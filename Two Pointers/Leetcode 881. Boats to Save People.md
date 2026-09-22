
<iframe
  src="boats_to_save_people_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| people | weights of each person, sorted ascending |
| limit | maximum total weight one boat can carry |
| left | pointer at the lightest remaining person |
| right | pointer at the heaviest remaining person |
| boats | running count of boats used (the answer) |
