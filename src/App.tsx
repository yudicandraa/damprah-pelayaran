import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PortGrid from "./components/PostGrid";
import PortDetail from "./components/PortDetail";
import { ports as portsData } from "./data/ports";
import Pelabuhan from "./pages/Pelabuhan";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

/* ===== Layout khusus halaman yang butuh login ===== */
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 lg:p-12">
        <Header />
        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== LOGIN (TANPA SIDEBAR) ===== */}
        <Route path="/login" element={<Login />} />

        {/* ===== DASHBOARD (PROTECTED) ===== */}
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
