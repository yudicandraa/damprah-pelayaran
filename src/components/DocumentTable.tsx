import React, { useState } from "react";
import { CloudArrowUpIcon, TrashIcon } from "@heroicons/react/24/solid";
import { getUserRole } from "../auth/auth";

type FileItem = {
  id: number;
  file_name: string;
  file_path: string;
};

type Row = {
  templateId: string;
  title: string;
  status: string;
  fileCount: number;
  files: FileItem[];
};

export default function DocumentTable({
  portId,
  rows,
  onChanged,
}: {
  portId: string;
  rows: Row[];
  onChanged?: () => void;
}) {
  const isAdmin = getUserRole() === "admin";
  const [openRow, setOpenRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // HELPER: fetch dengan timeout
  // ============================
  async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 30000 // 30 detik
  ) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // ============================
  // UPLOAD FILE
  // ============================
  async function upload(templateId: string, file: File) {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("portId", portId);
      form.append("templateId", templateId);

      const res = await fetchWithTimeout(
        "/api/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: form,
        },
        60000 // upload bisa lama → 60 detik
      );

      if (!res.ok) {
        const text = await res.text();
        alert("Upload gagal: " + text);
        return;
      }

      onChanged?.();
    } catch (err: any) {
      if (err.name === "AbortError") {
        alert("Upload terlalu lama (timeout)");
      } else {
        alert("Gagal upload file");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // DELETE FILE
  // ============================
  async function deleteFile(id: number) {
    if (!confirm("Hapus file ini?")) return;

    try {
      const res = await fetchWithTimeout(
        `/api/documents/file/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        15000
      );

      if (!res.ok) {
        const text = await res.text();
        alert("Gagal menghapus file: " + text);
        return;
      }

      onChanged?.();
    } catch (err) {
      alert("Gagal menghapus file");
      console.error(err);
    }
  }

  // ============================
  // PREVIEW FILE (NEW TAB)
  // ============================
  async function previewFile(id: number) {
    try {
      const res = await fetchWithTimeout(
        `/api/documents/preview/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        30000
      );

      if (!res.ok) {
        alert("Gagal membuka file");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert("Gagal preview file");
      console.error(err);
    }
  }

  return (
    <>
      <table className="w-full">
        <tbody>
          {rows.map((r) => (
            <tr key={r.templateId} className="border-b">
              <td className="p-2">{r.title}</td>

              <td className="p-2">
                {r.fileCount > 0 ? (
                  <button
                    onClick={() => setOpenRow(r)}
                    className="text-sky-600 underline"
                  >
                    Sudah Unggah ({r.fileCount})
                  </button>
                ) : (
                  "Belum Unggah"
                )}
              </td>

              {isAdmin && (
                <td className="p-2">
                  <label className="cursor-pointer text-xs flex items-center gap-1">
                    <CloudArrowUpIcon className="w-4 h-4" />
                    {loading ? "Mengunggah..." : "Upload"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={loading}
                      onChange={(e) =>
                        e.target.files &&
                        upload(r.templateId, e.target.files[0])
                      }
                    />
                  </label>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============================
           MODAL LIST FILE
         ============================ */}
      {openRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-96 max-h-[80vh] overflow-auto">
            <h3 className="font-bold mb-3">{openRow.title}</h3>

            <ul className="space-y-2">
              {openRow.files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between"
                >
                  <button
                    onClick={() => previewFile(f.id)}
                    className="text-sky-600 text-sm underline text-left"
                  >
                    {f.file_name}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => deleteFile(f.id)}
                      className="text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setOpenRow(null)}
              className="mt-4 text-sm text-gray-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
