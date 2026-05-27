# Visualizer Output Report

Generated: 2026-05-27T20:31:40.677Z

Generated from 19 HTML visualizers.

## Summary

- Visualizers captured: 19
- Visualizers with errors: 0
- Max step limit: 80
- Highest steps used: 67
- Visualizers at max step limit: 0
- Total step snapshots: 483

## Array & Hashing/concatenation_of_array_visualizer.html

Title: Leetcode 1929. Concatenation of Array Visualizer
Heading: Leetcode 1929. Concatenation of Array
Subtitle: Manual optimal JavaScript solution visualized: create res, then copy each nums[i] into two positions.
Step mode: btn-next

### Initial HUD

```text
i:
0
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ _, _, _, _, _, _ ]
```

### Initial Console

```text
// Original input
const nums = [ 1, 2, 1 ];

// Live state

let i = 0;

const n = 3;

let value = undefined;

let firstIndex = undefined;

let secondIndex = undefined;

const res = [ _, _, _, _, _, _ ];

// Output
return res = [ _, _, _, _, _, _ ];
```

### Initial Narration

```text
Create res with enough space for two copies of nums: nums.length * 2.
```

### Initial Trace

```text
No writes yet. Step until res[i] = nums[i] to start the trace.
```

### Step Snapshots (18)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ _, _, _, _, _, _ ]
```

Result:
```text
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ _, _, _, _, _, _ ]
```

Result:
```text
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
n:
3
value:
1
firstIndex:
0
secondIndex:
3
res:
[ _, _, _, _, _, _ ]
```

Result:
```text
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
n:
3
value:
1
firstIndex:
0
secondIndex:
3
res:
[ 1, _, _, _, _, _ ]
```

Result:
```text
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
n:
3
value:
1
firstIndex:
0
secondIndex:
3
res:
[ 1, _, _, 1, _, _ ]
```

Result:
```text
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
1
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, _, _, 1, _, _ ]
```

Result:
```text
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
1
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, _, _, 1, _, _ ]
```

Result:
```text
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1
n:
3
value:
2
firstIndex:
1
secondIndex:
4
res:
[ 1, _, _, 1, _, _ ]
```

Result:
```text
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1
n:
3
value:
2
firstIndex:
1
secondIndex:
4
res:
[ 1, 2, _, 1, _, _ ]
```

Result:
```text
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1
n:
3
value:
2
firstIndex:
1
secondIndex:
4
res:
[ 1, 2, _, 1, 2, _ ]
```

Result:
```text
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
2
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, _, 1, 2, _ ]
```

Result:
```text
pending
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
2
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, _, 1, 2, _ ]
```

Result:
```text
pending
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
2
n:
3
value:
1
firstIndex:
2
secondIndex:
5
res:
[ 1, 2, _, 1, 2, _ ]
```

Result:
```text
pending
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
2
n:
3
value:
1
firstIndex:
2
secondIndex:
5
res:
[ 1, 2, 1, 1, 2, _ ]
```

Result:
```text
pending
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
2
n:
3
value:
1
firstIndex:
2
secondIndex:
5
res:
[ 1, 2, 1, 1, 2, 1 ]
```

Result:
```text
pending
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
done
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, 1, 1, 2, 1 ]
```

Result:
```text
pending
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
done
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, 1, 1, 2, 1 ]
```

Result:
```text
[ 1, 2, 1, 1, 2, 1 ]
```

#### Step 17 (next: Finished!)

HUD:
```text
i:
done
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, 1, 1, 2, 1 ]
```

Result:
```text
[ 1, 2, 1, 1, 2, 1 ]
```

### Final Snapshot

return value: [ 1, 2, 1, 1, 2, 1 ]

HUD:
```text
i:
done
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, 1, 1, 2, 1 ]
```

### After Step Back

```text
i:
done
n:
3
value:
undefined
firstIndex:
undefined
secondIndex:
undefined
res:
[ 1, 2, 1, 1, 2, 1 ]
```

### Controls

- #btn-ex-1: [1,2,1]
- #btn-ex-2: [1,3,2,1]
- #btn-ex-3: [5]
- #btn-ex-4: [9,8,7,6]
- #btn-ex-5: [0,-1,4]
- #btn-ex-6: [2,2,2,2]
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/contains_duplicate_visualizer.html

Title: Leetcode 217. Contains Duplicate Visualizer
Heading: Leetcode 217. Contains Duplicate
Step mode: btn-next

### Initial HUD

```text
i:
0
num:
undefined
seen:
{ }
result:
pending
```

### Initial Console

```text
// Original input
const nums = [ 1, 2, 3, 1 ];

// Live state

let i = 0;

let num = undefined;

const seen = new Set();

seen.has(num) = not checked;

// Output

return result = pending;
```

### Initial Narration

```text
Create an empty Set. This stores every number we have already seen.
```

### Initial Trace

```text
No iterations yet. Step into the loop to start the trace.
```

### Step Snapshots (20)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
num:
undefined
seen:
{ }
result:
pending
```

Result:
```text
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
num:
1
seen:
{ }
result:
pending
```

Result:
```text
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
num:
1
seen:
{ }
result:
pending
```

Result:
```text
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
num:
1
seen:
{ }
result:
pending
```

Result:
```text
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
num:
1
seen:
{ 1 }
result:
pending
```

Result:
```text
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
1
num:
undefined
seen:
{ 1 }
result:
pending
```

Result:
```text
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
1
num:
2
seen:
{ 1 }
result:
pending
```

Result:
```text
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1
num:
2
seen:
{ 1 }
result:
pending
```

Result:
```text
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1
num:
2
seen:
{ 1 }
result:
pending
```

Result:
```text
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1
num:
2
seen:
{ 1, 2 }
result:
pending
```

Result:
```text
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
2
num:
undefined
seen:
{ 1, 2 }
result:
pending
```

Result:
```text
pending
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
2
num:
3
seen:
{ 1, 2 }
result:
pending
```

Result:
```text
pending
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
2
num:
3
seen:
{ 1, 2 }
result:
pending
```

Result:
```text
pending
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
2
num:
3
seen:
{ 1, 2 }
result:
pending
```

Result:
```text
pending
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
2
num:
3
seen:
{ 1, 2, 3 }
result:
pending
```

Result:
```text
pending
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
3
num:
undefined
seen:
{ 1, 2, 3 }
result:
pending
```

Result:
```text
pending
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
pending
```

Result:
```text
pending
```

#### Step 17 (next: Step Over)

HUD:
```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
pending
```

Result:
```text
pending
```

#### Step 18 (next: Step Over)

HUD:
```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
true
```

Result:
```text
true
```

#### Step 19 (next: Finished!)

HUD:
```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
true
```

Result:
```text
true
```

### Final Snapshot

return value: true

HUD:
```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
true
```

### After Step Back

```text
i:
3
num:
1
seen:
{ 1, 2, 3 }
result:
true
```

### Controls

- #btn-ex-1: [1,2,3,1]
- #btn-ex-2: [1,2,3,4]
- #btn-ex-3: [0,4,5,0]
- #btn-ex-4: []
- #btn-ex-5: [7]
- #btn-ex-6: [2,14,18,22,22]
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/encode_decode_strings_visualizer.html

Title: Leetcode 271. Encode and Decode Strings Visualizer
Heading: Leetcode 271. Encode and Decode Strings
Step mode: btn-next

### Initial HUD

```text
mode:
encode
index:
0
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

### Initial Console

```text
// Input
const strs = ["neet","code","love","you"];
const encodedSource = "4#neet4#code4#love3#you";

// Live state

let mode = "encode";

let index = 0;

let i = 0;

let j = 0;
let start = undefined;

let len = undefined;

// Output

return encoded = "4#neet4#code4#love3#you";
```

### Initial Narration

```text
Start with an empty encoded string: result = "".
```

### Initial Trace

```text
No steps recorded yet. Step until the algorithm appends or slices a string.
```

### Step Snapshots (19)

#### Step 0 (next: Step Over)

HUD:
```text
mode:
encode
index:
0
i:
0
len:
undefined
result:
""
```

Result:
```text
""
```

#### Step 1 (next: Step Over)

HUD:
```text
mode:
encode
index:
0
i:
0
len:
4
result:
""
```

Result:
```text
""
```

#### Step 2 (next: Step Over)

HUD:
```text
mode:
encode
index:
0
i:
0
len:
4
result:
""
```

Result:
```text
""
```

#### Step 3 (next: Step Over)

HUD:
```text
mode:
encode
index:
0
i:
0
len:
4
result:
"4#neet"
```

Result:
```text
"4#neet"
```

#### Step 4 (next: Step Over)

HUD:
```text
mode:
encode
index:
1
i:
0
len:
undefined
result:
"4#neet"
```

Result:
```text
"4#neet"
```

#### Step 5 (next: Step Over)

HUD:
```text
mode:
encode
index:
1
i:
0
len:
4
result:
"4#neet"
```

Result:
```text
"4#neet"
```

#### Step 6 (next: Step Over)

HUD:
```text
mode:
encode
index:
1
i:
0
len:
4
result:
"4#neet"
```

Result:
```text
"4#neet"
```

#### Step 7 (next: Step Over)

HUD:
```text
mode:
encode
index:
1
i:
0
len:
4
result:
"4#neet4#code"
```

Result:
```text
"4#neet4#code"
```

#### Step 8 (next: Step Over)

HUD:
```text
mode:
encode
index:
2
i:
0
len:
undefined
result:
"4#neet4#code"
```

Result:
```text
"4#neet4#code"
```

#### Step 9 (next: Step Over)

HUD:
```text
mode:
encode
index:
2
i:
0
len:
4
result:
"4#neet4#code"
```

Result:
```text
"4#neet4#code"
```

#### Step 10 (next: Step Over)

HUD:
```text
mode:
encode
index:
2
i:
0
len:
4
result:
"4#neet4#code"
```

Result:
```text
"4#neet4#code"
```

#### Step 11 (next: Step Over)

HUD:
```text
mode:
encode
index:
2
i:
0
len:
4
result:
"4#neet4#code4#love"
```

Result:
```text
"4#neet4#code4#love"
```

#### Step 12 (next: Step Over)

HUD:
```text
mode:
encode
index:
3
i:
0
len:
undefined
result:
"4#neet4#code4#love"
```

Result:
```text
"4#neet4#code4#love"
```

#### Step 13 (next: Step Over)

HUD:
```text
mode:
encode
index:
3
i:
0
len:
3
result:
"4#neet4#code4#love"
```

Result:
```text
"4#neet4#code4#love"
```

#### Step 14 (next: Step Over)

HUD:
```text
mode:
encode
index:
3
i:
0
len:
3
result:
"4#neet4#code4#love"
```

Result:
```text
"4#neet4#code4#love"
```

#### Step 15 (next: Step Over)

HUD:
```text
mode:
encode
index:
3
i:
0
len:
3
result:
"4#neet4#code4#love3#you"
```

Result:
```text
"4#neet4#code4#love3#you"
```

#### Step 16 (next: Step Over)

HUD:
```text
mode:
encode
index:
4
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

