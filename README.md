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

Explicit root example:

```bash
node scripts/sync-absolute-iframe-paths.mjs --root "C:\Users\ryupr\Documents\Obsidian Vault\Leetcode"
```
