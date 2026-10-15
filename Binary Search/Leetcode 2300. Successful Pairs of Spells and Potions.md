<iframe
  src="successful_pairs_of_spells_and_potions_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| spells | spell strengths |
| potions | potion strengths, sorted in place |
| success | minimum product for a successful pair |
| res | successful pair counts, one per spell |
| spell | spell being paired |
| left | first potion index that may succeed |
| right | end of the search range |
| mid | potion index being tested |
