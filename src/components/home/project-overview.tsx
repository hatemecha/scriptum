import { siteConfig } from "@/config/site";

const setupHighlights = [
  "Next.js 16 + React 19 with App Router",
  "TypeScript strict mode enabled",
  "ESLint and Prettier configured",
];

const dayOneChecklist = [
  "Repository initialized on the main branch",
  "Import aliases mapped to src",
  "Initial app structure ready for upcoming phases",
];

export function ProjectOverview() {
  return (
    <section className="project-overview" aria-labelledby="project-title">
      <p className="eyebrow">Phase 0 / Day 1</p>
      <h1 id="project-title">{siteConfig.name}</h1>
      <p className="lead">{siteConfig.description}</p>

      <div className="overview-grid">
        {setupHighlights.map((highlight) => (
          <article key={highlight} className="overview-card">
            <h2>{highlight}</h2>
          </article>
        ))}
      </div>

      <section className="overview-panel" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title">Initial Setup Status</h2>
        <ul className="checklist">
          {dayOneChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
