import type { CodingProblem, Language } from '../../shared/coding';
import { solutionExtensions } from '../../coding/solutions';
// Each solution is its own lazily loaded chunk, so none enter the main bundle.
const files = import.meta.glob('../../coding/solutions/*/*', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
export async function loadSolution(problem: CodingProblem, language: Language): Promise<string> {
  if (language === 'javascript') return problem.reference;
  const load = files[`../../coding/solutions/${language}/${problem.number}.${solutionExtensions[language]}`];
  if (!load) throw new Error(`No ${language} solution is bundled for problem ${problem.number}.`);
  return load();
}
