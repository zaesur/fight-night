import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "build",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "www/index.html"),
        audience: resolve(__dirname, "www/audience.html"),
      },
    },
  },
});
