import { Request, Response } from "express";
import path from "path";
import { db } from "../config/db";
import fs from "fs";
import mime from "mime-types";
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");


// ============================
// LIST DOCUMENTS BY PORT
// ============================
export function getDocumentsByPort(req: Request, res: Response) {
  const { portId } = req.params;

  db.all(
    `SELECT id, port_id, template_id, file_name, file_path, uploaded_at
     FROM documents
     WHERE port_id = ?
     ORDER BY uploaded_at DESC`,
    [portId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
}

// ============================
// UPLOAD DOCUMENT (LOCAL)
// ============================
export function uploadDocument(req: Request, res: Response) {
  console.time("UPLOAD");

  try {
    if (!req.file) {
      console.timeEnd("UPLOAD");
      return res.status(400).send("File tidak ditemukan");
    }

    const { portId, templateId } = req.body;

    if (!portId || !templateId) {
      console.timeEnd("UPLOAD");
      return res.status(400).send("Data tidak lengkap");
    }

    const fileName = req.file.originalname;
    const filePath = req.file.filename;

    const sql = `
      INSERT OR REPLACE INTO documents
      (port_id, template_id, file_name, file_path)
      VALUES (?, ?, ?, ?)
    `;

    db.run(
      sql,
      [portId, templateId, fileName, filePath],
      function (err) {
        if (err) {
          console.error("UPLOAD DB ERROR:", err);
          console.timeEnd("UPLOAD");
          return res.status(500).send("Gagal simpan data");
        }

        console.timeEnd("UPLOAD");
        return res.json({ message: "Upload berhasil" });
      }
    );
  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    console.timeEnd("UPLOAD");
    return res.status(500).send("Server error");
  }
}

// preview document (inline or attachment based on type)
export function previewDocument(req: Request, res: Response) {
  const { id } = req.params;

  db.get(
    `SELECT file_path, file_name FROM documents WHERE id = ?`,
    [id],
    (err, row: any) => {
      if (err || !row) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      const absolutePath = path.join(UPLOADS_DIR, row.file_path);

      if (!fs.existsSync(absolutePath)) {
        console.error("PREVIEW FILE NOT FOUND:", absolutePath);
        return res.status(404).json({ message: "File tidak ada di server" });
      }

      const mimeType =
        mime.lookup(absolutePath) || "application/octet-stream";

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${row.file_name}"`
      );
      res.setHeader("Accept-Ranges", "bytes");

      fs.createReadStream(absolutePath).pipe(res);
    }
  );
}


// ============================
// DOWNLOAD DOCUMENT (ATTACHMENT)
// ============================
export function downloadDocument(req: Request, res: Response) {
  const { id } = req.params;

  db.get(
    `SELECT file_path, file_name FROM documents WHERE id = ?`,
    [id],
    (err, row: any) => {
      if (err || !row) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      const absolutePath = path.join(UPLOADS_DIR, row.file_path);

      if (!fs.existsSync(absolutePath)) {
        console.error("DOWNLOAD FILE NOT FOUND:", absolutePath);
        return res.status(404).json({ message: "File tidak ada di server" });
      }

      res.download(absolutePath, row.file_name);
    }
  );
}


// ============================
// DELETE DOCUMENT
// ============================
export function deleteDocument(req: Request, res: Response) {
  const { id } = req.params;

  db.get(
    `SELECT file_path FROM documents WHERE id = ?`,
    [id],
    (err, row: any) => {
      if (err || !row) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      const absolutePath = path.join(UPLOADS_DIR, row.file_path);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      db.run(
        `DELETE FROM documents WHERE id = ?`,
        [id],
        (err2) => {
          if (err2) {
            return res
              .status(500)
              .json({ message: "Gagal hapus database" });
          }

          res.json({ message: "File berhasil dihapus" });
        }
      );
    }
  );
}
