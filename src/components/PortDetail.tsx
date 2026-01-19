// src/components/PortDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { getUserRole } from "../auth/auth";
import { documentTemplates } from "../data/ports";
import ModalPortal from "./ModalPortal";

type FileItem = {
  id: number;
  file_name: string;
  uploaded_at: string;
};

export default function PortDetail({ ports }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = getUserRole() === "admin";

  const port = ports.find((p: any) => p.id === id);
  if (!port) return <div>Pelabuhan tidak ditemukan</div>;

  const [documents, setDocuments] = useState<any[]>([]);
  const [openRow, setOpenRow] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // HELPER: fetch + timeout
  // ============================
  async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 30000
  ) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  }

  // ============================
  // LOAD DOCUMENTS
  // ============================
  async function loadDocuments() {
    try {
      const res = await fetchWithTimeout(
        `/api/documents/${port.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        15000
      );

      if (!res.ok) {
        const text = await res.text();
        alert("Gagal memuat dokumen: " + text);
        return;
      }

      setDocuments(await res.json());
    } catch (err) {
      alert("Gagal memuat dokumen");
      console.error(err);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [port.id]);

  // ============================
  // UPLOAD FILE
  // ============================
  async function uploadFile(templateId: string, file: File) {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("portId", port.id);
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
        60000 // upload bisa lama
      );

      if (!res.ok) {
        const err = await res.text();
        alert("Upload gagal: " + err);
        return;
      }

      alert("Upload berhasil");
      loadDocuments();
    } catch (err: any) {
      if (err.name === "AbortError") {
        alert("Upload terlalu lama (timeout)");
      } else {
        alert("Upload gagal");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // PREVIEW FILE
  // ============================
  async function preview(file: FileItem) {
    try {
      const res = await fetchWithTimeout(
        `/api/documents/preview/${file.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        30000
      );

      if (!res.ok) {
        alert("Gagal preview");
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

  // ============================
  // DOWNLOAD FILE
  // ============================
  async function download(file: FileItem) {
    try {
      const res = await fetchWithTimeout(
        `/api/documents/download/${file.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        30000
      );

      if (!res.ok) {
        alert("Gagal download");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal download file");
      console.error(err);
    }
  }

  // ============================
  // DELETE FILE
  // ============================
  async function deleteFile(file: FileItem) {
    if (!confirm("Hapus file ini?")) return;

    try {
      const res = await fetchWithTimeout(
        `/api/documents/file/${file.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
        15000
      );

      if (!res.ok) {
        alert("Gagal menghapus file");
        return;
      }

      alert("File berhasil dihapus");
      loadDocuments();
    } catch (err) {
      alert("Gagal menghapus file");
      console.error(err);
    }
  }

  const rows = documentTemplates.map((tpl) => ({
    ...tpl,
    files: documents.filter(
      (d) => String(d.template_id) === String(tpl.id)
    ),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HERO */}
      <div className="relative rounded-xl overflow-hidden">
        <img src={port.hero} className="w-full h-48 sm:h-56 object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white p-2 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="absolute bottom-4 left-4 text-2xl sm:text-4xl text-white font-bold">
          {port.name}
        </h1>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.title}</td>
                <td className="p-3">
                  {r.files.length ? (
                    <button
                      onClick={() => setOpenRow(r)}
                      className="text-green-600 text-xs"
                    >
                      Sudah Unggah ({r.files.length})
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">
                      Belum Unggah
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="p-3">
                    <label className="cursor-pointer flex items-center gap-1 text-xs text-sky-600">
                      <CloudArrowUpIcon className="w-4 h-4" />
                      {loading ? "Mengunggah..." : "Upload"}
                      <input
                        type="file"
                        hidden
                        disabled={loading}
                        onChange={(e) =>
                          e.target.files &&
                          uploadFile(r.id, e.target.files[0])
                        }
                      />
                    </label>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openRow && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-[95%] sm:w-[720px] max-h-[90vh] overflow-auto">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">{openRow.title}</h3>
                <button onClick={() => setOpenRow(null)}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <table className="w-full text-sm">
                <tbody>
                  {openRow.files.map((f: FileItem) => (
                    <tr key={f.id} className="border-b">
                      <td className="py-2">{f.file_name}</td>
                      <td className="py-2 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => preview(f)}>
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => download(f)}>
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button onClick={() => deleteFile(f)}>
                              <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
