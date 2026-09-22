# LeetCode 143 — Reorder List

<iframe
  title="LeetCode 143 Reorder List Phase View Visualizer"
  src="reorderListVisualizer.html"
  width="100%"
  height="950"
  style="border: 0;"
></iframe>

## Core idea

Given:

```txt
L0 → L1 → L2 → ... → Ln-1 → Ln
```

Reorder it into:

```txt
L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ...
```

## Visual phases

```txt
1. Find the middle using slow/fast.
2. Split the list at slow.
3. Reverse the second half.
4. Weave/merge first half + reversed second half.
```

## JavaScript solution

```js
var reorderList = function(head) {
  if (!head || !head.next) return;

  let slow = head;
  let fast = head;

  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  let second = slow.next;
  slow.next = null;

  let prev = null;
  let curr = second;

  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  let first = head;
  second = prev;

  while (second) {
    let temp1 = first.next;
    let temp2 = second.next;

    first.next = second;
    second.next = temp1;

    first = temp1;
    second = temp2;
  }
};
```

## Key pointer lessons

```js
slow.next = null;
```

This splits the list. Without this cut, old `.next` links can remain and make the final weave confusing.

```js
first.next = second;
second.next = temp1;
```

These two lines perform the weave: first-half node, last node, next first-half node, second-last node, etc.

## Controls

```txt
Labels: Learning / All
Layout: Phase / Debugger
Object: Memory / Nested
```

Use **Phase + Learning** for studying. Use **Debugger + All** when you want to inspect every pointer at once.

## Variable Pattern

| Name | Meaning |
|---|---|
| head | list head |
| slow | slow pointer for midpoint |
| fast | fast pointer for midpoint |
| prev | previous node while reversing |
| curr | current node while reversing |
| next | saved next pointer |
| second | start of second half |
