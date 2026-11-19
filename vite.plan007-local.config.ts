import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config";

// Local-only entry point: reuse the Docker API without widening its CORS policy.
export default defineConfig(env => {
  if (env.command !== "serve") throw new Error("Plan 007 local config is only for the development server.");
  return mergeConfig(baseConfig(env), {
  define: {
    "import.meta.env.VITE_ON_AIR_ENABLED": JSON.stringify("true"),
    "import.meta.env.VITE_PROGRAMMING_API_URL": JSON.stringify(""),
  },
  server: {
    host: "127.0.0.1",
    port: 8093,
    strictPort: true,
    proxy: {
      "/api/public/programming": "http://127.0.0.1:3012",
      "/api/public/polls": "http://127.0.0.1:3012",
    },
  },
  });
});
