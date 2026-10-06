import fs from 'node:fs';
import path from 'node:path';
import {collectCatalog,ROOT} from './content.mjs';
const catalog=collectCatalog();
for(const file of catalog.visualizers){
  const absolute=path.join(ROOT,file);let source=fs.readFileSync(absolute,'utf8');
  if(!source.includes('../visualizer-ui/guided.js')){
    source=source.replace('<script defer src="../visualizer-ui/learning.js"></script>','<script defer src="../visualizer-ui/learning.js"></script>\n  <script defer src="../visualizer-ui/guided-core.js"></script>\n  <script defer src="../visualizer-ui/guided.js"></script>');
    fs.writeFileSync(absolute,source);
  }
}
console.log(`Attached guided mode to ${catalog.visualizers.length} visualizers.`);
