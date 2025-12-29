// src/components/SidebarOptimized.tsx
import React, { useState, useCallback } from "react";
import {
  HomeIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useNavigate, useLocation } from "react-router-dom";

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NAV_ITEMS = [
  { id: "home", icon: HomeIcon, label: "Beranda", path: "/" },
  { id: "pelabuhan", icon: GlobeAltIcon, label: "Pelabuhan", path: "/pelabuhan" },
];

function NavButton({ icon: Icon, label, active, collapsed, onClick }: NavButtonProps) {
  const collapsedBtnClass =
    "w-12 h-12 flex items-center justify-center rounded-full transition-shadow duration-150 flex-shrink-0";
  const expandedBtnClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 transition-shadow duration-150";

  const baseBg = "bg-white";
  const activeStyle = "ring-2 ring-sky-300 shadow-sm";
  const notActiveHover = "hover:brightness-95";

  const iconColorWhenWhite = "text-sky-800";

  return (
    <button
      onClick={onClick}
      className={`${collapsed ? collapsedBtnClass : expandedBtnClass} ${baseBg} ${
        active ? activeStyle : notActiveHover
      }`}
      aria-pressed={active}
      title={label}
      style={{ transitionProperty: "box-shadow, background-color, transform" }}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColorWhenWhite}`} />
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-150 text-sky-900 font-normal ${
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
        }`}
        style={{ transitionProperty: "max-width, opacity" }}
      >
        {label}
      </span>
    </button>
  );
}

export default React.memo(function SidebarOptimized() {
  // default collapsed true jika mau start tertutup
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [active, setActive] = useState<string>("home");

  const navigate = useNavigate();
  const location = useLocation();

  // sync active dengan path saat mount / route change
  React.useEffect(() => {
    const found = NAV_ITEMS.find((i) => i.path === location.pathname);
    if (found) setActive(found.id);
    else setActive("home");
  }, [location.pathname]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const onNavClick = useCallback(
    (id: string, path: string) => {
      setActive(id);
      navigate(path);
    },
    [navigate]
  );

  // UBAH DI SINI: w-80 diubah ke w-96 agar lebih lebar
  const asideWidthClass = collapsed ? "w-20" : "w-96";

  return (
    <aside
      className={`${asideWidthClass} bg-gradient-to-b from-sky-900 to-sky-300 text-white flex flex-col items-center md:items-start p-4 overflow-visible`}
      aria-label="Sidebar"
    >
      {/* Header: conditional justify - center when collapsed so logo is centered */}
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} w-full mb-4`}
      >
        <div className="flex items-center gap-3">
          {/* Logo button */}
          <button
            onClick={toggle}
            aria-pressed={!collapsed}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            className="flex items-center justify-center rounded-full p-2 focus:outline-none hover:scale-105 transition-transform duration-150 z-10"
            style={{ background: "transparent" }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/logo/perhubungan.png"
                alt="Logo Dinas Perhubungan"
                className="w-9 h-9 object-contain"
                loading="lazy"
                width={36}
                height={36}
                decoding="async"
              />
            </div>
          </button>

          {/* header text only visible when expanded */}
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap transition-all duration-150 max-w-[300px] opacity-100">
              <div className="font-bold text-lg leading-tight text-white">DAMPRAH</div>
              <div className="text-xs opacity-80 text-white">Data Master Pelabuhan Penyeberangan Aceh</div>
            </div>
          )}
        </div>

        {/* right-side placeholder only when expanded to keep spacing */}
        {!collapsed && <div className="transition-opacity duration-150" />}
      </div>

      {/* Navigation: centered when collapsed so buttons appear in middle column */}
      <nav className={`flex flex-col gap-3 mt-2 ${collapsed ? "items-center" : "w-full"}`}>
        {NAV_ITEMS.map((it) => (
          <NavButton
            key={it.id}
            icon={it.icon}
            label={it.label}
            active={active === it.id}
            collapsed={collapsed}
            onClick={() => onNavClick(it.id, it.path)}
          />
        ))}
      </nav>

      {/* Footer - Logout button */}
      <div className="mt-auto w-full">
        <div className={`${collapsed ? "flex justify-center" : ""} w-full`}>
          <button
            onClick={() => {
              /* handle logout */
            }}
            className={`${
              collapsed ? "w-12 h-12 flex items-center justify-center rounded-full mx-auto" : "w-full flex items-center gap-3 rounded-lg px-3 py-2"
            } bg-white transition-shadow duration-150 hover:brightness-95`}
            title="Keluar"
          >
            <ArrowRightOnRectangleIcon className={`w-6 h-6 ${collapsed ? "text-sky-800" : "text-sky-800"}`} />
            {!collapsed && (
              <span className="overflow-hidden whitespace-nowrap transition-all duration-150 text-sky-900 font-normal max-w-[160px] opacity-100">
                Keluar
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
});
