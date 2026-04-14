import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const auditToken = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const artifactDirectory =
  process.env.AUDIT_ARTIFACT_DIR ??
  path.join(process.cwd(), "agent", "audit-artifacts", `roadmap-audit-${auditToken}`);

const testAccounts = {
  primary: {
    email: `scriptum.audit.${Date.now()}+a@gmail.com`,
    password: "ScriptumAudit!2026A",
    displayName: "Scriptum Audit A",
  },
  secondary: {
    email: `scriptum.audit.${Date.now()}+b@gmail.com`,
    password: "ScriptumAudit!2026B",
    displayName: "Scriptum Audit B",
  },
};

const projectTitle = `Audit Script ${auditToken}`;
const draftRecoveryLine = `BORRADOR LOCAL ${auditToken}`;
const offlineLine = `SIN RED ${auditToken}`;

/** @typedef {{ name: string; ok: boolean; details?: string; error?: string; screenshot?: string; durationMs: number }} AuditStep */

/** @type {AuditStep[]} */
const results = [];

async function ensureArtifactsDirectory() {
  await mkdir(artifactDirectory, { recursive: true });
}

async function readDotEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = await readFile(envPath, "utf8");

  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
}

async function probeSupabaseSignUp() {
  const env = await readDotEnvFile();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Public Supabase environment variables are missing in .env.local.");
  }

  const probeClient = createClient(url, publishableKey);
  const probeEmail = `scriptum.audit.${Date.now()}+probe@gmail.com`;
  const result = await probeClient.auth.signUp({
    email: probeEmail,
    password: "ScriptumAudit!2026Probe",
  });

  if (result.error) {
    return `Supabase sign-up returned ${result.error.status ?? "unknown"} ${result.error.code ?? "unknown"}: ${result.error.message}`;
  }

  return `Supabase sign-up succeeded for ${probeEmail}.`;
}

async function saveJsonReport() {
  const outputPath = path.join(artifactDirectory, "runtime-audit-results.json");
  await writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl,
        artifactDirectory,
        projectTitle,
        primaryEmail: testAccounts.primary.email,
        secondaryEmail: testAccounts.secondary.email,
        results,
      },
      null,
      2,
    ),
  );
}

async function captureScreenshot(page, filename) {
  const fullPath = path.join(artifactDirectory, filename);
  await page.screenshot({ path: fullPath, fullPage: true });
  return fullPath;
}

async function runStep(name, page, callback) {
  const startedAt = Date.now();

  try {
    const details = await callback();
    const result = {
      name,
      ok: true,
      details,
      durationMs: Date.now() - startedAt,
    };
    results.push(result);
    return result;
  } catch (error) {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const screenshot = page ? await captureScreenshot(page, `${safeName}-failure.png`) : undefined;

    const result = {
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      screenshot,
      durationMs: Date.now() - startedAt,
    };
    results.push(result);
    return result;
  }
}

function recordSkippedStep(name, reason) {
  results.push({
    name,
    ok: false,
    error: `Skipped: ${reason}`,
    durationMs: 0,
  });
}

async function waitForUrl(page, expected) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const currentUrl = page.url();
    const matches =
      expected instanceof RegExp ? expected.test(currentUrl) : currentUrl.includes(expected);

    if (matches) {
      return currentUrl;
    }

    await page.waitForTimeout(200);
  }

  throw new Error(`Timed out waiting for URL ${String(expected)}. Last URL: ${page.url()}`);
}

async function waitForVisibleText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 20_000 });
}

async function registerUser(page, account) {
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.getByLabel("Nombre").fill(account.displayName);
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña").fill(account.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await waitForUrl(page, /\/projects$/);
}

async function loginUser(page, account) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña").fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await waitForUrl(page, /\/projects$/);
}

async function logoutLocalSession(page) {
  await page.goto(`${baseUrl}/settings`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Cerrar sesión$/ }).click();
  await waitForUrl(page, /\/login$/);
}

