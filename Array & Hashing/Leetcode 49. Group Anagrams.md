
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Array%20%26%20Hashing/group_anagrams_visualizer.html"
  width="100%"
  height="900px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>
Real JavaScript `Map` does **not** look like this:

```
Map {  a:1 | e:1 | t:1 → ["eat", "tea"]}
```

That was meant to mean:

```
key: character-count patternvalue: list of words with that same pattern
```

In actual JavaScript, the map would be closer to this:

```
Map {  "1#0#0#0#1#0#0#0#0#0#0#0#0#0#0#0#0#0#0#1#0#0#0#0#0#0" => ["eat", "tea"]}
```

Because `"eat"` has:

```
a = 1e = 1t = 1everything else = 0
```

So visually I shortened it to:

```
a:1 | e:1 | t:1 → ["eat", "tea"]
```