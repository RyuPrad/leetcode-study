import fs from 'node:fs';
const lessons=JSON.parse(fs.readFileSync('visualizer-ui/lessons.json','utf8'));
for(const lesson of lessons){let html=fs.readFileSync(lesson.path,'utf8');if(!html.includes('../visualizer-ui/operations.js'))html=html.replace('<script defer src="../visualizer-ui/learning.js"></script>','<script defer src="../visualizer-ui/operation-rules.js"></script>\n  <script defer src="../visualizer-ui/operations.js"></script>\n  <script defer src="../visualizer-ui/learning.js"></script>');fs.writeFileSync(lesson.path,html);}
console.log(`Attached operation presentation to ${lessons.length} visualizers.`);
