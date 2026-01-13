import { Router } from "express";
import {
  uploadDocument,
  getDocumentsByPort,
  previewDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/document.controller";
import { upload } from "../middleware/upload";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.get("/:portId", requireAuth, getDocumentsByPort);

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  uploadDocument
);

router.get("/preview/:id", previewDocument);
router.get("/download/:id", requireAuth, downloadDocument);

router.delete(
  "/file/:id",
  requireAuth,
  requireAdmin,
  deleteDocument
);

export default router;