async function deleteCurrentProject(page, expectedTitle) {
  await page.goto(`${baseUrl}/projects`, { waitUntil: "networkidle" });
  await waitForVisibleText(page, expectedTitle);
  await page.getByLabel("Opciones del proyecto").first().click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page.getByRole("button", { name: /^Eliminar$/ }).click();
  await page.waitForLoadState("networkidle");
}

async function openPlaygroundEditor(page, viewState = "default") {
  const search = viewState === "default" ? "" : `?state=${viewState}`;
  await page.goto(`${baseUrl}/playground/editor/roadmap-audit${search}`, {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Título del proyecto").waitFor({ state: "visible", timeout: 20_000 });
}

async function typeInEditor(page, lines) {
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 20_000 });
  await editor.click();

  for (let index = 0; index < lines.length; index += 1) {
    await page.keyboard.type(lines[index]);
    if (index < lines.length - 1) {
      await page.keyboard.press("Enter");
    }
  }
}

async function readEditorText(page) {
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 20_000 });
  return (await editor.textContent()) ?? "";
}

async function closeExportDialog(page) {
  const closeButton = page.getByRole("button", { name: "Cerrar", exact: true }).first();
  await closeButton.click();
  await page.getByText("PDF listo.", { exact: false }).waitFor({ state: "hidden", timeout: 20_000 });
}

