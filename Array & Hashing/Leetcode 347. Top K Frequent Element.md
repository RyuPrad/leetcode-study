
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Array%20%26%20Hashing/top_k_frequent_elements_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>
this line looks weird when you first see it:

```
const buckets = Array.from({ length: nums.length + 1 }, () => []);
```

It means:

> Create an array with `nums.length + 1` slots, and put a **separate empty array** in each slot.

So for:

```
nums = [1, 1, 1, 2, 2, 3]
```

`nums.length` is `6`, so this creates:

```
buckets = [  [], // index 0  [], // index 1  [], // index 2  [], // index 3  [], // index 4  [], // index 5  []  // index 6]
```

We need `nums.length + 1` because the highest possible frequency is `nums.length`.

For example:

```
nums = [5, 5, 5, 5, 5, 5]
```

The number `5` appears `6` times, so we need:

```
buckets[6]
```

That is why the array length needs to be `7`, because indexes go from `0` to `6`.

---

The second part is important:

```
() => []
```

This says:

> For every bucket, create a brand-new empty array.

So each bucket is independent:

```
buckets[1].push(3);
buckets[2].push(2);
buckets[3].push(1);
```

Now it becomes:

```
[
  [],
  [3],
  [2],
  [1],
  [],
  [],
  []
]
```

---

Be careful. This is **not the same** as:

```
const buckets = new Array(nums.length + 1).fill([]);
```

That version is bad here.

Why?

Because `.fill([])` puts the **same exact array reference** into every slot.

Example:

## Bad version

```
const buckets = new Array(7).fill([]);

buckets[1].push(3);
buckets[2].push(2);
buckets[3].push(1);

console.log(buckets);
```

You might expect this:

```
[
  [],
  [3],
  [2],
  [1],
  [],
  [],
  []
]
```

But the real output is:

```
[
  [3, 2, 1],
  [3, 2, 1],
  [3, 2, 1],
  [3, 2, 1],
  [3, 2, 1],
  [3, 2, 1],
  [3, 2, 1]
]
```

Because this:

```
new Array(7).fill([])
```

does **not** create 7 different arrays.

It creates **one array**, then puts that same array reference into every slot.

So visually, it is like this:

```
bucket[0] ─┐
bucket[1] ─┤
bucket[2] ─┤
bucket[3] ─┤──> same array: [3, 2, 1]
bucket[4] ─┤
bucket[5] ─┤
bucket[6] ─┘
```

That is why when you do:

```
buckets[1].push(3);
```

all buckets show `[3]`.

Then:

```
buckets[2].push(2);
```

all buckets show `[3, 2]`.

Then:

```
buckets[3].push(1);
```

all buckets show `[3, 2, 1]`.

So for this problem, always use:

```
const buckets = Array.from({ length: nums.length + 1 }, () => []);
```

not:

```
const buckets = new Array(nums.length + 1).fill([]);
```