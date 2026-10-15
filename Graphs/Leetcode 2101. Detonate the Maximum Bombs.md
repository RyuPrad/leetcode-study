<iframe
  src="detonate_the_maximum_bombs_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| bombs | [x, y, radius] of each bomb |
| n | number of bombs |
| adj | adj[i] = bombs inside bomb i's range |
| i | bomb whose range is checked |
| j | bomb that might be inside it |
| dx | x difference |
| dy | y difference |
| res | most bombs detonated |
| start | bomb detonated first |
| visited | bombs detonated in this chain |
| stack | bombs whose blasts are still to spread |
| bomb | bomb exploding now |
| next | bomb in its range |
