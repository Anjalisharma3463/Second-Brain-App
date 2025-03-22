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
const utils_1 = require("./utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Links_1 = require("./Model/Links");
const User_1 = require("./Model/User");
const Content_1 = require("./Model/Content");
const UserMiddleware_1 = require("./middleware/UserMiddleware");
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const Validate_1 = require("./middleware/Validate");
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, db_1.default)();
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    email: zod_1.z.string().email("Invalid email format"),
});
const signinSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
const contentSchema = zod_1.z.object({
    link: zod_1.z.string().url("Invalid URL format"),
    type: zod_1.z.string(),
    title: zod_1.z.string().optional(),
});
const deleteContentSchema = zod_1.z.object({
    contentId: zod_1.z.string(),
});
const shareBrainSchema = zod_1.z.object({
    share: zod_1.z.boolean(),
});
app.post("/api/v1/signup", (0, Validate_1.validate)(signupSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        yield User_1.UserModel.create({ username, password: hashedPassword, email });
        res.json({ message: "User signed up" });
    }
    catch (e) {
        res.status(411).json({ message: "User already exists" });
    }
}));
app.post("/api/v1/signin", (0, Validate_1.validate)(signinSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const existingUser = yield User_1.UserModel.findOne({ username });
    if (existingUser) {
        const isPasswordValid = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!isPasswordValid) {
            res.status(403).json({ message: "Incorrect credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        res.json({ token });
    }
    else {
        res.status(403).json({ message: "Wrong credentials" });
    }
}));
app.post("/api/v1/content", UserMiddleware_1.userMiddleware, (0, Validate_1.validate)(contentSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    yield Content_1.ContentModel.create({ link, type, title, userId: req.userId, tags: [] });
    res.json({ message: "Content added" });
}));
app.delete("/api/v1/content", UserMiddleware_1.userMiddleware, (0, Validate_1.validate)(deleteContentSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contentId } = req.body;
    yield Content_1.ContentModel.deleteMany({ _id: contentId, userId: req.userId });
    res.json({ message: "Deleted" });
}));
app.post("/api/v1/brain/share", UserMiddleware_1.userMiddleware, (0, Validate_1.validate)(shareBrainSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const existingLink = yield Links_1.LinkModel.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield Links_1.LinkModel.create({ userId: req.userId, hash });
        res.json({ hash });
    }
    else {
        yield Links_1.LinkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield Links_1.LinkModel.findOne({ hash });
    if (!link) {
        res.status(411).json({ message: "Sorry, incorrect input" });
        return;
    }
    const content = yield Content_1.ContentModel.find({ userId: link.userId });
    const user = yield User_1.UserModel.findById(link.userId);
    if (!user) {
        res.status(411).json({ message: "User not found !" });
        return;
    }
    res.json({ username: user.username, content });
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
