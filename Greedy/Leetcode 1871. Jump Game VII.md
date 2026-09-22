
<iframe
  src="jump_game_vii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | Binary string of `'0'`/`'1'`; you may only stand on `'0'` cells and start at index 0. |
| minJump | Minimum jump length; from index `i` you may reach indices `i + minJump .. i + maxJump`. |
| maxJump | Maximum jump length. |
| n | `s.length`. |
| dp | Boolean array; `dp[i]` is `true` iff index `i` is reachable from the start. |
| windowCount | Number of reachable cells (`dp = true`) currently inside the sliding window `[i - maxJump, i - minJump]`. |
| i | Loop pointer scanning indices `1 .. n - 1`. |
| ans | Final boolean `dp[n - 1]`: whether the last index is reachable. |
