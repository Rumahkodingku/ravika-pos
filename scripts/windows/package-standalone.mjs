import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, resolve } from "node:path";

const standalone = resolve(".next/standalone");
const app = resolve("release/app");
const extras = [
  "AGENTS.md",
  "README.md",
  "biome.json",
  "data",
  "deploy",
  "docs",
  "installer",
  "next.config.ts",
  "release",
  "scripts",
  "src",
  "tests",
  "tsconfig.json",
];

function copyDereferenced(source, target, stack = new Set()) {
  const real = realpathSync(source);
  const stat = statSync(real);

  if (stat.isDirectory()) {
    if (stack.has(real)) {
      return;
    }

    const nextStack = new Set(stack).add(real);
    mkdirSync(target, { recursive: true });

    for (const entry of readdirSync(real)) {
      copyDereferenced(join(real, entry), join(target, entry), nextStack);
    }
    return;
  }

  if (stat.isFile()) {
    copyFileSync(real, target);
  }
}

mkdirSync(standalone, { recursive: true });

for (const extra of extras) {
  rmSync(resolve(standalone, extra), { force: true, recursive: true });
}

rmSync(app, { force: true, recursive: true });
mkdirSync(app, { recursive: true });
copyDereferenced(standalone, app);

copyDereferenced(resolve(standalone, "public"), resolve(app, "public"));
copyDereferenced(resolve(".next/static"), resolve(app, ".next/static"));
copyDereferenced(resolve("drizzle"), resolve(app, "drizzle"));

const virtualStore = resolve(app, "node_modules/.pnpm/node_modules");

if (existsSync(virtualStore)) {
  copyDereferenced(virtualStore, resolve(app, "node_modules"));
}

const swcPackage = readdirSync(resolve("node_modules/.pnpm")).find((entry) =>
  entry.startsWith("@swc+helpers@"),
);

if (!swcPackage) {
  throw new Error("Unable to find @swc/helpers in the pnpm store.");
}

const swcSource = resolve(
  "node_modules/.pnpm",
  swcPackage,
  "node_modules/@swc/helpers",
);
const swcTarget = resolve(app, "node_modules/@swc/helpers");

rmSync(swcTarget, { force: true, recursive: true });
copyDereferenced(swcSource, swcTarget);

const swcHelper = resolve(swcTarget, "_/_interop_require_default/package.json");

if (!existsSync(swcHelper)) {
  throw new Error("Packaged app is missing @swc/helpers.");
}

console.log(app);
