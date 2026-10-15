<iframe
  src="seat_reservation_manager_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| this.next | smallest seat that was never reserved |
| this.freed | min-heap of seats that were reserved and given back |
| n | number of seats |
| seatNumber | seat being given back |
