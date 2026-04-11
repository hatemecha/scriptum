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
  exportTitlePageAddressMaxLength: 500,
  exportTitlePageLineMaxLength: 220,
} as const;

/** Optional fields for the PDF cover page (stored as JSON on `projects.export_title_page`). */
export type ExportTitlePageFields = {
  address: string | null;
  companyName: string | null;
  companyRegistration: string | null;
  contactEmail: string | null;
  revisedBy: string | null;
  revisionLabel: string | null;
};

export function emptyExportTitlePageFields(): ExportTitlePageFields {
  return {
    address: null,
    companyName: null,
    companyRegistration: null,
    contactEmail: null,
    revisedBy: null,
    revisionLabel: null,
  };
}

export function normalizeExportTitlePageFields(value: unknown): ExportTitlePageFields {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return emptyExportTitlePageFields();
  }

  const o = value as Record<string, unknown>;
  const max = projectMetadataLimits.exportTitlePageLineMaxLength;

  return {
    address: normalizeOptionalMultilineText(
      o.address as string | null | undefined,
      projectMetadataLimits.exportTitlePageAddressMaxLength,
      "Address",
    ),
    companyName: normalizeOptionalText(o.companyName as string | null | undefined, max, "Company name"),
    companyRegistration: normalizeOptionalText(
      o.companyRegistration as string | null | undefined,
      max,
      "Company registration",
    ),
    contactEmail: normalizeOptionalText(o.contactEmail as string | null | undefined, max, "Contact email"),
    revisedBy: normalizeOptionalText(o.revisedBy as string | null | undefined, max, "Revised by"),
    revisionLabel: normalizeOptionalText(
      o.revisionLabel as string | null | undefined,
      max,
      "Revision label",
    ),
  };
}

function isProjectStatus(value: string): value is ProjectStatus {
  return projectStatusValues.includes(value as ProjectStatus);
}

function isProjectLanguage(value: string): value is ProjectLanguage {
  return projectLanguageValues.includes(value as ProjectLanguage);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeOptionalMultilineText(
  value: string | null | undefined,
  maxLength: number,
  fieldLabel: string,
): string | null {
  if (value == null) {
    return null;
  }

  const lines = value
    .split(/\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);
  const normalizedValue = lines.join("\n").trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  if (normalizedValue.length > maxLength) {
    throw new Error(`${fieldLabel} cannot exceed ${maxLength} characters.`);
  }

  return normalizedValue;
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
