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

  // upload progress
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // modal state
  const [modal, setModal] = useState<{
    type: "success" | "error" | "confirm" | null;
    message: string;
    onConfirm?: () => void;
  }>({ type: null, message: "" });

  /* =========================
     HELPERS
  ========================= */
  function openSuccess(msg: string) {
    setModal({ type: "success", message: msg });
  }

  function openError(msg: string) {
    setModal({ type: "error", message: msg });
  }

  function openConfirm(msg: string, onConfirm: () => void) {
    setModal({ type: "confirm", message: msg, onConfirm });
  }

  /* =========================
     LOAD DOCUMENTS
  ========================= */
  async function loadDocuments() {
    try {
      const res = await fetch(`/api/documents/${port.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error();
      setDocuments(await res.json());
    } catch {
      openError("Gagal memuat dokumen");
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [port.id]);

  /* =========================
     UPLOAD WITH PROGRESS
  ========================= */
  async function uploadFile(templateId: string, file: File) {
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("portId", port.id);
    form.append("templateId", templateId);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/documents/upload");
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${localStorage.getItem("token")}`
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject();

        xhr.onerror = () => reject();
        xhr.send(form);
      });

      await loadDocuments();
      openSuccess("Upload berhasil");
    } catch {
      openError("Upload gagal");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  }

  /* =========================
     PREVIEW & DOWNLOAD
  ========================= */
  async function preview(file: FileItem) {
    try {
      const res = await fetch(`/api/documents/preview/${file.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      openError("Gagal membuka file");
    }
  }

  async function download(file: FileItem) {
    try {
      const res = await fetch(`/api/documents/download/${file.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      openError("Gagal download file");
    }
  }

  /* =========================
     DELETE WITH CONFIRM MODAL
  ========================= */
  function deleteFile(file: FileItem) {
    openConfirm("Yakin ingin menghapus file ini?", async () => {
      try {
        const res = await fetch(`/api/documents/file/${file.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error();

        await loadDocuments();
        openSuccess("File berhasil dihapus");
      } catch {
        openError("Gagal menghapus file");
      }
    });
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
        <img src={port.hero} className="w-full h-48 object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white p-2 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="absolute bottom-4 left-4 text-3xl text-white font-bold">
          {port.name}
        </h1>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow p-4">
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
                      Upload
                      <input
                        type="file"
                        hidden
                        disabled={uploading}
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

      {/* MODAL FILE LIST */}
      {openRow && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[720px] max-h-[90vh] overflow-auto">
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

      {/* UPLOAD PROGRESS */}
      {uploading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-72">
          <p className="text-sm font-semibold mb-2">
            Mengunggah… {progress}%
          </p>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-sky-600 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* GLOBAL MODAL */}
      {modal.type && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md text-center">
              <h3 className="font-bold text-lg mb-3">
                {modal.type === "success"
                  ? "Berhasil"
                  : modal.type === "error"
                  ? "Terjadi Kesalahan"
                  : "Konfirmasi"}
              </h3>

              <p className="text-sm mb-6">{modal.message}</p>

              <div className="flex justify-center gap-3">
                {modal.type === "confirm" ? (
                  <>
                    <button
                      className="px-4 py-2 bg-gray-200 rounded"
                      onClick={() =>
                        setModal({ type: null, message: "" })
                      }
                    >
                      Batal
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded"
                      onClick={() => {
                        modal.onConfirm?.();
                        setModal({ type: null, message: "" });
                      }}
                    >
                      Hapus
                    </button>
                  </>
                ) : (
                  <button
                    className="px-6 py-2 bg-sky-600 text-white rounded"
                    onClick={() =>
                      setModal({ type: null, message: "" })
                    }
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
