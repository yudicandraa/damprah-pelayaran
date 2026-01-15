import { Request, Response } from "express";
import path from "path";
import { db } from "../config/db";
import fs from "fs";
import mime from "mime-types";
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
  const file = req.file;
  const { portId, templateId } = req.body;
  const user = (req as any).user;

  if (!file) {
    return res.status(400).json({ message: "File tidak ditemukan" });
  }

  const filePath = file.path.replace(/\\/g, "/");

  db.run(
    `INSERT INTO documents 
     (port_id, template_id, file_name, file_path, uploaded_by)
     VALUES (?,?,?,?,?)`,
    [portId, templateId, file.originalname, filePath, user?.id ?? "admin"],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Upload berhasil", id: this.lastID });
    }
  );
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

      const filePath = path.resolve(row.file_path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).end();
      }

      const mimeType =
        mime.lookup(filePath) || "application/pdf";

      res.writeHead(200, {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${row.file_name}"`,
        "Accept-Ranges": "bytes",
      });

      fs.createReadStream(filePath).pipe(res);
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

      res.download(path.resolve(row.file_path), row.file_name);
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
      if (err) {
        console.error("DB SELECT ERROR:", err);
        return res.status(500).json({ message: "Database error (select)" });
      }

      if (!row) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      // 🔥 PENTING: pastikan path absolut ke folder uploads
      const uploadsRoot = path.resolve(__dirname, "../../uploads");
      const absolutePath = path.isAbsolute(row.file_path)
        ? row.file_path
        : path.join(uploadsRoot, path.basename(row.file_path));

      console.log("DELETE FILE PATH:", absolutePath);

      // 1️⃣ Hapus file fisik (jika ada)
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (fsErr) {
          console.error("FS DELETE ERROR:", fsErr);
          return res
            .status(500)
            .json({ message: "Gagal menghapus file fisik" });
        }
      } else {
        console.warn("FILE TIDAK ADA DI DISK:", absolutePath);
      }

      // 2️⃣ Hapus record DB
      db.run(
        `DELETE FROM documents WHERE id = ?`,
        [id],
        (err2) => {
          if (err2) {
            console.error("DB DELETE ERROR:", err2);
            return res
              .status(500)
              .json({ message: "Gagal menghapus data di database" });
          }

          res.json({ message: "File berhasil dihapus" });
        }
      );
    }
  );
}