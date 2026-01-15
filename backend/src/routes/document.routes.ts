import { Router } from "express";
import {
  getDocumentsByPort,
  uploadDocument,
  previewDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/document.controller";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload"; // ⬅️ HARUS ADA

const router = Router();

router.get("/:portId", authMiddleware, getDocumentsByPort);

// 🔥 INI KRUSIAL
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"), // ⬅️ TANPA INI = Failed to fetch
  uploadDocument
);

router.get("/preview/:id", authMiddleware, previewDocument);
router.get("/download/:id", authMiddleware, downloadDocument);
router.delete("/file/:id", authMiddleware, deleteDocument);

export default router;
