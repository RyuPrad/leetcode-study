// Reference solutions in each language. JavaScript uses problems.json's reference; the
// others are maintained files under coding/solutions, checked by npm run check:solutions.
import type { Language } from '../shared/coding';

export const solutionExtensions: Record<Exclude<Language, 'javascript' | 'sql'>, string> = { typescript: 'ts', java: 'java', c: 'c' };
export const solutionPath = (number: number, language: Exclude<Language, 'javascript' | 'sql'>) => `coding/solutions/${language}/${number}.${solutionExtensions[language]}`;
