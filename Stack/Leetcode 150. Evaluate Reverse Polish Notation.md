
<iframe
  src="evaluate_reverse_polish_notation_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `tokens` | input array of RPN tokens (integers and `+ - * /`) |
| `stack` | LIFO stack of operands and intermediate results |
| `a` | first operand popped second (the left side of `a OP b`) |
| `b` | second operand popped first (the top of the stack) |
