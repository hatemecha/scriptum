import { type EditorThemeClasses } from "lexical";

export const screenplayEditorTheme: EditorThemeClasses = {
  root: "screenplay-editor-root",
  paragraph: "screenplay-block screenplay-block--action",
  /* El guión no usa RichText en cuerpo; clases por si algún nodo heredado; ScreenplayPlainTextGuard las anula. */
  text: {},
  screenplayBlock: {
    "scene-heading": "screenplay-block--scene-heading",
    action: "screenplay-block--action",
    character: "screenplay-block--character",
    dialogue: "screenplay-block--dialogue",
    parenthetical: "screenplay-block--parenthetical",
    transition: "screenplay-block--transition",
  },
};
