import { createCommand, type LexicalCommand } from "lexical";

import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

export type SetBlockTypePayload = {
  blockType: ScreenplayBlockType;
};

export const SET_BLOCK_TYPE_COMMAND: LexicalCommand<SetBlockTypePayload> =
  createCommand("SET_BLOCK_TYPE_COMMAND");
