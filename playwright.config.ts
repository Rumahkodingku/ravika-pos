import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3200",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    env: {
      RAVIKA_BOOTSTRAP_OWNER_EMAIL: "owner@ravika.id",
      RAVIKA_BOOTSTRAP_OWNER_NAME: "Pemilik",
      RAVIKA_BOOTSTRAP_OWNER_PASSWORD: "demo123",
      RAVIKA_DB_PATH: ".e2e/ravika.sqlite",
      RAVIKA_QR_TOKEN_KEY: "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=",
      RAVIKA_SEED_MODE: "production",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: "http://127.0.0.1:3200/api/health",
  },
});
