import {
  MonacoEditorModule,
  NgxMonacoEditorConfig
} from 'ngx-monaco-editor';

const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: (monaco) => {
    console.log(monaco);
    monaco.editor.defineTheme("myCustomTheme", {
      base: "vs", // can also be vs-dark or hc-black
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [
        {
          token: "comment",
          foreground: "ffa500",
          fontStyle: "italic underline"
        },
        { token: "comment.js", foreground: "008800", fontStyle: "bold" },
        { token: "comment.css", foreground: "0000ff" } // will inherit fontStyle from `comment` above
      ],
      colors: {
        "editor.background": '#ffffff', // code background
        'editorCursor.foreground': '#002438', // corsour color
        'editor.lineHighlightBackground': '#9B9B9B', // line highlight colour
        'editorLineNumber.foreground': '#666666', // line number colour
        'editor.selectionBackground': '#666666', // code selection background
        'editor.inactiveSelectionBackground': '#7e890b'
      }
    });
    monaco.editor.setTheme('myCustomTheme');
  }
};

export default monacoConfig;