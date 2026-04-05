type SearchParamValue = string | string[] | undefined;

export type AuthViewState = "default" | "error" | "loading" | "offline";
export type EditorViewState =
  | "default"
  | "empty"
  | "error"
  | "loading"
  | "offline"
  | "save-error"
  | "saving"
  | "synced"
  | "syncing"
  | "unsaved";
export type ExportViewState = "closed" | "error" | "exporting" | "ready" | "success";
export type ProjectsViewState = "default" | "empty" | "error" | "loading" | "offline";
export type SettingsViewState = "default" | "error" | "loading" | "offline" | "saving";

export type RouteSearchParams = Record<string, SearchParamValue>;

function getFirstSearchParamValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseEnumValue<T extends string>(
  value: SearchParamValue,
  allowedValues: readonly T[],
  fallbackValue: T,
): T {
  const resolvedValue = getFirstSearchParamValue(value);

  if (!resolvedValue) {
    return fallbackValue;
  }

  return allowedValues.includes(resolvedValue as T) ? (resolvedValue as T) : fallbackValue;
}

export function getAuthViewState(searchParams: RouteSearchParams): AuthViewState {
  return parseEnumValue(searchParams.state, ["default", "error", "loading", "offline"], "default");
}

export function getProjectsViewState(searchParams: RouteSearchParams): ProjectsViewState {
  return parseEnumValue(
    searchParams.state,
    ["default", "empty", "error", "loading", "offline"],
    "default",
  );
}

export function getSettingsViewState(searchParams: RouteSearchParams): SettingsViewState {
  return parseEnumValue(
    searchParams.state,
    ["default", "error", "loading", "offline", "saving"],
    "default",
  );
}

export function getEditorViewState(searchParams: RouteSearchParams): EditorViewState {
  return parseEnumValue(
    searchParams.state,
    ["default", "empty", "error", "loading", "offline", "save-error", "saving", "synced", "syncing", "unsaved"],
    "default",
  );
}

export function getExportViewState(searchParams: RouteSearchParams): ExportViewState {
  return parseEnumValue(
    searchParams.export,
    ["closed", "error", "exporting", "ready", "success"],
    "closed",
  );
}
