// src/components/DocUploader.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getUserRole } from "../auth/auth";

type Props = {
  portId: string;
  onDone?: () => void;
  folder?: string;
};

export default function DocUploader({ portId, onDone, folder = "" }: Props) {
  const role = getUserRole();
  const isAdmin = role === "admin";

  // 🔒 USER TIDAK MELIHAT APA PUN
  if (!isAdmin) return null;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Pilih file terlebih dahulu");

    setUploading(true);
    try {
      const bucket = "dokumen-pelabuhan-aceh";
      const filename = `${Date.now()}_${file.name}`;
      const path = folder
        ? `${folder}/${portId}/${filename}`
        : `${portId}/${filename}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { error: dbErr } = await supabase.from("documents").insert({
        port_id: portId,
        file_name: file.name,
        path: data.path,
        uploaded_by: "admin",
      });

      if (dbErr) throw dbErr;

      setFile(null);
      onDone?.();
      alert("Upload berhasil");
    } catch (err: any) {
      console.error(err);
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border rounded p-3 bg-slate-50">
      <div className="text-sm font-semibold text-slate-700">
        Upload Dokumen
      </div>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-3 py-1 rounded bg-sky-600 text-white disabled:opacity-50"
      >
        {uploading ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  );
}
