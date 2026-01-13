import React, { useCallback } from "react";
import { HomeIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import { useNavigate, useLocation } from "react-router-dom";

/* ================= TYPES ================= */

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

/* ================= DATA ================= */

const NAV_ITEMS = [
  { id: "home", icon: HomeIcon, label: "Beranda", path: "/" },
  { id: "pelabuhan", icon: GlobeAltIcon, label: "Pelabuhan", path: "/pelabuhan" },
];

/* ================= NAV BUTTON ================= */

function NavButton({
  icon: Icon,
  label,
  active,
  collapsed,
  onClick,
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        group w-full rounded-lg transition-colors duration-200
        ${collapsed
          ? "flex justify-center py-3"
          : "flex items-center gap-3 px-3 py-2"}
        ${
          active
            ? "bg-white shadow ring-2 ring-sky-300"
            : "hover:bg-white/10"
        }
      `}
    >
      {/* ICON */}
      <Icon
        className={`
          w-6 h-6 shrink-0 transition-colors duration-200
          ${
            active
              ? "text-sky-900"
              : "text-white/70 group-hover:text-white"
          }
        `}
      />

      {/* TEXT (HANYA TERLIHAT SAAT EXPANDED) */}
      {!collapsed && (
        <span
          className={`
            whitespace-nowrap font-medium transition-colors duration-200
            ${
              active
                ? "text-sky-900"
                : "text-white/80 group-hover:text-white"
            }
          `}
        >
          {label}
        </span>
      )}
    </button>
  );
}

/* ================= SIDEBAR ================= */

export default function SidebarOptimized({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    NAV_ITEMS.find((i) => i.path === location.pathname)?.id || "home";

  const toggle = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed]
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen
        ${collapsed ? "w-20" : "w-80"}
        transition-[width] duration-300 ease-in-out
        bg-gradient-to-b from-sky-900 to-sky-300
        flex flex-col z-50
        overflow-hidden
      `}
    >
      {/* ===== HEADER / LOGO ===== */}
      <div
        className={`
          flex flex-col items-center border-b border-white/20
          ${collapsed ? "justify-center py-6" : "px-4 pt-6 pb-5"}
        `}
      >
        <button
          onClick={toggle}
          title={collapsed ? "Buka menu" : "Tutup menu"}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition"
        >
          <img
            src="/logo/perhubungan.png"
            alt="Logo"
            className="w-11 h-11 object-contain brightness-0 invert"
          />
        </button>

        {/* TEXT LOGO (HILANG SAAT COLLAPSED) */}
        {!collapsed && (
          <div className="mt-4 text-center">
            <div className="text-white font-bold text-2xl">DAMPRAH</div>
            <div className="text-sm text-white/80 leading-snug mt-1">
              Data Master Pelabuhan Penyeberangan Aceh
            </div>
          </div>
        )}
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 px-3 py-4 space-y-3">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
}
