<iframe
  src="reorder_routes_to_make_all_paths_lead_to_the_city_zero_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of cities |
| connections | one-way roads [a, b] from a to b |
| adj | adj[a] = [neighbor, cost]; cost 1 means the road points away from city 0 |
| a | start of a road |
| b | end of a road |
| visited | cities already reached from 0 |
| stack | cities still to explore |
| res | roads that must be reversed |
| node | city being explored |
| next | neighboring city |
| cost | 1 if the road goes node → next, which is away from city 0 |
