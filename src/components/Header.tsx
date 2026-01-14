import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../auth/auth";

export default function Header() {
  const navigate = useNavigate();
  const isAdmin = getUserRole() === "admin";

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="
        max-w-7xl mx-auto
        px-4 py-2
        md:px-6 md:py-3
        flex flex-col md:flex-row
        md:items-center md:justify-between
        gap-2
      ">
       <div
  className="
    font-bold text-sm sm:text-base md:text-lg
    pr-14 md:pr-0
    leading-tight
    break-words
  "
>
  Data Master Pelabuhan Penyeberangan Aceh
</div>


        <div className="flex items-center gap-3">
          <span className="text-[10px] md:text-xs px-2 py-1 bg-slate-100 rounded">
            {isAdmin ? "Admin" : "User"}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="text-sm text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
