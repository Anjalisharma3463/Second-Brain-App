"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    console.log("Received token:", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token payload:", decoded);
        if (typeof decoded === "object" && "id" in decoded) {
            //@ts-ignore
            req.userId = decoded.id;
            //@ts-ignore
            console.log("req.userId set:", req.userId);
        }
        else {
            throw new Error("Invalid token payload");
        }
        next();
    }
    catch (e) {
        console.error("JWT verification failed:", e);
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.UserMiddleware = UserMiddleware;
