import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "production-smoke.spec.ts",
  workers: 1,
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.HERO_TEST_URL || "http://127.0.0.1:4173/hero-academy/",
    channel: process.env.CI ? undefined : "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.HERO_TEST_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173",
        url: "http://127.0.0.1:4173/hero-academy/",
        reuseExistingServer: false,
      },
  reporter: "list",
});
