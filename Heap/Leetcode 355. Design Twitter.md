
<iframe
  src="design_twitter_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `time` | Global clock; increments after every `postTweet` so newer tweets get larger timestamps. |
| `tweets` | Map from userId to a list of `[time, tweetId]` entries (that user's timeline). |
| `following` | Map from userId to a Set of the userIds they follow. |
| `heap` | Per-feed max-heap keyed by `entry[0]` (time); merges the followed users' tweets so the newest sits on top. |
| `res` | The news feed: up to the 10 most recent tweet IDs, newest first. |
