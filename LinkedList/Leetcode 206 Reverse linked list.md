# Leetcode 206 Reverse linked list

<iframe
  title="LeetCode 206 Reverse Linked List Visualizer"
  src="reverseLinkedListVisualizer.html"
  width="100%"
  height="850"
  style="border: 0;"
></iframe>

## Key idea

For each node, save the original next node first:

```js
let next = curr.next;
```

Then flip the current node backward:

```js
curr.next = prev;
```

Then move both pointers forward:

```js
prev = curr;
curr = next;
```

In the visualizer, `next` stays visible after `curr = next` until the next loop overwrites it. That means it will show `node(2)`, then next loop it becomes `node(3)`, then `node(4)`, and so on.

## Variable Pattern

| Name | Meaning |
|---|---|
| head | list head |
| prev | previous node in reversed list |
| curr | node being reversed |
| next | saved original next pointer |
