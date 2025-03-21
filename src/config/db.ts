import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("❌ DATABASE_URL is not defined in environment variables");
    }
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      dbName: "Second_brain_app",  
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;