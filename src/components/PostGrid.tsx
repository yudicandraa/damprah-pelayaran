import React from "react";
import PortCard from "./PostCard";
import type { Port } from "../data/ports";

export default function PortGrid({ ports }: { ports: Port[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ports.map((p) => (
        <PortCard key={p.id} port={p as any} />
      ))}
    </div>
  );
}
