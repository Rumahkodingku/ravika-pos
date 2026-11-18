import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const db = resolve(root, ".e2e/ravika.sqlite");

for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${db}${suffix}`, { force: true });
}

const build = spawnSync("pnpm", ["build"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const server = spawn("pnpm", ["exec", "next", "start", "-p", "3200"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

const stop = () => server.kill("SIGTERM");
process.on("SIGTERM", stop);
process.on("SIGINT", stop);

server.on("exit", (code) => process.exit(code ?? 1));
