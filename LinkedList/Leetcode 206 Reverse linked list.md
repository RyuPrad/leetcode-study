# Leetcode 206 Reverse linked list

<iframe
  title="LeetCode 206 Reverse Linked List Visualizer"
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/reverseLinkedListVisualizer.html"
  width="100%"
  height="850"
  style="border: 0;"
></iframe>

## Key idea

For each node, save the original next node first:

```js
let nextTemp = curr.next;
```

Then flip the current node backward:

```js
curr.next = prev;
```

Then move both pointers forward:

```js
prev = curr;
curr = nextTemp;
```

In the visualizer, `nextTemp` stays visible after `curr = nextTemp` until the next loop overwrites it. That means it will show `node(2)`, then next loop it becomes `node(3)`, then `node(4)`, and so on.
