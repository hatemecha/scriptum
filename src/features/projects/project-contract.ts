export const projectStatusValues = [
  "draft",
  "in-progress",
  "finished",
  "optioned",
  "produced",
] as const;

export const projectLanguageValues = ["en", "es", "fr", "de", "pt", "it", "other"] as const;

export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectLanguage = (typeof projectLanguageValues)[number];

export const projectMetadataLimits = {
  authorMaxLength: 200,
  descriptionMaxLength: 500,
  titleMaxLength: 200,
} as const;

function isProjectStatus(value: string): value is ProjectStatus {
  return projectStatusValues.includes(value as ProjectStatus);
}

function isProjectLanguage(value: string): value is ProjectLanguage {
  return projectLanguageValues.includes(value as ProjectLanguage);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeOptionalText(
  value: string | null | undefined,
  maxLength: number,
  fieldLabel: string,
): string | null {
  if (value == null) {
    return null;
  }

  const normalizedValue = normalizeWhitespace(value);

  if (normalizedValue.length === 0) {
    return null;
  }

  if (normalizedValue.length > maxLength) {
    throw new Error(`${fieldLabel} cannot exceed ${maxLength} characters.`);
  }

  return normalizedValue;
}

export function normalizeProjectTitle(value: string | undefined, fallback = "Sin título"): string {
  const normalizedValue = normalizeWhitespace(value ?? "");

  if (normalizedValue.length === 0) {
    if (fallback.length === 0) {
      throw new Error("Title cannot be empty.");
    }

    return fallback;
  }

  if (normalizedValue.length > projectMetadataLimits.titleMaxLength) {
    throw new Error(`Title cannot exceed ${projectMetadataLimits.titleMaxLength} characters.`);
  }

  return normalizedValue;
}

export function normalizeProjectAuthor(value: string | null | undefined): string | null {
  return normalizeOptionalText(value, projectMetadataLimits.authorMaxLength, "Author");
}

export function normalizeProjectDescription(value: string | null | undefined): string | null {
  return normalizeOptionalText(value, projectMetadataLimits.descriptionMaxLength, "Description");
}

export function normalizeProjectLanguage(
  value: string | undefined,
  fallback: ProjectLanguage = "es",
): ProjectLanguage {
  if (value == null) {
    return fallback;
  }

  const normalizedValue = normalizeWhitespace(value).toLowerCase();

  if (normalizedValue.length === 0) {
    return fallback;
  }

  if (!isProjectLanguage(normalizedValue)) {
    throw new Error(`Unsupported project language "${value}".`);
  }

  return normalizedValue;
}

export function normalizeProjectStatus(
  value: string | undefined,
  fallback: ProjectStatus = "draft",
): ProjectStatus {
  if (value == null) {
    return fallback;
  }

  const normalizedValue = normalizeWhitespace(value).toLowerCase();

  if (normalizedValue.length === 0) {
    return fallback;
  }

  if (!isProjectStatus(normalizedValue)) {
    throw new Error(`Unsupported project status "${value}".`);
  }

  return normalizedValue;
}

export function formatProjectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case "draft":
      return "Borrador";
    case "in-progress":
      return "En progreso";
    case "finished":
      return "Terminado";
    case "optioned":
      return "Opcionado";
    case "produced":
      return "Producido";
  }

  return status;
}
