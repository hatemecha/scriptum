import {
  createScreenplayDocument,
  type ScreenplayDocument,
  type ScreenplayDocumentId,
  type ScreenplayProjectId,
  type ScreenplayBlockId,
} from "@/features/screenplay/document-core";

export const screenplayDocumentReferenceSamples = [
  createScreenplayDocument({
    id: "doc_reference-sample" as ScreenplayDocumentId,
    createdAt: "2026-04-04T00:00:00.000Z",
    updatedAt: "2026-04-04T00:00:00.000Z",
    lastNormalizedAt: "2026-04-04T00:00:00.000Z",
    project: {
      id: "project_reference-sample" as ScreenplayProjectId,
      title: "Reference Screenplay",
      author: "SCRIPTUM",
      description: "Internal validation sample for the screenplay document model.",
      language: "en",
      status: "draft",
      createdAt: "2026-04-04T00:00:00.000Z",
      updatedAt: "2026-04-04T00:00:00.000Z",
    },
    blocks: [
      {
        id: "blk_sample-scene-1" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. KITCHEN - NIGHT",
      },
      {
        id: "blk_sample-action-1" as ScreenplayBlockId,
        type: "action",
        text: "The kettle screams on the stove.",
      },
      {
        id: "blk_sample-character-1" as ScreenplayBlockId,
        type: "character",
        text: "MARTA",
      },
      {
        id: "blk_sample-parenthetical-1" as ScreenplayBlockId,
        type: "parenthetical",
        text: "(under her breath)",
      },
      {
        id: "blk_sample-dialogue-1" as ScreenplayBlockId,
        type: "dialogue",
        text: "We missed the call.",
      },
      {
        id: "blk_sample-transition-1" as ScreenplayBlockId,
        type: "transition",
        text: "CUT TO:",
      },
      {
        id: "blk_sample-scene-2" as ScreenplayBlockId,
        type: "scene-heading",
        text: "EXT. STREET - NIGHT",
      },
      {
        id: "blk_sample-action-2" as ScreenplayBlockId,
        type: "action",
        text: "Rain pushes everyone under the awnings.",
      },
    ],
    sync: {
      status: "local-only",
    },
  }),
  createScreenplayDocument({
    id: "doc_reference-leading-action" as ScreenplayDocumentId,
    createdAt: "2026-04-04T00:00:00.000Z",
    updatedAt: "2026-04-04T00:00:00.000Z",
    lastNormalizedAt: "2026-04-04T00:00:00.000Z",
    project: {
      id: "project_reference-leading-action" as ScreenplayProjectId,
      title: "Leading Action Sample",
      language: "en",
      status: "draft",
    },
    blocks: [
      {
        id: "blk_leading-action" as ScreenplayBlockId,
        type: "action",
        text: "Black before the first image.",
      },
      {
        id: "blk_leading-transition" as ScreenplayBlockId,
        type: "transition",
        text: "FADE IN:",
      },
      {
        id: "blk_first-scene" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. STUDIO - MORNING",
      },
      {
        id: "blk_first-scene-action" as ScreenplayBlockId,
        type: "action",
        text: "A blank page waits in the typewriter.",
      },
    ],
  }),
] as const satisfies readonly ScreenplayDocument[];
