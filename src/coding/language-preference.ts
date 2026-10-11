import { isLanguage, type Language } from '../../shared/coding';
// The language for problems that have no draft yet. Renderer-only, like study.tabOutEnabled.
const key='study.codeLanguage';
export function preferredLanguage():Language{try{const value=localStorage.getItem(key);return isLanguage(value)?value:'javascript';}catch{return 'javascript';}}
export function setPreferredLanguage(language:Language){try{localStorage.setItem(key,language);}catch{/* Preferences are optional. */}}
