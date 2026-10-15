<iframe
  src="number_of_music_playlists_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | different songs, each played at least once |
| goal | length of the playlist |
| k | a song can repeat only after k other songs |
| MOD | 10^9 + 7 |
| dp | dp[i][j] = playlists of length i using exactly j different songs |
| i | playlist length |
| j | different songs used |
| fresh | ways if song i is new |
| replay | ways if song i repeats an earlier song |
