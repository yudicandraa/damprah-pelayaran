import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidebarOptimized from "./components/SidebarOptimized";
import Header from "./components/Header";
import PortGrid from "./components/PostGrid";
import PortDetail from "./components/PortDetail";
import { ports as portsData } from "./data/ports";
import Pelabuhan from "./pages/Pelabuhan";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

/* ================= DASHBOARD LAYOUT ================= */

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SIDEBAR (FIXED) */}
      <SidebarOptimized
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENT */}
      <div
        className={`transition-all duration-300
          ${collapsed ? "ml-20" : "ml-80"}
        `}
      >
        {/* HEADER TETAP DI ATAS */}
        <Header />

        {/* MAIN CONTENT (SCROLL DI SINI) */}
        <main className="p-6 md:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== LOGIN ===== */}
        <Route path="/login" element={<Login />} />

        {/* ===== DASHBOARD ===== */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PortGrid ports={portsData} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/port/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PortDetail ports={portsData} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pelabuhan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Pelabuhan />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
