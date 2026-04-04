import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import {
  createScreenplayDocument,
  type ScreenplayBlockId,
  type ScreenplayDocument,
  type ScreenplayDocumentId,
  type ScreenplayProjectId,
} from "@/features/screenplay/document-model";
import { formatScreenplayBlockText } from "@/features/screenplay/format-rules";

import { type FoundationIconName } from "@/features/playground/foundation-icons";

export type FoundationPreviewLine = {
  id: string;
  text: string;
  type: ScreenplayBlockType;
};

export type FoundationPreviewScene = {
  heading: string;
  id: string;
  indexLabel: string;
  scriptLines: readonly FoundationPreviewLine[];
};

export type FoundationRailItem = {
  active?: boolean;
  icon: FoundationIconName;
  label: string;
};

export const foundationRailItems: readonly FoundationRailItem[] = [
  {
    active: true,
    icon: "drafts",
    label: "Drafts",
  },
  {
    icon: "scenes",
    label: "Scenes",
  },
  {
    icon: "research",
    label: "Research",
  },
  {
    icon: "characters",
    label: "Characters",
  },
  {
    icon: "outline",
    label: "Outline",
  },
] as const;

export const foundationChecklist = [
  "Token-based color, spacing, typography, shadows, and radii.",
  "Reusable button, input, modal, toast, and skeleton primitives.",
  "Internal visual playground isolated from the main product routes.",
  "Script preview rendered from the canonical screenplay document model.",
] as const;

export const foundationToneNotes = [
  "Use layout and spacing first, not a grid of cards.",
  "Keep the writing surface dominant.",
  "Reserve accent color for selection, feedback, and active state.",
  "Avoid decorative motion in core interactions.",
] as const;

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

function createFoundationPreviewDocument(): ScreenplayDocument {
  return createScreenplayDocument({
    id: "doc_foundation-preview" as ScreenplayDocumentId,
    project: {
      id: "project_foundation-preview" as ScreenplayProjectId,
      title: "The Silent Editor",
      description: "Internal visual playground for the screenplay editor foundation.",
      language: "en",
      status: "draft",
    },
    blocks: [
      {
        id: "blk_foundation-scene-1-heading" as ScreenplayBlockId,
        type: "scene-heading",
        text: "EXT. CITY STREET - NIGHT",
      },
      {
        id: "blk_foundation-scene-1-action-1" as ScreenplayBlockId,
        type: "action",
        text: "Traffic washes the avenue in white streaks while a lone figure moves through the crowd without looking up.",
      },
      {
        id: "blk_foundation-scene-1-character-1" as ScreenplayBlockId,
        type: "character",
        text: "WRITER",
      },
      {
        id: "blk_foundation-scene-1-dialogue-1" as ScreenplayBlockId,
        type: "dialogue",
        text: "Nobody notices the first decision. They only notice the fallout.",
      },
      {
        id: "blk_foundation-scene-2-heading" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. APARTMENT - CONTINUOUS",
      },
      {
        id: "blk_foundation-scene-2-action-1" as ScreenplayBlockId,
        type: "action",
        text: "The apartment is almost empty. A desk lamp burns over scattered pages and a glass gone flat.",
      },
      {
        id: "blk_foundation-scene-2-character-1" as ScreenplayBlockId,
        type: "character",
        text: "WRITER",
      },
      {
        id: "blk_foundation-scene-2-parenthetical-1" as ScreenplayBlockId,
        type: "parenthetical",
        text: "half awake",
      },
      {
        id: "blk_foundation-scene-2-dialogue-1" as ScreenplayBlockId,
        type: "dialogue",
        text: "I can fix the page. I just need the room to stop watching me.",
      },
      {
        id: "blk_foundation-scene-3-heading" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. COFFEE SHOP - DAY",
      },
      {
        id: "blk_foundation-scene-3-action-1" as ScreenplayBlockId,
        type: "action",
        text: "A writer is hunched over their laptop. Cups knock together in the background, but the table feels sealed off from the room.",
      },
      {
        id: "blk_foundation-scene-3-character-1" as ScreenplayBlockId,
        type: "character",
        text: "WRITER",
      },
      {
        id: "blk_foundation-scene-3-parenthetical-1" as ScreenplayBlockId,
        type: "parenthetical",
        text: "to themselves",
      },
      {
        id: "blk_foundation-scene-3-dialogue-1" as ScreenplayBlockId,
        type: "dialogue",
        text: "Just one more page.",
      },
      {
        id: "blk_foundation-scene-3-action-2" as ScreenplayBlockId,
        type: "action",
        text: "They type again. The cursor blinks with the stubborn rhythm of a heartbeat.",
      },
      {
        id: "blk_foundation-scene-4-heading" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. SUBWAY STATION - LATE",
      },
      {
        id: "blk_foundation-scene-4-action-1" as ScreenplayBlockId,
        type: "action",
        text: "Fluorescent light smears across the tiles. The station hums with a tired, metallic patience.",
      },
      {
        id: "blk_foundation-scene-4-transition-1" as ScreenplayBlockId,
        type: "transition",
        text: "CUT TO:",
      },
    ],
  });
}

function deriveFoundationPreviewScenes(
  document: ScreenplayDocument,
): readonly FoundationPreviewScene[] {
  const blockIndexById = new Map(
    document.content.blockOrder.map((blockId, index) => [blockId, index] as const),
  );

  return document.indexes.scenes.sceneOrder
    .map((sceneId, sceneIndex) => {
      const sceneEntry = document.indexes.scenes.scenes[sceneId];
      const startIndex = blockIndexById.get(sceneEntry.firstBlockId);
      const endIndex = blockIndexById.get(sceneEntry.lastBlockId);
      const headingBlock = document.content.blocks[sceneEntry.headingBlockId];

      if (startIndex == null || endIndex == null || !headingBlock) {
        return null;
      }

      const scriptLines = document.content.blockOrder
        .slice(startIndex, endIndex + 1)
        .map((blockId) => document.content.blocks[blockId])
        .filter((block): block is NonNullable<typeof block> => block !== undefined)
        .map((block) => ({
          id: block.id,
          text: formatScreenplayBlockText(block.type, block.text),
          type: block.type,
        }));

      return {
        heading: formatScreenplayBlockText("scene-heading", headingBlock.text),
        id: sceneId,
        indexLabel: `Scene ${sceneIndex + 1}`,
        scriptLines,
      };
    })
    .filter(isPresent);
}

const foundationPreviewDocument = createFoundationPreviewDocument();

export const foundationPreviewScenes = deriveFoundationPreviewScenes(foundationPreviewDocument);

export const defaultFoundationSceneId =
  foundationPreviewScenes[2]?.id ?? foundationPreviewScenes[0]?.id ?? "";
