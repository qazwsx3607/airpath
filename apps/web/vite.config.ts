import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-three": ["three"],
          "vendor-r3f": ["@react-three/fiber", "@react-three/drei"],
          "vendor-app-support": ["lucide-react", "zustand", "zod"]
        }
      }
    }
  },
  resolve: {
    alias: {
      "@airpath/scenario-schema": resolve(__dirname, "../../packages/scenario-schema/src/index.ts"),
      "@airpath/solver-core": resolve(__dirname, "../../packages/solver-core/src/index.ts"),
      "@airpath/report-engine": resolve(__dirname, "../../packages/report-engine/src/index.ts")
    }
  }
});
