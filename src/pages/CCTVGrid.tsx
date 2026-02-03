import { useParams } from "react-router-dom";
import HLSPlayer from "../components/HLSPlayer";
import ports from "../data/ports";

const MEULABOH_STREAMS = [
  {
    id: "m1",
    name: "CCTV 1",
    url: "http://123.108.97.129:7405/memfs/0bd0c54a-48fb-4100-8d45-fe50f15a43b9.m3u8",
  },
  {
    id: "m2",
    name: "CCTV 2",
    url: "http://123.108.97.129:7405/memfs/8de7c2a5-3700-4efc-b285-4db04287b5ff.m3u8",
  },
  {
    id: "m3",
    name: "CCTV 3",
    url: "http://123.108.97.129:7405/memfs/9d743f21-64fa-45e0-a64a-0e955576bd5b.m3u8",
  },
  {
    id: "m4",
    name: "CCTV 4",
    url: "http://123.108.97.129:7405/memfs/f7cd4349-dc2f-4004-b187-7ee00676d672.m3u8",
  },
  {
    id: "m5",
    name: "CCTV 5",
    url: "http://123.108.97.129:7405/memfs/d574084e-4876-46ba-8f23-dc7c0c7b5d1b.m3u8",
  },
];

export default function CCTVGrid() {
  const { portId } = useParams();
  const port = ports.find((p) => p.id === portId);

  // sementara: hanya Meulaboh
  const streams = portId === "meulaboh" ? MEULABOH_STREAMS : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">
        CCTV {port?.name}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {port?.subtitle}
      </p>

      {streams.length === 0 ? (
        <p className="text-gray-500">
          CCTV belum tersedia untuk pelabuhan ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {streams.map((cam) => (
            <div
              key={cam.id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-gray-100 px-3 py-2 text-sm font-medium">
                {cam.name}
              </div>

              <div className="aspect-video">
                <HLSPlayer src={cam.url} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
