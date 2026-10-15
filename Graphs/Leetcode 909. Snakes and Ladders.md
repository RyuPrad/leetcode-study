<iframe
  src="snakes_and_ladders_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| board | n × n board; -1 is a plain square, other values are snake or ladder targets |
| n | side length |
| cell | returns the board value of a square number |
| moves | moves[s] = fewest dice rolls to reach square s, -1 if not reached |
| queue | squares in the order they were reached |
| head | next square to expand |
| square | square being expanded |
| next | square a roll lands on |
| value | board value at next |
| dest | where the roll finally ends after any snake or ladder |
