// src/components/DocumentTable.tsx
import React from "react";
import { TrashIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { getUserRole } from "../auth/auth";

export type DocumentRow = {
  id: string;
  title: string;
  status: "Belum Unggah" | "Sudah Unggah";
  note?: string;
};

type Props = {
  portId: string;
  rows: DocumentRow[];
};

export default function DocumentTable({ portId, rows }: Props) {
  const role = getUserRole();
  const isAdmin = role === "admin";

  function handleFileSelected(templateId: string, file: File) {
    if (!isAdmin) return;
    console.log("UPLOAD:", templateId, file);
    // nanti sambungkan ke Supabase / API upload
  }

  function handleDelete(templateId: string) {
    if (!isAdmin) return;
    console.log("DELETE:", templateId);
    // nanti sambungkan ke API delete
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left text-sm">
            <th className="p-2">Dokumen</th>
            <th className="p-2">Status</th>
            <th className="p-2">Keterangan</th>
            {isAdmin && <th className="p-2 text-right">Aksi</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2 font-medium">{r.title}</td>
              <td className="p-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    r.status === "Sudah Unggah"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="p-2 text-sm text-slate-600">
                {r.note ?? "-"}
              </td>

              {/* ADMIN ONLY */}
              {isAdmin && (
                <td className="p-2">
                  <div className="flex justify-end gap-2">
                    <label className="flex items-center gap-1 px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 cursor-pointer text-xs">
                      <CloudArrowUpIcon className="w-4 h-4 text-sky-600" />
                      Unggah
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.currentTarget.files?.[0];
                          if (f) handleFileSelected(r.id, f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      title="Hapus"
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
