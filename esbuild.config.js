const esbuild = require("esbuild");
const { dtsPlugin } = require("esbuild-plugin-d.ts");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/main.js",
    format: "iife",
    globalName: "WebMarker",
    platform: "browser",
    target: ["es2015"],
    plugins: [dtsPlugin()],
    jsx: "transform",
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/module.js",
    format: "esm",
    platform: "browser",
    target: ["es2015"],
    jsx: "transform",
  })
  .catch(() => process.exit(1));
