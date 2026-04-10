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

// ✅ CORS Configuration - Allow all your frontend domains
const allowedOrigins = [
  "https://theekaa-ahb3.vercel.app",
  "https://theekaa-ahb3-git-main-sihina-nimnadas-projects-b21c3852.vercel.app",
  "https://theekaa-ahb3-fl2131pif-sihina-nimnadas-projects-b21c3852.vercel.app",
  "http://localhost:5173", // Local development
];

app.use(
  cors({
    origin: (origin, callback) => {
    
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
