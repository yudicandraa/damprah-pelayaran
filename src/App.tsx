import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PortGrid from "./components/PostGrid";
import PortDetail from "./components/PortDetail";
import { ports as portsData } from "./data/ports";
import Pelabuhan from "./pages/Pelabuhan";

const ports = [
  { id: "ulee", name: "Ulee Lheue", subtitle: "Pelabuhan", img: "/images/ulee-lheue.jpg" },
  { id: "lamteng", name: "Lamteng", subtitle: "Pelabuhan", img: "/images/lamteng.jpg" },
  { id: "meulaboh", name: "Meulaboh", subtitle: "Pelabuhan", img: "/images/meulaboh.jpg" },
  { id: "labuhan", name: "Labuhan Haji", subtitle: "Pelabuhan", img: "/images/labuhan-haji.jpg" },
  { id: "sinabang", name: "Sinabang", subtitle: "Pelabuhan", img: "/images/sinabang.jpg" },
  { id: "pulau", name: "Pulau Banyak", subtitle: "Pelabuhan", img: "/images/pulau-banyak.jpg" }
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 lg:p-12">
          <Header />
          <main className="mt-8">
            <Routes>
              <Route path="/" element={<PortGrid ports={portsData} />} />
              <Route path="/port/:id" element={<PortDetail ports={portsData} />} />
              <Route path="/pelabuhan" element={<Pelabuhan />} />
              {/* tambahkan route lain bila perlu */}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}