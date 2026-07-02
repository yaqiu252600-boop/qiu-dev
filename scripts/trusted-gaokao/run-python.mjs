import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const script = process.argv[2]
const args = process.argv.slice(3)

if (!script) {
  console.error("Usage: node scripts/trusted-gaokao/run-python.mjs <script.py> [...args]")
  process.exit(1)
}

const candidates = [
  process.env.PYTHON,
  path.join(
    os.homedir(),
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "python",
    "python.exe",
  ),
  "python",
  "python3",
  "py",
].filter(Boolean)

for (const candidate of candidates) {
  const command = candidate
  const exists =
    command === "python" ||
    command === "python3" ||
    command === "py" ||
    fs.existsSync(command)

  if (!exists) {
    continue
  }

  const probe = spawnSync(command, ["--version"], {
    stdio: "ignore",
    shell: false,
  })

  if (probe.error || probe.status !== 0) {
    continue
  }

  const result = spawnSync(command, [script, ...args], {
    stdio: "inherit",
    shell: false,
  })

  if (!result.error) {
    process.exit(result.status ?? 0)
  }
}

console.error("No usable Python runtime found.")
process.exit(1)
