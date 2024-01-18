import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "build",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        control: resolve(__dirname, "www/control.html"),
        audience: resolve(__dirname, "www/audience.html"),
      },
    },
  },
});
