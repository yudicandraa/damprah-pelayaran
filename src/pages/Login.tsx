import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("HANDLE LOGIN TERPANGGIL");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login gagal");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("Tidak bisa terhubung ke backend");
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-sm mx-auto mt-20 space-y-4"
    >
      <h1 className="text-xl font-bold">Login Admin</h1>

      <input
        type="email"
        className="border p-2 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-sky-600 text-white px-4 py-2 rounded w-full"
      >
        Login
      </button>
    </form>
  );
}
