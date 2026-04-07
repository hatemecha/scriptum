import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
  ElementNode,
} from "lexical";

import { type ScreenplayBlockType, screenplayBlockTypes } from "@/features/screenplay/blocks";

export type SerializedScreenplayBlockNode = Spread<
  { blockType: ScreenplayBlockType },
  SerializedElementNode
>;

const BLOCK_TYPE_TO_CSS: Record<ScreenplayBlockType, string> = {
  "scene-heading": "screenplay-block screenplay-block--scene-heading",
  action: "screenplay-block screenplay-block--action",
  character: "screenplay-block screenplay-block--character",
  dialogue: "screenplay-block screenplay-block--dialogue",
  parenthetical: "screenplay-block screenplay-block--parenthetical",
  transition: "screenplay-block screenplay-block--transition",
};

function isScreenplayBlockType(value: string): value is ScreenplayBlockType {
  return (screenplayBlockTypes as readonly string[]).includes(value);
}

function convertDivElement(domNode: HTMLElement): DOMConversionOutput | null {
  const raw = domNode.getAttribute("data-screenplay-block-type");
  const blockType: ScreenplayBlockType =
    raw && isScreenplayBlockType(raw) ? raw : "action";
  return { node: $createScreenplayBlockNode(blockType) };
}

export class ScreenplayBlockNode extends ElementNode {
  __blockType: ScreenplayBlockType;

  static getType(): string {
    return "screenplay-block";
  }

  static clone(node: ScreenplayBlockNode): ScreenplayBlockNode {
    return new ScreenplayBlockNode(node.__blockType, node.__key);
  }

  constructor(blockType: ScreenplayBlockType = "action", key?: NodeKey) {
    super(key);
    this.__blockType = blockType;
  }

  getBlockType(): ScreenplayBlockType {
    return this.getLatest().__blockType;
  }

  setBlockType(blockType: ScreenplayBlockType): this {
    const self = this.getWritable();
    self.__blockType = blockType;
    return self;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = BLOCK_TYPE_TO_CSS[this.__blockType];
    dom.setAttribute("data-screenplay-block-type", this.__blockType);
    if (config.theme.screenplayBlock) {
      const themeClass = config.theme.screenplayBlock[this.__blockType];
      if (themeClass) {
        dom.classList.add(...themeClass.split(" "));
      }
    }
    return dom;
  }

  updateDOM(
    prevNode: ScreenplayBlockNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    if (prevNode.__blockType !== this.__blockType) {
      dom.className = BLOCK_TYPE_TO_CSS[this.__blockType];
      dom.setAttribute("data-screenplay-block-type", this.__blockType);
      if (config.theme.screenplayBlock) {
        const themeClass = config.theme.screenplayBlock[this.__blockType];
        if (themeClass) {
          dom.classList.add(...themeClass.split(" "));
        }
      }
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = BLOCK_TYPE_TO_CSS[this.__blockType];
    element.setAttribute("data-screenplay-block-type", this.__blockType);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: HTMLElement) => {
        if (!node.hasAttribute("data-screenplay-block-type")) {
          return null;
        }
        return { conversion: convertDivElement, priority: 1 };
      },
      p: () => ({
        conversion: () => ({ node: $createScreenplayBlockNode("action") }),
        priority: 0,
      }),
    };
  }

  static importJSON(
    serializedNode: SerializedScreenplayBlockNode,
  ): ScreenplayBlockNode {
    return $createScreenplayBlockNode(serializedNode.blockType);
  }

  exportJSON(): SerializedScreenplayBlockNode {
    return {
      ...super.exportJSON(),
      type: "screenplay-block",
      blockType: this.__blockType,
    };
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection?: boolean,
  ): ScreenplayBlockNode {
    const newBlock = $createScreenplayBlockNode("action");
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  collapseAtStart(): boolean {
    if (this.__blockType !== "action") {
      this.setBlockType("action");
      return true;
    }
    return false;
  }
}

export function $createScreenplayBlockNode(
  blockType: ScreenplayBlockType = "action",
): ScreenplayBlockNode {
  return $applyNodeReplacement(new ScreenplayBlockNode(blockType));
}

export function $isScreenplayBlockNode(
  node: LexicalNode | null | undefined,
): node is ScreenplayBlockNode {
  return node instanceof ScreenplayBlockNode;
}
