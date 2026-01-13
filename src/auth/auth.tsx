import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  id: number;
  role: string;
  exp?: number;
};

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserRole(): "admin" | "user" | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // token expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logout();
      return null;
    }

    return decoded.role as "admin" | "user";
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
}
