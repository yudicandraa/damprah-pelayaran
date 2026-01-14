// src/pages/Pelabuhan.tsx
import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap, LatLngExpression, LatLngBounds } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Port = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  info?: string;
};

const ports: Port[] = [
  { id: "ulee-lheue", name: "Pelabuhan Ulee Lheue", lat: 5.564771, lng: 95.293473, type: "Kota Banda Aceh" },
  { id: "lamteng", name: "Pelabuhan Lamteng", lat: 5.6417549, lng: 95.1589633, type: "Aceh Besar" },
  { id: "meulaboh", name: "Pelabuhan Meulaboh", lat: 4.2050372, lng: 96.0397789, type: "Aceh Barat" },
  { id: "labuhan-haji", name: "Pelabuhan Labuhan Haji", lat: 3.5460545, lng: 96.998153, type: "Aceh Selatan" },
  { id: "sinabang", name: "Pelabuhan Sinabang", lat: 2.4563128, lng: 96.4025222, type: "Simeulue" },
  { id: "pulau-banyak", name: "Pelabuhan Pulau Banyak", lat: 2.2954307, lng: 97.4069009, type: "Aceh Singkil" },
];

// icon marker
const portIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function FlyToPort({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 0.7 });
    }
  }, [position, map]);
  return null;
}

function SetMapRef({
  mapRef,
  boundsLatLng,
}: {
  mapRef: React.MutableRefObject<LeafletMap | null>;
  boundsLatLng: LatLngBounds;
}) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    map.fitBounds(boundsLatLng, { padding: [50, 50] });
    return () => {
      mapRef.current = null;
    };
  }, [map, boundsLatLng]);
  return null;
}

export default function Pelabuhan() {
  const [selected, setSelected] = React.useState<Port | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const bounds: LatLngExpression[] = ports.map((p) => [p.lat, p.lng]);
  const boundsLatLng: LatLngBounds = L.latLngBounds(bounds);

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Peta Digital Pelabuhan Penyeberangan Aceh
      </h1>

      {/* RESPONSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* LIST */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-3
          h-[55vh] md:h-[70vh] overflow-auto">
          <h2 className="font-medium mb-2">Daftar Pelabuhan</h2>
          <ul className="space-y-2">
            {ports.map((p) => (
              <li key={p.id} className="border rounded p-2">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-slate-500">{p.type}</div>
                <button
                  onClick={() => setSelected(p)}
                  className="mt-2 text-xs px-2 py-1 rounded bg-sky-600 text-white"
                >
                  Lihat
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* MAP */}
        <div className="md:col-span-3 h-[55vh] md:h-[70vh] rounded-lg overflow-hidden">
          <MapContainer
            center={[5.55, 95.32]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
          >
            <SetMapRef mapRef={mapRef} boundsLatLng={boundsLatLng} />

            <TileLayer
              url="http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />

            {ports.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={portIcon}
                eventHandlers={{ click: () => setSelected(p) }}
              >
                <Popup>
                  <strong>{p.name}</strong>
                  <div className="text-xs">{p.type}</div>
                </Popup>
              </Marker>
            ))}

            <FlyToPort position={selected ? [selected.lat, selected.lng] : null} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
