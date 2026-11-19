import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const standalone = resolve(".next/standalone");
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

mkdirSync(standalone, { recursive: true });

for (const extra of extras) {
  rmSync(resolve(standalone, extra), { force: true, recursive: true });
}

cpSync("public", resolve(standalone, "public"), { recursive: true });
cpSync(".next/static", resolve(standalone, ".next/static"), {
  recursive: true,
});
cpSync("drizzle", resolve(standalone, "drizzle"), { recursive: true });
