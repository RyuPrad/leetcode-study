
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/longest_turbulent_subarray_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `arr` | The input integer array being scanned for a turbulent (zig-zag) run. |
| `ans` | Length of the longest turbulent subarray found so far; starts at `1`. |
| `inc` | Length of the current turbulent run that **ends on an UP step** (`arr[i] > arr[i-1]`). |
| `dec` | Length of the current turbulent run that **ends on a DOWN step** (`arr[i] < arr[i-1]`). |
| `i` | Loop index comparing `arr[i]` against its left neighbour `arr[i-1]`, from `1`. |
