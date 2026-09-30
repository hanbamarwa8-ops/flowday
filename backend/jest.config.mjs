import dotenv from "dotenv";
import { createDefaultEsmPreset } from "ts-jest";

dotenv.config({
  path: ".env.test",
});

const presetConfig = createDefaultEsmPreset();

const config = {
  ...presetConfig,

  testEnvironment: "node",

  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
  ],

  resolver: "<rootDir>/jest.resolver.cjs",

  clearMocks: true,
};

export default config;