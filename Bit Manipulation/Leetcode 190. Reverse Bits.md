
<iframe
  src="reverse_bits_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | The 32-bit unsigned input, treated as a register. Each iteration its lowest bit is read (`n & 1`) and then it is shifted right (`n >>> 1`), exposing the next bit. |
| res | The accumulating reversed value. Each iteration it is shifted left (`res << 1`) to open a slot, then the pulled bit is OR'd into position 0. |
| i | Loop counter from 0 to 31, guaranteeing exactly 32 bits are processed regardless of leading zeros. |
