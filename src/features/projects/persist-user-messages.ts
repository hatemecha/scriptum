/**
 * Mensajes de error de guardado / validación en español para la UI (evita filtrar strings técnicos en inglés).
 */
const KNOWN: ReadonlyArray<{ match: string | RegExp; es: string }> = [
  {
    match:
      "Persisted documents cannot contain empty blocks outside the single empty Action fallback.",
    es: "Había líneas vacías en el guion; al guardar se quitaron automáticamente.",
  },
  {
    match: /^Block "[^"]+" of type "[^"]+" cannot follow "[^"]+"\.$/,
    es: "El orden de bloques no es válido para guardar. Revisá el tipo de cada línea (encabezado, acción, personaje…).",
  },
  {
    match: /^Block "[^"]+" of type "[^"]+" cannot precede "[^"]+"\.$/,
    es: "El orden de bloques no es válido para guardar. Revisá qué va después de cada bloque.",
  },
];

export function mapPersistErrorForDisplay(message: string): string {
  const trimmed = message.trim();
  for (const { match, es } of KNOWN) {
    if (typeof match === "string") {
      if (trimmed === match) {
        return es;
      }
    } else if (match.test(trimmed)) {
      return es;
    }
  }
  if (/cannot|must be|Block "|document\.|schema/i.test(trimmed)) {
    return "No se pudo guardar: el servidor rechazó el formato del guion. Los cambios siguen en este navegador; probá de nuevo o revisá bloques vacíos.";
  }
  return trimmed.length > 0 ? trimmed : "No se pudo sincronizar el documento.";
}
