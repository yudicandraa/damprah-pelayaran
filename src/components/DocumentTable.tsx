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

  async function upload(templateId: string, file: File) {
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("portId", portId);
    form.append("templateId", templateId);

    await fetch("http://localhost:4000/api/documents/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: form,
    });

    setLoading(false);
    onChanged?.();
  }

  async function deleteFile(id: number) {
    if (!confirm("Hapus file ini?")) return;

    await fetch(
      `http://localhost:4000/api/documents/file/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    onChanged?.();
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
                    Upload
                    <input
                      type="file"
                      className="hidden"
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

      {/* MODAL LIST FILE */}
      {openRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="font-bold mb-2">{openRow.title}</h3>

            <ul className="space-y-2">
              {openRow.files.map((f) => (
                <li key={f.id} className="flex justify-between">
                  <a
                    href={`http://localhost:4000/api/documents/download/${f.id}`}
                    target="_blank"
                    className="text-sky-600 text-sm"
                  >
                    {f.file_name}
                  </a>

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
              className="mt-3 text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
