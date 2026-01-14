import React from "react";
import { NavLink } from "react-router-dom";

export default function PortCard({ port }: any) {
  return (
    <NavLink
      to={`/port/${port.id}`}
      className="relative h-40 sm:h-44 rounded-xl overflow-hidden shadow"
    >
      <img
        src={port.img}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
      <div className="absolute bottom-4 left-4 text-white">
        <div className="text-xs">{port.subtitle}</div>
        <div className="font-semibold">{port.name}</div>
      </div>
    </NavLink>
  );
}