Result:
```text
"4#neet4#code4#love3#you"
```

#### Step 17 (next: Step Over)

HUD:
```text
mode:
encode
index:
4
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

Result:
```text
"4#neet4#code4#love3#you"
```

#### Step 18 (next: Finished!)

HUD:
```text
mode:
encode
index:
4
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

Result:
```text
"4#neet4#code4#love3#you"
```

### Final Snapshot

return value: "4#neet4#code4#love3#you"

HUD:
```text
mode:
encode
index:
4
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

### After Step Back

```text
mode:
encode
index:
4
i:
0
len:
undefined
result:
"4#neet4#code4#love3#you"
```

### Controls

- #mode-encode: Encode
- #mode-decode: Decode
- #btn-ex-1: basic
- #btn-ex-2: special #
- #btn-ex-3: empty
- #btn-ex-4: spaces
- #btn-ex-5: numbers
- #btn-ex-6: single
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/group_anagrams_visualizer.html

Title: Leetcode 49. Group Anagrams Visualizer
Heading: Leetcode 49. Group Anagrams Visualizer
Subtitle: Group strings that are anagrams together using a HashMap with a 26-character frequency-count key.
Step mode: btn-next

### Initial HUD

```text
i:
0 / 6
str:
undefined
key:
not built
mapSize:
0
res:
pending
```

### Initial Console

```text
// Original input
const strs = ["eat", "tea", "tan", "ate", "nat", "bat"];

// Live state

let i = 0;

let str = undefined;

let charIndex = 0;
let count = all zeros;

const key = not built;

const groups.size = 0;

// HashMap
new Map()

// Output

return res = pending;
```

### Initial Narration

```text
Create an empty Map. The key will be a 26-letter frequency signature, and the value will be a list of anagrams.
```

### Initial Trace

```text
No words grouped yet. Step until a word gets pushed into the HashMap.
```

### Step Snapshots (45)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
undefined
key:
not built
mapSize:
0
res:
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
not built
mapSize:
0
res:
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
not built
mapSize:
0
res:
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
not built
mapSize:
0
res:
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
a:1 | e:1 | t:1
mapSize:
0
res:
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
a:1 | e:1 | t:1
mapSize:
1
res:
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
0 / 6
str:
"eat"
key:
a:1 | e:1 | t:1
mapSize:
1
res:
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
undefined
key:
not built
mapSize:
1
res:
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
not built
mapSize:
1
res:
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
not built
mapSize:
1
res:
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
not built
mapSize:
1
res:
pending
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
a:1 | e:1 | t:1
mapSize:
1
res:
pending
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
a:1 | e:1 | t:1
mapSize:
1
res:
pending
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
1 / 6
str:
"tea"
key:
a:1 | e:1 | t:1
mapSize:
1
res:
pending
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
undefined
key:
not built
mapSize:
1
res:
pending
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
not built
mapSize:
1
res:
pending
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
not built
mapSize:
1
res:
pending
```

#### Step 17 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
not built
mapSize:
1
res:
pending
```

#### Step 18 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
a:1 | n:1 | t:1
mapSize:
1
res:
pending
```

#### Step 19 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
a:1 | n:1 | t:1
mapSize:
2
res:
pending
```

#### Step 20 (next: Step Over)

HUD:
```text
i:
2 / 6
str:
"tan"
key:
a:1 | n:1 | t:1
mapSize:
2
res:
pending
```

#### Step 21 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
undefined
key:
not built
mapSize:
2
res:
pending
```

#### Step 22 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
not built
mapSize:
2
res:
pending
```

#### Step 23 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
not built
mapSize:
2
res:
pending
```

#### Step 24 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
not built
mapSize:
2
res:
pending
```

#### Step 25 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
a:1 | e:1 | t:1
mapSize:
2
res:
pending
```

#### Step 26 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
a:1 | e:1 | t:1
mapSize:
2
res:
pending
```

#### Step 27 (next: Step Over)

HUD:
```text
i:
3 / 6
str:
"ate"
key:
a:1 | e:1 | t:1
mapSize:
2
res:
pending
```

#### Step 28 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
undefined
key:
not built
mapSize:
2
res:
pending
```

#### Step 29 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 30 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 31 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 32 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
a:1 | n:1 | t:1
mapSize:
2
res:
pending
```

#### Step 33 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
a:1 | n:1 | t:1
mapSize:
2
res:
pending
```

#### Step 34 (next: Step Over)

HUD:
```text
i:
4 / 6
str:
"nat"
key:
a:1 | n:1 | t:1
mapSize:
2
res:
pending
```

#### Step 35 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
undefined
key:
not built
mapSize:
2
res:
pending
```

#### Step 36 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 37 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 38 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
not built
mapSize:
2
res:
pending
```

#### Step 39 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
a:1 | b:1 | t:1
mapSize:
2
res:
pending
```

#### Step 40 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
a:1 | b:1 | t:1
mapSize:
3
res:
pending
```

#### Step 41 (next: Step Over)

HUD:
```text
i:
5 / 6
str:
"bat"
key:
a:1 | b:1 | t:1
mapSize:
3
res:
pending
```

#### Step 42 (next: Step Over)

HUD:
```text
i:
done
str:
undefined
key:
not built
mapSize:
3
res:
pending
```

#### Step 43 (next: Step Over)

HUD:
```text
i:
done
str:
undefined
key:
not built
mapSize:
3
res:
pending
```

#### Step 44 (next: Finished!)

HUD:
```text
i:
done
str:
undefined
key:
not built
mapSize:
3
res:
[["eat","tea","ate"],["tan","nat"],["bat"]]
```

### Final Snapshot

HUD:
```text
i:
done
str:
undefined
key:
not built
mapSize:
3
res:
[["eat","tea","ate"],["tan","nat"],["bat"]]
```

### After Step Back

```text
i:
done
str:
undefined
key:
not built
mapSize:
3
res:
pending
```

### Controls

- (no id): ▶ Play
- (no id): Ⅱ Pause
- (no id): ■ Reset
- #btn-ex-1: Example 1
- #btn-ex-2: Example 2
- #btn-ex-3: Example 3
- (no id): Load
- (no id): Random
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Fullscreen
- #btn-prev: Step Back
- #btn-next: Step Over

### Errors

None

## Array & Hashing/longest_common_prefix_visualizer.html

Title: Leetcode 14. Longest Common Prefix Visualizer
Heading: Leetcode 14. Longest Common Prefix
Subtitle: Optimal JavaScript solution visualized column by column: use strs[0] as reference, compare every string at the same index, stop at the first mismatch.
Step mode: btn-next

### Initial HUD

```text
i:
0
j:
1
char:
undefined
prefix:
pending
```

### Initial Console

```text
// Original input
const strs = ["flower", "flow", "flight"];

// Live state

let i = 0;

let j = 1;

const char = undefined;

let prefix = pending;

// Output

return prefix = pending;
```

### Initial Narration

```text
Start by handling the edge case. If strs is empty, return an empty string.
```

### Initial Trace

```text
No comparisons yet. Step until the inner loop compares a row against the reference character.
```

