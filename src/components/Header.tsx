import React from "react";

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">DAMPRAH</h1>
        <p className="text-sm text-slate-500">Data Master Pelabuhan Penyeberangan Aceh</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">Admin</div>
        <div className="w-9 h-9 rounded-full bg-slate-200" aria-hidden />
      </div>
    </header>
  );
}
