
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/greatest_common_divisor_traversal_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input array. Two indices may be traversed between when `gcd(nums[i], nums[j]) > 1`, i.e. they share a prime factor. |
| `n` | Length of `nums`; also the number of nodes in the union-find. |
| `dsu` | `class DSU` disjoint-set. Each index starts in its own component; `union` merges components that share a prime. `dsu.count` tracks how many components remain. |
| `parent` | The `dsu.parent` array. `parent[x]` is `x`'s parent; following it to a fixed point gives the component root. Path compression flattens it during `find`. |
| `primeToIndex` | `Map` from a prime `p` to the **first** node index that contained `p`. The second node to see `p` unions itself with that owner. |
| `i` | Index of the node currently being factored. |
| `x` | Working copy of `nums[i]` that is divided down as prime factors are extracted; any leftover `> 1` is itself a prime. |
| `p` | Trial-division candidate. The loop runs while `p * p <= x`. |

## Idea

Build a graph where nodes are array indices and an edge joins two indices that share a prime factor. The answer is **true iff this graph is connected** (one component), because connectivity is exactly "every pair can be traversed between."

Rather than compare all `O(n^2)` pairs with `gcd`, we connect through **shared primes** using union-find:

- Factor each `nums[i]`. For every prime `p` of it, look in `primeToIndex`.
- If some earlier node already claimed `p`, `union` the two nodes — they share that prime, so they belong together.
- Otherwise record `primeToIndex[p] = i` so future owners of `p` link back to `i`.

Two special cases: a value of `1` has no prime factors, so it can never connect to anything — return `false` immediately (unless `n === 1`, where the single node is trivially connected). At the end, the whole array is traversable exactly when `dsu.count === 1`.

The `class DSU` uses iterative `find` with path compression (`parent[x] = parent[parent[x]]`) for near-constant amortized operations.

- **Time:** `O(n * sqrt(max) * alpha(n))` — trial-division factoring per number, with near-constant union-find ops.
- **Space:** `O(n + P)` for the DSU and the prime map (`P` = distinct primes seen).