### Step Snapshots (29)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
j:
1
char:
undefined
prefix:
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
j:
1
char:
undefined
prefix:
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
j:
1
char:
"f"
prefix:
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
j:
1
char:
"f"
prefix:
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
j:
1
char:
"f"
prefix:
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0
j:
2
char:
"f"
prefix:
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
0
j:
2
char:
"f"
prefix:
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
0
j:
2
char:
"f"
prefix:
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
0
j:
done
char:
"f"
prefix:
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
0
j:
done
char:
"f"
prefix:
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
1
j:
done
char:
undefined
prefix:
pending
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
1
j:
done
char:
undefined
prefix:
pending
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
1
j:
1
char:
"l"
prefix:
pending
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
1
j:
1
char:
"l"
prefix:
pending
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
1
j:
1
char:
"l"
prefix:
pending
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
1
j:
2
char:
"l"
prefix:
pending
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
1
j:
2
char:
"l"
prefix:
pending
```

#### Step 17 (next: Step Over)

HUD:
```text
i:
1
j:
2
char:
"l"
prefix:
pending
```

#### Step 18 (next: Step Over)

HUD:
```text
i:
1
j:
done
char:
"l"
prefix:
pending
```

#### Step 19 (next: Step Over)

HUD:
```text
i:
1
j:
done
char:
"l"
prefix:
pending
```

#### Step 20 (next: Step Over)

HUD:
```text
i:
2
j:
done
char:
undefined
prefix:
pending
```

#### Step 21 (next: Step Over)

HUD:
```text
i:
2
j:
done
char:
undefined
prefix:
pending
```

#### Step 22 (next: Step Over)

HUD:
```text
i:
2
j:
1
char:
"o"
prefix:
pending
```

#### Step 23 (next: Step Over)

HUD:
```text
i:
2
j:
1
char:
"o"
prefix:
pending
```

#### Step 24 (next: Step Over)

HUD:
```text
i:
2
j:
1
char:
"o"
prefix:
pending
```

#### Step 25 (next: Step Over)

HUD:
```text
i:
2
j:
2
char:
"o"
prefix:
pending
```

#### Step 26 (next: Step Over)

HUD:
```text
i:
2
j:
2
char:
"o"
prefix:
pending
```

#### Step 27 (next: Step Over)

HUD:
```text
i:
2
j:
2
char:
"o"
prefix:
"fl"
```

#### Step 28 (next: Finished!)

HUD:
```text
i:
2
j:
2
char:
"o"
prefix:
"fl"
```

### Final Snapshot

HUD:
```text
i:
2
j:
2
char:
"o"
prefix:
"fl"
```

### After Step Back

```text
i:
2
j:
2
char:
"o"
prefix:
"fl"
```

### Controls

- #btn-ex-1: flower, flow, flight
- #btn-ex-2: dog, racecar, car
- #btn-ex-3: inter..., inter...
- #btn-ex-4: alone
- #btn-ex-5: empty prefix
- #btn-ex-6: short string stop
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/product_of_array_except_self_visualizer.html

Title: Leetcode 238. Product of Array Except Self Visualizer
Heading: Leetcode 238. Product of Array Except Self Visualizer
Step mode: btn-next

### Initial HUD

```text
phase:
INIT
i:
-
numsI:
undefined
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

### Initial Console

```text
// Original input
const nums = [ 1, 2, 3, 4 ];
const n = 4;

// Live state

let phase = "INIT";
let i = null;
let nums[i] = undefined;
let prefix = 1;
let suffix = 1;

// Output

return res = [ 1, 1, 1, 1 ];
```

### Initial Narration

```text
Create res with all 1s. We will store prefix products first, then multiply suffix products into the same output array.
```

### Initial Trace

```text
No operations yet. Step forward to start tracing the algorithm.
```

### Step Snapshots (27)

#### Step 0 (next: Next ▶)

HUD:
```text
phase:
PREFIX_START
i:
-
numsI:
undefined
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 1 (next: Next ▶)

HUD:
```text
phase:
PREFIX_READ
i:
0
numsI:
1
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 2 (next: Next ▶)

HUD:
```text
phase:
PREFIX_WRITE
i:
0
numsI:
1
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 3 (next: Next ▶)

HUD:
```text
phase:
PREFIX_UPDATE
i:
0
numsI:
1
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 4 (next: Next ▶)

HUD:
```text
phase:
PREFIX_READ
i:
1
numsI:
2
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 5 (next: Next ▶)

HUD:
```text
phase:
PREFIX_WRITE
i:
1
numsI:
2
prefix:
1
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 6 (next: Next ▶)

HUD:
```text
phase:
PREFIX_UPDATE
i:
1
numsI:
2
prefix:
2
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 7 (next: Next ▶)

HUD:
```text
phase:
PREFIX_READ
i:
2
numsI:
3
prefix:
2
suffix:
1
res:
[1, 1, 1, 1]
```

#### Step 8 (next: Next ▶)

HUD:
```text
phase:
PREFIX_WRITE
i:
2
numsI:
3
prefix:
2
suffix:
1
res:
[1, 1, 2, 1]
```

#### Step 9 (next: Next ▶)

HUD:
```text
phase:
PREFIX_UPDATE
i:
2
numsI:
3
prefix:
6
suffix:
1
res:
[1, 1, 2, 1]
```

#### Step 10 (next: Next ▶)

HUD:
```text
phase:
PREFIX_READ
i:
3
numsI:
4
prefix:
6
suffix:
1
res:
[1, 1, 2, 1]
```

#### Step 11 (next: Next ▶)

HUD:
```text
phase:
PREFIX_WRITE
i:
3
numsI:
4
prefix:
6
suffix:
1
res:
[1, 1, 2, 6]
```

#### Step 12 (next: Next ▶)

HUD:
```text
phase:
PREFIX_UPDATE
i:
3
numsI:
4
prefix:
24
suffix:
1
res:
[1, 1, 2, 6]
```

#### Step 13 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_START
i:
-
numsI:
undefined
prefix:
24
suffix:
1
res:
[1, 1, 2, 6]
```

#### Step 14 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_READ
i:
3
numsI:
4
prefix:
24
suffix:
1
res:
[1, 1, 2, 6]
```

#### Step 15 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_WRITE
i:
3
numsI:
4
prefix:
24
suffix:
1
res:
[1, 1, 2, 6]
```

#### Step 16 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_UPDATE
i:
3
numsI:
4
prefix:
24
suffix:
4
res:
[1, 1, 2, 6]
```

#### Step 17 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_READ
i:
2
numsI:
3
prefix:
24
suffix:
4
res:
[1, 1, 2, 6]
```

#### Step 18 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_WRITE
i:
2
numsI:
3
prefix:
24
suffix:
4
res:
[1, 1, 8, 6]
```

#### Step 19 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_UPDATE
i:
2
numsI:
3
prefix:
24
suffix:
12
res:
[1, 1, 8, 6]
```

#### Step 20 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_READ
i:
1
numsI:
2
prefix:
24
suffix:
12
res:
[1, 1, 8, 6]
```

#### Step 21 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_WRITE
i:
1
numsI:
2
prefix:
24
suffix:
12
res:
[1, 12, 8, 6]
```

#### Step 22 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_UPDATE
i:
1
numsI:
2
prefix:
24
suffix:
24
res:
[1, 12, 8, 6]
```

#### Step 23 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_READ
i:
0
numsI:
1
prefix:
24
suffix:
24
res:
[1, 12, 8, 6]
```

#### Step 24 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_WRITE
i:
0
numsI:
1
prefix:
24
suffix:
24
res:
[24, 12, 8, 6]
```

#### Step 25 (next: Next ▶)

HUD:
```text
phase:
SUFFIX_UPDATE
i:
0
numsI:
1
prefix:
24
suffix:
24
res:
[24, 12, 8, 6]
```

#### Step 26 (next: Next ▶)

HUD:
```text
phase:
DONE
i:
-
numsI:
undefined
prefix:
24
suffix:
24
res:
[24, 12, 8, 6]
```

### Final Snapshot

HUD:
```text
phase:
DONE
i:
-
numsI:
undefined
prefix:
24
suffix:
24
res:
[24, 12, 8, 6]
```

### After Step Back

```text
phase:
SUFFIX_UPDATE
i:
0
numsI:
1
prefix:
24
suffix:
24
res:
[24, 12, 8, 6]
```

### Controls

- (no id): Load
- #btn-ex-1: Ex 1
- #btn-ex-2: Zero
- #btn-ex-3: Two 0s
- #btn-ex-4: Neg
- #btn-first: ⏮ First
- #btn-prev: ◀ Prev
- #btn-next: Next ▶
- #btn-last: Last ⏭
- #btn-play: ▶ Play
- #btn-pause: Ⅱ Pause
- #btn-reset: ↻ Reset
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Fullscreen

### Errors

None

## Array & Hashing/top_k_frequent_elements_visualizer.html

Title: Leetcode 347. Top K Frequent Elements Visualizer
Heading: Leetcode 347. Top K Frequent Elements Visualizer
Step mode: btn-next

### Initial HUD

```text
phase:
INIT
i:
-
num:
undefined
freq:
Map size 0
bucket:
-
res:
[]
```

### Initial Console

```text
// Original input
const nums = [ 1, 1, 1, 2, 2, 3 ];
const k = 2;

// Live state

let phase = "INIT";
let i = null;
let num = undefined;
let freq = null;
const freq = new Map();
const buckets = <span class="kw">empty buckets</span>;

// Output

return res = [  ];
```

### Initial Narration

```text
Create an empty Map named freq. This will store each number and how many times it appears.
```

### Initial Trace

```text
No operations yet. Step forward to start tracing the algorithm.
```

### Step Snapshots (32)

#### Step 0 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
0
num:
1
freq:
Map size 0
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 1 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
0
num:
1
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 2 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
1
num:
1
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 3 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
1
num:
1
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 4 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
2
num:
1
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 5 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
2
num:
1
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 6 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
3
num:
2
freq:
Map size 1
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 7 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
3
num:
2
freq:
Map size 2
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 8 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
4
num:
2
freq:
Map size 2
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 9 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
4
num:
2
freq:
Map size 2
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 10 (next: Next ▶)

HUD:
```text
phase:
COUNT_READ
i:
5
num:
3
freq:
Map size 2
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 11 (next: Next ▶)

HUD:
```text
phase:
COUNT_WRITE
i:
5
num:
3
freq:
Map size 3
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 12 (next: Next ▶)

HUD:
```text
phase:
MAKE_BUCKETS
i:
-
num:
undefined
freq:
Map size 3
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 13 (next: Next ▶)

HUD:
```text
phase:
BUCKET_READ
i:
-
num:
1
freq:
Map size 3
bucket:
bucket[3]
res:
[]
```

