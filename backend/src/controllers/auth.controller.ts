import { Request, Response } from "express";
import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export function login(req: Request, res: Response) {
  console.time("LOGIN");

  const { email, password } = req.body;

  if (!email || !password) {
    console.timeEnd("LOGIN");
    return res.status(400).json({ message: "Email dan password wajib" });
  }

  // 🔥 QUERY RINGAN + LIMIT 1
  const sql =
    "SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1";

  db.get(sql, [email], async (err, user: any) => {
    if (err) {
      console.error("DB ERROR:", err);
      console.timeEnd("LOGIN");
      return res.status(500).json({ message: "Database error" });
    }

    if (!user) {
      console.timeEnd("LOGIN");
      return res.status(401).json({ message: "Email atau password salah" });
    }

    try {
      // 🔥 bcrypt.compare (WAJIB)
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        console.timeEnd("LOGIN");
        return res
          .status(401)
          .json({ message: "Email atau password salah" });
      }

      // 🔥 JWT RINGAN
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "1d" }
      );

      console.timeEnd("LOGIN");
      return res.json({ token });
    } catch (e) {
      console.error("LOGIN ERROR:", e);
      console.timeEnd("LOGIN");
      return res.status(500).json({ message: "Server error" });
    }
  });
}
