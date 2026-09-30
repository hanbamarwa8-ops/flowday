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

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  clearMocks: true,
};

export default config;