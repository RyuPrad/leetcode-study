<iframe
  src="insert_delete_getrandom_o1_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| this.values | the stored values, packed with no gaps |
| this.indexOf | value → its position in this.values |
| val | value inserted or removed |
| index | position of the value being removed |
| last | the last value, moved into the gap |
