// Refreshes coding/leetcode-index.json, the metadata for every LeetCode problem: number, title,
// URL slug, difficulty, acceptance rate, premium flag, category and topic tags. No problem
// statements are stored; each problem links to leetcode.com. Run with network access:
//   node scripts/fetch-leetcode-index.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './content.mjs';

const ENDPOINT = 'https://leetcode.com/graphql';
const PAGE = 100; // LeetCode caps questionList pages at 100 questions.
// Database problems are listed under both "database" and "pandas"; algorithms is the default.
const CATEGORIES = ['database', 'pandas', 'javascript', 'concurrency', 'shell'];

async function page(category, skip, fields) {
  const query = `query{q:questionList(categorySlug:${JSON.stringify(category)},limit:${PAGE},skip:${skip},filters:{}){total:totalNum questions:data{${fields}}}}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json', referer: 'https://leetcode.com/problemset/' }, body: JSON.stringify({ query }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { data } = await response.json();
      return data.q;
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}
async function list(category, fields) {
  const questions = [];
  for (let skip = 0; ; skip += PAGE) {
    const { total, questions: batch } = await page(category, skip, fields);
    questions.push(...batch);
    if (!batch.length || questions.length >= total) return questions;
  }
}

const questions = await list('', 'frontendQuestionId:questionFrontendId title titleSlug difficulty paidOnly:isPaidOnly acRate topicTags{name}');
const category = new Map();
for (const slug of CATEGORIES) for (const { frontendQuestionId } of await list(slug, 'frontendQuestionId:questionFrontendId')) category.set(frontendQuestionId, slug === 'pandas' ? 'database' : slug);
const index = questions.map(q => ({
  number: Number(q.frontendQuestionId), title: q.title.trim(), slug: q.titleSlug, difficulty: q.difficulty,
  acceptance: Math.round(q.acRate * 10) / 10, premium: q.paidOnly, category: category.get(q.frontendQuestionId) ?? 'algorithms',
  tags: q.topicTags.map(tag => tag.name)
})).sort((a, b) => a.number - b.number);
if (index.some(q => !Number.isInteger(q.number))) throw new Error('LeetCode returned a non-numeric problem ID.');
const file = path.join(ROOT, 'coding', 'leetcode-index.json');
fs.writeFileSync(file, `[\n${index.map(q => JSON.stringify(q)).join(',\n')}\n]\n`);
console.log(`Wrote ${index.length} problems to ${path.relative(ROOT, file)}.`);
