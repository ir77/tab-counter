import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";

const rootDir = fileURLToPath(new URL("./src", import.meta.url));
const manifestPath = resolve(rootDir, "manifest.json");

function copyManifestPlugin() {
  let outDir = "dist";

  return {
    name: "copy-manifest-plugin",
    apply: "build",
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    async writeBundle() {
      const targetDir = resolve(process.cwd(), outDir);
      await mkdir(targetDir, { recursive: true });
      await copyFile(manifestPath, resolve(targetDir, "manifest.json"));
    },
  };
}

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(rootDir, "background.ts"),
        popup: resolve(rootDir, "ui/popup.html"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name].js",
      },
    },
  },
  plugins: [copyManifestPlugin()],
});
