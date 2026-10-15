<iframe
  src="process_tasks_using_servers_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| servers | weight of each server |
| tasks | time each task takes; task j arrives at second j |
| free | min-heap of [weight, index] for idle servers |
| busy | min-heap of [time free again, weight, index] |
| i | server being added |
| res | server assigned to each task |
| time | current second |
| j | task being assigned |
| weight | weight of the chosen server |
| index | index of the chosen server |
