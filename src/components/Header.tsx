import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../auth/auth";

export default function Header() {
  const navigate = useNavigate();
  const role = getUserRole(); // "admin" | "user" | null
  const isAdmin = role === "admin";

  function handleLogout() {
    logout(); // hapus token
    navigate("/login", { replace: true });
  }

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div
        className={`
      max-w-7xl mx-auto py-3
      px-6 lg:px-8
      flex items-center justify-between
    `}
      >

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-800">
            Data Master Pelabuhan Penyeberangan Aceh
          </div>

          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
