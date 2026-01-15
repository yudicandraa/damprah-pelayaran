import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  // 1️⃣ Header Authorization
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.replace("Bearer ", "");
  }

  // 2️⃣ (OPSIONAL) token di query (kalau masih dipakai)
  if (!token && req.query.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}
