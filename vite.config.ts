import { defineConfig } from "vite";

// Simple config — hot reload + TS support out of the box.
export default defineConfig ( {
    server: { open: true, port: 5173 },
    build:  { outDir: "dist", emptyOutDir: true }
} );
