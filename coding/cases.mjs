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
    case 34:return [
      [[1],1],
      [[1],2],
      [[2,2,2,2],1],
      [[2,2,2,2],2],
      [[1,1,2,3],1],
      [[1,2,3,3],3],
      [[-8,-4,-4,-4,0,7],-4],
      [[-3,-1,0,0,0,2,9],0],
      [[1,1,3,3,5],2],
      [[-9,...Array(64).fill(7),12],7],
      [[Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER,-1,0,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],Number.MIN_SAFE_INTEGER],
      [[Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER,-1,0,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],Number.MAX_SAFE_INTEGER]
    ][s-1];
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
    case 437:return [[[],0],[[0],0],[[7],7],[[7],0],[[-3],-3],[[0,0,0],0],[[0,null,0,null,0],0],[[1,1,1],0],[[1,-1,-1],0],[[1,null,1,null,1],2],[[2,null,-2,2,-2],0],[[1000000000,1000000000,null,294967296,null,1000000000,null,1000000000],0]][s-1];
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
    default:throw new Error(`Missing authored cases for ${n}`);
  }
}
