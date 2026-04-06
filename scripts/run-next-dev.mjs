/**
 * Next.js 16 holds an exclusive lock at `.next/dev/lock`. Starting a second `next dev`
 * exits with "Another next dev server is already running." This script stops the
 * process recorded in that lock (if still alive), then spawns `next dev`.
 */
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, ".next", "dev", "lock");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

function readLockPid() {
  try {
    const raw = fs.readFileSync(lockPath, "utf8");
    const data = JSON.parse(raw);
    const pid = Number(data?.pid);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killWindows(pid) {
  try {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
  } catch {
    /* proceso ya terminado o sin permisos */
  }
}

async function killUnix(pid) {
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (!isProcessRunning(pid)) {
      return;
    }
  }
  try {
    process.kill(pid, "SIGKILL");
  } catch {
    /* ignore */
  }
}

const existingPid = readLockPid();
if (existingPid != null && isProcessRunning(existingPid)) {
  console.log(`Deteniendo el servidor de desarrollo previo (PID ${existingPid})...`);
  if (process.platform === "win32") {
    killWindows(existingPid);
  } else {
    await killUnix(existingPid);
  }
  await new Promise((r) => setTimeout(r, 400));
}

if (!fs.existsSync(nextBin)) {
  console.error("No se encontró el CLI de Next.js. Ejecutá `npm install` en la raíz del proyecto.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
