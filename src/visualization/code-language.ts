import { isLanguage, type Language } from '../../shared/coding';
import { setPreferredLanguage } from '../coding/language-preference';
// The language the Visualizer and Learn tabs show reference code in. It follows the open
// problem's Code tab, and the language picker inside a visualizer changes the Code tab too.
let current:{problemId:string|null;language:Language}={problemId:null,language:'javascript'};
const listeners=new Set<()=>void>();
function broadcast(){for(const frame of document.querySelectorAll('iframe'))frame.contentWindow?.postMessage({type:'study:code-language',language:current.language},'study://content');}
/** The language for this problem's reference code, once the problem is open. */
export function codeLanguageFor(problemId:string):Language|undefined{return current.problemId===problemId?current.language:undefined;}
export function showCodeLanguage(problemId:string,language:Language){
  if(!isLanguage(language)||(current.problemId===problemId&&current.language===language))return;
  current={problemId,language};listeners.forEach(fn=>fn());broadcast();
}
export function onCodeLanguage(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
window.addEventListener('message',event=>{
  if(event.origin!=='study://content'||![...document.querySelectorAll('iframe')].some(f=>f.contentWindow===event.source))return;
  if(event.data?.type==='study:code-language'&&isLanguage(event.data.language)&&current.problemId){setPreferredLanguage(event.data.language);showCodeLanguage(current.problemId,event.data.language);}
  if(event.data?.type==='study:code-language-ready')(event.source as Window).postMessage({type:'study:code-language',language:current.language},'study://content');
});
