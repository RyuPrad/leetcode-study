# Leetcode Obsidian Vault

Personal Obsidian vault with Markdown Leetcode notes and standalone HTML visualizers.

This vault intentionally uses absolute Windows `file:///` iframe paths in Markdown notes so Obsidian can load local HTML visualizers reliably.

## Commands

Sync iframe paths to the current vault root:

```bash
npm run sync:iframes
```

Check without writing:

```bash
npm run check:iframes
```

The check normalizes equivalent `file:///` path encodings before comparing (for example `%26` and literal `&` in folder names like `Array & Hashing`).

Explicit root example:

```bash
node scripts/sync-absolute-iframe-paths.mjs --root "C:\Users\ryupr\Documents\Obsidian Vault\Leetcode"
```

## Capturing visualizer outputs

Capture HUD, console, narration, trace, and step snapshots from every HTML visualizer:

```bash
npm run capture:outputs
```

This generates:

- `reports/visualizer-output-report.json`
- `reports/visualizer-output-report.md`

These files are committed so the visualizer output state can be reviewed from GitHub.
