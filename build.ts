import { bundle } from "deno_emit";
import { copy } from "std/fs/copy.ts";
import { emptyDir } from "std/fs/empty_dir.ts";

const outDir = "./dist";
const srcDir = "./src";

async function build(entryPoint: string) {
  const result = await bundle(`${srcDir}/${entryPoint}`);

  const outFile = `${outDir}/${entryPoint.replace(".ts", ".js")}`;
  await Deno.writeTextFile(outFile, result.code);
}

async function copyStaticFiles() {
  await copy(`${srcDir}/popup.html`, `${outDir}/popup.html`);
  await copy(`${srcDir}/popup.css`, `${outDir}/popup.css`);
  await copy(`${srcDir}/manifest.json`, `${outDir}/manifest.json`);
}

async function updateSrcManifestVersion() { // Renamed for clarity
  const manifestPath = `${srcDir}/manifest.json`;
  const manifest = JSON.parse(await Deno.readTextFile(manifestPath));

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2); // Get last two digits of year
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");

  manifest.version = `1.${yy}.${mm}${dd}.${hh}${mi}`;
  await Deno.writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
}

await emptyDir(outDir);
await updateSrcManifestVersion();
await Promise.all([
  build("background.ts"),
  build("popup.ts"),
  copyStaticFiles(),
]);