async function main() {
  await ensureArtifactsDirectory();

  const browser = await chromium.launch({ headless: true });
  const contextA = await browser.newContext({ acceptDownloads: true });
  const contextB = await browser.newContext({ acceptDownloads: true });
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  let projectUrl = "";

  try {
    await runStep("unauthenticated-projects-redirect", pageA, async () => {
      await pageA.goto(`${baseUrl}/projects`, { waitUntil: "networkidle" });
      const url = await waitForUrl(pageA, /\/login(?:\?.*)?$/);
      return url.includes("next=")
        ? `Redirected to ${url}`
        : `Redirected to ${url} without preserving next.`;
    });

    const registerPrimaryResult = await runStep("register-primary-user", pageA, async () => {
      await registerUser(pageA, testAccounts.primary);
      return `Registered ${testAccounts.primary.email}`;
    });

    await runStep("supabase-sign-up-api-probe", null, async () => {
      return probeSupabaseSignUp();
    });

    if (registerPrimaryResult.ok) {
      const createProjectResult = await runStep("create-project-and-open-editor", pageA, async () => {
        await waitForVisibleText(pageA, "Tus proyectos");
        await pageA.getByRole("button", { name: /\+ Nuevo proyecto/ }).click();
        projectUrl = await waitForUrl(pageA, /\/projects\/project_/);
        await pageA.getByLabel("Título del proyecto").fill(projectTitle);
        return `Opened ${projectUrl}`;
      });

      if (createProjectResult.ok) {
        const writeResult = await runStep("write-screenplay-and-detect-scene", pageA, async () => {
          await typeInEditor(pageA, [
            "INT. CASA - NOCHE",
            "La lluvia golpea la ventana.",
            "ANA",
            "No pienso esperar mas.",
          ]);
          await waitForVisibleText(pageA, "INT. CASA - NOCHE");
          await captureScreenshot(pageA, "editor-after-writing.png");
          return "Typed screenplay sample and detected scene in sidebar.";
        });

        if (writeResult.ok) {
          await runStep("save-project-snapshot", pageA, async () => {
            await pageA.getByRole("button", { name: "Guardar", exact: true }).click();
            await pageA.getByLabel("Guardado").waitFor({ state: "visible", timeout: 20_000 });
            return "Manual save completed.";
          });

          await runStep("export-pdf", pageA, async () => {
            await pageA.getByRole("button", { name: "Exportar" }).click();
            await pageA.getByRole("button", { name: "Exportar PDF" }).click();
            await waitForVisibleText(pageA, "PDF listo.");

            const downloadPromise = pageA.waitForEvent("download", { timeout: 20_000 });
            await pageA.getByRole("button", { name: "Descargar PDF" }).click();
            const download = await downloadPromise;
            const pdfPath = path.join(artifactDirectory, "screenplay-export.pdf");
            await download.saveAs(pdfPath);
            await closeExportDialog(pageA);

            return `PDF exported to ${pdfPath}`;
          });

          await runStep("local-draft-recovery", pageA, async () => {
            await typeInEditor(pageA, ["", draftRecoveryLine]);
            await pageA.getByLabel("Sin guardar").waitFor({ state: "visible", timeout: 20_000 });
            await pageA.reload({ waitUntil: "networkidle" });
            await waitForVisibleText(pageA, draftRecoveryLine);
            return "Unsaved draft survived reload.";
          });

          await runStep("offline-local-state-and-reconnect", pageA, async () => {
            await contextA.setOffline(true);

            try {
              await typeInEditor(pageA, ["", offlineLine]);
              await pageA.getByLabel("Guardado en local").waitFor({
                state: "visible",
                timeout: 20_000,
              });
            } finally {
              await contextA.setOffline(false);
            }

            await pageA.getByRole("button", { name: "Guardar", exact: true }).click();
            await pageA.getByLabel("Guardado").waitFor({ state: "visible", timeout: 20_000 });
            return "Offline write kept local state and synced after reconnect.";
          });

          await runStep("logout-and-login-primary-user", pageA, async () => {
            await logoutLocalSession(pageA);
            await loginUser(pageA, testAccounts.primary);
            await waitForVisibleText(pageA, projectTitle);
            return "Primary user logged out and back in.";
          });

          await runStep("forgot-password-request", pageA, async () => {
            await logoutLocalSession(pageA);
            await pageA.goto(`${baseUrl}/forgot-password`, { waitUntil: "networkidle" });
            await pageA.getByLabel("Correo electrónico").fill(testAccounts.primary.email);
            await pageA.getByRole("button", { name: "Enviar enlace" }).click();
            await waitForVisibleText(pageA, "Si el correo existe");
            return "Password recovery email request accepted.";
          });

          await runStep("reopen-project-after-login", pageA, async () => {
            await loginUser(pageA, testAccounts.primary);
            await pageA.getByRole("link", { name: new RegExp(projectTitle, "i") }).click();
            const editorText = await readEditorText(pageA);

            if (!editorText.includes(draftRecoveryLine) || !editorText.includes(offlineLine)) {
              throw new Error("Saved content was not restored after signing in again.");
            }

            return "Persisted content visible after new session login.";
          });

          const registerSecondaryResult = await runStep("register-secondary-user", pageB, async () => {
            await registerUser(pageB, testAccounts.secondary);
            return `Registered ${testAccounts.secondary.email}`;
          });

          if (registerSecondaryResult.ok) {
            await runStep("block-cross-user-project-access", pageB, async () => {
              await pageB.goto(projectUrl, { waitUntil: "networkidle" });
              const redirectedUrl = await waitForUrl(pageB, /\/projects$/);
              return `Secondary user redirected to ${redirectedUrl}`;
            });
          } else {
            recordSkippedStep(
              "block-cross-user-project-access",
              "secondary registration failed, so ownership redirect could not be exercised.",
            );
          }

          await runStep("delete-audit-project-cleanup", pageA, async () => {
            await deleteCurrentProject(pageA, projectTitle);
            await captureScreenshot(pageA, "projects-after-cleanup.png");
            return "Audit project removed via UI cleanup.";
          });
        } else {
          recordSkippedStep("save-project-snapshot", "editor write flow failed.");
          recordSkippedStep("export-pdf", "editor write flow failed.");
          recordSkippedStep("local-draft-recovery", "editor write flow failed.");
          recordSkippedStep("offline-local-state-and-reconnect", "editor write flow failed.");
          recordSkippedStep("logout-and-login-primary-user", "editor write flow failed.");
          recordSkippedStep("forgot-password-request", "editor write flow failed.");
          recordSkippedStep("reopen-project-after-login", "editor write flow failed.");
          recordSkippedStep("register-secondary-user", "editor write flow failed.");
          recordSkippedStep("block-cross-user-project-access", "editor write flow failed.");
          recordSkippedStep("delete-audit-project-cleanup", "editor write flow failed.");
        }
      } else {
        recordSkippedStep("write-screenplay-and-detect-scene", "project creation failed.");
        recordSkippedStep("save-project-snapshot", "project creation failed.");
        recordSkippedStep("export-pdf", "project creation failed.");
        recordSkippedStep("local-draft-recovery", "project creation failed.");
        recordSkippedStep("offline-local-state-and-reconnect", "project creation failed.");
        recordSkippedStep("logout-and-login-primary-user", "project creation failed.");
        recordSkippedStep("forgot-password-request", "project creation failed.");
        recordSkippedStep("reopen-project-after-login", "project creation failed.");
        recordSkippedStep("register-secondary-user", "project creation failed.");
        recordSkippedStep("block-cross-user-project-access", "project creation failed.");
        recordSkippedStep("delete-audit-project-cleanup", "project creation failed.");
      }
    } else {
      recordSkippedStep(
        "create-project-and-open-editor",
        "primary registration failed against Supabase.",
      );
      recordSkippedStep(
        "write-screenplay-and-detect-scene",
        "primary registration failed against Supabase.",
      );
      recordSkippedStep("save-project-snapshot", "primary registration failed against Supabase.");
      recordSkippedStep("export-pdf", "primary registration failed against Supabase.");
      recordSkippedStep("local-draft-recovery", "primary registration failed against Supabase.");
      recordSkippedStep(
        "offline-local-state-and-reconnect",
        "primary registration failed against Supabase.",
      );
      recordSkippedStep(
        "logout-and-login-primary-user",
        "primary registration failed against Supabase.",
      );
      recordSkippedStep("forgot-password-request", "primary registration failed against Supabase.");
      recordSkippedStep("reopen-project-after-login", "primary registration failed against Supabase.");
      recordSkippedStep("register-secondary-user", "primary registration failed against Supabase.");
      recordSkippedStep(
        "block-cross-user-project-access",
        "primary registration failed against Supabase.",
      );
      recordSkippedStep(
        "delete-audit-project-cleanup",
        "primary registration failed against Supabase.",
      );
    }

    await runStep("playground-editor-scene-sidebar", pageA, async () => {
      await openPlaygroundEditor(pageA);
      await pageA.getByLabel("Título del proyecto").fill(`Playground ${projectTitle}`);
      await typeInEditor(pageA, ["INT. AZOTEA - AMANECER", "La ciudad sigue en silencio."]);
      await waitForVisibleText(pageA, "INT. AZOTEA - AMANECER");
      await captureScreenshot(pageA, "playground-editor-scene-sidebar.png");
      return "Prototype editor rendered blocks and scene sidebar.";
    });

    await runStep("playground-export-pdf", pageA, async () => {
      await pageA.getByRole("button", { name: "Exportar" }).click();
      await pageA.getByRole("button", { name: "Exportar PDF" }).click();
      await waitForVisibleText(pageA, "PDF listo.");

      const downloadPromise = pageA.waitForEvent("download", { timeout: 20_000 });
      await pageA.getByRole("button", { name: "Descargar PDF" }).click();
      const download = await downloadPromise;
      const pdfPath = path.join(artifactDirectory, "playground-screenplay-export.pdf");
      await download.saveAs(pdfPath);
      await closeExportDialog(pageA);

      return `Prototype PDF exported to ${pdfPath}`;
    });

    await runStep("playground-offline-visual-state", pageA, async () => {
      await openPlaygroundEditor(pageA, "offline");
      await waitForVisibleText(pageA, "Sin conexión. Los cambios quedan guardados en este navegador");
      return "Offline editor state rendered in prototype mode.";
    });

    await runStep("playground-save-error-visual-state", pageA, async () => {
      await openPlaygroundEditor(pageA, "save-error");
      await pageA.getByLabel("Error al guardar").waitFor({ state: "visible", timeout: 20_000 });
      return "Save error state rendered in prototype mode.";
    });
  } finally {
    await saveJsonReport();
    await contextA.close();
    await contextB.close();
    await browser.close();
  }
}

main().catch(async (error) => {
  await saveJsonReport();
  console.error(error);
  process.exitCode = 1;
});
