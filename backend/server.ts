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


app.use(express.json());
app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:5173", 
  
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/likes", postLikeRoutes);
app.use("/api/messages", messageRoutes);


app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API working ✅",
  });
});


let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    process.exit(1);
  }
};


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}


export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}