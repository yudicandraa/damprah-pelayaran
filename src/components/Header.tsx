// src/components/Header.tsx
import React from "react";
import { getUserRole, logout } from "../auth/auth";

export default function Header() {
  const role = getUserRole();

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
          DAMPRAH
        </h1>
        <p className="text-sm text-slate-500">
          Data Master Pelabuhan Penyeberangan Aceh
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">
          {role === "admin" ? "Administrator" : "User"}
        </div>

        <button
          onClick={logout}
          className="text-sm px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
