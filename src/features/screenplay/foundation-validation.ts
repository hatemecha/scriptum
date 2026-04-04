import { getScreenplayDocumentModelValidationErrors } from "@/features/screenplay/document-model";
import { getScreenplayFormatValidationErrors } from "@/features/screenplay/format-rules";
import { getScreenplayWritingRuleValidationErrors } from "@/features/screenplay/writing-rules";

export interface ScreenplayFoundationValidationSection {
  errorCount: number;
  errors: readonly string[];
  label: string;
  valid: boolean;
}

export interface ScreenplayFoundationValidationSummary {
  errorCount: number;
  isValid: boolean;
  sections: readonly ScreenplayFoundationValidationSection[];
}

export function getScreenplayFoundationValidationSummary(): ScreenplayFoundationValidationSummary {
  const sections = [
    {
      errors: getScreenplayDocumentModelValidationErrors(),
      label: "Document model",
    },
    {
      errors: getScreenplayFormatValidationErrors(),
      label: "Format rules",
    },
    {
      errors: getScreenplayWritingRuleValidationErrors(),
      label: "Writing rules",
    },
  ].map((section) => ({
    ...section,
    errorCount: section.errors.length,
    valid: section.errors.length === 0,
  }));

  const errorCount = sections.reduce(
    (currentCount, section) => currentCount + section.errorCount,
    0,
  );

  return {
    errorCount,
    isValid: errorCount === 0,
    sections,
  };
}

export function assertScreenplayFoundationIsValid(): void {
  const summary = getScreenplayFoundationValidationSummary();

  if (summary.isValid) {
    return;
  }

  const formattedErrors = summary.sections
    .filter((section) => !section.valid)
    .flatMap((section) => section.errors.map((error) => `${section.label}: ${error}`))
    .join("\n");

  throw new Error(`Screenplay foundation validation failed.\n${formattedErrors}`);
}