Result:
```text
[ ]
```

#### Step 14 (next: Next ▶)

HUD:
```text
phase:
BUCKET_WRITE
i:
-
num:
1
freq:
Map size 3
bucket:
bucket[3]
res:
[]
```

Result:
```text
[ ]
```

#### Step 15 (next: Next ▶)

HUD:
```text
phase:
BUCKET_READ
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[]
```

Result:
```text
[ ]
```

#### Step 16 (next: Next ▶)

HUD:
```text
phase:
BUCKET_WRITE
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[]
```

Result:
```text
[ ]
```

#### Step 17 (next: Next ▶)

HUD:
```text
phase:
BUCKET_READ
i:
-
num:
3
freq:
Map size 3
bucket:
bucket[1]
res:
[]
```

Result:
```text
[ ]
```

#### Step 18 (next: Next ▶)

HUD:
```text
phase:
BUCKET_WRITE
i:
-
num:
3
freq:
Map size 3
bucket:
bucket[1]
res:
[]
```

Result:
```text
[ ]
```

#### Step 19 (next: Next ▶)

HUD:
```text
phase:
RESULT_INIT
i:
-
num:
undefined
freq:
Map size 3
bucket:
-
res:
[]
```

Result:
```text
[ ]
```

#### Step 20 (next: Next ▶)

HUD:
```text
phase:
SCAN_BUCKET
i:
-
num:
undefined
freq:
Map size 3
bucket:
bucket[6]
res:
[]
```

Result:
```text
[ ]
```

#### Step 21 (next: Next ▶)

HUD:
```text
phase:
SCAN_BUCKET
i:
-
num:
undefined
freq:
Map size 3
bucket:
bucket[5]
res:
[]
```

Result:
```text
[ ]
```

#### Step 22 (next: Next ▶)

HUD:
```text
phase:
SCAN_BUCKET
i:
-
num:
undefined
freq:
Map size 3
bucket:
bucket[4]
res:
[]
```

Result:
```text
[ ]
```

#### Step 23 (next: Next ▶)

HUD:
```text
phase:
SCAN_BUCKET
i:
-
num:
undefined
freq:
Map size 3
bucket:
bucket[3]
res:
[]
```

Result:
```text
[ ]
```

#### Step 24 (next: Next ▶)

HUD:
```text
phase:
INNER_LOOP
i:
-
num:
1
freq:
Map size 3
bucket:
bucket[3]
res:
[]
```

Result:
```text
[ ]
```

#### Step 25 (next: Next ▶)

HUD:
```text
phase:
PUSH_RESULT
i:
-
num:
1
freq:
Map size 3
bucket:
bucket[3]
res:
[1]
```

Result:
```text
[ 1 ]
```

#### Step 26 (next: Next ▶)

HUD:
```text
phase:
CHECK_K
i:
-
num:
1
freq:
Map size 3
bucket:
bucket[3]
res:
[1]
```

Result:
```text
[ 1 ]
```

#### Step 27 (next: Next ▶)

HUD:
```text
phase:
SCAN_BUCKET
i:
-
num:
undefined
freq:
Map size 3
bucket:
bucket[2]
res:
[1]
```

Result:
```text
[ 1 ]
```

#### Step 28 (next: Next ▶)

HUD:
```text
phase:
INNER_LOOP
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1]
```

Result:
```text
[ 1 ]
```

#### Step 29 (next: Next ▶)

HUD:
```text
phase:
PUSH_RESULT
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1, 2]
```

Result:
```text
[ 1, 2 ]
```

#### Step 30 (next: Next ▶)

HUD:
```text
phase:
CHECK_K
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1, 2]
```

Result:
```text
[ 1, 2 ]
```

#### Step 31 (next: Next ▶)

HUD:
```text
phase:
DONE
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1, 2]
```

Result:
```text
[ 1, 2 ]
```

### Final Snapshot

return value: [ 1, 2 ]

HUD:
```text
phase:
DONE
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1, 2]
```

### After Step Back

```text
phase:
CHECK_K
i:
-
num:
2
freq:
Map size 3
bucket:
bucket[2]
res:
[1, 2]
```

### Controls

- (no id): Load
- #btn-ex-1: Ex 1
- #btn-ex-2: Ex 2
- #btn-ex-3: Ex 3
- #btn-ex-4: Ex 4
- #btn-first: ⏮ First
- #btn-prev: ◀ Prev
- #btn-next: Next ▶
- #btn-last: Last ⏭
- #btn-play: ▶ Play
- #btn-pause: Ⅱ Pause
- #btn-reset: ↻ Reset
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Fullscreen

### Errors

None

## Array & Hashing/two_sum_visualizer - Copy.html

Title: Leetcode 1. Two Sum Visualizer
Heading: Leetcode 1. Two Sum
Subtitle: Optimal JavaScript solution visualized with a hash map: store previous values, check the needed complement (need), return indices.
Step mode: btn-next

### Initial HUD

```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

### Initial Console

```text
// Original input
const nums = [ 2, 7, 11, 15 ];
const target = 9;

// Live state

let i = 0;

let num = undefined;

let need = undefined;

const seen = new Map();

seen.has(need) = not checked;

// Output

return res = pending;
```

### Initial Narration

```text
Create an empty Map. It stores number → index for values we have already passed.
```

### Initial Trace

```text
No iterations yet. Step until seen.has(need) to start the trace.
```

### Step Snapshots (12)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
1
num:
undefined
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1
num:
undefined
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

Result:
```text
[0, 1]
```

#### Step 11 (next: Finished!)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

Result:
```text
[0, 1]
```

### Final Snapshot

return value: [0, 1]

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

### After Step Back

```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

### Controls

- #btn-ex-1: [2,7,11,15], 9
- #btn-ex-2: [3,2,4], 6
- #btn-ex-3: [3,3], 6
- #btn-ex-4: [-1,-2,-3,-4,-5], -8
- #btn-ex-5: [0,4,3,0], 0
- #btn-ex-6: [1,5,8,12], 20
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/two_sum_visualizer.html

Title: Leetcode 1. Two Sum Visualizer
Heading: Leetcode 1. Two Sum
Subtitle: Optimal JavaScript solution visualized with a hash map: store previous values, check the needed complement (need), return indices.
Step mode: btn-next

### Initial HUD

```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

### Initial Console

```text
// Original input
const nums = [ 2, 7, 11, 15 ];
const target = 9;

// Live state

let i = 0;

let num = undefined;

let need = undefined;

const seen = new Map();

seen.has(need) = not checked;

// Output

return res = pending;
```

### Initial Narration

```text
Create an empty Map. It stores number → index for values we have already passed.
```

### Initial Trace

```text
No iterations yet. Step until seen.has(need) to start the trace.
```

### Step Snapshots (12)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
num:
undefined
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
undefined
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{}
res:
pending
```

Result:
```text
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0
num:
2
need:
7
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
1
num:
undefined
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1
num:
undefined
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
undefined
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
pending
```

Result:
```text
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

Result:
```text
[0, 1]
```

#### Step 11 (next: Finished!)

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

Result:
```text
[0, 1]
```

### Final Snapshot

return value: [0, 1]

HUD:
```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

### After Step Back

```text
i:
1
num:
7
need:
2
seen:
{ 2 → 0 }
res:
[0, 1]
```

### Controls

- #btn-ex-1: [2,7,11,15], 9
- #btn-ex-2: [3,2,4], 6
- #btn-ex-3: [3,3], 6
- #btn-ex-4: [-1,-2,-3,-4,-5], -8
- #btn-ex-5: [0,4,3,0], 0
- #btn-ex-6: [1,5,8,12], 20
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Array & Hashing/valid_anagram_visualizer.html

Title: Leetcode 242. Valid Anagram Visualizer
Heading: Leetcode 242. Valid Anagram
Step mode: btn-next

### Initial HUD

```text
i:
0
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

### Initial Console

```text
// Original input
const s = "anagram";
const t = "nagaram";

// Live state

let i = 0;

let s[i] = undefined;

let t[i] = undefined;

length check = pass;
checking letter = a;
nonzero counts = all zero;

// Output

return ans = pending;
```

### Initial Narration

```text
Start the function with two strings: s and t. An anagram must have the same letters with the same frequencies.
```

### Initial Trace

```text
No iterations yet. Step into the frequency loop to start the trace.
```

### Step Snapshots (35)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
s[i]:
'a'
t[i]:
'n'
ans:
pending
```

Result:
```text
pending
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0
s[i]:
'a'
t[i]:
'n'
ans:
pending
```

Result:
```text
pending
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
0
s[i]:
'a'
t[i]:
'n'
ans:
pending
```

Result:
```text
pending
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
1
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
1
s[i]:
'n'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
1
s[i]:
'n'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
1
s[i]:
'n'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
2
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
2
s[i]:
'a'
t[i]:
'g'
ans:
pending
```

Result:
```text
pending
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
2
s[i]:
'a'
t[i]:
'g'
ans:
pending
```

Result:
```text
pending
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
2
s[i]:
'a'
t[i]:
'g'
ans:
pending
```

Result:
```text
pending
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
3
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
3
s[i]:
'g'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 17 (next: Step Over)

HUD:
```text
i:
3
s[i]:
'g'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 18 (next: Step Over)

HUD:
```text
i:
3
s[i]:
'g'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 19 (next: Step Over)

HUD:
```text
i:
4
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 20 (next: Step Over)

HUD:
```text
i:
4
s[i]:
'r'
t[i]:
'r'
ans:
pending
```

Result:
```text
pending
```

#### Step 21 (next: Step Over)

HUD:
```text
i:
4
s[i]:
'r'
t[i]:
'r'
ans:
pending
```

