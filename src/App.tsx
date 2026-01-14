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

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarOptimized
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`
          transition-all duration-300
          ml-0
          md:ml-20
          ${!collapsed ? "md:ml-80" : ""}
        `}
      >
        <Header />

        <main className="p-4 sm:p-6 md:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

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
