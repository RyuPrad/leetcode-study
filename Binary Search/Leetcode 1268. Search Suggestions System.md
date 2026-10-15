<iframe
  src="search_suggestions_system_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| products | product names, sorted in place |
| searchWord | word typed one character at a time |
| res | suggestion lists, one per typed prefix |
| prefix | characters typed so far |
| c | character just typed |
| left | start of the binary search range |
| right | end of the binary search range |
| mid | product index being compared |
| matches | up to three products starting with prefix |
| i | index checked for a match |
