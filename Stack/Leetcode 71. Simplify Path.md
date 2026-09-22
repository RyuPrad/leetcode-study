
<iframe
  src="simplify_path_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `path` | The raw unix-style absolute path string to canonicalize. |
| `parts` | The path split on `"/"`; each segment is a name, `""`, `"."`, or `".."`. |
| `stack` | Directory stack: push a name, pop on `".."`, skip `""` and `"."`; final path is `"/" + stack.join("/")`. |