Result:
```text
pending
```

#### Step 22 (next: Step Over)

HUD:
```text
i:
4
s[i]:
'r'
t[i]:
'r'
ans:
pending
```

Result:
```text
pending
```

#### Step 23 (next: Step Over)

HUD:
```text
i:
5
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 24 (next: Step Over)

HUD:
```text
i:
5
s[i]:
'a'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 25 (next: Step Over)

HUD:
```text
i:
5
s[i]:
'a'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 26 (next: Step Over)

HUD:
```text
i:
5
s[i]:
'a'
t[i]:
'a'
ans:
pending
```

Result:
```text
pending
```

#### Step 27 (next: Step Over)

HUD:
```text
i:
6
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 28 (next: Step Over)

HUD:
```text
i:
6
s[i]:
'm'
t[i]:
'm'
ans:
pending
```

Result:
```text
pending
```

#### Step 29 (next: Step Over)

HUD:
```text
i:
6
s[i]:
'm'
t[i]:
'm'
ans:
pending
```

Result:
```text
pending
```

#### Step 30 (next: Step Over)

HUD:
```text
i:
6
s[i]:
'm'
t[i]:
'm'
ans:
pending
```

Result:
```text
pending
```

#### Step 31 (next: Step Over)

HUD:
```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 32 (next: Step Over)

HUD:
```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
pending
```

Result:
```text
pending
```

#### Step 33 (next: Step Over)

HUD:
```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
true
```

Result:
```text
true
```

#### Step 34 (next: Finished!)

HUD:
```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
true
```

Result:
```text
true
```

### Final Snapshot

return value: true

HUD:
```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
true
```

### After Step Back

```text
i:
done
s[i]:
undefined
t[i]:
undefined
ans:
true
```

### Controls

- #btn-ex-1: anagram / nagaram
- #btn-ex-2: rat / car
- #btn-ex-3: listen / silent
- #btn-ex-4: hello / bello
- #btn-ex-5: a / ab
- #btn-ex-6: empty / empty
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Binary Search/binary_search_visualizer.html

Title: Leetcode 704. Binary Search Visualizer
Heading: 704. Binary Search Visualizer
Subtitle: Given a sorted array nums and an integer target, return the index of target if it exists. Otherwise return -1.
Step mode: btn-next

### Initial HUD

```text
left:
0
right:
5
mid:
undefined
currentValue:
undefined
target:
9
ans:
undefined
```

### Initial Console

```text
// Input
const nums = [-1,0,3,5,9,12];
const target = 9;

// Live state

let left = 0;

let right = 5;

let mid = undefined;

let nums[mid] = undefined;

let target = 9;

let ans = undefined;

let state = "INIT";
```

### Initial Narration

```text
Start with left = 0 and right = nums.length - 1.
```

### Initial Trace

```text
No trace yet. Step through the algorithm to record mid calculations, comparisons, and discarded halves.
```

### Step Snapshots (9)

#### Step 0 (next: Step Over)

HUD:
```text
left:
0
right:
5
mid:
undefined
currentValue:
undefined
target:
9
ans:
undefined
```

#### Step 1 (next: Step Over)

HUD:
```text
left:
0
right:
5
mid:
undefined
currentValue:
undefined
target:
9
ans:
undefined
```

#### Step 2 (next: Step Over)

HUD:
```text
left:
0
right:
5
mid:
2
currentValue:
3
target:
9
ans:
undefined
```

#### Step 3 (next: Step Over)

HUD:
```text
left:
0
right:
5
mid:
2
currentValue:
3
target:
9
ans:
undefined
```

#### Step 4 (next: Step Over)

HUD:
```text
left:
3
right:
5
mid:
undefined
currentValue:
undefined
target:
9
ans:
undefined
```

#### Step 5 (next: Step Over)

HUD:
```text
left:
3
right:
5
mid:
undefined
currentValue:
undefined
target:
9
ans:
undefined
```

#### Step 6 (next: Step Over)

HUD:
```text
left:
3
right:
5
mid:
4
currentValue:
9
target:
9
ans:
undefined
```

#### Step 7 (next: Step Over)

HUD:
```text
left:
3
right:
5
mid:
4
currentValue:
9
target:
9
ans:
4
```

#### Step 8 (next: Finished!)

HUD:
```text
left:
3
right:
5
mid:
4
currentValue:
9
target:
9
ans:
4
```

### Final Snapshot

HUD:
```text
left:
3
right:
5
mid:
4
currentValue:
9
target:
9
ans:
4
```

### After Step Back

```text
left:
3
right:
5
mid:
4
currentValue:
9
target:
9
ans:
4
```

### Controls

- #btn-ex-1: classic
- #btn-ex-2: not found
- #btn-ex-3: negative
- #btn-ex-4: single
- #btn-ex-5: large
- #btn-ex-6: edges
- (no id): Load
- (no id): Set
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Binary Search/search_insert_position_visualizer.html

Title: Leetcode 35. Search Insert Position Visualizer
Heading: 35. Search Insert Position Visualizer
Subtitle: Given a sorted array nums and an integer target, return the index if the target exists. Otherwise, return the index where it would be inserted in order.
Step mode: btn-next

### Initial HUD

```text
left:
0
right:
3
mid:
undefined
currentValue:
undefined
target:
5
ans:
undefined
```

### Initial Console

```text
// Input
const nums = [1,3,5,6];
const target = 5;

// Live state

let left = 0;

let right = 3;

let mid = undefined;

let nums[mid] = undefined;

let target = 5;

let ans = undefined;

let state = "INIT";
```

### Initial Narration

```text
Start with left = 0 and right = nums.length - 1.
```

### Initial Trace

```text
No trace yet. Step through the algorithm to record mid calculations, comparisons, and updated search windows and the final insert position.
```

### Step Snapshots (9)

#### Step 0 (next: Step Over)

HUD:
```text
left:
0
right:
3
mid:
undefined
currentValue:
undefined
target:
5
ans:
undefined
```

#### Step 1 (next: Step Over)

HUD:
```text
left:
0
right:
3
mid:
undefined
currentValue:
undefined
target:
5
ans:
undefined
```

#### Step 2 (next: Step Over)

HUD:
```text
left:
0
right:
3
mid:
1
currentValue:
3
target:
5
ans:
undefined
```

#### Step 3 (next: Step Over)

HUD:
```text
left:
0
right:
3
mid:
1
currentValue:
3
target:
5
ans:
undefined
```

#### Step 4 (next: Step Over)

HUD:
```text
left:
2
right:
3
mid:
undefined
currentValue:
undefined
target:
5
ans:
undefined
```

#### Step 5 (next: Step Over)

HUD:
```text
left:
2
right:
3
mid:
undefined
currentValue:
undefined
target:
5
ans:
undefined
```

#### Step 6 (next: Step Over)

HUD:
```text
left:
2
right:
3
mid:
2
currentValue:
5
target:
5
ans:
undefined
```

#### Step 7 (next: Step Over)

HUD:
```text
left:
2
right:
3
mid:
2
currentValue:
5
target:
5
ans:
2
```

#### Step 8 (next: Finished!)

HUD:
```text
left:
2
right:
3
mid:
2
currentValue:
5
target:
5
ans:
2
```

### Final Snapshot

HUD:
```text
left:
2
right:
3
mid:
2
currentValue:
5
target:
5
ans:
2
```

### After Step Back

```text
left:
2
right:
3
mid:
2
currentValue:
5
target:
5
ans:
2
```

### Controls

- #btn-ex-1: found
- #btn-ex-2: middle
- #btn-ex-3: negative
- #btn-ex-4: start
- #btn-ex-5: end
- #btn-ex-6: edges
- (no id): Load
- (no id): Set
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## LinkedList/linkedListCycleVisualizer.html

Title: LeetCode 141 — Linked List Cycle Visualizer
Heading: LeetCode 141 — Linked List Cycle
Step mode: btn-next

### Initial HUD

```text
(empty)
```

### Step Snapshots (13)

#### Step 0 (next: Step Over)

#### Step 1 (next: Step Over)

#### Step 2 (next: Step Over)

#### Step 3 (next: Step Over)

#### Step 4 (next: Step Over)

#### Step 5 (next: Step Over)

#### Step 6 (next: Step Over)

#### Step 7 (next: Step Over)

#### Step 8 (next: Step Over)

#### Step 9 (next: Step Over)

#### Step 10 (next: Step Over)

#### Step 11 (next: Step Over)

#### Step 12 (next: Finished!)

### Final Snapshot

HUD:
```text
(empty)
```

### After Step Back

```text
(empty)
```

### Controls

- (no id): Dock Left
- (no id): Dock Right
- #btn-ex-1: [3,2,0,-4], pos=1
- #btn-ex-2: [1,2], pos=0
- #btn-ex-3: [1], no cycle
- #btn-ex-4: [], no cycle
- #btn-ex-5: [1,2,3,4,5], pos=2
- #memory-toggle: Memory labels: ON
- #cycle-toggle: Object view: Nested refs
- #btn-prev: Step Back
- #btn-next: Step Over
- (no id): Reset

### Errors

None

## LinkedList/mergeTwoListsVisualizer.html

Title: Merge Two Sorted Lists Visualizer
Step mode: btn-next

### Initial HUD

```text
list1:
1 → 2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
undefined
```

### Initial Console

```text
// Original inputs
const input_list1 = [ 1, 2, 4 ];
const input_list2 = [ 1, 3, 4 ];

// Live state

let list1 = 1 → 2 → 4 → null;

let list2 = 1 → 3 → 4 → null;

let tail = undefined;

// Merged chain (dummy.next → ...)

