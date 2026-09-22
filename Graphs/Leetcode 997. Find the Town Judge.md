
<iframe
  src="find_the_town_judge_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of people, labeled `1..n`. The judge must have a net score of exactly `n - 1`. |
| `trust` | List of directed edges `[a, b]` meaning person `a` trusts person `b`. |
| `score` | Array of length `n + 1`; `score[p]` = (people who trust `p`) − (people `p` trusts). A judge gets `+1` from everyone and never spends a `−1`. |
| `a` | The truster in the current edge `[a, b]`; `score[a]--` (trusting disqualifies you). |
| `b` | The trustee in the current edge `[a, b]`; `score[b]++`. |
| `i` | Loop index over candidates `1..n` while scanning for the judge. |
| `ans` | The returned value: the judge's label if some `score[i] === n - 1`, otherwise `-1`. |
