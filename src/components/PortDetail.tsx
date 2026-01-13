import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import type { Port } from "../data/ports";
import { documentTemplates } from "../data/ports";
import { getUserRole } from "../auth/auth";
import ModalPortal from "../components/ModalPortal";

/* ================= TYPES ================= */

type FileItem = {
  id: number;
  file_name: string;
  uploaded_at: string;
};

type PreviewFile = FileItem & {
  previewUrl: string;
};

type Row = {
  templateId: string;
  title: string;
  files: FileItem[];
};

/* ================= HELPERS ================= */

function formatDate(dt: string) {
  const [date] = dt.split(" ");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/* ================= COMPONENT ================= */

export default function PortDetail({ ports }: { ports: Port[] }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = getUserRole() === "admin";

  const port = ports.find((p) => p.id === id);
  if (!port) {
    return (
      <div className="bg-white rounded shadow p-4">
        <p>Pelabuhan tidak ditemukan.</p>
        <Link to="/" className="text-sky-600 underline">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const portId = port.id;

  /* ================= STATE ================= */

  const [documents, setDocuments] = useState<any[]>([]);
  const [openRow, setOpenRow] = useState<Row | null>(null);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FileItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  /* ================= LOAD DOCUMENTS ================= */

  async function loadDocuments() {
    const res = await fetch(
      `http://localhost:4000/api/documents/${portId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await res.json();
    setDocuments(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadDocuments();
  }, [portId]);

  /* ================= BODY SCROLL LOCK ================= */

  useEffect(() => {
    const hasModal = openRow || previewFile || confirmDelete || uploading;
    document.body.style.overflow = hasModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRow, previewFile, confirmDelete, uploading]);

  /* ================= BUILD ROWS ================= */

  const rows: Row[] = documentTemplates.map((tpl) => ({
    templateId: String(tpl.id),
    title: tpl.title,
    files: documents.filter(
      (d) => String(d.template_id) === String(tpl.id)
    ),
  }));

  /* ================= ACTIONS ================= */

  async function uploadFile(templateId: string, file: File) {
    setUploading(true);
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

    setUploading(false);
    showToast("Upload berhasil");
    loadDocuments();
  }
// async function preview(file: FileItem) {
//   const token = localStorage.getItem("token");

//   const url = `http://localhost:4000/api/documents/preview/${file.id}?token=${token}`;

//   window.open(url, "_blank");
// }

  // async function preview(file: FileItem) {
  //   const res = await fetch(
  //     `http://localhost:4000/api/documents/preview/${file.id}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     }
  //   );

  //   if (!res.ok) {
  //     showToast("Gagal membuka preview");
  //     return;
  //   }

  //   const blob = await res.blob();
  //   const url = URL.createObjectURL(blob);
  //   setPreviewFile({ ...file, previewUrl: url });
  // }

 
  function preview(file: FileItem) {
  window.open(
    `http://localhost:4000/api/documents/preview/${file.id}`,
    "_blank"
  );
}
 function closePreview() {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.previewUrl);
    }
    setPreviewFile(null);
  }

  async function download(file: FileItem) {
    const res = await fetch(
      `http://localhost:4000/api/documents/download/${file.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.ok) {
      showToast("Gagal download");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.file_name;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function deleteConfirmed() {
    if (!confirmDelete || !openRow) return;

    await fetch(
      `http://localhost:4000/api/documents/file/${confirmDelete.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // 🔥 UPDATE MODAL STATE LANGSUNG
    const updatedFiles = openRow.files.filter(
      (f) => f.id !== confirmDelete.id
    );

    if (updatedFiles.length === 0) {
      setOpenRow(null); // tutup modal kalau kosong
    } else {
      setOpenRow({ ...openRow, files: updatedFiles });
    }

    setConfirmDelete(null);
    showToast("File berhasil dihapus");
    loadDocuments();
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HERO */}
      <div className="relative rounded-xl overflow-hidden ring-1 ring-sky-300">
        <img
          src={port.hero ?? port.img ?? "/images/default-placeholder.jpg"}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <h2 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
          {port.name}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="w-full">
          <tbody>
            {rows.map((r) => (
              <tr key={r.templateId} className="border-b">
                <td className="p-4 font-medium">{r.title}</td>
                <td className="p-4 text-center">
                  {r.files.length > 0 ? (
                    <button
                      onClick={() => setOpenRow(r)}
                      className="px-4 py-1 text-xs rounded-full bg-green-100 text-green-700"
                    >
                      Sudah Unggah ({r.files.length})
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Belum Unggah</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="p-4 text-center">
                    <label
                      className="
        inline-flex items-center justify-center gap-2
        h-10 px-5
        rounded-full
        bg-gradient-to-r from-[#9ECAD6] to-[#113F67]
        text-white font-semibold
        cursor-pointer
        shadow
        hover:from-[#8ABBC9] hover:to-[#0E3456]
        transition
      "
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files &&
                          uploadFile(r.templateId, e.target.files[0])
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

      {/* MODAL LIST FILE */}
      {openRow && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-[720px] max-h-[80vh] overflow-auto">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">{openRow.title}</h3>
                <button onClick={() => setOpenRow(null)}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <table className="w-full text-sm">
                <tbody>
                  {openRow.files.map((f, i) => (
                    <tr key={f.id} className="border-b">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2">{f.file_name}</td>
                      <td className="py-2">{formatDate(f.uploaded_at)}</td>
                      <td className="py-2">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => preview(f)}
                            className="p-1 rounded hover:bg-slate-100"
                            title="Preview"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => download(f)}
                            className="p-1 rounded hover:bg-slate-100"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setConfirmDelete(f)}
                              className="p-1 rounded hover:bg-red-50"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5 text-red-600" />
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

      {/* PREVIEW */}
      {previewFile && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-xl w-[90%] h-[90%] flex flex-col">
              <div className="flex justify-between p-3 border-b">
                <span>{previewFile.file_name}</span>
                <button onClick={closePreview}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <iframe src={previewFile.previewUrl} className="flex-1 w-full" />
            </div>
          </div>
        </ModalPortal>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded p-6 w-96 text-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="font-semibold mb-4">Hapus file ini?</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmDelete(null)}>Batal</button>
                <button onClick={deleteConfirmed} className="text-red-600">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* UPLOADING */}
      {uploading && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded p-4">Mengunggah file...</div>
          </div>
        </ModalPortal>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow">
          <CheckCircleIcon className="w-5 h-5 inline mr-1" />
          {toast}
        </div>
      )}
    </div>
  );
}
