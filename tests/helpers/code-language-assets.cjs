// Reference-code language includes that 0.10.0 (scripts/attach-code-language.mjs) appends right after
// guided.js on every lesson page. Suites that pin 0.7.0's shared assets expect exactly these after them.
module.exports = {
  codeLanguageHrefs: [
    '../visualizer-ui/code-language.css',
    '../visualizer-ui/code-languages.js',
    '../visualizer-ui/code-language.js',
  ],
  codeLanguageTags: [
    '<link rel="stylesheet" href="../visualizer-ui/code-language.css" />',
    '<script defer src="../visualizer-ui/code-languages.js">',
    '<script defer src="../visualizer-ui/code-language.js">',
  ],
};
