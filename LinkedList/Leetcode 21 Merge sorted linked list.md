

<iframe src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/mergeTwoListsVisualizer.html" width="100%" height="800px" frameborder="0"></iframe>






The two pointers are **`list1` and `list2`** themselves.

Each one is a pointer that walks through its own list independently. At every iteration you:

1. Compare the values they point to (`list1.val` vs `list2.val`)
2. Advance whichever pointer had the smaller value (`list1 = list1.next` or `list2 = list2.next`)
3. Leave the other pointer exactly where it is, so it gets compared again next iteration

That's the defining feature of the two-pointer pattern: two independent cursors moving through data, each advancing based on a condition rather than in lockstep.

`tail` isn't one of the two pointers — it's a separate bookkeeping pointer tracking where to append next in the output list.

## Variable Pattern

| Name | Meaning |
|---|---|
| list1 | first sorted list |
| list2 | second sorted list |
| dummy | sentinel head node |
| tail | end of merged list |
| curr | node being attached |
