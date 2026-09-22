
<iframe
  src="accounts_merge_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `accounts` | Input list; each entry is `[name, email1, email2, ...]`. Accounts sharing any email belong to one person. |
| `dsu` | The `DSU` (union-find) over account indices `0..accounts.length-1`. |
| `parent` | `parent[x]` is account `x`'s parent pointer; the root identifies its merged group. |
| `emailToId` | `Map` from each email to the index of the first account that listed it. |
| `i` | Index of the account currently being scanned. |
| `j` | Index of the current email within `accounts[i]` (starts at 1, since index 0 is the name). |
| `email` | The current email string `accounts[i][j]`. |
| `groups` | `Map` from a set root to the list of emails belonging to that merged person. |
| `root` | `find(id)` — the representative account index for an email's owner. |
| `res` | Output: one entry per merged person = `[name, ...sortedEmails]`. |
