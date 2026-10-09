// Import before any legacy authoring dependency. There is deliberately no flag
// that enables these stale bulk writers against the reviewed content shards.
throw new Error(
  'Legacy Guided bulk writing is disabled: it can overwrite reviewed lessons and reset their versions. ' +
  'Edit only the intended lesson in visualizer-ui/guided-content-a.json or guided-content-b.json, ' +
  'increment that lesson version, and run npm run check:guided and npm run test:guided. ' +
  'See README.md, "Maintaining Guided content", for the targeted review workflow. No content was written.'
);
