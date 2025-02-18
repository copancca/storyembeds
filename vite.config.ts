import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const base = mode === "production" ? "/storyembeds/" : "/";
  return {
    appType: "spa",
    base: base,
    plugins: [react()],
  };
});
