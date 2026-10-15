<iframe
  src="stickers_to_spell_word_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| stickers | available sticker words, each usable any number of times |
| target | word to spell |
| memo | remaining letters → fewest stickers to cover them |
| rest | letters still needed, sorted |
| best | fewest stickers found for rest |
| sticker | sticker being tried |
| next | letters still needed after using this sticker |
| ch | sticker letter being cut out of next |
| res | answer for the whole target |
