// src/components/PortDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Port, DocumentRow } from "../data/ports";
import { documentTemplates } from "../data/ports";
import DocumentTable from "./DocumentTable";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function PortDetail({ ports }: { ports: Port[] }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const port = ports.find((p) => p.id === id);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [imgKey, setImgKey] = useState(id ?? "none");

  useEffect(() => {
    setHeroLoaded(false);
    setImgKey(id ?? String(Date.now()));
  }, [id]);

  if (!port) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <p>Pelabuhan tidak ditemukan.</p>
        <Link to="/" className="text-sky-600 underline">Kembali ke dashboard</Link>
      </div>
    );
  }

  function handleBack() {
    try {
      navigate(-1);
    } catch {
      navigate("/", { replace: true });
    }
  }

  const heroSrc = port.hero ?? port.img ?? "/images/default-placeholder.jpg";

  // --- BUILD `rows` FOR DocumentTable ---
  // Normalisasi shape: { id, title, status, note?, path? }
  let rows: DocumentRow[] = [];

  if (Array.isArray((port as any).documents) && (port as any).documents.length > 0) {
    rows = (port as any).documents.map((d: any) => ({
      id: String(d.id ?? d.templateId ?? d.title),
      title: d.title ?? d.name ?? d.title,
      status: (d.status ?? "Belum Unggah") as DocumentRow["status"],
      note: d.note ?? d.fileName ?? undefined,
    }));
  } else {
    // fallback: gunakan documentTemplates (didefinisikan di ../data/ports)
    rows = documentTemplates.map((t) => ({
      id: String(t.id),
      title: t.title,
      status: "Belum Unggah" as DocumentRow["status"],
    }));
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-lg overflow-hidden border-4 border-sky-400">
        <div
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-300 ${heroLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="w-full h-40 md:h-56 bg-gradient-to-r from-slate-200 via-white to-slate-200 animate-pulse" />
        </div>

        <img
          key={imgKey}
          src={heroSrc}
          alt={`${port.name} hero`}
          className={`w-full h-40 md:h-56 object-cover transition-opacity duration-300 ${heroLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setHeroLoaded(true)}
          onError={() => setHeroLoaded(true)}
          loading="eager"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 pointer-events-none" />

        <div className="absolute left-6 bottom-6">
          <div className="text-xs text-slate-600">Pelabuhan Penyeberangan</div>
          <h2 className="text-4xl font-extrabold text-slate-900">{port.name}.</h2>
        </div>

        <button
          onClick={handleBack}
          aria-label="Kembali"
          className="absolute left-4 top-4 inline-flex items-center gap-2 bg-white/95 text-slate-800 p-2 rounded-full shadow hover:bg-white focus:outline-none focus:ring-4 focus:ring-sky-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="hidden md:inline">Kembali</span>
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-lg shadow p-4">
        <DocumentTable portId={port.id} rows={rows} />
      </div>
    </div>
  );
}
