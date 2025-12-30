import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}
