import { bundle } from "deno_emit";
import { copy } from "std/fs/copy.ts";
import { emptyDir } from "std/fs/empty_dir.ts";
import { format } from "std/datetime/format.ts";

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

async function updateSrcManifestVersion() {
  const manifestPath = `${srcDir}/manifest.json`;
  const manifest = JSON.parse(await Deno.readTextFile(manifestPath));

  manifest.version = `1.${format(new Date(), "yy.MMdd.HHmm")}`;
  await Deno.writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
}

await emptyDir(outDir);
if (!Deno.env.get("CI")) {
  await updateSrcManifestVersion();
}

await Promise.all([
  build("background.ts"),
  build("popup.ts"),
  copyStaticFiles(),
]);
