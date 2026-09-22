
<iframe
  src="find_the_duplicate_number_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input array of n+1 integers, each in the range 1..n-1, treated as an implicit linked list where index `i` links to index `nums[i]` |
| `slow` | slow pointer; advances one step per move (`slow = nums[slow]`) |
| `fast` | fast pointer; advances two steps per move (`fast = nums[nums[fast]]`), then one step per move in phase 2 |
