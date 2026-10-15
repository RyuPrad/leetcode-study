<iframe
  src="minimum_fuel_cost_to_report_to_the_capital_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| roads | tree edges between cities |
| seats | seats per car |
| n | number of cities |
| adj | neighbors of each city |
| a | one end of a road |
| b | other end |
| parent | parent of each city when the tree hangs from city 0 |
| order | cities in breadth-first order from city 0 |
| i | position in order |
| next | neighbor being discovered |
| people | representatives gathered in each city's subtree |
| fuel | liters used so far |
| node | city whose group drives one road toward the capital |
