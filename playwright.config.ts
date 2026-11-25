import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 90000,
  use: { baseURL: "http://127.0.0.1:5173/hero-academy/", channel: "chrome" },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173/hero-academy/",
    reuseExistingServer: true,
  },
  reporter: "list",
});
