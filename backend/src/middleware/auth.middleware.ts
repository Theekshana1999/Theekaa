import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Admin from "../models/admin.model";

export const verifyUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header found" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    // ✅ Remove "Bearer " prefix
    const token = authHeader.slice(7);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    console.log("Decoded token:", decoded);

    // ✅ Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Auth verification error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header found" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = authHeader.slice(7);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    console.log("Decoded token:", decoded);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error: any) {
    console.error("Admin verification error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};