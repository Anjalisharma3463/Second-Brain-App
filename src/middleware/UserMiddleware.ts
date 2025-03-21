import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const UserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    console.log("Received token:", token);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log("Decoded token payload:", decoded);

        if (typeof decoded === "object" && "id" in decoded) {
            //@ts-ignore
            req.userId = decoded.id;
            //@ts-ignore
            console.log("req.userId set:", req.userId);
        } else {
            throw new Error("Invalid token payload");
        }

        next();
    } catch (e) {
        console.error("JWT verification failed:", e);
        res.status(401).json({ message: "Invalid token" });
    }
};
