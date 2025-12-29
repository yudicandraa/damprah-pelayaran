// src/data/ports.tsx  (Opsi B)
export type DocumentRow = {
  id: string;
  title: string;
  status?: "Terunggah" | "Belum Unggah" | "Terverifikasi" | "Ditolak";
  path?: string | null | undefined;
  downloadUrl?: string | null | undefined;
  note?: string | null | undefined;
  created_at?: string | null | undefined;
};

export type Port = {
  id: string;
  name: string;
  subtitle?: string;
  hero?: string;
  img?: string;
  documents?: DocumentRow[]; // opsional — DocumentTable akan fetch
};

export const documentTemplates = [
  { id: "d1", title: "Rencana Induk Pelabuhan" },
  { id: "d2", title: "FS" },
  { id: "d3", title: "DED" },
  { id: "d4", title: "Dokumen Amdal" },
  { id: "d5", title: "Surat Kementerian Perhubungan" },
  { id: "d6", title: "Surat Gubernur Aceh" },
  { id: "d7", title: "Surat Kepala Dinas" },
  { id: "d8", title: "Data Sarana Prasarana Pelabuhan" },
  { id: "d9", title: "Dokumen P3D" },
];

export const ports = [
  { id: "ulee-lheue", name: "Ulee Lheue", subtitle: "Pelabuhan Penyeberangan", hero: "/images/ulee-lheue.webp", img: "/images/ulee-lheue.webp" },
  { id: "lamteng", name: "Lamteng", subtitle: "Pelabuhan Penyeberangan", hero: "/images/lamteng.webp", img: "/images/lamteng.webp" },
  { id: "meulaboh", name: "Meulaboh", subtitle: "Pelabuhan Penyeberangan", hero: "/images/meulaboh.webp", img: "/images/meulaboh.webp" },
  { id: "labuhan-haji", name: "Labuhan Haji", subtitle: "Pelabuhan Penyeberangan", hero: "/images/labuhan-haji.webp", img: "/images/labuhan-haji.webp" },
  { id: "sinabang", name: "Sinabang", subtitle: "Pelabuhan Penyeberangan", hero: "/images/sinabang.webp", img: "/images/sinabang.webp" },
  { id: "pulau-banyak", name: "Pulau Banyak", subtitle: "Pelabuhan Penyeberangan", hero: "/images/pulau-banyak.webp", img: "/images/pulau-banyak.webp" },
];

export default ports;
  