<iframe
  src="find_duplicate_subtrees_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| root | root of the tree |
| ids | subtree shape (value, left id, right id) → its id |
| count | how many times each subtree id was seen |
| res | one root for each repeated subtree |
| node | node this call identifies |
| left | id of the left subtree (0 for null) |
| right | id of the right subtree |
| key | value and child ids of this subtree |
| id | id of this subtree |
