import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react(), {
    name: "hero-build-provenance",
    transformIndexHtml: () => [{
      tag: "meta",
      attrs: { name: "hero-build", content: process.env.GITHUB_SHA || "local" },
    }],
  }],
  base: "/hero-academy/",
});
