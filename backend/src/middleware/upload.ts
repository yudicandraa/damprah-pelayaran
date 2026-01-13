import multer from "multer";
import fs from "fs";
import path from "path";

const tempDir = path.join(process.cwd(), "uploads", "temp");
fs.mkdirSync(tempDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      // ⛔ JANGAN PAKAI req.body DI SINI
      cb(null, tempDir);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, `${Date.now()}_${safeName}`);
    },
  }),
});
