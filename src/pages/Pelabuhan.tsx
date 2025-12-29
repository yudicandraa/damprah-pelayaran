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
  { id: "ulee-lheue", name: "Pelabuhan Ulee Lheue", lat: 5.564771, lng: 95.293473, type: "Kota Banda Aceh", info: "Pelabuhan Ulee Lheue" },
  { id: "lamteng", name: "Pelabuhan Lamteng", lat: 5.6417549, lng: 95.1589633, type: "Aceh Besar", info: "Pelabuhan Lamteng" },
  { id: "meulaboh", name: "Pelabuhan Meulaboh", lat: 4.2050372, lng: 96.0397789, type: "Aceh Barat", info: "Pelabuhan Meulaboh" },
  { id: "labuhan-haji", name: "Pelabuhan Labuhan Haji", lat: 3.5460545, lng: 96.998153, type: "Aceh Selatan", info: "Pelabuhan Labuhan Haji" },
  { id: "sinabang", name: "Pelabuhan Sinabang", lat: 2.4563128, lng: 96.4025222, type: "Simeulue", info: "Pelabuhan Sinabang" },
  { id: "pulau-banyak", name: "Pelabuhan Pulau Banyak", lat: 2.2954307, lng: 97.4069009, type: "Aceh Singkil", info: "Pelabuhan Pulau Banyak" },
];

// Custom icon
const portIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

// Komponen bantu: jika ada posisi terpilih, terbang ke lokasi tersebut
function FlyToPort({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 0.7 });
    }
  }, [position, map]);
  return null;
}

// Komponen bantu: simpan mapRef & setel view agar tampil semua marker saat peta dibuat
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
    try {
      if (boundsLatLng) {
        map.fitBounds(boundsLatLng, { padding: [50, 50] });
      }
    } catch (err) {
      console.warn("fitBounds error:", err);
    }
    return () => {
      mapRef.current = null;
    };
  }, [map, boundsLatLng]);
  return null;
}

export default function Pelabuhan() {
  const [selected, setSelected] = React.useState<Port | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Buat bounds semua pelabuhan
  const bounds: LatLngExpression[] = ports.map((p) => [p.lat, p.lng]);
  const boundsLatLng: LatLngBounds = L.latLngBounds(bounds);

  const center: [number, number] = [5.55, 95.32]; // fallback jika fitBounds gagal

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Peta Digital Pelabuhan Penyeberangan Aceh</h1>
        <div className="space-x-2">
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.fitBounds(boundsLatLng, { padding: [50, 50] });
                setSelected(null);
              }
            }}
            className="px-3 py-1 rounded bg-slate-700 text-white"
          >
            Reset view
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Panel daftar pelabuhan */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-3 h-[70vh] overflow-auto">
          <h2 className="font-medium mb-2">Daftar Pelabuhan</h2>
          <ul className="space-y-2">
            {ports.map((p) => (
              <li key={p.id} className="border rounded p-2 hover:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-slate-500">{p.type}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-sm px-2 py-1 rounded bg-sky-600 text-white"
                    >
                      Lihat
                    </button>
                    <a
                      className="text-xs mt-2 text-slate-400 hover:underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka di Maps
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Peta */}
        <div className="md:col-span-3 h-[70vh] rounded-lg overflow-hidden">
          <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }}>
            <SetMapRef mapRef={mapRef} boundsLatLng={boundsLatLng} />

            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
              url="http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />


            {ports.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={portIcon}
                eventHandlers={{
                  click: () => setSelected(p),
                }}
              >
                <Popup>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm">{p.type}</div>
                    {p.info && <div className="text-xs mt-1">{p.info}</div>}
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.flyTo([p.lat, p.lng], 13);
                          }
                        }}
                        className="text-xs px-2 py-1 rounded bg-sky-600 text-white"
                      >
                        Zoom ke sini
                      </button>
                    </div>
                  </div>
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
