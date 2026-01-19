import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(__dirname, "../../uploads");

// 🔥 pastikan folder ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 🔥 50MB
  },
});
