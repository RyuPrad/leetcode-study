// Deterministic, constraint-valid judge cases. Seeds exercise boundaries, repetitions,
// ordering, absent targets, and structure shape; these are independent of the presets.
const seq = (n, start = 1) => Array.from({length:n},(_,i)=>i+start);
const grid = (rows,cols,fn) => Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>fn(r,c)));
const ops = (name, ctor, steps) => [[name,...steps.map(s=>s[0])],[ctor,...steps.map(s=>s.slice(1))]];
export function extraCase(n, seed) {
  const s=seed, len=2+s%6, v=seq(len), nums=v.map((x,i)=>(x*7+s*3)%13-6), pos=nums.map(x=>Math.abs(x)+1), word=String.fromCharCode(97+s%20), tree=[s+4,s+2,s+7,s+1,s+3,s+6,s+9];
  switch(n) {
    case 1:return [[s,2*s+1,100+s,1000+s],3*s+1];
    case 2:return [[s%10,9,9],[1,s%9+1]];
    case 3:case 5:case 647:case 680:return [word+'ab'+word.repeat(s%4+1)+'ba'+(s%2?'c':'')];
    case 4:return [v.map(x=>x*2+s),s%2?[]:v.map(x=>x*2+s+1)];
    case 7:return [s%2 ? 120*s+3 : -100*s-21];
    case 10:return ['a'.repeat(s)+'b',s%3===0?'a*b':s%3===1?'.*c':'a*.*'];
    case 11:case 42:case 84:return [pos];
    case 13:return [['I','II','III','IV','V','VI','VII','VIII','IX','X','XL','CM'][s-1]];
    case 14:return [[word+'abc',word+'abd',s%2?word:word+'ab']];
    case 15:return [[-s,0,s,-s,2*s,s+1,-s-1]];
    case 17:return [String(2+s%8)+String(2+Math.floor((s-1)/8))];
    case 18:return [[-s,0,s,2*s,-2*s,s+1,-s-1],s%2?0:s];
    case 19:case 25:return [v.map(x=>x+s),1+s%len];
    case 20:return ['('.repeat(s)+'[]'+')'.repeat(s)+(s%2?'':'{')];
    case 21:return [v.map(x=>x+s),s%2?[]:v.map(x=>x+s+1)];
    case 22:return [1+(s-1)%8];
    case 23:return [[v.map(x=>x+s),[],v.map(x=>x*2+s)]];
    case 26:return [v.flatMap(x=>[x+s,x+s])];
    case 27:return [[s,0,s,2,3,s,4],s];
    case 33:case 153:case 81:{ const x=v.map(x=>x+s); const r=s%len; const rot=x.slice(r).concat(x.slice(0,r));return n===153?[rot]:[n===81?rot.flatMap(x=>[x,x]):rot,s%2?s+1:100]; }
    case 35:case 704:return [v.map(x=>x*2+s),s*2];
    case 36:{const b=grid(9,9,()=>'.');b[s%9][(s*2)%9]=String(1+s%9);b[(s+3)%9][(s*2)%9]=s%2?String(1+s%9):String(1+(s+1)%9);return [b];}
    case 39:return [[2,3,5+s],s+5];
    case 40:return [[1,1,2,2,3,s+2],s+4];
    case 41:case 53:case 128:case 152:case 217:case 229:case 300:case 912:case 918:case 978:return [nums.concat(s%2?[nums[0]]:[s])];
    case 43:return [String(s*101+1),String(s*11)];
    case 45:case 55:return [[n===55&&s%3===0?0:s+2,...seq(s+2).map(x=>x%3)]];
    case 46:case 78:return [v.slice(0,1+s%5).map(x=>x+s)];
    case 47:case 90:return [[s,s,s+1,s+2].slice(0,2+s%3)];
    case 48:return [grid(1+s%4,1+s%4,(r,c)=>r*4+c+s)];
    case 49:return [[word+'ab','ba'+word,word+word,'ab'+word,'z']];
    case 50:return [s%2?1+s/10:-1-s/10,s%3===0?-s:s];
    case 51:case 52:return [1+(s-1)%9];
    case 54:case 867:return [grid(1+s%4,1+s%3,(r,c)=>s+r*5+c)];
    case 56:case 252:case 253:case 435:return [[[s,s+3],[s+2,s+5],[s+6,s+9],[s+8,s+10]]];
    case 57:return [[[1,2],[5,7],[10,15]],[s,s+3]];
    case 62:return [1+s%6,2+s%5];
    case 63:return [grid(2+s%3,2+s%4,(r,c)=>(r+c+s)%5===0?1:0)];
    case 64:case 329:case 417:case 1631:return [grid(2+s%3,2+s%4,(r,c)=>(r*7+c*3+s)%17+1)];
    case 66:return [[s%9+1,9,9,s%10]];
    case 67:return [(s*13).toString(2),(s*7+1).toString(2)];
    case 69:return [s*s+(s%2?0:s)];
    case 70:case 279:case 338:case 343:case 1137:return [s+2];
    case 71:return [`/a/${word}/.././b//${s}/../../c`];
    case 72:case 1143:return [word+'abcdef'.slice(0,s%6),word+'ace'.repeat(1+s%3)];
    case 73:return [grid(2+s%3,2+s%4,(r,c)=>(r+c+s)%4? s:0)];
    case 74:return [grid(2+s%3,3,(r,c)=>s+r*6+c*2),s+s%5];
    case 75:return [seq(s+1,0).map(x=>(x*7+s)%3)];
    case 76:return [word+'aaabbbcc'+word.repeat(s),'ab'+word];
    case 77:return [s+2,1+s%3];
    case 79:return [[[word,'a'],['b',word]],s%2?word+'a'+word:word+'aba'];
    case 88:return [v.map(x=>x+s).concat([0,0]),len,[s,s+100],2];
    case 91:return [String(11*s+10)+(s%3===0?'0':'1')];
    case 92:return [v.map(x=>x+s),1,1+s%len];
    case 94:case 98:case 102:case 104:case 110:case 124:case 144:case 145:case 199:case 226:case 297:case 337:case 543:case 1448:return [s%2?tree:[s,null,s+1,null,s+2]];
    case 97:return [word.repeat(s),'ab',s%2?word.repeat(s)+'ab':word.repeat(s)+'ac'];
    case 100:return [tree,s%2?tree:[...tree.slice(0,6),100+s]];
    case 105:return [[s+2,s+1,s+3],[s+1,s+2,s+3]];
    case 115:return [word.repeat(s+2)+'a',word.repeat(2)+'a'];
    case 121:case 122:case 198:case 213:case 309:case 746:return [pos];
    case 125:return [s%2?`${s}A man a plan!${s}`:`${word}.,A..a${word}`];
    case 127:return [word+'aa',word+'bb',[word+'ab',word+'bb',word+'ba']];
    case 130:return [grid(4,4,(r,c)=>s&(1<<((r*4+c)%8))?'O':'X')];
    case 131:return [word.repeat(1+s%4)+'aba'];
    case 133:{const k=2+s;return [seq(k).map(i=>[i===1?k:i-1,i===k?1:i+1])];}
    case 134:return [seq(s+2).map((_,i)=>i===s?s+2:0),seq(s+2).map(()=>s%2?1:2)];
    case 135:return [nums.map(x=>x+s+10)];
    case 136:return [[s,s,s+1,s+2,s+1]];
    case 138:return [[[s,null],[s+1,0],[s+2,s%3]]];
    case 139:case 140:case 2707:return [word.repeat(1+s%5)+'ab',[word,'ab',word+word]];
    case 141:return [v.map(x=>x+s),s%2?-1:s%len];
    case 143:case 206:case 2807:return [v.map(x=>x+s)];
    case 146:case 460:return ops(n===146?'LRUCache':'LFUCache',[1+s%3],[['put',s,10],['put',s+1,20],['get',s],['put',s+2,30],['get',s+1],['put',s,40],['get',s],['get',s+2]]);
    case 150:return [[String(s),'2','*',String(s+1),'+','3','/']];
    case 155:return ops('MinStack',[],[['push',s],['push',-s],['getMin'],['top'],['pop'],['getMin'],['push',s+2],['pop'],['top']]);
    case 167:return [[s,s+1,s+10,s+100],2*s+1];
    case 168:return [s*26+(s%2?1:0)];
    case 169:return [[s,s+1,s,s,s+2]];
    case 189:return [nums,s+len];
    case 190:case 191:return [2**(s+3)+s];
    case 200:return [grid(2+s%3,2+s%4,(r,c)=>(r+c+s)%3?'1':'0')];
    case 201:return [s*7,s*7+s];
    case 202:return [s*11+1];
    case 207:case 210:return [s+2,s%2?seq(s+1,0).map(i=>[i+1,i]):[[0,1],[1,0]]];
    case 208:return ops('Trie',[],[['insert',word+'ab'],['search',word],['startsWith',word],['insert',word],['search',word],['search',word+'abc']]);
    case 209:return [s*4,pos];
    case 211:return ops('WordDictionary',[],[['addWord',word+'ab'],['search','.ab'],['search',word+'..'],['search','....'],['addWord',word],['search',word]]);
    case 212:return [[[word,'a'],['b',word]],[word+'a',word+'b',word+'aba','z']];
    case 215:case 239:return [nums,1+s%len];
    case 219:return [nums.concat(nums[0]),s%len];
    case 225:case 232:return ops(n===225?'MyStack':'MyQueue',[],[['empty'],['push',s],['push',s+1],[n===225?'top':'peek'],['pop'],['pop'],['empty'],['push',s+2],['pop']]);
    case 230:return [tree,1+s%7];
    case 235:return [tree,s+1,s%2?s+3:s+9];
    case 238:return [[s,-s,s%3?2:0,3]];
    case 242:return [word.repeat(s)+'ab',s%2?'ba'+word.repeat(s):'aa'+word.repeat(s)];
    case 261:case 323:return [s+2,s%2?seq(s+1,0).map(i=>[i,i+1]):seq(s,0).map(i=>[i,i+1])];
    case 268:return [seq(s+2,0).filter(x=>x!==s)];
    case 269:return [[word+'a',word+'b',word+'c']];
    case 271:return [[word.repeat(s),'#12','',word+'#0#','🙂']];
    case 286:return [grid(2+s%3,3,(r,c)=>r===0&&c===s%3?0:(r+c+s)%4===0?-1:2147483647)];
    case 287:return [seq(s+1).concat(1+s%(s+1))];
    case 295:return ops('MedianFinder',[],[['addNum',s],['findMedian'],['addNum',-s],['findMedian'],['addNum',s+3],['findMedian']]);
    case 304:return ops('NumMatrix',[grid(2,3,(r,c)=>s+r*3+c)],[['sumRegion',0,0,1,2],['sumRegion',0,1,0,2],['sumRegion',1,1,1,1]]);
    case 310:return [s+2,seq(s+1,1).map(i=>[0,i])];
    case 312:case 416:case 473:case 1046:case 1049:case 1863:case 2709:return [pos];
    case 322:return [[2,3+s],s*2+1];
    case 332:return [[['JFK','AAA'],['AAA','JFK'],['JFK',word.toUpperCase().repeat(3)],...[...Array(s%3)].flatMap(()=>[[word.toUpperCase().repeat(3),'JFK'],['JFK',word.toUpperCase().repeat(3)]])]];
    case 344:return [[...word.repeat(s)+'ab']];
    case 347:return [[s,s,s,s+1,s+1,s+2],s%2?1:2];
    case 355:return ops('Twitter',[],[['postTweet',1,s],['follow',1,2],['postTweet',2,s+100],['getNewsFeed',1],['unfollow',1,2],['getNewsFeed',1],['getNewsFeed',3]]);
    case 371:return [s*100-700,200-s*50];
    case 374:return [s*101,s*7];
    case 377:return [[1,2,s+3],s+2];
    case 394:return [`${s}[a2[b]]c`];
    case 399:return [[['a','b'],['b','c']],[s+1,2],[['a','c'],['c','a'],['x','a'],['b','b']]];
    case 410:return [pos,1+s%len];
    case 424:return [('AB'.repeat(s)+'CCCC'),s%5];
    case 427:return [grid(4,4,(r,c)=>s&(1<<((r*4+c)%8))?1:0)];
    case 450:return [tree,s%2?s+4:s+100];
    case 463:return [grid(2+s%4,2+s%3,(r,c)=>r===0||c===0?1:0)];
    case 494:return [pos,s%2?s:0];
    case 502:return [s%4+1,s,[1,s+2,3],[0,s,s+2]];
    case 518:return [s*3,[1,3,7]];
    case 560:return [nums.concat([0,0]),s-5];
    case 567:return [word+'a','bb'+word.repeat(s)+(s%2?'a':'b')];
    case 572:return [tree,s%2?[s+2,s+1,s+3]:[s+2,s+1]];
    case 621:return [[...('A'.repeat(s)+'BBCC')],s%4];
    case 622:return ops('MyCircularQueue',[1+s%3],[['enQueue',s],['enQueue',s+1],['isFull'],['Front'],['Rear'],['deQueue'],['enQueue',s+2],['Front'],['Rear'],['isEmpty']]);
    case 649:return ['R'.repeat(s)+'D'.repeat(1+s%5)];
    case 658:return [v.map(x=>x*2+s),1+s%len,s*2];
    case 678:return ['('.repeat(s)+'*'.repeat(s)+(s%2?')':'')];
    case 682:return [[String(s),String(s+1),'D','+','C',String(-s),'+']];
    case 684:return [seq(s+2,1).map(i=>[i,i+1]).concat([[1,s+3]])];
    case 695:return [grid(3,4,(r,c)=>s&(1<<((r*4+c)%8))?1:0)];
    case 698:return [pos,1+s%len];
    case 700:return [tree,s%2?s+2:s+100];
    case 701:return [tree,s+5];
    case 703:return ops('KthLargest',[1+s%3,[s,s+1,s+2]],[['add',-s],['add',s+5],['add',s+3],['add',s+10]]);
    case 705:return ops('MyHashSet',[],[['contains',s],['add',s],['add',s],['contains',s],['add',s+8],['remove',s],['contains',s],['contains',s+8]]);
    case 706:return ops('MyHashMap',[],[['get',s],['put',s,s*10],['get',s],['put',s,s*20],['put',s+8,3],['remove',s],['get',s],['get',s+8]]);
    case 721:return [[[word,`${s}@a`,`${s}@b`],[word,`${s}@b`,`${s}@c`],['Other',`${s}@d`]]];
    case 735:return [[s,s+2,-s-1,-s-3,s+4]];
    case 739:return [v.map(x=>30+(x*7+s)%60)];
    case 743:return [[[1,2,s],[2,3,s+1],[1,3,s*4]],3,s%2?1:3];
    case 752:return [s%2?['0000']:[],String(s*101).padStart(4,'0')];
    case 763:return [word+'ab'+word+'cd'.repeat(s)];
    case 767:return [word.repeat(s)+'a'.repeat(1+s%5)+'b'];
    case 778:{const k=2+s%3;return [grid(k,k,(r,c)=>(r*k+c+s)%(k*k))];}
    case 787:return [3,[[0,1,s*10],[1,2,s*10],[0,2,s*30]],0,2,s%2];
    case 846:return [[s,s+1,s+2,s,s+1,s+2],s%2?3:2];
    case 853:return [s+20,[0,s,s+5],[1,3,2]];
    case 860:return [[...Array(s).fill(5),10,20,...(s%2?[20]:[])]];
    case 875:return [pos,len+s];
    case 877:return [[s,s+1,s+2,s+4]];
    case 881:return [pos,Math.max(...pos)+s];
    case 895:return ops('FreqStack',[],[['push',s],['push',s+1],['push',s],['pop'],['push',s+1],['pop'],['pop'],['pop']]);
    case 901:return ops('StockSpanner',[],v.map((x,i)=>['next',s*10+(i%2?x:len-x)]));
    case 933:return ops('RecentCounter',[],[['ping',s],['ping',s+2999],['ping',s+3000],['ping',s+3001],['ping',s+9000]]);
    case 953:return [[word+'a',word+'b'],'abcdefghijklmnopqrstuvwxyz'];
    case 973:return [v.map(x=>[x+s,x%2?-x:x]),1+s%len];
    case 981:return ops('TimeMap',[],[['get',word,1],['set',word,'first',s+1],['set',word,'second',s+5],['get',word,s],['get',word,s+3],['get',word,s+5],['get',word,s+100]]);
    case 994:return [grid(2+s%3,3,(r,c)=>r===0&&c===0?2:(r+c+s)%4?1:0)];
    case 997:return [s+2,s%2?seq(s+1,1).map(i=>[i,s+2]):[]];
    case 1011:return [pos,1+s%len];
    case 1071:return ['AB'.repeat(s+1),'AB'.repeat(s%4+1)+(s%3===0?'C':'')];
    case 1094:return [[[s,1,4],[s+1,3,5],[1,5,7]],s*2];
    case 1095:return [s%2?s+2:s+20,[s,s+1,s+3,s+2,s+1]];
    case 1140:return [pos];
    case 1325:return [[s,s+1,s+1,s+1,null,s+2],s+1];
    case 1405:return [s,s%5,s%3];
    case 1406:return [nums];
    case 1462:return [s+2,seq(s+1,0).map(i=>[i,i+1]),[[0,s+1],[s+1,0],[1,s+1]]];
    case 1489:return [4,[[0,1,s],[1,2,s],[2,3,s+1],[3,0,s+1],[0,2,s+3]]];
    case 1584:return [v.map(x=>[x+s,x*x-s])];
    case 1768:return [word.repeat(s),'abc'];
    case 1834:return [v.map((x,i)=>[s+i,1+(x*3)%7])];
    case 1851:return [[[s,s+3],[s+2,s+6],[s+8,s+9]],[s-1,s,s+3,s+7,s+9]];
    case 1871:return ['0'.repeat(s+3)+(s%2?'0':'1'),1,2];
    case 1899:return [[[s,2,3],[1,s+2,3],[1,2,s+3]],[s,s+2,s+3]];
    case 1929:return [pos];
    case 2013:return ops('DetectSquares',[],[['add',[s,s]],['add',[s,s+2]],['add',[s+2,s]],['count',[s+2,s+2]],['add',[s,s]],['count',[s+2,s+2]],['count',[0,0]]]);
    case 2392:return [s+2,seq(s+1,1).map(i=>[i,i+1]),s%2?seq(s+1,1).map(i=>[i+1,i]):[[1,2],[2,1]]];
    case 2402:return [1+s%3,seq(len,0).map(i=>[s+i,s+i+(i%2?3:7)])];
    case 3133:return [s*3,s*7];
    case 283:return [nums.map((x,i)=>(x+s+i)%3===0?0:x)];
    case 1984:return [pos.concat(s*3),1+s%(len+1)];
    case 80:return [v.flatMap(x=>Array(1+(x+s)%4).fill(x*2+s-6))];
    case 1498:return [pos.map(x=>x+s%3).concat(s%2?Array(40+s).fill(1):[]),2*s+3];
    case 1968:return [seq(len+1).map(x=>x*3+s).concat(s%2?[0]:[])];
    case 1343:return [pos.map(x=>x+s),1+s%len,2+s%5];
    case 1838:return [pos.map(x=>(x*s)%9+1),s*2];
    case 1456:return [word+'abciiidef'.slice(0,3+s%6)+'ou'.repeat(s%3),1+s%3];
    case 1888:return [(s*37+5).toString(2)+'1'.repeat(s%3)];
    case 1658:return [pos,s%4===0?pos.reduce((a,b)=>a+b,0):s+3];
    case 2390:return [word+'ab*c'+'*'.repeat(s%2)+'de'.repeat(s%3+1)+'*'];
    case 946:{const p=seq(len,1).map(x=>x+s);return [p,s%3===0?p.slice().reverse():s%3===1?p.slice():[p[len-1],...p.slice(0,len-1)]];}
    case 1209:return ['de'+'e'.repeat(s%3+1)+'dbbc'+'c'.repeat(s%2)+'cbbd'+'a'.repeat(s%4),2+s%2];
    case 456:return [nums.concat(s%2?[s]:[])];
    case 402:return [String(s*7919+10),1+s%3];
    case 904:return [seq(len+3,0).map(i=>(i*(s%3+1)+(i>>2)+Math.floor(s/6))%4)];
    case 441:return [s%4===0?2147483647-s:s*s*7+s];
    case 367:return [s===12?2147395600:s%2?(s*13)**2:(s*13)**2+1];
    case 540:{const p=seq(len+1,1).map(x=>x*2+s);const one=s%(len+1);return [p.flatMap((x,i)=>i===one?[x]:[x,x])];}
    case 162:return [s%3===0?seq(len+1,0).map(i=>i*s):seq(len+1,0).map(i=>i%2?s+10+i:i)];
    case 2300:return [pos.map(x=>x+s),seq(len+2,1).map(x=>x*3%11+1),s*7];
    case 2616:return [nums.map(x=>Math.abs(x)*s%17),s%(Math.floor(len/2)+1)];
    case 34:return [v.flatMap(x=>Array(1+(x+s)%3).fill(x+s)),s%3===0?100:s+2];
    case 1898:{const t=word+'abcacb'.repeat(1+s%2);return [t,'ab',seq(t.length,0).map(i=>(i*(s%5+1)+s)%t.length).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3+s%3)];}
    case 1268:return [['mobile','mouse','moneypot','monitor','mousepad',word+'mouse','mop'].slice(0,3+s%5),['mouse','mon','mob','zzz','mo'][s%5]+'abc'.slice(0,s%3)];
    case 977:return [v.map(x=>x*(1+s%4)-len-Math.floor(s/2))];
    case 1299:return [pos.map(x=>x*s%17+1)];
    case 392:return ['ace'.slice(0,s%4)+word,'abcde'+word.repeat(s%2)+'xyz'+'q'.repeat(s)];
    case 58:return ['hello'+' world'.repeat(s%3)+' '.repeat(s%4)+(s%2?' '+word.repeat(s):'')+' '.repeat(Math.floor(s/4))];
    case 118:return [1+s%30];
    case 929:return [['test.email+alex@leetcode.com','test.e.mail+bob.cathy@leetcode.com','testemail+david@lee.tcode.com',word+'.x@a.com',word+'x+y@a.com'].slice(0,2+s%4).concat(s%2?['a'+word.repeat(s)+'@b.com']:[])];
    case 205:return ['egg'+word.repeat(s%3+1),s%2?'add'+String.fromCharCode(98+s%20).repeat(s%3+1):'adb'+'q'.repeat(s%3+1)];
    case 605:return [seq(len+3,0).map(i=>i%(2+s%3)===0?1:0),s%3+Math.floor(s/6)];
    case 496:{const m=len+3,b=seq(m,1+s),c=b.slice(s%m).concat(b.slice(0,s%m)),d=s%2?c.reverse():c;return [d.filter((_,i)=>i%2===0),d];}
    case 724:return [nums.concat(s%2?[s]:[])];
    case 303:return ops('NumArray',[nums],[['sumRange',0,len-1],['sumRange',1%len,len-1],['sumRange',0,0],['sumRange',len-1,len-1],['sumRange',s%len,s%len]]);
    case 448:return [seq(len+2,1).map(x=>((x*s)%(len+2))+1)];
    case 1189:return ['balloon'.repeat(s%3)+'lo'.repeat(s%4)+'ban'+word+'o'.repeat(Math.floor(s/4))];
    case 290:return ['abba'.slice(0,2+s%3),['dog','cat','cat','dog','fish'].slice(0,2+(s+1)%4).join(' ')];
    case 1822:return [nums.map(x=>x===0&&s%3?1:x).concat(s%2?[-s]:[s])];
    case 2215:return [nums,nums.map(x=>x+s%3).concat([s*10])];
    case 1603:return ops('ParkingSystem',[s%3,1+s%2,s%4],[['addCar',1],['addCar',2],['addCar',3],['addCar',1],['addCar',2],['addCar',3],['addCar',s%3+1]]);
    case 28:return [word+'sadbutsad'.slice(0,3+s%7)+'ab'.repeat(s%3),['sad','but','ab','zz','d'][s%5]+(s>9?'b':'')];
    case 535:return ['https://leetcode.com/problems/'+word.repeat(s)+'/design-tinyurl'];
    case 554:{const base=[1,1+s%4,2,1+Math.floor(s/4)];return [seq(3+s%3,0).map(r=>base.slice(r%4).concat(base.slice(0,r%4)))];}
    case 1930:return ['aabca'+word.repeat(s%3)+'bbcbaba'.slice(0,s%7)+'a'.repeat(Math.floor(s/6))];
    case 1963:{const k=1+s%4;return [']'.repeat(k)+'['.repeat(k)+'[]'.repeat(Math.floor(s/4))];}
    case 2001:return [seq(len+2,1).map(i=>[i*(1+s%3),i*(2+s%2)]).concat([[s+1,s+2]])];
    case 2002:return ['leetcodecom'.slice(0,2+s%9)+word];
    case 2017:return [[pos.map(x=>x*s%7+1),pos.map(x=>(x+s)%5+1)]];
    case 438:return ['cbaebabacd'.slice(0,4+s%7)+word.repeat(s%3),'abc'.slice(0,1+s%3)];
    case 280:return [nums.concat(s%2?[s]:[])];
    case 179:return [s%5===0?[0,0]:pos.map(x=>x*s%30)];
    case 523:return [pos.map(x=>x*s%9),2+s%5];
    case 838:return ['.L.R...LR..L..'.slice(0,5+s%10)+'R.'.repeat(s%3)+'.'.repeat(Math.floor(s/10))];
    case 187:return ['AAAAACCCCC'.repeat(1+s%2)+'AAAAAGGGTT'.slice(0,s%10)+'ACGT'[s%4].repeat(s)];
    case 380:return ops('RandomizedSet',[],[['insert',s],['insert',s+1],['insert',s],['getRandom'],['remove',s+2],['remove',s],['insert',s+3],['getRandom'],['remove',s+1],['getRandom']]);
    case 1461:return ['00110110'.slice(0,3+s%6)+(s*5).toString(2),1+s%3];
    case 665:return [nums.concat(s%2?[s]:[])];
    case 2348:return [nums.map((x,i)=>(i+s)%3?0:x).concat(s%2?[0,0]:[1])];
    case 2405:return ['abacaba'.slice(0,3+s%5)+word.repeat(s%3)+'z'.repeat(Math.floor(s/5))];
    case 1396:return ops('UndergroundSystem',[],[['checkIn',1,'A',s],['checkIn',2,'A',s+1],['checkOut',1,'B',s+5+s%3],['checkOut',2,'B',s+9],['getAverageTime','A','B'],['checkIn',1,'B',s+20],['checkOut',1,'C',s+21+s%4],['getAverageTime','B','C'],['getAverageTime','A','B']]);
    case 2483:return ['YYNY'.repeat(1+s%3)+'N'.repeat(s%4)+'Y'.repeat(Math.floor(s/4))];
    case 68:return [['This','is','an','example','of','text','justification.'].slice(0,3+s%5).concat(s%2?['ok']:[]),14+s%6];
    case 2306:return [['coffee','donuts','time','toffee','tea','cash','dime'].slice(0,3+s%5).concat([word+'x'+'y'.repeat(s)])];
    case 2439:return [pos.map(x=>x*s%11).concat([s])];
    case 1423:return [pos.map(x=>x*s%13+1),1+s%len];
    case 1921:return [pos.map(x=>x*s%9+1),pos.map((x,i)=>1+(x+i*s)%3)];
    case 1029:return [v.concat(v).map((x,i)=>[1+(x*s+i*7)%50,1+(x*3+s*i)%50])];
    case 646:return [v.concat(v.map(x=>x+len)).map((x,i)=>{const a=(x*s*7+i*3)%21-10;return [a,a+1+(x+s)%5];})];
    case 1647:return [word.repeat(1+s%4)+'ab'.repeat(1+s%3)+'c'.repeat(s%5)+'d'.repeat(s%3)];
    case 1288:{const seen=new Set(),r=[];for(const x of v.concat(v.map(y=>y+len))){const a=(x*s*3)%17,b=a+1+(x+s)%7,k=a+','+b;if(!seen.has(k)){seen.add(k);r.push([a,b]);}}return [r];}
    case 352:return ops('SummaryRanges',[],[['addNum',s],['getIntervals'],['addNum',s+2],['getIntervals'],['addNum',s+1],['getIntervals'],['addNum',s*3%50],['addNum',s+7],['getIntervals'],['addNum',s+6],['addNum',s+2],['getIntervals']]);
    case 1523:return [s*7%20,s%4===0?1000000000-s:s*7%20+s*3];
    case 1572:return [grid(1+s%5,1+s%5,(r,c)=>(r*7+c*s+s*s)%100+1)];
    case 149:{const r=v.map(x=>[x,(s%3)*x+1]);return [r.concat([[s%4+10,-s],[0,s+20]])];}
    case 59:return [s];
    case 9:return [s%5===0?-s*111:s%2?Number(String(s*37)+[...String(s*37)].reverse().join('')):s*37+s%3*1000];
    case 263:return [s%4===0?-s:s%3===0?s*7:2**(s%5)*3**(s%3)*5**(s%2)];
    case 1260:return [grid(1+s%3,1+s%4,(r,c)=>r*4+c+s),s*3%17];
    case 12:return [(s*313)%3999+1];
    case 1041:return ['G'.repeat(1+s%4)+'LR'[s%2].repeat(1+s%3)+'G'.repeat(s%5)];
    case 6:return [word+'abcdefghij'.slice(0,s%10)+word.toUpperCase()+(s%3?'.':','),1+s%5];
    case 2028:return [pos.map(x=>1+(x*s)%6),1+s%6,1+s%5];
    case 1470:return [pos.concat(pos.map(x=>x*s%1000+1)),pos.length];
    case 989:return [pos.map(x=>x%10),s*97%10000+1];
    case 120:return [Array.from({length:1+s%5},(_,r)=>Array.from({length:r+1},(_,c)=>(r*7+c*s+s)%21-10))];
    case 740:return [pos.concat(pos.map(x=>x+s%3))];
    case 256:return [pos.map((x,i)=>[(x*s+i)%20+1,(x+s*i)%20+1,(x*3+s)%20+1])];
    case 2369:return [v.flatMap(x=>s%3===0?[x+s,x+s]:s%3===1?[x*3+s,x*3+s+1,x*3+s+2]:[x+s,x+s+s%2])];
    case 1856:return [pos.map(x=>x*s%9+1)];
    case 983:return [v.map(x=>x*(1+s%5)+s),[2+s%3,5+s%4,12+s%7]];
    case 673:return [nums.concat(pos)];
    case 691:return [[word+'ab','bc'+word,'ca'],'abc'+word.repeat(1+s%3)+(s%4===0?'z':'')];
    case 1035:return [nums.map(x=>x+7),pos.map((x,i)=>1+(x*s+i)%7)];
    case 2140:return [pos.map((x,i)=>[x*s%10+1,(x+i)%4+1])];
    case 2466:{const low=1+s%4;return [low,low+s%6,1+s%low,1+(s*7)%low];}
    case 837:return [s*3%25,s%8,1+s%10];
    case 1626:return [pos.map(x=>x*s%10+1),pos.map((x,i)=>(x+i*s)%5+1)];
    case 472:{const list=[word,'x',word+'x','x'+word+word,word+'yy'];if(s%2)list.push('yy');return [list];}
    case 1799:return [v.concat(v).slice(0,2*(1+s%3)).map((x,i)=>x*(1+s%4)+i)];
    case 1964:return [pos.concat(pos.map(x=>(x*s)%7+1))];
    case 1359:return [s*41%500+1];
    case 516:return [word+'ab'+word.repeat(s%3)+'ba'+(s%2?'c':'')+String.fromCharCode(98+s%5)];
    case 221:return [grid(1+s%4,1+s%5,(r,c)=>(r*c+s+r+c)%3?'1':'0')];
    case 474:return [v.map(x=>'0'.repeat(x%3)+'1'.repeat((x+s)%3)||'0'),1+s%5,1+s%4];
    case 1911:return [pos.concat(pos.map(x=>x*s%9+1))];
    case 1220:return [s*s*7%200+1];
    case 1866:{const n=2+s*3%17;return [n,1+(s*5)%n];}
    case 926:return ['0'.repeat(s%4)+'1'.repeat(1+s%3)+'0'.repeat(s%5)+'1'+(s%2?'0':'')];
    case 2218:{const piles=v.slice(0,1+s%3).map((x,i)=>pos.slice(0,1+(x+i)%4).map(y=>y*s%20+1));const total=piles.reduce((t,p)=>t+p.length,0);return [piles,1+s%total];}
    case 920:{const n=2+s%4;return [n,n+s%5,s%n];}
    case 1639:return [[word+'ab'+word,'ba'+word+word,word+word+'ab'].map(w=>w.slice(0,4)),(word+'ab').slice(0,1+s%3)];
    case 879:return [3+s%5,s%4,pos.map(x=>1+x%3),pos.map((x,i)=>(x*s+i)%5)];
    case 1547:{const n=10+s;const cuts=[...new Set(v.map(x=>1+(x*s)%(n-1)))];return [n,cuts];}
    case 93:return [String(s*7919+s).slice(0,4+s%6)+String(s%10).repeat(s%3)];
    case 1849:{const x=5+s*7;const t=String(x)+String(x-1).padStart(s%2?3:0,'0')+(s%4===0?String(x-2):'');return [s%5===0?t+'7':t];}
    case 1980:{const n=1+s%5;const set=new Set();for(let k=0;set.size<n;k++)set.add(((k*7+s*3)%(1<<n)).toString(2).padStart(n,'0'));return [[...set]];}
    case 1239:return [[word+'b','c'+word,'de','f'+word+'f','gh'].slice(0,2+s%4)];
    case 1514:{const n=3+s%4;const edges=[],prob=[];for(let i=1;i<n;i++){edges.push([i-1,i]);prob.push(((i*s)%9+1)/10);}edges.push([0,n-1]);prob.push((s%5)/10);return [n,edges,prob,0,n-1];}
    case 1579:{const n=2+s%4;const edges=[];for(let i=2;i<=n;i++)edges.push([1+(i+s)%3,i-1,i]);edges.push([3,1,n]);if(s%2)edges.push([1+s%2,1,2]);const seen=new Set();return [n,edges.filter(e=>{const k=e.join();if(seen.has(k))return false;seen.add(k);return true;})];}
    case 1675:return [pos.map(x=>x*s%17+1)];
    case 2542:return [pos.map(x=>x*s%11),pos.map((x,i)=>(x+i*s)%9+1),1+s%pos.length];
    case 1845:{const n=5+s%5;const list=[];for(let k=0;k<1+s%4;k++)list.push(['reserve']);list.push(['unreserve',1]);list.push(['reserve']);if(s%2){list.push(['unreserve',1]);list.push(['reserve']);}list.push(['reserve']);return ops('SeatManager',[n],list);}
    case 1882:return [v.slice(0,1+s%3).map(x=>(x*s)%5+1),pos.map(x=>x*s%4+1)];
    case 1985:return [v.map(x=>String(x*s*37%1000)),1+s%len];
    case 1383:return [pos.length,pos.map(x=>x*s%10+1),pos.map((x,i)=>(x+i*s)%8+1),1+s%pos.length];
    case 2421:{const n=2+s%6;const vals=Array.from({length:n},(_,i)=>1+(i*s+s)%4);const edges=[];for(let i=1;i<n;i++)edges.push([s%i,i]);return [vals,edges];}
    case 1905:return [grid(2+s%3,2+s%4,(r,c)=>(r*c+s+c)%3?1:0),grid(2+s%3,2+s%4,(r,c)=>(r+c*s)%3===0?0:1)];
    case 1254:return [grid(3+s%3,3+s%4,(r,c)=>(r*c+s*r+c)%3?1:0)];
    case 1020:return [grid(2+s%4,2+s%5,(r,c)=>(r*c+s+r)%3?1:0)];
    case 934:{const n=3+s%4;const g=grid(n,n,()=>0);g[0][0]=1;if(s%2)g[1][0]=1;const c=1+s%(n-1);g[n-1][c]=1;if(n>=4&&s%3===0)g[n-2][c]=1;if(s%5===0)g[0][1]=1;return [g];}
    case 1091:{const n=2+s%4;const g=grid(n,n,(r,c)=>(r*7+c*s+s*s)%5===0?1:0);g[0][0]=0;if(s%6)g[n-1][n-1]=0;return [g];}
    case 1162:return [grid(2+s%5,2+s%5,(r,c)=>(r*7+c*s+s)%6===0?1:0)];
    case 909:{const n=2+s%4;const b=grid(n,n,()=>-1);if(n>2){b[n-2][(s*3)%n]=1+(s*5)%(n*n);b[0][(s+1)%n]=2+s%(n*n-2);}b[n-1][0]=-1;b[0][n%2?n-1:0]=-1;return [b];}
    case 802:{const n=3+s%5;const g=Array.from({length:n},(_,i)=>[...new Set([(i*s+1)%n,(i+s)%n].filter(j=>j!==i&&(i+j+s)%3!==0))].sort((a,b)=>a-b));return [g];}
    case 1466:{const n=2+s%7;const c=[];for(let i=1;i<n;i++){const p=s%i;c.push((i+s)%3?[p,i]:[i,p]);}return [n,c];}
    case 2359:{const n=3+s%5;const e=Array.from({length:n},(_,i)=>(i*s+1)%n===i?-1:(i*s+1)%n);if(s%3===0)e[n-1]=-1;return [e,s%n,(s*2+1)%n];}
    case 1129:return [2+s%5,[[0,1],[1,(1+s)%(2+s%5)]],[[0,(s*3)%(2+s%5)],[1,s%(2+s%5)]]];
    case 2477:{const n=2+s%7;const r=[];for(let i=1;i<n;i++)r.push([s%i,i]);return [r,1+s%4];}
    case 2492:{const n=2+s%5;const r=[];for(let i=1;i<n;i++)r.push([i,i+1,1+(i*s)%9]);if(n>3)r.push([2,n,1+s%4]);return [n,r];}
    case 1557:{const n=2+s%7;const e=[];for(let i=1;i<n;i++)if((i*s)%3)e.push([s%i,i]);return [n,e];}
    case 785:{const n=2+s%6;const sets=Array.from({length:n},()=>new Set());for(let i=0;i<n;i++){const j=(i*s+1)%n;if(j!==i&&(i+j+s)%4){sets[i].add(j);sets[j].add(i);}}return [sets.map(x=>[...x].sort((a,b)=>a-b))];}
    case 2101:return [v.map((x,i)=>[1+(x*s)%10,1+(x*3+i)%7,1+(x+s)%4])];
    case 1857:{const n=2+s%5;const colors=Array.from({length:n},(_,i)=>String.fromCharCode(97+(i*s)%3)).join('');const e=[];for(let i=1;i<n;i++)e.push([s%i,i]);if(s%4===0)e.push([n-1,0]);return [colors,e];}
    case 1553:return [s*s*s*97+s];
    case 1958:{const b=grid(8,8,(r,c)=>(r*s+c*3+s)%5===0?'B':(r+c*s)%7===0?'W':'.');const r=s%8,c=(s*3)%8;b[r][c]='.';return [b,r,c,s%2?'B':'W'];}
    case 234:return [s%3===0?[...v,...v.slice().reverse()].map(x=>(x*s)%10):s%3===1?[...v,s%10,...v.slice().reverse()].map(x=>(x+s)%10):v.map(x=>(x*s+1)%10)];
    case 203:return [s%7===0?[]:v.map(x=>1+(x*s)%4),1+s%4];
    case 83:return [s%6===0?[]:v.flatMap(x=>Array(1+(x*s)%3).fill(x*3-s))];
    case 876:return [v.map(x=>1+(x*s*7)%100)];
    case 160:{const pa=seq(1+s%3,s+10),pb=seq((s*2)%4,s+20),t=s%4===0?[]:v.map(x=>x+s);const a=[...pa,...t],b=[...pb,...t];if(!b.length)b.push(99);return [a,b,t.length?pa.length:a.length,t.length?pb.length:b.length];}
    case 2130:return [[...v,...v.map(x=>x+s)].map(x=>1+(x*s*37)%1000)];
    case 1721:return [v.map(x=>(x*s*7)%50),1+s%len];
    case 707:{const list=[["addAtHead",s%10],["addAtTail",s+1],["addAtIndex",1,s+2],["get",s%3],["addAtTail",7],["deleteAtIndex",s%4],["get",1],["addAtIndex",s%5,9],["get",s%4],["deleteAtIndex",0],["get",0],["addAtIndex",9,4]];return ops("MyLinkedList",[],list.slice(0,6+s%7));}
    case 1472:{const u=k=>String.fromCharCode(97+(s+k)%26)+".com";const list=[["visit",u(1)],["visit",u(2)],["back",1+s%3],["visit",u(3)],["forward",1+s%2],["back",s%4+1],["forward",2],["visit",u(4)],["back",1],["forward",3]];return ops("BrowserHistory",[u(0)],list.slice(0,4+s%7));}
    case 24:return [s%8===0?[]:v.map(x=>(x*s*7)%101)];
    case 148:return [s%9===0?[]:v.concat(v).map(x=>(x*s*17)%61-30)];
    case 86:return [s%9===0?[]:v.map(x=>(x*s*7)%21-10),s%7-3];
    case 61:return [s%9===0?[]:v.map(x=>x*s%201-100),s%4===0?2e9-s:(s*3)%11];
    case 147:return [v.map(x=>(x*s*13)%41-20)];
    case 725:return [s%8===0?[]:v.concat(v.map(x=>x+len)).map(x=>(x*s)%1001),1+(s*3)%7];
    case 116:return [seq([0,1,3,7,15][s%5]).map(x=>(x*s)%50-25)];
    case 108:return [seq(len+s%5).map(x=>x*3-s)];
    case 617:{const a=tree.map(x=>(x*s)%13),b=tree.map(x=>(x+s)%11);if(s%2)a[4]=null,a[5]=null;if(s%3===0)b[3]=null;if(s%3===1)b.length=3;return [s%7===0?[]:a,b];}
    case 112:{const t=tree.map(x=>x-s+((x*s)%7)-3);if(s%2)t[4]=null;if(s%3===0)t[6]=null;return [s%5===0?[]:t,s%4===0?999:t[0]+t[2]+t[5]];}
    case 606:{const t=tree.map(x=>(x*s)%21-10);if(s%2)t[3]=null;if(s%3===0)t[5]=null;if(s%4===1)t[2]=null,t.length=5;return [t];}
    case 783:{const t=tree.map(x=>x*(1+s%5)+s);if(s%2)t[3]=null;if(s%3===0)t[6]=null;return [t];}
    case 101:{const x=s%5,y=s%7;return [s%3===0?[1,2,2,x,y,y,x]:s%3===1?[s,1+s%4,1+s%4,null,x,x]:[s,x,x+(s%2),y,null,null,y]];}
    case 103:{const t=tree.map(x=>(x*s)%31);if(s%2)t[3]=null;if(s%3===0)t.push(s,null,s+1);return [s%8===0?[]:t];}
    case 958:{const t=seq(2+(s*5)%9);if(s%3===1)t[Math.min(t.length-2,1+s%4)]=null;return [t];}
    case 662:{const t=tree.map(x=>(x*s)%17);if(s%2)t[3]=null;if(s%3!==1)t[6]=null;if(s%4===0)t.push(null,s,s+1,null,null,null,s+2);return [t];}
    case 1376:{const n=len+2;const m=Array.from({length:n},(_,i)=>i?(i*s+3)%i:-1);const boss=new Set(m);return [n,0,m,m.map((_,i)=>boss.has(i)?1+(i*s)%7:0)];}
    case 96:return [1+(s*7)%19];
    case 95:return [1+(s*3)%8];
    case 129:{const t=tree.map(x=>(x*s)%10);if(s%2)t[4]=null;if(s%3===0)t.push(s%10,null,(s+3)%10);return [t];}
    case 951:{const a=tree.slice();const b=s%3===2?[a[0],a[1],a[2],a[3],a[4],a[5],a[6]]:[a[0],a[2],a[1],a[6],a[5],a[4],a[3]];if(s%4===0)b[3]=a[0]+100;if(s%5===0)a.length=3,b.length=3;return [a,b];}
    case 1993:{const n=len+3;const parent=Array.from({length:n},(_,i)=>i?(i*s+1)%i:-1);const list=[["lock",n-1,1+s%3],["unlock",n-1,2],["lock",(s+1)%n,4],["upgrade",0,5],["lock",n-2,7],["upgrade",(n-1)%2,3],["unlock",(s+1)%n,4],["upgrade",0,9],["lock",0,1]];return ops("LockingTree",[parent],list.slice(0,4+s%6));}
    case 513:{const t=tree.map(x=>(x*s)%23);if(s%2)t[3]=null;if(s%3===0)t.push(null,null,s+1);return [t];}
    case 669:{const t=tree.map(x=>x*2);if(s%2)t[3]=null;return [t,2*s+1+(s%3),2*s+11-(s%4)];}
    case 173:{const t=tree.map(x=>x*(1+s%4));if(s%2)t[3]=null;const count=t.filter(x=>x!==null).length;const list=[];for(let k=0;k<count;k++){if((k+s)%2)list.push(["hasNext"]);list.push(["next"]);}list.push(["hasNext"]);return ops("BSTIterator",[t],list.slice(0,5+s%9));}
    case 538:{const t=tree.map(x=>x*(1+s%3)-s);if(s%2)t[3]=null;if(s%3===0)t[6]=null;return [s%7===0?[]:t];}
    case 894:return [[1,3,5,7,9,11,2,4,6,8,10,13][s%12]];
    case 106:{const t=tree.map(x=>x*(2+s%3)-s);if(s%2)t[4]=null;if(s%3===0)t.length=4;const nodes=[];let root=null;{const q=[];let i=0;const mk=x=>x===null?null:{v:x,l:null,r:null};root=mk(t[i++]);q.push(root);while(q.length&&i<t.length){const p=q.shift();for(const k of ["l","r"]){if(i<t.length){const c=mk(t[i++]);if(c){p[k]=c;q.push(c);}}}}}const ino=[],post=[];const go=n=>{if(!n)return;go(n.l);ino.push(n.v);go(n.r);};const gp=n=>{if(!n)return;gp(n.l);gp(n.r);post.push(n.v);};go(root);gp(root);return [ino,post];}
    case 652:{const t=tree.map(x=>((x+s)*(s%4+1))%(2+s%3));if(s%2)t[3]=null;if(s%3===0)t.push(t[1],t[2]);if(s%4===1)t.push(null,s%3);return [t];}
    case 1443:{const n=len+2+s%3;return [n,seq(n-1).map(i=>s%2?[(i*s*7+s+3)%i,i]:[i,(i*s*7+s+3)%i]),Array.from({length:n},(_,i)=>((i+1)*(s*3+1))%5<2)];}
    default:throw new Error(`Missing authored cases for ${n}`);
  }
}
