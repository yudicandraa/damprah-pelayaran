import { Request, Response } from "express";
import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "User tidak ditemukan" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Password salah" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    }
  );
}