const result = pending;
```

### Initial Narration

```text
Create a dummy node to simplify the merge. tail will track the last node of the growing merged list; it starts at dummy.
```

### Step Snapshots (29)

#### Step 0 (next: Step Over)

HUD:
```text
list1:
1 → 2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
dummy
```

#### Step 1 (next: Step Over)

HUD:
```text
list1:
1 → 2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
dummy
```

#### Step 2 (next: Step Over)

HUD:
```text
list1:
1 → 2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
dummy
```

#### Step 3 (next: Step Over)

HUD:
```text
list1:
1 → 2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
dummy
```

#### Step 4 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
dummy
```

#### Step 5 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
node(1)
```

#### Step 6 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
node(1)
```

#### Step 7 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
node(1)
```

#### Step 8 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
1 → 3 → 4 → null
tail:
node(1)
```

#### Step 9 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 10 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 11 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 12 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 13 (next: Step Over)

HUD:
```text
list1:
2 → 4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 14 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
3 → 4 → null
tail:
node(1)
```

#### Step 15 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
3 → 4 → null
tail:
node(2)
```

#### Step 16 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
3 → 4 → null
tail:
node(2)
```

#### Step 17 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
3 → 4 → null
tail:
node(2)
```

#### Step 18 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
3 → 4 → null
tail:
node(2)
```

#### Step 19 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
4 → null
tail:
node(2)
```

#### Step 20 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
4 → null
tail:
node(3)
```

#### Step 21 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
4 → null
tail:
node(3)
```

#### Step 22 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
4 → null
tail:
node(3)
```

#### Step 23 (next: Step Over)

HUD:
```text
list1:
4 → null
list2:
4 → null
tail:
node(3)
```

#### Step 24 (next: Step Over)

HUD:
```text
list1:
null
list2:
4 → null
tail:
node(3)
```

#### Step 25 (next: Step Over)

HUD:
```text
list1:
null
list2:
4 → null
tail:
node(4)
```

#### Step 26 (next: Step Over)

HUD:
```text
list1:
null
list2:
4 → null
tail:
node(4)
```

#### Step 27 (next: Step Over)

HUD:
```text
list1:
null
list2:
null
tail:
node(4)
```

#### Step 28 (next: Finished!)

HUD:
```text
list1:
null
list2:
null
tail:
node(4)
```

### Final Snapshot

HUD:
```text
list1:
null
list2:
null
tail:
node(4)
```

### After Step Back

```text
list1:
null
list2:
null
tail:
node(4)
```

### Controls

- #btn-ex-1: [1,2,4] + [1,3,4]
- #btn-ex-2: [] + [0]
- #btn-ex-3: [5] + [1,2,3]
- #btn-ex-4: [] + []
- #btn-raw-toggle: Object view: Committed
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## LinkedList/reorderListVisualizer.html

Title: LeetCode 143 Reorder List Visualizer
Heading: LeetCode 143 — Reorder List
Step mode: no btn-next found

### Initial HUD

```text
(empty)
```

### Final Snapshot

HUD:
```text
(empty)
```

### Controls

- (no id): Dock Left
- (no id): Dock Right
- #ex1: [1,2,3,4]
- #ex2: [1,2,3,4,5]
- #ex3: [1,2]
- #ex4: [1]
- #ex5: []
- #labBtn: Labels: Learning
- #layoutBtn: Layout: Phase
- #objBtn: Object: Memory
- #prevBtn: Step Back
- #nextBtn: Step Over
- (no id): Reset

### Errors

None

## LinkedList/reverseLinkedListVisualizer.html

Title: Reverse Linked List Visualizer
Heading: LeetCode 206 — Reverse Linked List
Subtitle: Goal: reverse the linked list in-place by flipping each node's next pointer. The key pattern is: save the old next node, reverse the arrow, then move both pointers forward.
Step mode: btn-next

### Initial HUD

```text
head:
1 → 2 → 3 → 4 → 5 → null
prev:
null
curr:
1 → 2 → 3 → 4 → 5 → null
next:
undefined
```

### Initial Console

```text
// Original input
const input_head = [ 1, 2, 3, 4, 5 ];

// Live state

let head = 1 → 2 → 3 → 4 → 5 → null;

let prev = null;

let curr = 1 → 2 → 3 → 4 → 5 → null;

let next = undefined;

// Return value

const result = pending;
```

### Initial Narration

```text
Initialize prev to null and curr to head. prev represents the reversed side. curr walks through the original list.
```

### Step Snapshots (28)

#### Step 0 (next: Step Over)

HUD:
```text
head:
1 → 2 → 3 → 4 → 5 → null
prev:
null
curr:
1 → 2 → 3 → 4 → 5 → null
next:
undefined
```

#### Step 1 (next: Step Over)

HUD:
```text
head:
1 → 2 → 3 → 4 → 5 → null
prev:
null
curr:
1 → 2 → 3 → 4 → 5 → null
next:
undefined
```

#### Step 2 (next: Step Over)

HUD:
```text
head:
1 → 2 → 3 → 4 → 5 → null
prev:
null
curr:
1 → 2 → 3 → 4 → 5 → null
next:
node(2)
```

#### Step 3 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
null
curr:
1 → null
next:
node(2)
```

#### Step 4 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
1 → null
curr:
1 → null
next:
node(2)
```

#### Step 5 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
1 → null
curr:
2 → 3 → 4 → 5 → null
next:
node(2)
```

#### Step 6 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
1 → null
curr:
2 → 3 → 4 → 5 → null
next:
node(2)
```

#### Step 7 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
1 → null
curr:
2 → 3 → 4 → 5 → null
next:
node(3)
```

#### Step 8 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
1 → null
curr:
2 → 1 → null
next:
node(3)
```

#### Step 9 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
2 → 1 → null
curr:
2 → 1 → null
next:
node(3)
```

#### Step 10 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
2 → 1 → null
curr:
3 → 4 → 5 → null
next:
node(3)
```

#### Step 11 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
2 → 1 → null
curr:
3 → 4 → 5 → null
next:
node(3)
```

#### Step 12 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
2 → 1 → null
curr:
3 → 4 → 5 → null
next:
node(4)
```

#### Step 13 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
2 → 1 → null
curr:
3 → 2 → 1 → null
next:
node(4)
```

#### Step 14 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
3 → 2 → 1 → null
curr:
3 → 2 → 1 → null
next:
node(4)
```

#### Step 15 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
3 → 2 → 1 → null
curr:
4 → 5 → null
next:
node(4)
```

#### Step 16 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
3 → 2 → 1 → null
curr:
4 → 5 → null
next:
node(4)
```

#### Step 17 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
3 → 2 → 1 → null
curr:
4 → 5 → null
next:
node(5)
```

#### Step 18 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
3 → 2 → 1 → null
curr:
4 → 3 → 2 → 1 → null
next:
node(5)
```

#### Step 19 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
4 → 3 → 2 → 1 → null
curr:
4 → 3 → 2 → 1 → null
next:
node(5)
```

#### Step 20 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
4 → 3 → 2 → 1 → null
curr:
5 → null
next:
node(5)
```

#### Step 21 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
4 → 3 → 2 → 1 → null
curr:
5 → null
next:
node(5)
```

#### Step 22 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
4 → 3 → 2 → 1 → null
curr:
5 → null
next:
null
```

#### Step 23 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
4 → 3 → 2 → 1 → null
curr:
5 → 4 → 3 → 2 → 1 → null
next:
null
```

#### Step 24 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
5 → 4 → 3 → 2 → 1 → null
next:
null
```

#### Step 25 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
null
next:
null
```

#### Step 26 (next: Step Over)

HUD:
```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
null
next:
null
```

#### Step 27 (next: Finished!)

HUD:
```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
null
next:
null
```

### Final Snapshot

HUD:
```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
null
next:
null
```

### After Step Back

```text
head:
1 → null
prev:
5 → 4 → 3 → 2 → 1 → null
curr:
null
next:
null
```

### Controls

- (no id): Dock Left
- (no id): Dock Right
- #btn-ex-1: [1,2,3,4,5]
- #btn-ex-2: [1,2]
- #btn-ex-3: []
- #btn-ex-4: [42]
- #btn-memory-toggle: Memory labels: ON
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Two Pointers/container_with_most_water_visualizer.html

Title: Leetcode 11. Container With Most Water Visualizer
Heading: 11. Container With Most Water Visualizer
Subtitle: Given an array height, choose two lines that form a container with the x-axis. Maximize area = width × shorter height.
Step mode: btn-next

### Initial HUD

```text
left:
0
right:
8
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
0
```

### Initial Console

```text
// Input
const height = [1,8,6,2,5,4,8,3,7];

// Live state

let left = 0;

let right = 8;

let width = undefined;

let currentHeight = undefined;

let area = undefined;

let ans = 0;

let state = "INIT";
```

### Initial Narration

```text
Start with left = 0, right = height.length - 1, and ans = 0.
```

### Initial Trace

```text
No trace yet. Step through the algorithm to record areas, max updates, and pointer moves.
```

### Step Snapshots (35)

#### Step 0 (next: Step Over)

HUD:
```text
left:
0
right:
8
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
0
```

#### Step 1 (next: Step Over)

HUD:
```text
left:
0
right:
8
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
0
```

#### Step 2 (next: Step Over)

HUD:
```text
left:
0
right:
8
width:
8
currentHeight:
1
area:
8
ans:
0
```

#### Step 3 (next: Step Over)

HUD:
```text
left:
0
right:
8
width:
8
currentHeight:
1
area:
8
ans:
8
```

#### Step 4 (next: Step Over)

HUD:
```text
left:
1
right:
8
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
8
```

#### Step 5 (next: Step Over)

HUD:
```text
left:
1
right:
8
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
8
```

#### Step 6 (next: Step Over)

HUD:
```text
left:
1
right:
8
width:
7
currentHeight:
7
area:
49
ans:
8
```

#### Step 7 (next: Step Over)

HUD:
```text
left:
1
right:
8
width:
7
currentHeight:
7
area:
49
ans:
49
```

#### Step 8 (next: Step Over)

HUD:
```text
left:
1
right:
7
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 9 (next: Step Over)

