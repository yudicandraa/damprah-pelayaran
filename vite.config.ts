import { defineConfig } from "vite";

export default async () => {
  // dynamic import agar ESM-only package bisa dimuat tanpa require()
  const reactPluginModule = await import("@vitejs/plugin-react");
  const react = reactPluginModule.default ?? reactPluginModule;

  return defineConfig({
    plugins: [react()],
    server: { port: 5173 },
  });
};
