import {
    defineConfig,
    devices,
  } from "@playwright/test";
  
  export default defineConfig({
    testDir: "./e2e",
  
    fullyParallel: true,
  
    forbidOnly: !!process.env.CI,
  
    retries: process.env.CI ? 2 : 0,
  
    workers: process.env.CI ? 1 : undefined,
  
    reporter: "html",
  
    use: {
      baseURL: "http://localhost:3000",
  
      trace: "on-first-retry",
  
      screenshot: "only-on-failure",
    },
  
    projects: [
      {
        name: "chromium",
  
        use: {
          ...devices["Desktop Chrome"],
        },
      },
    ],
  
    webServer: [
      {
        command: "npm run dev:frontend",
  
        url: "http://localhost:3000",
  
        name: "Frontend",
  
        reuseExistingServer:
          !process.env.CI,
  
        env: {
          NEXT_PUBLIC_API_URL:
            "http://localhost:4001",
        },
  
        timeout: 120 * 1000,
      },
  
      {
        command:
          "npm run start:e2e:backend",
  
        url: "http://localhost:4001/api/health",
  
        name: "Backend E2E",
  
        reuseExistingServer: false,
  
        timeout: 120 * 1000,
      },
    ],
  });