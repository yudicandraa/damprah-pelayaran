import React from "react";
import { NavLink } from "react-router-dom";

type PortProp = {
  id: string;
  name: string;
  subtitle?: string;
  img?: string;
};

type Props = { port: PortProp };

export default function PortCard({ port }: Props) {
  const fallback = "/images/default-placeholder.jpg"; // sediakan file ini di public/images
  const src = port.img ?? fallback;

  // className generator for base + active
  const baseClass =
    "relative h-40 md:h-44 rounded-xl overflow-hidden shadow-md transform-gpu transition focus:outline-none";
  const innerImgClass = "absolute inset-0 w-full h-full object-cover";

  return (
    <NavLink
      to={`/port/${port.id}`}
      aria-label={`Buka detail ${port.name}`}
      className={({ isActive }) =>
        // ring biru saat active, dan sama focus-visible saat keyboard
        `${baseClass} ${isActive ? "ring-4 ring-sky-400" : ""} group`
      }
    >
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={`${port.name} photo`}
          className={innerImgClass}
          loading="lazy"
        />

        {/* overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent"></div>

        {/* label */}
        <div className="absolute left-4 bottom-4 text-white">
          {port.subtitle && <div className="text-xs opacity-90">{port.subtitle}</div>}
          <h3 className="text-lg font-semibold">{port.name}</h3>
        </div>

        {/* subtle border */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10"></div>
      </div>
    </NavLink>
  );
}
