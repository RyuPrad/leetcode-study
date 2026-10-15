<iframe
  src="maximum_length_of_a_concatenated_string_with_unique_characters_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| arr | the strings |
| res | longest valid concatenation found |
| backtrack | tries adding each later string |
| index | first string that may be added next |
| used | concatenation built so far |
| i | string being tried |
| candidate | used plus arr[i] |
