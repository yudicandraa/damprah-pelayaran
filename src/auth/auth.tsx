import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: number;
  role: "admin" | "user";
  exp: number;
};

export function getUserRole(): JwtPayload["role"] | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
