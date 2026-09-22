/** UTF-16 offsets, matching Monaco positions. Token types come from its JavaScript lexer. */
export interface CodeToken { offset:number; type:string }
export interface TabOutLine {
  text:string;
  forward:number[];
  backward:number[];
  protectedRanges:Array<{start:number;end:number;openEnded:boolean}>;
}
type Context={quote:string}|{depth:number};

export function collectTabOutTargets(source:string,tokens:readonly (readonly CodeToken[])[]):TabOutLine[] {
  const contexts:Context[]=[];
  return source.split(/\r\n|\r|\n/).map((text,lineIndex)=>{
    const line:TabOutLine={text,forward:[],backward:[],protectedRanges:[]};
    const spans=tokens[lineIndex]||[];
    for(let t=0;t<spans.length;t++){
      const {offset:start,type}=spans[t],end=spans[t+1]?.offset??text.length;
      if(/^(comment|regexp)(\.|$)/.test(type)){
        const previous=line.protectedRanges.at(-1);
        const openEnded=type.startsWith('comment')&&end===text.length&&!text.endsWith('*/');
        if(previous?.end===start){previous.end=end;previous.openEnded=openEnded;}
        else line.protectedRanges.push({start,end,openEnded});
        continue;
      }
      if(type.startsWith('string.escape'))continue;
      for(let i=start;i<end;i++){
        const char=text[i],context=contexts.at(-1);
        if(type.startsWith('string')){
          if(char==='\\'){i++;continue;}
          if(context&&'quote'in context){
            if(char===context.quote){line.backward.push(i);line.forward.push(i+1);contexts.pop();}
          }else if(char==='"'||char==="'"||char==='`'){
            line.backward.push(i);contexts.push({quote:char});
          }
        }else if(!type.startsWith('delimiter')){
          continue; // Untokenized/overlong lines must not guess string or regex boundaries.
        }else if(context&&'quote'in context){
          if(context.quote==='`'&&char==='$'&&text[i+1]==='{'){
            line.backward.push(++i);contexts.push({depth:1});
          }
        }else if('()[]{}'.includes(char)){
          line.backward.push(i);
          if(')]}'.includes(char))line.forward.push(i+1);
          if(context&&'depth'in context){
            if(char==='{')context.depth++;
            else if(char==='}'&&!--context.depth)contexts.pop();
          }
        }
      }
    }
    // An unfinished single/double quoted string ends at the newline, unless continued.
    const context=contexts.at(-1);
    if(context&&'quote'in context&&context.quote!=='`'&&(text.match(/\\+$/)?.[0].length||0)%2===0)contexts.pop();
    return line;
  });
}

export function tabOutTarget(line:TabOutLine|undefined,offset:number,direction:'forward'|'backward'):number|null {
  if(!line||offset<0||offset>line.text.length||!line.text.slice(0,offset).trim())return null;
  if(line.protectedRanges.some(r=>offset>r.start&&(offset<r.end||r.openEnded&&offset===r.end)))return null;
  if(direction==='forward')return line.forward.find(target=>target>offset)??null;
  for(let i=line.backward.length-1;i>=0;i--)if(line.backward[i]<offset)return line.backward[i];
  return null;
}
