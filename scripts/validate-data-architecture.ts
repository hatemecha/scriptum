import { getDataArchitectureModelValidationErrors } from "@/features/data/data-architecture";

const errors = getDataArchitectureModelValidationErrors();

if (errors.length === 0) {
  console.log("Data architecture validation passed.");
} else {
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
}
