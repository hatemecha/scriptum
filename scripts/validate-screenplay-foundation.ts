import { getScreenplayFoundationValidationSummary } from "@/features/screenplay/foundation-validation";

const summary = getScreenplayFoundationValidationSummary();

for (const section of summary.sections) {
  const statusLabel = section.valid
    ? "OK"
    : `${section.errorCount} issue${section.errorCount === 1 ? "" : "s"}`;

  console.log(`${section.label}: ${statusLabel}`);

  if (!section.valid) {
    for (const error of section.errors) {
      console.error(`  - ${error}`);
    }
  }
}

if (!summary.isValid) {
  process.exitCode = 1;
} else {
  console.log("Screenplay foundation validation passed.");
}
