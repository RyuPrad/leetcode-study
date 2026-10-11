import fs from 'node:fs';
const lessons=JSON.parse(fs.readFileSync('visualizer-ui/lessons.json','utf8'));
const guided='<script defer src="../visualizer-ui/guided.js"></script>';
for(const lesson of lessons){let html=fs.readFileSync(lesson.path,'utf8');if(!html.includes('../visualizer-ui/code-language.js')){if(!html.includes(guided))throw Error(`${lesson.path} has no guided controller to follow.`);html=html.replace(guided,guided+'\n  <link rel="stylesheet" href="../visualizer-ui/code-language.css" />\n  <script defer src="../visualizer-ui/code-languages.js"></script>\n  <script defer src="../visualizer-ui/code-language.js"></script>');}fs.writeFileSync(lesson.path,html);}
console.log(`Attached reference code languages to ${lessons.length} visualizers.`);
