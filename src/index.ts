import express, { Request, Response, NextFunction } from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { LinkModel } from "./Model/Links";
import { UserModel } from "./Model/User";
import { ContentModel } from "./Model/Content";
import { userMiddleware } from "./middleware/UserMiddleware";
import cors from "cors";
import { z } from "zod";
import bcrypt from "bcrypt";
import dotenv from "dotenv"; 
import { validate } from "./middleware/Validate";
dotenv.config(); 
import connectDB from "./config/db";

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    email: z.string().email("Invalid email format"),
});

const signinSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const contentSchema = z.object({
    link: z.string().url("Invalid URL format"),
    type: z.string(),
    title: z.string().optional(),
});

const deleteContentSchema = z.object({
    contentId: z.string(),
});

const shareBrainSchema = z.object({
    share: z.boolean(),
});
 
app.post("/api/v1/signup", validate(signupSchema), async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await UserModel.create({ username, password: hashedPassword, email });

        res.json({ message: "User signed up" });
       
    } catch (e) {
        res.status(411).json({ message: "User already exists" });
    }
});
 
app.post("/api/v1/signin", validate(signinSchema), async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
             res.status(403).json({ message: "Incorrect credentials" });
             return;
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET as string);
        
        res.json({ token });
    } else {
        res.status(403).json({ message: "Wrong credentials" });
    }
});

app.post("/api/v1/content", userMiddleware, validate(contentSchema), async (req: Request, res: Response) => {
    const { link, type, title } = req.body;

    await ContentModel.create({ link, type, title, userId: req.userId, tags: [] });

    res.json({ message: "Content added" });
});

app.delete("/api/v1/content", userMiddleware, validate(deleteContentSchema), async (req: Request, res: Response) => {
    const { contentId } = req.body;

    await ContentModel.deleteMany({ _id: contentId, userId: req.userId });

    res.json({ message: "Deleted" });
});

app.post("/api/v1/brain/share", userMiddleware, validate(shareBrainSchema), async (req: Request, res: Response) => {
    const { share } = req.body;

    if (share) {
        const existingLink = await LinkModel.findOne({ userId: req.userId });

        if (existingLink) {
             res.json({ hash: existingLink.hash });
             return;
        }

        const hash = random(10);
        await LinkModel.create({ userId: req.userId, hash });

        res.json({ hash });
    } else {
        await LinkModel.deleteOne({ userId: req.userId });

        res.json({ message: "Removed link" });
    }
});

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({ hash });

    if (!link) {
       res.status(411).json({ message: "Sorry, incorrect input" });
       return
    }

    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findById(link.userId);

    if (!user) {
        res.status(411).json({ message: "User not found !" });
        return;
    }

    res.json({ username: user.username, content });
});  


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
