import fs from "node:fs/promises";
import path from "node:path";

type Finding = {
  file: string;
  line: number;
  kind: "hardcoded-color";
  snippet: string;
};

const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "src");

const ALLOWLIST_FILES = new Set<string>([
  // Token source of truth
  path.join(srcRoot, "styles", "globals.css"),
  // Non-UI renderer; allowed to use physical PDF colors.
  path.join(srcRoot, "features", "screenplay", "screenplay-pdf.ts"),
]);

const TARGET_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"]);

const HARD_CODED_COLOR_PATTERNS: Array<{ kind: Finding["kind"]; re: RegExp }> = [
  { kind: "hardcoded-color", re: /#[0-9a-fA-F]{3,8}\b/g },
  { kind: "hardcoded-color", re: /\brgba?\(/g },
  { kind: "hardcoded-color", re: /\bhsla?\(/g },
];

async function listFilesRec(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listFilesRec(full)));
      continue;
    }
    out.push(full);
  }
  return out;
}

function findHardcodedColors(file: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    for (const { kind, re } of HARD_CODED_COLOR_PATTERNS) {
      re.lastIndex = 0;
      if (!re.test(line)) {
        continue;
      }

      // Report the first match only; the line will guide the fix.
      findings.push({
        file,
        line: i + 1,
        kind,
        snippet: line.trim().slice(0, 240),
      });
      break;
    }
  }

  return findings;
}

async function main() {
  const all = await listFilesRec(srcRoot);
  const candidates = all.filter((f) => TARGET_EXTS.has(path.extname(f)));

  const findings: Finding[] = [];
  for (const file of candidates) {
    if (ALLOWLIST_FILES.has(file)) {
      continue;
    }
    const content = await fs.readFile(file, "utf8");
    findings.push(...findHardcodedColors(file, content));
  }

  if (findings.length === 0) {
    process.stdout.write("validate:design: OK (no hardcoded colors)\n");
    return;
  }

  const byFile = new Map<string, Finding[]>();
  for (const f of findings) {
    const arr = byFile.get(f.file) ?? [];
    arr.push(f);
    byFile.set(f.file, arr);
  }

  process.stderr.write("validate:design: FAIL (hardcoded colors found)\n\n");
  for (const [file, items] of byFile) {
    const rel = path.relative(repoRoot, file);
    process.stderr.write(`${rel}\n`);
    for (const it of items.slice(0, 12)) {
      process.stderr.write(`  L${it.line}: ${it.snippet}\n`);
    }
    if (items.length > 12) {
      process.stderr.write(`  … and ${items.length - 12} more\n`);
    }
    process.stderr.write("\n");
  }

  process.stderr.write(
    [
      "Fix guidance:",
      "- Move UI colors to tokens in src/styles/globals.css",
      "- Replace in-feature usage with var(--color-*) / var(--mask-*)",
      "- If a file must use physical colors (renderer/export), add it to the allowlist in scripts/validate-design-tokens.ts",
      "",
    ].join("\n"),
  );

  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`validate:design: ERROR: ${String(err)}\n`);
  process.exit(2);
});