HUD:
```text
left:
1
right:
7
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 10 (next: Step Over)

HUD:
```text
left:
1
right:
7
width:
6
currentHeight:
3
area:
18
ans:
49
```

#### Step 11 (next: Step Over)

HUD:
```text
left:
1
right:
7
width:
6
currentHeight:
3
area:
18
ans:
49
```

#### Step 12 (next: Step Over)

HUD:
```text
left:
1
right:
6
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 13 (next: Step Over)

HUD:
```text
left:
1
right:
6
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 14 (next: Step Over)

HUD:
```text
left:
1
right:
6
width:
5
currentHeight:
8
area:
40
ans:
49
```

#### Step 15 (next: Step Over)

HUD:
```text
left:
1
right:
6
width:
5
currentHeight:
8
area:
40
ans:
49
```

#### Step 16 (next: Step Over)

HUD:
```text
left:
1
right:
5
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 17 (next: Step Over)

HUD:
```text
left:
1
right:
5
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 18 (next: Step Over)

HUD:
```text
left:
1
right:
5
width:
4
currentHeight:
4
area:
16
ans:
49
```

#### Step 19 (next: Step Over)

HUD:
```text
left:
1
right:
5
width:
4
currentHeight:
4
area:
16
ans:
49
```

#### Step 20 (next: Step Over)

HUD:
```text
left:
1
right:
4
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 21 (next: Step Over)

HUD:
```text
left:
1
right:
4
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 22 (next: Step Over)

HUD:
```text
left:
1
right:
4
width:
3
currentHeight:
5
area:
15
ans:
49
```

#### Step 23 (next: Step Over)

HUD:
```text
left:
1
right:
4
width:
3
currentHeight:
5
area:
15
ans:
49
```

#### Step 24 (next: Step Over)

HUD:
```text
left:
1
right:
3
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 25 (next: Step Over)

HUD:
```text
left:
1
right:
3
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 26 (next: Step Over)

HUD:
```text
left:
1
right:
3
width:
2
currentHeight:
2
area:
4
ans:
49
```

#### Step 27 (next: Step Over)

HUD:
```text
left:
1
right:
3
width:
2
currentHeight:
2
area:
4
ans:
49
```

#### Step 28 (next: Step Over)

HUD:
```text
left:
1
right:
2
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 29 (next: Step Over)

HUD:
```text
left:
1
right:
2
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 30 (next: Step Over)

HUD:
```text
left:
1
right:
2
width:
1
currentHeight:
6
area:
6
ans:
49
```

#### Step 31 (next: Step Over)

HUD:
```text
left:
1
right:
2
width:
1
currentHeight:
6
area:
6
ans:
49
```

#### Step 32 (next: Step Over)

HUD:
```text
left:
1
right:
1
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 33 (next: Step Over)

HUD:
```text
left:
1
right:
1
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

#### Step 34 (next: Finished!)

HUD:
```text
left:
1
right:
1
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

### Final Snapshot

HUD:
```text
left:
1
right:
1
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

### After Step Back

```text
left:
1
right:
1
width:
undefined
currentHeight:
undefined
area:
undefined
ans:
49
```

### Controls

- #btn-ex-1: classic
- #btn-ex-2: small
- #btn-ex-3: increasing
- #btn-ex-4: decreasing
- #btn-ex-5: peaks
- #btn-ex-6: flat
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Two Pointers/three_sum_visualizer.html

Title: Leetcode 15. 3Sum Visualizer
Heading: 15. 3Sum Visualizer
Subtitle: Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] === 0.
Step mode: btn-next

### Initial HUD

```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

### Initial Console

```text
// Input
const nums = [-1,0,1,2,-1,-4];
const sorted = [-4,-1,-1,0,1,2];

// Live state

let i = 0;

let left = 1;

let right = 5;

let sum = undefined;

let state = "INIT";

// Output

return res = [];
```

### Initial Narration

```text
Start by sorting nums and creating an empty res array.
```

### Initial Trace

```text
No trace yet. Step through the algorithm to record sums, moves, duplicate skips, and found triplets.
```

### Step Snapshots (44)

#### Step 0 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

#### Step 1 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

#### Step 2 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

#### Step 3 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

#### Step 4 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
undefined
res:
[]
```

#### Step 5 (next: Step Over)

HUD:
```text
i:
0
left:
1
right:
5
sum:
-3
res:
[]
```

#### Step 6 (next: Step Over)

HUD:
```text
i:
0
left:
2
right:
5
sum:
-3
res:
[]
```

#### Step 7 (next: Step Over)

HUD:
```text
i:
0
left:
2
right:
5
sum:
-3
res:
[]
```

#### Step 8 (next: Step Over)

HUD:
```text
i:
0
left:
2
right:
5
sum:
-3
res:
[]
```

#### Step 9 (next: Step Over)

HUD:
```text
i:
0
left:
3
right:
5
sum:
-3
res:
[]
```

#### Step 10 (next: Step Over)

HUD:
```text
i:
0
left:
3
right:
5
sum:
-3
res:
[]
```

#### Step 11 (next: Step Over)

HUD:
```text
i:
0
left:
3
right:
5
sum:
-2
res:
[]
```

#### Step 12 (next: Step Over)

HUD:
```text
i:
0
left:
4
right:
5
sum:
-2
res:
[]
```

#### Step 13 (next: Step Over)

HUD:
```text
i:
0
left:
4
right:
5
sum:
-2
res:
[]
```

#### Step 14 (next: Step Over)

HUD:
```text
i:
0
left:
4
right:
5
sum:
-1
res:
[]
```

#### Step 15 (next: Step Over)

HUD:
```text
i:
0
left:
5
right:
5
sum:
-1
res:
[]
```

#### Step 16 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
undefined
res:
[]
```

#### Step 17 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
undefined
res:
[]
```

#### Step 18 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
undefined
res:
[]
```

#### Step 19 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
undefined
res:
[]
```

#### Step 20 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
undefined
res:
[]
```

#### Step 21 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
0
res:
[]
```

#### Step 22 (next: Step Over)

HUD:
```text
i:
1
left:
2
right:
5
sum:
0
res:
[[-1,-1,2]]
```

#### Step 23 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2]]
```

#### Step 24 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2]]
```

#### Step 25 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2]]
```

#### Step 26 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2]]
```

#### Step 27 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2]]
```

#### Step 28 (next: Step Over)

HUD:
```text
i:
1
left:
3
right:
4
sum:
0
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 29 (next: Step Over)

HUD:
```text
i:
1
left:
4
right:
3
sum:
0
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 30 (next: Step Over)

HUD:
```text
i:
1
left:
4
right:
3
sum:
0
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 31 (next: Step Over)

HUD:
```text
i:
1
left:
4
right:
3
sum:
0
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 32 (next: Step Over)

HUD:
```text
i:
2
left:
3
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 33 (next: Step Over)

HUD:
```text
i:
2
left:
3
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 34 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 35 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 36 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 37 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 38 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 39 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
5
sum:
3
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 40 (next: Step Over)

HUD:
```text
i:
3
left:
4
right:
4
sum:
3
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 41 (next: Step Over)

HUD:
```text
i:
4
left:
5
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 42 (next: Step Over)

HUD:
```text
i:
4
left:
5
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

#### Step 43 (next: Finished!)

HUD:
```text
i:
4
left:
5
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

### Final Snapshot

HUD:
```text
i:
4
left:
5
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

### After Step Back

```text
i:
4
left:
5
right:
5
sum:
undefined
res:
[[-1,-1,2],[-1,0,1]]
```

### Controls

- #btn-ex-1: classic
- #btn-ex-2: all zero
- #btn-ex-3: none
- #btn-ex-4: dups
- #btn-ex-5: mixed
- #btn-ex-6: bigger
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

## Two Pointers/valid_palindrome_visualizer.html

Title: Leetcode 125. Valid Palindrome Visualizer
Heading: 125. Valid Palindrome
Subtitle: Check if a string is a palindrome while ignoring non-alphanumeric characters and letter casing.
Step mode: btn-next

### Initial HUD

```text
left:
0
right:
29
compared:
0
skipped:
0
ans:
undefined
```

### Initial Console

```text
// Input
const s = "A man, a plan, a canal: Panama";
const cleaned = "amanaplanacanalpanama";

// Live state

let left = 0;

let right = 29;

let charactersCompared = 0;

let charactersSkipped = 0;

let state = "INIT";

// Output

