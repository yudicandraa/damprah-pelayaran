// src/components/DocumentTable.tsx
import React, { useEffect, useState } from "react";
import type { DocumentRow } from "../data/ports";
import {
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ArrowDownOnSquareIcon,
  XMarkIcon,
  EyeDropperIcon,
} from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

/** Small status pill component */
function StatusPill({ status }: { status: DocumentRow["status"] }) {
  const map: Record<string, string> = {
    Terunggah: "bg-green-100 text-green-800",
    "Belum Unggah": "bg-red-100 text-red-800",
    Terverifikasi: "bg-blue-100 text-blue-800",
    Ditolak: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        map[String(status)] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

/** Tipetype untuk baris lokal (memuat path/download/metadata) */
type LocalRow = DocumentRow & {
  path?: string | null;
  downloadUrl?: string | null;
  note?: string | null;
  metadata_id?: number | null;

  // info terakhir
  lastUploadedAt?: string | null;
  lastFileName?: string | null;
};

type FileMeta = {
  id: number;
  port_id: string;
  file_name: string;
  path: string;
  uploaded_at: string;
  uploaded_by?: string | null;
};

export default function DocumentTable({
  portId,
  rows,
}: {
  portId: string;
  rows: DocumentRow[];
}) {
  const BUCKET = "dokumen-pelabuhan-aceh";

  const [localRows, setLocalRows] = useState<LocalRow[]>([]);
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  // files per template id cache
  const [filesMap, setFilesMap] = useState<Record<string, FileMeta[]>>({});
  const [loadingFilesFor, setLoadingFilesFor] = useState<string | null>(null);

  // modal state (current template whose files are shown)
  const [openTemplate, setOpenTemplate] = useState<string | null>(null);

  // preview state (file selected to preview)
  const [previewFile, setPreviewFile] = useState<FileMeta | null>(null);
  const [previewUrlMap, setPreviewUrlMap] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const initial = rows.map((r) => ({
      ...r,
      status: (r.status ?? "Belum Unggah") as DocumentRow["status"],
      path: (r as any).path ?? undefined,
      downloadUrl: (r as any).downloadUrl ?? undefined,
      note: (r as any).note ?? undefined,
      metadata_id: (r as any).metadata_id ?? undefined,
      lastUploadedAt: (r as any).lastUploadedAt ?? null,
      lastFileName: (r as any).lastFileName ?? null,
    }));
    setLocalRows(initial);
  }, [rows]);

  // fetch all documents for this port once and merge
  useEffect(() => {
    if (!portId) return;
    let mounted = true;

    async function fetchExistingDocuments() {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("port_id", portId)
          .order("uploaded_at", { ascending: false });

        if (!mounted) return;
        if (error) {
          console.warn("[DocumentTable] fetch documents error:", error);
          return;
        }
        if (!data || data.length === 0) {
          // clear filesMap and leave rows as Belum Unggah
          setFilesMap({});
          setLocalRows((prev) =>
            prev.map((r) => ({ ...r, status: "Belum Unggah", lastFileName: null, lastUploadedAt: null }))
          );
          return;
        }

        // group by templateId: path => portId/templateId/filename
        const byTemplateId: Record<string, FileMeta[]> = {};
        for (const row of data) {
          if (!row.path || typeof row.path !== "string") continue;
          const parts = row.path.split("/").filter(Boolean);
          // expect parts: [portId, templateId, filename...]
          if (parts.length >= 2 && parts[0] === portId) {
            const templateId = parts[1];
            if (!byTemplateId[templateId]) byTemplateId[templateId] = [];
            byTemplateId[templateId].push({
              id: row.id,
              port_id: row.port_id,
              file_name: row.file_name,
              path: row.path,
              uploaded_at: row.uploaded_at,
              uploaded_by: row.uploaded_by,
            });
          }
        }

        // merge into localRows: set status Terunggah if any file exists and set lastUploaded info
        setFilesMap(byTemplateId);
        setLocalRows((prev) =>
          prev.map((r) => {
            const has = byTemplateId[String(r.id)] ?? [];
            if (has.length > 0) {
              const latest = has[0]; // because ordered by uploaded_at desc
              return {
                ...r,
                status: "Terunggah" as DocumentRow["status"],
                lastFileName: latest.file_name,
                lastUploadedAt: latest.uploaded_at,
                note: latest.file_name ?? r.note ?? "",
              };
            }
            return { ...r, status: "Belum Unggah", lastFileName: null, lastUploadedAt: null };
          })
        );
      } catch (err) {
        console.error("[DocumentTable] unexpected fetchExistingDocuments error:", err);
      }
    }

    fetchExistingDocuments();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portId, rows]);

  function setRowPartial(id: DocumentRow["id"], patch: Partial<LocalRow>) {
    setLocalRows((prev) =>
      prev.map((r) => (String(r.id) === String(id) ? { ...r, ...patch } : r))
    );
  }

  // UPLOAD logic
  async function handleFileSelected(id: DocumentRow["id"], file?: File) {
    if (!file) return;
    setUploadingMap((m) => ({ ...m, [String(id)]: true }));
    setErrorMap((m) => ({ ...m, [String(id)]: "" }));

    const row = localRows.find((r) => String(r.id) === String(id));
    if (!row) {
      const msg = "Row tidak ditemukan";
      console.error(msg);
      setErrorMap((m) => ({ ...m, [String(id)]: msg }));
      setUploadingMap((m) => ({ ...m, [String(id)]: false }));
      return;
    }

    try {
      const filename = `${Date.now()}_${file.name}`;
      const path = `${portId}/${row.id}/${filename}`;

      const uploadResp = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
      if ((uploadResp as any).error) throw (uploadResp as any).error;
      const uploadData = (uploadResp as any).data;
      if (!uploadData?.path) throw new Error("Upload succeeded but no path returned");

      let signedUrl: string | null = null;
      try {
        const signedResp = await supabase.storage.from(BUCKET).createSignedUrl(uploadData.path, 60 * 60);
        if (!(signedResp as any).error) {
          signedUrl = (signedResp as any).data?.signedUrl ?? null;
        }
      } catch (e) {
        console.warn("[UPLOAD] signed url generation failed", e);
      }

      try {
        const insertResp = await supabase
          .from("documents")
          .insert({
            port_id: portId,
            file_name: file.name,
            path: uploadData.path,
            uploaded_by: null,
            status: "uploaded",
          })
          .select()
          .single();

        if ((insertResp as any).error) throw (insertResp as any).error;
        const saved = (insertResp as any).data;

        // update local structures: add file to filesMap[templateId]
        const templateId = String(row.id);
        const newEntry: FileMeta = {
          id: saved?.id ?? Date.now(),
          port_id: portId,
          file_name: file.name,
          path: uploadData.path,
          uploaded_at: saved?.uploaded_at ?? new Date().toISOString(),
          uploaded_by: saved?.uploaded_by ?? null,
        };

        setFilesMap((m) => {
          const prev = m[templateId] ?? [];
          return { ...m, [templateId]: [newEntry, ...prev] };
        });

        // update row with lastUploaded info
        setRowPartial(row.id, {
          status: "Terunggah",
          path: uploadData.path,
          downloadUrl: signedUrl,
          note: file.name,
          metadata_id: saved?.id ?? null,
          lastFileName: file.name,
          lastUploadedAt: newEntry.uploaded_at,
        });
      } catch (insertErr: any) {
        console.error("[INSERT] failed:", insertErr);
        setErrorMap((m) => ({ ...m, [String(id)]: "Insert metadata failed: " + (insertErr?.message ?? String(insertErr)) }));
        setRowPartial(row.id, { status: "Terunggah", path: uploadData.path, downloadUrl: signedUrl, note: file.name, lastFileName: file.name, lastUploadedAt: new Date().toISOString() });
      }
    } catch (errAny: any) {
      console.error("[UPLOAD] overall error:", errAny);
      const pretty = {
        message: errAny?.message ?? String(errAny),
      };
      setErrorMap((m) => ({ ...m, [String(id)]: pretty.message }));
    } finally {
      setUploadingMap((m) => ({ ...m, [String(id)]: false }));
    }
  }

  // Create signed url helper
  async function getSignedUrl(path: string) {
    // simple cache: return if exists in previewUrlMap
    if (previewUrlMap[path]) return previewUrlMap[path];
    try {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
      if (error) {
        console.error("signedUrl error", error);
        return null;
      }
      // store in map
      setPreviewUrlMap((m) => ({ ...m, [path]: data.signedUrl }));
      return data.signedUrl;
    } catch (e) {
      console.error("signedUrl unexpected", e);
      return null;
    }
  }

  // Open file list for a template: fetch if not cached
  async function openFileListFor(templateId: string) {
    setOpenTemplate(templateId);
    setPreviewFile(null);
    // if cached already, don't refetch; but refresh is acceptable
    if (filesMap[templateId] && filesMap[templateId].length > 0) return;
    setLoadingFilesFor(templateId);
    try {
      // query documents where port_id = portId and path LIKE 'portId/templateId/%'
      const likePattern = `${portId}/${templateId}/%`;
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("port_id", portId)
        .like("path", likePattern)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.warn("[openFileListFor] error:", error);
        setFilesMap((m) => ({ ...m, [templateId]: [] }));
        return;
      }
      const mapped: FileMeta[] = (data ?? []).map((r: any) => ({
        id: r.id,
        port_id: r.port_id,
        file_name: r.file_name,
        path: r.path,
        uploaded_at: r.uploaded_at,
        uploaded_by: r.uploaded_by,
      }));
      setFilesMap((m) => ({ ...m, [templateId]: mapped }));

      // update last info on the row (if available)
      if (mapped.length > 0) {
        const latest = mapped[0];
        setRowPartial(templateId, { lastFileName: latest.file_name, lastUploadedAt: latest.uploaded_at, status: "Terunggah", note: latest.file_name });
      } else {
        setRowPartial(templateId, { lastFileName: null, lastUploadedAt: null, status: "Belum Unggah", note: undefined });
      }
    } catch (e) {
      console.error("[openFileListFor] unexpected:", e);
      setFilesMap((m) => ({ ...m, [templateId]: [] }));
    } finally {
      setLoadingFilesFor(null);
    }
  }

  // Delete single file (path + metadata)
  async function deleteFile(file: FileMeta, templateId: string) {
    if (!confirm(`Hapus file "${file.file_name}"? Tindakan ini akan menghapus file dan metadata.`)) return;

    try {
      // remove from storage
      const { error: rmError } = await supabase.storage.from(BUCKET).remove([file.path]);
      if (rmError) {
        console.error("[deleteFile] storage remove error:", rmError);
        alert("Gagal menghapus file di storage: " + (rmError.message ?? String(rmError)));
        return;
      }

      // delete metadata rows by path or id
      const { error: delErr } = await supabase.from("documents").delete().eq("path", file.path);
      if (delErr) {
        console.warn("[deleteFile] delete metadata by path error:", delErr);
        // try by id fallback
        await supabase.from("documents").delete().eq("id", file.id);
      }

      // update filesMap & localRows
      setFilesMap((m) => {
        const arr = (m[templateId] ?? []).filter((f) => f.path !== file.path);
        // update localRows' last info based on arr
        if (arr.length > 0) {
          const latest = arr[0];
          setRowPartial(templateId, { status: "Terunggah", lastFileName: latest.file_name, lastUploadedAt: latest.uploaded_at, note: latest.file_name });
        } else {
          setRowPartial(templateId, { status: "Belum Unggah", lastFileName: null, lastUploadedAt: null, note: undefined, path: undefined, downloadUrl: undefined, metadata_id: undefined });
        }
        return { ...m, [templateId]: arr };
      });

      // remove cached preview url for deleted path (if any)
      setPreviewUrlMap((m) => {
        const copy = { ...m };
        delete copy[file.path];
        return copy;
      });

      // if previewing this file, close preview
      if (previewFile && previewFile.path === file.path) setPreviewFile(null);

      alert("File dihapus.");
    } catch (err: any) {
      console.error("[deleteFile] unexpected:", err);
      alert("Gagal menghapus file: " + (err?.message ?? String(err)));
    }
  }

  // download helper
  async function downloadFile(file: FileMeta) {
    const url = await getSignedUrl(file.path);
    if (!url) return alert("Gagal membuat link download");
    window.open(url, "_blank");
  }

  // preview helper
  async function previewSelectedFile(file: FileMeta) {
    setPreviewFile(file);
    setLoadingPreview(true);
    try {
      const url = await getSignedUrl(file.path);
      if (!url) {
        alert("Gagal membuat link preview");
        setPreviewFile(null);
      } else {
        // previewUrlMap already set in getSignedUrl
        // now preview is ready (previewFile + url in previewUrlMap)
      }
    } catch (e) {
      console.error("[previewSelectedFile] error", e);
      setPreviewFile(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  // helper to determine mime from filename extension (simple)
  function guessMimeFromName(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["pdf"].includes(ext)) return "application/pdf";
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) return "image";
    if (["txt", "md"].includes(ext)) return "text";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "office";
    return "other";
  }

  // Render modal/popover that shows file list for openTemplate, now with preview panel
  function FileListModal({
    templateId,
    onClose,
  }: {
    templateId: string;
    onClose: () => void;
  }) {
    const files = filesMap[templateId] ?? [];
    const loading = loadingFilesFor === templateId;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative w-[min(980px,98%)] max-h-[88vh] overflow-hidden bg-white rounded-lg shadow-lg p-3 z-10 flex">
          {/* LEFT: file list */}
          <div className="w-[36%] border-r pr-3 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">Daftar file</h3>
                <div className="text-sm text-slate-500">{files.length} file</div>
              </div>
              <button onClick={onClose} className="p-2 rounded bg-gray-100">
                <XMarkIcon className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <div>
              {loading && <div className="text-sm text-slate-500">Memuat...</div>}
              {!loading && files.length === 0 && <div className="text-sm text-slate-500">Belum ada file.</div>}

              <ul className="space-y-2 mt-2">
                {files.map((f) => {
                  const mimeGuess = guessMimeFromName(f.file_name);
                  return (
                    <li key={f.id} className="p-2 border rounded flex items-start gap-2">
                      <div className="flex-1">
                        <button
                          onClick={() => previewSelectedFile(f)}
                          className="text-left w-full"
                          title="Klik untuk preview"
                        >
                          <div className="font-medium text-sm break-words">{f.file_name}</div>
                          <div className="text-xs text-slate-500">{new Date(f.uploaded_at).toLocaleString()}</div>
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => downloadFile(f)}
                          className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sm flex items-center gap-1"
                          title="Download"
                        >
                          <ArrowDownOnSquareIcon className="w-4 h-4 text-sky-600" />
                        </button>

                        <button
                          onClick={() => deleteFile(f, templateId)}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-sm flex items-center gap-1"
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RIGHT: preview panel */}
          <div className="flex-1 p-3 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-md font-medium">Preview</h4>
                <div className="text-sm text-slate-500">
                  {previewFile ? previewFile.file_name : "Pilih file untuk melihat preview"}
                </div>
              </div>
              <div>
                {previewFile && (
                  <button
                    onClick={() => {
                      // open in new tab
                      const url = previewFile ? previewUrlMap[previewFile.path] : null;
                      if (url) window.open(url, "_blank");
                      else alert("Preview belum tersedia, silakan tunggu atau klik Download.");
                    }}
                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    Buka di Tab Baru
                  </button>
                )}
              </div>
            </div>

            <div className="border rounded h-[64vh] overflow-auto flex items-center justify-center bg-slate-50">
              {loadingPreview && <div className="text-sm text-slate-500">Mempersiapkan preview...</div>}

              {!previewFile && !loadingPreview && <div className="text-sm text-slate-500">Tidak ada file dipilih</div>}

              {previewFile && !loadingPreview && (() => {
                const url = previewUrlMap[previewFile.path];
                const mimeGuess = guessMimeFromName(previewFile.file_name);
                // If no url yet, show loading / button to fetch (shouldn't happen because previewSelectedFile fetches)
                if (!url) return <div className="text-sm text-slate-500">Preview belum tersedia — cobalah sekali lagi.</div>;

                if (mimeGuess === "application/pdf" || previewFile.file_name.toLowerCase().endsWith(".pdf")) {
                  // PDF: use iframe/embed
                  return (
                    <iframe
                      title={previewFile.file_name}
                      src={url}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    />
                  );
                }

                if (mimeGuess === "image") {
                  return <img src={url} alt={previewFile.file_name} className="max-w-full max-h-full object-contain" />;
                }

                if (mimeGuess === "text") {
                  // try fetch text content (small files)
                  return (
                    <iframe
                      title={previewFile.file_name}
                      src={url}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    />
                  );
                }

                // office or other: fallback message + download button
                return (
                  <div className="text-sm text-slate-600 flex flex-col items-center gap-3">
                    <div>Tipe file tidak didukung untuk preview di browser.</div>
                    <div className="text-xs text-slate-400">Silakan klik "Buka di Tab Baru" atau "Download".</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          const url = previewUrlMap[previewFile.path];
                          if (url) window.open(url, "_blank");
                        }}
                        className="px-3 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sm"
                      >
                        Buka di Tab Baru
                      </button>
                      <button
                        onClick={() => downloadFile(previewFile)}
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b">
            <th className="py-3">Dokumen</th>
            <th className="py-3">Status</th>
            <th className="py-3">Aksi</th>
            <th className="py-3">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {localRows.map((r, idx) => {
            const templateId = String(r.id);
            const filesFor = filesMap[templateId] ?? [];
            const fileCount = filesFor.length;

            // build keterangan text (prioritize lastUploaded fields)
            const keterangan = r.lastUploadedAt && r.lastFileName
              ? `Updated: ${new Date(r.lastUploadedAt).toLocaleString()}`
              : fileCount > 0
              ? `${fileCount} file`
              : "Belum ada file";

            return (
              <tr key={String(r.id) + "-" + idx} className={`align-top border-b last:border-b-0 ${idx % 2 === 0 ? "bg-white" : "bg-white"}`}>
                <td className="py-3 pr-4">
                  {idx + 1}. {r.title}
                </td>

                <td className="py-3">
                  <StatusPill status={r.status} />
                </td>

                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {/* Eye opens modal listing all files for this template */}
                    <button
                      title="Lihat daftar file"
                      onClick={() => openFileListFor(templateId)}
                      className={`p-2 rounded ${fileCount > 0 ? "bg-sky-50 hover:bg-sky-100" : "bg-gray-100"}`}
                    >
                      <div className="flex items-center gap-2">
                        <EyeIcon className={`w-4 h-4 ${fileCount > 0 ? "text-sky-600" : "text-slate-400"}`} />
                        {fileCount > 0 && <span className="text-xs">{fileCount}</span>}
                      </div>
                    </button>

                    {/* Upload when Belum Unggah or even when exist allow adding more */}
                    <label className="p-2 rounded bg-gray-50 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                      <CloudArrowUpIcon className="w-4 h-4 text-slate-700" />
                      <span className="text-xs">Unggah</span>
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
                    {uploadingMap[String(r.id)] && <span className="text-xs text-slate-500">Mengunggah...</span>}
                  </div>

                  {errorMap[String(r.id)] && <div className="text-xs text-red-600 mt-1">{errorMap[String(r.id)]}</div>}
                </td>

                <td className="py-3 text-slate-500 break-words">{keterangan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal: show file list for openTemplate */}
      {openTemplate && <FileListModal templateId={openTemplate} onClose={() => { setOpenTemplate(null); setPreviewFile(null); }} />}
    </div>
  );
}
