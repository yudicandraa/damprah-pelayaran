import { useState } from "react";
import logo from "../../public/logo/dishub.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Login gagal");
        return;
      }

      const data = await res.json();

      if (!data.token) {
        setError("Token tidak diterima dari server");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Login terlalu lama. Server lambat.");
      } else {
        setError("Tidak bisa terhubung ke server");
      }
      console.error(err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-8 py-10">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="DAMPRAH" className="w-20 h-25" />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center text-slate-800">
          DAMPRAH
        </h1>
        <p className="text-xs text-center text-slate-500 mb-6">
          Data Master Pelabuhan Penyeberangan Aceh
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-white font-semibold
              bg-gradient-to-r from-sky-700 to-sky-400
              hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
