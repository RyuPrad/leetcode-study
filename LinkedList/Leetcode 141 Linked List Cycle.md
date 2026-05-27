# LeetCode 141 — Linked List Cycle

<iframe
  title="LeetCode 141 Linked List Cycle Visualizer"
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/linkedListCycleVisualizer.html"
  width="100%"
  height="900"
  style="border: 0;"
></iframe>

## Core idea

Use two pointers:

```js
let slow = head;
let fast = head;

while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;

  if (slow === fast) {
    return true;
  }
}

return false;
```

The important part is that `slow === fast` compares whether both pointers reference the exact same node object, not whether their values are equal.

## Variable Pattern

| Name | Meaning |
|---|---|
| head | list head |
| slow | slow pointer |
| fast | fast pointer |
