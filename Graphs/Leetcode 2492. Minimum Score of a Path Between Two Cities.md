<iframe
  src="minimum_score_of_a_path_between_two_cities_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | cities 1 to n |
| roads | [a, b, distance] two-way roads |
| adj | adj[a] = [neighbor, distance] |
| a | one end of a road |
| b | other end |
| d | road distance |
| visited | cities reached from city 1 |
| stack | cities still to explore |
| res | smallest road seen in city 1's component |
| node | city being explored |
| next | neighboring city |
