
<iframe
  src="time_based_key_value_store_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `store` | A `Map` from each key to an array of `[timestamp, value]` pairs, kept in timestamp order |
| `key` | The string key passed to `set`/`get` |
| `value` | The string value stored by `set` |
| `timestamp` | The integer timestamp passed to `set`/`get` |
| `left` | Left bound of the binary search over the key's timestamp list (inside `get`) |
| `right` | Right bound of the binary search over the key's timestamp list (inside `get`) |
| `mid` | Midpoint index, `Math.floor((left + right) / 2)` (inside `get`) |
| `res` | The best value found so far whose timestamp is `<=` the query; `""` if none |
