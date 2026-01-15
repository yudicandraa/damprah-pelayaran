import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
  origin: "*", // ganti domain frontend jika sudah fix
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// STATIC FILES
// ======================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({
    message: "Route tidak ditemukan",
    path: req.originalUrl,
  });
});

export default app; // 🔥 INI YANG SEBELUMNYA HILANG
