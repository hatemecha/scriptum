import Link from "next/link";

import { routes } from "@/config/routes";

import styles from "./prototype-map.module.css";

type PrototypeLink = {
  hint?: string;
  href: string;
  label: string;
};

type PrototypeSection = {
  description?: string;
  links: PrototypeLink[];
  title: string;
};

const sections: PrototypeSection[] = [
  {
    description: "Superficie previa a la cuenta (Fase 4 conectará formularios reales).",
    title: "Público",
    links: [
      { href: routes.home, label: "Landing /" },
      { href: routes.login, label: "Login" },
      { href: `${routes.login}?state=loading`, hint: "?state=loading", label: "Login cargando" },
      { href: `${routes.login}?state=error`, hint: "?state=error", label: "Login error" },
      { href: `${routes.login}?state=offline`, hint: "?state=offline", label: "Login sin conexión" },
      { href: routes.register, label: "Registro" },
      {
        href: `${routes.register}?state=loading`,
        hint: "?state=loading",
        label: "Registro cargando",
      },
      {
        href: `${routes.register}?state=error`,
        hint: "?state=error",
        label: "Registro error",
      },
      {
        href: `${routes.register}?state=offline`,
        hint: "?state=offline",
        label: "Registro sin conexión",
      },
    ],
  },
  {
    description: "Listado y ajustes con datos de vista previa hasta persistir en backend.",
    title: "Dashboard",
    links: [
      { href: routes.projects, label: "Proyectos (lista demo)" },
      { href: `${routes.projects}?state=empty`, hint: "?state=empty", label: "Proyectos vacío" },
      { href: `${routes.projects}?state=loading`, hint: "?state=loading", label: "Proyectos cargando" },
      { href: `${routes.projects}?state=error`, hint: "?state=error", label: "Proyectos error" },
      {
        href: `${routes.projects}?state=offline`,
        hint: "?state=offline",
        label: "Proyectos sin conexión",
      },
      { href: routes.settings, label: "Ajustes" },
      {
        href: `${routes.settings}?state=loading`,
        hint: "?state=loading",
        label: "Ajustes cargando",
      },
      { href: `${routes.settings}?state=error`, hint: "?state=error", label: "Ajustes error" },
      {
        href: `${routes.settings}?state=offline`,
        hint: "?state=offline",
        label: "Ajustes sin conexión",
      },
      {
        href: `${routes.settings}?state=saving`,
        hint: "?state=saving",
        label: "Ajustes guardando",
      },
    ],
  },
  {
    description:
      "Demos del editor bajo /playground/editor (misma semilla que preview-data). La ruta /projects/[id] solo abre proyectos reales del usuario.",
    title: "Editor y escritura",
    links: [
      { href: routes.playgroundEditor("the-silent-editor"), label: "The Silent Editor" },
      { href: routes.playgroundEditor("manana-sin-mapa"), label: "Mañana sin mapa" },
      { href: routes.playgroundEditor("last-call"), label: "Last Call" },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=empty`,
        hint: "?state=empty",
        label: "Editor vacío (sin bloques)",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=loading`,
        hint: "?state=loading",
        label: "Editor cargando",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=error`,
        hint: "?state=error",
        label: "Editor error",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=offline`,
        hint: "?state=offline",
        label: "Editor sin conexión",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=saving`,
        hint: "?state=saving",
        label: "Editor guardando",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?state=synced`,
        hint: "?state=synced",
        label: "Editor sincronizado",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?export=ready`,
        hint: "?export=ready",
        label: "Export modal abierto (listo)",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?export=exporting`,
        hint: "?export=exporting",
        label: "Export en progreso",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?export=success`,
        hint: "?export=success",
        label: "Export exitoso",
      },
      {
        href: `${routes.playgroundEditor("the-silent-editor")}?export=error`,
        hint: "?export=error",
        label: "Export error",
      },
      {
        href: `${routes.playgroundEditor("sin-titulo")}?state=empty`,
        hint: "proyecto nuevo",
        label: "Nuevo proyecto (sin-título + vacío)",
      },
    ],
  },
  {
    description: "Herramientas internas; no forman parte del producto público.",
    title: "Playground",
    links: [
      { href: routes.playgroundFoundation, label: "Visual foundation" },
      { href: routes.playgroundPrototype, label: "Este mapa" },
    ],
  },
];

export function PrototypeMap() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Internal / Día 13</p>
        <h1 className={styles.title}>Mapa del prototipo</h1>
        <p className={styles.lead}>
          Atajos para recorrer pantallas y estados antes de la Fase 4 (auth y backend). Cada enlace
          abre la ruta real de Next.js en modo vista previa.
        </p>

        {sections.map((section, index) => (
          <section
            key={section.title}
            className={styles.section}
            aria-labelledby={`prototype-section-${index}`}
          >
            <h2 id={`prototype-section-${index}`} className={styles.sectionTitle}>
              {section.title}
            </h2>
            {section.description ? (
              <p className={styles.sectionDescription}>{section.description}</p>
            ) : null}
            <ul className={styles.list}>
              {section.links.map((item) => (
                <li key={item.href + item.label} className={styles.row}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                  {item.hint ? <span className={styles.hint}>{item.hint}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.footerNote}>
          Flujo de escritura canónico: reglas en{" "}
          <code className={styles.hint}>agent/SCREENPLAY_WRITING_RULES_V1.md</code>, bloques en{" "}
          <code className={styles.hint}>agent/SCREENPLAY_BLOCKS_V1.md</code>, pantallas en{" "}
          <code className={styles.hint}>agent/SCREENS_DAY11.md</code>.
        </p>
      </div>
    </div>
  );
}
