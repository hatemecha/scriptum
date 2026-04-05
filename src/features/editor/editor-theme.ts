import { type EditorThemeClasses } from "lexical";

export const screenplayEditorTheme: EditorThemeClasses = {
  root: "screenplay-editor-root",
  paragraph: "screenplay-block screenplay-block--action",
  text: {
    bold: "screenplay-text-bold",
    italic: "screenplay-text-italic",
    underline: "screenplay-text-underline",
  },
  screenplayBlock: {
    "scene-heading": "screenplay-block--scene-heading",
    action: "screenplay-block--action",
    character: "screenplay-block--character",
    dialogue: "screenplay-block--dialogue",
    parenthetical: "screenplay-block--parenthetical",
    transition: "screenplay-block--transition",
  },
};
