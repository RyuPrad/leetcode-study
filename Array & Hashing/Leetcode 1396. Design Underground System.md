<iframe
  src="design_underground_system_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| this.checkIns | customer id → [station, time] of the open trip |
| this.totals | "start,end" → [total travel time, trips] |
| id | customer id |
| stationName | station of a check-in or check-out |
| t | time of the event |
| start | check-in station of the finished trip |
| startTime | check-in time of the finished trip |
| route | "start,end" key |
| sum | total time on the route before this trip |
| count | trips on the route before this trip |
