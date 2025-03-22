import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    password: string;
    email: string;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
