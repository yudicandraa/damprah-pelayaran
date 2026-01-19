import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // ⏱ max 7 detik

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      // response bisa bukan JSON (misalnya error nginx)
      if (!res.ok) {
        const text = await res.text();
        alert(text || "Login gagal");
        return;
      }

      const data = await res.json();

      if (!data.token) {
        alert("Token tidak diterima dari server");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err: any) {
      if (err.name === "AbortError") {
        alert("Login terlalu lama. Server lambat.");
      } else {
        alert("Tidak bisa terhubung ke server");
      }
      console.error("LOGIN ERROR:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
