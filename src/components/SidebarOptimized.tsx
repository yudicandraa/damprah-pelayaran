import React, { useCallback } from "react";
import {
  HomeIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", icon: HomeIcon, label: "Beranda", path: "/" },
  { id: "pelabuhan", icon: GlobeAltIcon, label: "Pelabuhan", path: "/pelabuhan" },
  {
    id: "cctv",
    icon: VideoCameraIcon,
    label: "Pantau CCTV",
    path: "/cctv",
  },
];

export default function SidebarOptimized({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed]
  );

  return (
    <>
      {/* HAMBURGER BUTTON (MOBILE) */}
      <button
        onClick={toggle}
        className="
          fixed top-3 right-3 z-[80]
          md:hidden
          bg-white p-2 rounded-lg shadow
        "
        aria-label="Toggle menu"
      >
        {collapsed ? (
          <Bars3Icon className="w-6 h-6 text-slate-800" />
        ) : (
          <XMarkIcon className="w-6 h-6 text-slate-800" />
        )}
      </button>

      {/* MOBILE FULLSCREEN SIDEBAR */}
      {!collapsed && (
        <div
          className="
            fixed top-0 left-0 right-0
            h-[100dvh]
            z-[70] md:hidden
            bg-gradient-to-b from-sky-900 to-sky-300
            flex
            overscroll-contain
          "
        >
          <button
            onClick={() => setCollapsed(true)}
            className="
              fixed top-3 right-3 z-[90]
              bg-white p-2 rounded-lg shadow
            "
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6 text-slate-800" />
          </button>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="flex flex-col gap-4 w-full items-center">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setCollapsed(true);
                    }}
                    className={`
                      w-[80vw] max-w-[280px]
                      h-12
                      flex items-center justify-center gap-2
                      rounded-xl
                      text-base font-semibold
                      transition
                      ${
                        active
                          ? "bg-white text-sky-900"
                          : "bg-white/15 text-white hover:bg-white/25"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          hidden md:flex md:flex-col
          bg-gradient-to-b from-sky-900 to-sky-300
          transition-all duration-300
          ${collapsed ? "w-20" : "w-80"}
        `}
      >
        <div
          className={`flex flex-col items-center border-b border-white/20
            ${collapsed ? "py-6" : "px-4 pt-6 pb-5"}
          `}
        >
          <button
            onClick={toggle}
            className="w-12 h-15 flex items-center justify-center"
          >
            <img
              src="/logo/perhubungan.png"
              alt="Logo"
              className="w-full h-full brightness-0 invert"
            />
          </button>

          {!collapsed && (
            <div className="mt-4 text-center text-white">
              <div className="text-2xl font-bold">DAMPRAH</div>
              <div className="text-sm opacity-80 leading-snug">
                Data Master Pelabuhan Penyeberangan Aceh
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-3">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full rounded-lg transition
                  ${
                    collapsed
                      ? "flex justify-center py-3"
                      : "flex items-center gap-3 px-3 py-2"
                  }
                  ${
                    active
                      ? "bg-white text-sky-900"
                      : "text-white/80 hover:bg-white/10"
                  }
                `}
              >
                <item.icon className="w-6 h-6 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
