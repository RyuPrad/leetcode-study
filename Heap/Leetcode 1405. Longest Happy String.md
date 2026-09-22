
<iframe
  src="longest_happy_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `a`, `b`, `c` | Available counts of letters `'a'`, `'b'`, and `'c'`. |
| `heap` | Max-heap of `[count, char]`, compared by `count` (element `[0]`); root is the most plentiful letter. |
| `res` | The happy string being built; never contains `"aaa"`, `"bbb"`, or `"ccc"`. |
| `cnt`, `ch` | Destructured from the first `heap.pop()`: the most plentiful letter and its count. |
| `cnt2`, `ch2` | The second-choice letter, used when `ch` would create three in a row. |
