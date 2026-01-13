// src/app.ts
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";

const app = express();

// ======================
// MIDDLEWARE GLOBAL
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// STATIC FILE (DOWNLOAD)
// ======================
app.use(
  "/files",
  express.static(path.join(process.cwd(), "uploads"))
);

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get("/", (_req, res) => {
  res.json({ status: "Backend running" });
});

export default app;
