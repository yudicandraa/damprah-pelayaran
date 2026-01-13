import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    // simpan user ke request
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}
