import { getSecurityBaseValidationErrors } from "@/features/security/security-base";

const errors = getSecurityBaseValidationErrors();

if (errors.length === 0) {
  console.log("Security base validation passed.");
} else {
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
}