return ans = undefined;
```

### Initial Narration

```text
Start by placing left at the first character and right at the last character.
```

### Initial Trace

```text
No trace yet. Step through the algorithm to record skips and comparisons.
```

### Step Snapshots (67)

#### Step 0 (next: Step Over)

HUD:
```text
left:
0
right:
29
compared:
0
skipped:
0
ans:
undefined
```

#### Step 1 (next: Step Over)

HUD:
```text
left:
0
right:
29
compared:
0
skipped:
0
ans:
undefined
```

#### Step 2 (next: Step Over)

HUD:
```text
left:
0
right:
29
compared:
0
skipped:
0
ans:
undefined
```

#### Step 3 (next: Step Over)

HUD:
```text
left:
0
right:
29
compared:
0
skipped:
0
ans:
undefined
```

#### Step 4 (next: Step Over)

HUD:
```text
left:
0
right:
29
compared:
1
skipped:
0
ans:
undefined
```

#### Step 5 (next: Step Over)

HUD:
```text
left:
1
right:
28
compared:
1
skipped:
0
ans:
undefined
```

#### Step 6 (next: Step Over)

HUD:
```text
left:
1
right:
28
compared:
1
skipped:
0
ans:
undefined
```

#### Step 7 (next: Step Over)

HUD:
```text
left:
2
right:
28
compared:
1
skipped:
1
ans:
undefined
```

#### Step 8 (next: Step Over)

HUD:
```text
left:
2
right:
28
compared:
1
skipped:
1
ans:
undefined
```

#### Step 9 (next: Step Over)

HUD:
```text
left:
2
right:
28
compared:
1
skipped:
1
ans:
undefined
```

#### Step 10 (next: Step Over)

HUD:
```text
left:
2
right:
28
compared:
2
skipped:
1
ans:
undefined
```

#### Step 11 (next: Step Over)

HUD:
```text
left:
3
right:
27
compared:
2
skipped:
1
ans:
undefined
```

#### Step 12 (next: Step Over)

HUD:
```text
left:
3
right:
27
compared:
2
skipped:
1
ans:
undefined
```

#### Step 13 (next: Step Over)

HUD:
```text
left:
3
right:
27
compared:
2
skipped:
1
ans:
undefined
```

#### Step 14 (next: Step Over)

HUD:
```text
left:
3
right:
27
compared:
2
skipped:
1
ans:
undefined
```

#### Step 15 (next: Step Over)

HUD:
```text
left:
3
right:
27
compared:
3
skipped:
1
ans:
undefined
```

#### Step 16 (next: Step Over)

HUD:
```text
left:
4
right:
26
compared:
3
skipped:
1
ans:
undefined
```

#### Step 17 (next: Step Over)

HUD:
```text
left:
4
right:
26
compared:
3
skipped:
1
ans:
undefined
```

#### Step 18 (next: Step Over)

HUD:
```text
left:
4
right:
26
compared:
3
skipped:
1
ans:
undefined
```

#### Step 19 (next: Step Over)

HUD:
```text
left:
4
right:
26
compared:
3
skipped:
1
ans:
undefined
```

#### Step 20 (next: Step Over)

HUD:
```text
left:
4
right:
26
compared:
4
skipped:
1
ans:
undefined
```

#### Step 21 (next: Step Over)

HUD:
```text
left:
5
right:
25
compared:
4
skipped:
1
ans:
undefined
```

#### Step 22 (next: Step Over)

HUD:
```text
left:
5
right:
25
compared:
4
skipped:
1
ans:
undefined
```

#### Step 23 (next: Step Over)

HUD:
```text
left:
6
right:
25
compared:
4
skipped:
2
ans:
undefined
```

#### Step 24 (next: Step Over)

HUD:
```text
left:
7
right:
25
compared:
4
skipped:
3
ans:
undefined
```

#### Step 25 (next: Step Over)

HUD:
```text
left:
7
right:
25
compared:
4
skipped:
3
ans:
undefined
```

#### Step 26 (next: Step Over)

HUD:
```text
left:
7
right:
25
compared:
4
skipped:
3
ans:
undefined
```

#### Step 27 (next: Step Over)

HUD:
```text
left:
7
right:
25
compared:
5
skipped:
3
ans:
undefined
```

#### Step 28 (next: Step Over)

HUD:
```text
left:
8
right:
24
compared:
5
skipped:
3
ans:
undefined
```

#### Step 29 (next: Step Over)

HUD:
```text
left:
8
right:
24
compared:
5
skipped:
3
ans:
undefined
```

#### Step 30 (next: Step Over)

HUD:
```text
left:
9
right:
24
compared:
5
skipped:
4
ans:
undefined
```

#### Step 31 (next: Step Over)

HUD:
```text
left:
9
right:
24
compared:
5
skipped:
4
ans:
undefined
```

#### Step 32 (next: Step Over)

HUD:
```text
left:
9
right:
24
compared:
5
skipped:
4
ans:
undefined
```

#### Step 33 (next: Step Over)

HUD:
```text
left:
9
right:
24
compared:
6
skipped:
4
ans:
undefined
```

#### Step 34 (next: Step Over)

HUD:
```text
left:
10
right:
23
compared:
6
skipped:
4
ans:
undefined
```

#### Step 35 (next: Step Over)

HUD:
```text
left:
10
right:
23
compared:
6
skipped:
4
ans:
undefined
```

#### Step 36 (next: Step Over)

HUD:
```text
left:
10
right:
23
compared:
6
skipped:
4
ans:
undefined
```

#### Step 37 (next: Step Over)

HUD:
```text
left:
10
right:
22
compared:
6
skipped:
5
ans:
undefined
```

#### Step 38 (next: Step Over)

HUD:
```text
left:
10
right:
21
compared:
6
skipped:
6
ans:
undefined
```

#### Step 39 (next: Step Over)

HUD:
```text
left:
10
right:
21
compared:
6
skipped:
6
ans:
undefined
```

#### Step 40 (next: Step Over)

HUD:
```text
left:
10
right:
21
compared:
7
skipped:
6
ans:
undefined
```

#### Step 41 (next: Step Over)

HUD:
```text
left:
11
right:
20
compared:
7
skipped:
6
ans:
undefined
```

#### Step 42 (next: Step Over)

HUD:
```text
left:
11
right:
20
compared:
7
skipped:
6
ans:
undefined
```

#### Step 43 (next: Step Over)

HUD:
```text
left:
11
right:
20
compared:
7
skipped:
6
ans:
undefined
```

#### Step 44 (next: Step Over)

HUD:
```text
left:
11
right:
20
compared:
7
skipped:
6
ans:
undefined
```

#### Step 45 (next: Step Over)

HUD:
```text
left:
11
right:
20
compared:
8
skipped:
6
ans:
undefined
```

#### Step 46 (next: Step Over)

HUD:
```text
left:
12
right:
19
compared:
8
skipped:
6
ans:
undefined
```

#### Step 47 (next: Step Over)

HUD:
```text
left:
12
right:
19
compared:
8
skipped:
6
ans:
undefined
```

#### Step 48 (next: Step Over)

HUD:
```text
left:
12
right:
19
compared:
8
skipped:
6
ans:
undefined
```

#### Step 49 (next: Step Over)

HUD:
```text
left:
12
right:
19
compared:
8
skipped:
6
ans:
undefined
```

#### Step 50 (next: Step Over)

HUD:
```text
left:
12
right:
19
compared:
9
skipped:
6
ans:
undefined
```

#### Step 51 (next: Step Over)

HUD:
```text
left:
13
right:
18
compared:
9
skipped:
6
ans:
undefined
```

#### Step 52 (next: Step Over)

HUD:
```text
left:
13
right:
18
compared:
9
skipped:
6
ans:
undefined
```

#### Step 53 (next: Step Over)

HUD:
```text
left:
14
right:
18
compared:
9
skipped:
7
ans:
undefined
```

#### Step 54 (next: Step Over)

HUD:
```text
left:
15
right:
18
compared:
9
skipped:
8
ans:
undefined
```

#### Step 55 (next: Step Over)

HUD:
```text
left:
15
right:
18
compared:
9
skipped:
8
ans:
undefined
```

#### Step 56 (next: Step Over)

HUD:
```text
left:
15
right:
18
compared:
9
skipped:
8
ans:
undefined
```

#### Step 57 (next: Step Over)

HUD:
```text
left:
15
right:
18
compared:
10
skipped:
8
ans:
undefined
```

#### Step 58 (next: Step Over)

HUD:
```text
left:
16
right:
17
compared:
10
skipped:
8
ans:
undefined
```

#### Step 59 (next: Step Over)

HUD:
```text
left:
16
right:
17
compared:
10
skipped:
8
ans:
undefined
```

#### Step 60 (next: Step Over)

HUD:
```text
left:
17
right:
17
compared:
10
skipped:
9
ans:
undefined
```

#### Step 61 (next: Step Over)

HUD:
```text
left:
17
right:
17
compared:
10
skipped:
9
ans:
undefined
```

#### Step 62 (next: Step Over)

HUD:
```text
left:
17
right:
17
compared:
10
skipped:
9
ans:
undefined
```

#### Step 63 (next: Step Over)

HUD:
```text
left:
17
right:
17
compared:
11
skipped:
9
ans:
undefined
```

#### Step 64 (next: Step Over)

HUD:
```text
left:
18
right:
16
compared:
11
skipped:
9
ans:
undefined
```

#### Step 65 (next: Step Over)

HUD:
```text
left:
18
right:
16
compared:
11
skipped:
9
ans:
true
```

#### Step 66 (next: Finished!)

HUD:
```text
left:
18
right:
16
compared:
11
skipped:
9
ans:
true
```

### Final Snapshot

HUD:
```text
left:
18
right:
16
compared:
11
skipped:
9
ans:
true
```

### After Step Back

```text
left:
18
right:
16
compared:
11
skipped:
9
ans:
true
```

### Controls

- #btn-ex-1: classic
- #btn-ex-2: race car
- #btn-ex-3: false
- #btn-ex-4: empty-ish
- #btn-ex-5: numbers
- #btn-ex-6: mixed
- (no id): Load
- (no id): Dock Left
- (no id): Dock Right
- #btn-fullscreen: Full Screen
- #btn-prev: Step Back
- #btn-next: Step Over
- #btn-reset: Reset

### Errors

None

