// src/lib/portsLoader.ts
import { supabase } from "../lib/supabaseClient";
import type { DocumentRow, Port } from "../data/ports";

/**
 * Konfigurasi
 */
const BUCKET = "dokumen-pelabuhan-aceh"; // sesuaikan jika beda

type StorageFileInfo = {
  name: string;
  id?: string;
  updated_at?: string;
  // path akan dibentuk saat listing (Supabase returns .name and full path depending on SDK)
};

/**
 * 1) Ambil semua file di bucket (atau list per-prefix jika bucket besar)
 *  - Supabase JS/storage.list supports `path` and `limit` & `offset`.
 *  - Kode ini melakukan: list("", {limit: 1000}) — jika file banyak, perlu paging.
 */
export async function listAllFilesInBucket(): Promise<{ path: string; name: string }[]> {
  // NOTE: jika bucket sangat besar, ubah jadi list per-port atau gunakan paging
  const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });
  if (error) {
    console.warn("listAllFilesInBucket error:", error);
    return [];
  }
  // Depending on SDK, `data` might include folder markers; here we only take files and compute path
  // supabase .list("") returns objects with {name, id, updated_at, ...}, but does not give full path (the path is relative)
  // We assume top-level files are either folders or files; to get nested, we might need to call list on each folder.
  // Safer approach: first list root to get folders (port ids), then list each folder to get files.
  // We'll implement root folder listing and then list each folder.
  return (data || []).map((d: any) => ({ path: d.name, name: d.name }));
}

/**
 * 1b) List children of a folder (prefix)
 */
export async function listFilesInFolder(folder: string) {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000, offset: 0 });
  if (error) {
    console.warn("listFilesInFolder error for", folder, error);
    return [];
  }
  return (data || []).map((d: any) => ({ ...d, path: `${folder}/${d.name}` }));
}

/**
 * 2) Ambil metadata dari tabel `documents` (jika kamu simpan metadata upload di DB)
 *    Kolom yang diasumsikan: id, port_id, file_name, path, uploaded_at, status, uploaded_by, note
 */
export async function fetchDocumentsTable(): Promise<
  { id: number | string; port_id: string; file_name: string; path: string; uploaded_at?: string; status?: string; note?: string }[]
> {
  const { data, error } = await supabase.from("documents").select("*");
  if (error) {
    console.warn("fetchDocumentsTable error:", error);
    return [];
  }
  return (data || []) as any[];
}

/**
 * Utility: group array of files by first path segment (assume structure: <portId>/<docId>/<filename> OR <portId>/<filename>)
 */
function groupFilesByPort(files: { path: string; name?: string }[]) {
  const map: Record<string, { path: string; name?: string }[]> = {};
  for (const f of files) {
    const segments = f.path.split("/").filter(Boolean);
    if (segments.length === 0) continue;
    const portId = segments[0];
    map[portId] = map[portId] || [];
    map[portId].push(f);
  }
  return map;
}

/**
 * 3) MAIN: bangun Port[] nyata
 *
 * Strategy:
 * - Dapatkan daftar folder di root (anggap setiap folder = portId) dengan list("", { ... })
 * - Untuk tiap folder (portId) listFilesInFolder(portId) untuk dapat file list
 * - Ambil metadata tabel documents dan pakai untuk melengkapi (filename, status, note, path)
 * - Untuk title dokumen gunakan `documentTemplates` yang sudah ada di ../data/ports
 *
 * Returns: Port[] (id, name = portId as fallback, documents array)
 */
import { documentTemplates } from "../data/ports";

export async function loadPortsFromStorageAndDB(): Promise<Port[]> {
  // 1) list root to get folder names
  const { data: rootList, error: rootErr } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  if (rootErr) {
    console.warn("loadPortsFromStorageAndDB root list error:", rootErr);
    // fallback: return empty array
  }

  // rootList contains files and folders (folders will have `name`, but there is no explicit folder flag in some SDKs)
  const folders = (rootList || [])
    .filter((r: any) => r.name) // hope these are folder names; you may need to detect if r.type === 'folder' depending on SDK
    .map((r: any) => r.name);

  // 2) list files for each folder (port)
  const perPortFilesMap: Record<string, { path: string; name?: string }[]> = {};
  for (const folder of folders) {
    try {
      const fl = await listFilesInFolder(folder);
      perPortFilesMap[folder] = fl.map((f) => ({ path: f.path ?? `${folder}/${f.name}`, name: f.name }));
    } catch (e) {
      perPortFilesMap[folder] = [];
    }
  }

  // 3) additionally, fetch documents table to get richer metadata
  const docsTable = await fetchDocumentsTable();
  // group docsTable by port_id
  const docsByPort: Record<string, typeof docsTable> = {};
  for (const d of docsTable) {
    if (!d.port_id) continue;
    docsByPort[d.port_id] = docsByPort[d.port_id] || [];
    docsByPort[d.port_id].push(d);
  }

  // 4) Build Port[] — note: we don't invent name/hero/img — we only set id and documents.
  //    If you have a separate metadata source for port name/hero/img, merge it here.
  const ports: Port[] = folders.map((portId) => {
    const files = perPortFilesMap[portId] || [];
    const tableDocs = docsByPort[portId] || [];

    // Build documents array using documentTemplates: if there's a matching tableDoc for template id or file presence -> mark Terunggah
    const documents: DocumentRow[] = documentTemplates.map((tpl) => {
      // try to find table entry by template id in path or by title match
      const matchTable = tableDocs.find((td) => {
        // if td.path includes tpl.id OR td.file_name includes tpl.title keywords
        if (!td.path && !td.file_name) return false;
        const pathLower = (td.path ?? "").toLowerCase();
        const nameLower = (td.file_name ?? "").toLowerCase();
        if (pathLower.includes(tpl.id.toLowerCase())) return true;
        if (nameLower.includes(tpl.title.toLowerCase().split(" ")[0])) return true;
        return false;
      });

      // or find file in storage folder that matches tpl.id or tpl.title hint
      const matchFile = files.find((f) => {
        const p = (f.path ?? "").toLowerCase();
        const n = (f.name ?? "").toLowerCase();
        if (p.includes(tpl.id.toLowerCase())) return true;
        if (n.includes(tpl.title.toLowerCase().split(" ")[0])) return true;
        return false;
      });

      return {
        id: tpl.id,
        title: tpl.title,
        status: (matchTable?.status as DocumentRow["status"]) ?? (matchFile ? "Terunggah" : "Belum Unggah"),
        note: matchTable?.file_name ?? (matchFile?.name ?? undefined),
      };
    });

    return {
      id: portId,
      name: portId, // fallback: gunakan portId sebagai name; jika ada metadata nama, ganti/merge di sini
      subtitle: "Pelabuhan Penyeberangan",
      hero: undefined,
      img: undefined,
      documents,
    };
  });

  return ports;
}
