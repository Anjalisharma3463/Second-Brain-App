"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./Model/User");
const db_1 = __importDefault(require("./config/db"));
const UserMiddleware_1 = require("./middleware/UserMiddleware");
const Content_1 = require("./Model/Content");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //need to add zod and hash password
    try {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        yield User_1.UserModel.create({
            username: username,
            password: password,
            email: email
        });
        res.json({
            message: "User signed up successfully"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "user already exists"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const user = yield User_1.UserModel.findOne({ username: username, password: password });
        if (!user) {
            throw new Error("User not found");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            message: "User signed in successfully",
            token: token
        });
    }
    catch (e) {
        res.status(401).json({
            message: " User not found"
        });
    }
}));
app.post("/api/v1/content", UserMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type } = req.body;
    try {
        // @ts-ignore
        console.log("Received userId in route:", req.userId);
        // @ts-ignore
        console.log("Inserting Data:", { link, type, userId: req.userId });
        const newContent = yield Content_1.ContentModel.create({
            link,
            type,
            tags: [],
            //@ts-ignore
            userId: req.userId,
        });
        console.log("Inserted Content:", newContent);
        res.json({ message: "Content Added!" });
    }
    catch (error) {
        console.error("Error while adding content:", error);
        res.status(500).json({ message: "Content not added due to server error" });
    }
}));
app.get("/api/v1/content", UserMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const contentId = req.body.contentId;
        console.log("contentId:", contentId);
        const content = yield Content_1.ContentModel.find({
            contentId
        }).populate("userId", "username");
        console.log("content:", content);
        res.json({
            content: content
        });
    }
    catch (e) {
        res.status(401).json({
            message: "content not found"
        });
    }
}));
app.delete("/api/v1/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        yield Content_1.ContentModel.deleteOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            message: "content deleted"
        });
    }
    catch (e) {
        res.status(401).json({
            message: "content not deleted"
        });
    }
}));
app.post("/api/v1/brain/share", (req, res) => {
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
});
console.log("PORT:", process.env.PORT);
console.log("Database URL:", process.env.DATABASE_URL);
app.listen(process.env.PORT, () => {
    console.log("Server is running on port", process.env.PORT);
});
