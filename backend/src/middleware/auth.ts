import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1️⃣ Ambil token dari QUERY dulu
  const queryToken = req.query.token as string | undefined;

  // 2️⃣ Ambil token dari HEADER (fallback)
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = queryToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
}
