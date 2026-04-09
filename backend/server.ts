import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Routes
import userRoutes from "./src/routes/user.routes";
import postRoutes from "./src/routes/post.routes";
import chatRoutes from "./src/routes/chatRequest.routes";
import adminRoutes from "./src/routes/admin.routes";
import imageRoutes from "./src/routes/image.routes";
import postLikeRoutes from "./src/routes/postLike.routes";
import messageRoutes from "./src/routes/message.routes";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://theekaa-ahb3-jirl7dpsg-sihina-nimnadas-projects-b21c3852.vercel.app/", // 🔥 change for production (or your frontend URL)
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/likes", postLikeRoutes);
app.use("/api/messages", messageRoutes);

// ✅ MongoDB connection (no listen)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB error:", error);
    throw error;
  }
};

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API working ✅",
  });
});

// ✅ Vercel handler
export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
