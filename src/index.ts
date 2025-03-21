import express from "express";
import mongoose from "mongoose"; 
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "./Model/User";
import connectDB from "./config/db";
import { UserMiddleware } from "./middleware/UserMiddleware";
import { ContentModel } from "./Model/Content";


 dotenv.config(); 
 connectDB();
 const app = express();
app.use(express.json());


app.post("/api/v1/signup", async (req, res)=> {
    //need to add zod and hash password
    try {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    await UserModel.create({
        username: username,
        password: password,
        email: email
    })

    res.json({
        message: "User signed up successfully"
    })   
} catch (e) {
    res.status(411).json({
        message:  "user already exists"
    })
}   
 
});

app.post("/api/v1/signin", async(req, res)=> {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const user = await UserModel.findOne({username: username, password: password});
        if (!user) {
            throw new Error("User not found");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

        res.json({
            message: "User signed in successfully",
            token: token
        })
    }catch(e) {
        res.status(401).json({
            message:" User not found"
        })
    }
});

app.post("/api/v1/content", UserMiddleware, async (req, res) => {
    const { link, type } = req.body;

    try {
        // @ts-ignore
        console.log("Received userId in route:", req.userId);
        // @ts-ignore
        console.log("Inserting Data:", { link, type, userId: req.userId });

        const newContent = await ContentModel.create({
            link,
            type,
            tags: [],
            //@ts-ignore
            userId: req.userId,
        });

        console.log("Inserted Content:", newContent);

        res.json({ message: "Content Added!" });
    } catch (error) {
        console.error("Error while adding content:", error);
        res.status(500).json({ message: "Content not added due to server error" });
    }
});

 
app.get("/api/v1/content", UserMiddleware, async (req, res) => {
    try {
         const contentId = req.query.contentId as string;
        console.log("contentId:", contentId);
        //@ts-ignore
        const userId = req.userId;     
        if (!contentId) {
            res.status(400).json({ message: "contentId is required" });
            return;
        }

        const content = await ContentModel.findOne({ _id: contentId , userId:userId }).populate("userId", "username");
        console.log("content:", content);

        if (!content) {
            res.status(404).json({ message: "Content not found" });
            return;
        }

        res.json({ content });
    } catch (e) {
        console.error("Error fetching content:", e);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.delete("/api/v1/content", async(req, res)=> {
  
    try {
        const contentId = req.query.contentId;
        await ContentModel.deleteOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            message: "content deleted"
        });
    } catch (e) {
        res.status(401).json({
            message: "content not deleted"
        })
    }
});

app.post("/api/v1/brain/share", (req, res)=> {

});

app.get("/api/v1/brain/:shareLink", (req, res)=> {

});


console.log("PORT:", process.env.PORT);

console.log("Database URL:", process.env.DATABASE_URL);

app.listen(process.env.PORT, ()=> {
  console.log("Server is running on port", process.env.PORT);
});



