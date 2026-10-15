<iframe
  src="check_if_there_is_a_valid_partition_for_the_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | the array |
| n | its length |
| dp | dp[i] = the first i values can be partitioned |
| i | length of the prefix being decided |
| a | nums[i - 1], the last value of the prefix |
| b | nums[i - 2] |
| c | nums[i - 3] |
