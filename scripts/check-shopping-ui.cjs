const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
async function harness(path,fetcher,props={}) {
 let states=[],refs=[],deps=[],cleanups=[],effects=[],cursor=0,refCursor=0,effectCursor=0,tree;
 const react={useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;}];},useRef(initial){const i=refCursor++;if(!(i in refs))refs[i]={current:initial};return refs[i];},useEffect(fn,next){const i=effectCursor++;if(!deps[i]||next.some((v,j)=>!Object.is(v,deps[i][j]))){cleanups[i]?.();deps[i]=next;effects.push(()=>{cleanups[i]=fn();});}}};
 const mod={exports:{}};const context={module:mod,exports:mod.exports,require:name=>name==='react'?react:require(name),console,fetch:fetcher,setTimeout,clearTimeout,AbortController,process:{env:{NEXT_PUBLIC_API_URL:'http://localhost:8000',NEXT_PUBLIC_RETAILER_URL:'http://localhost:3000'}}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,context);
 function render(){cursor=0;refCursor=0;effectCursor=0;tree=mod.exports.default(props);return tree;}
 async function flush(){for(let i=0;i<6;i++){render();effects.splice(0).forEach(fn=>fn());await new Promise(r=>setImmediate(r));}return render();}
 function nodes(node){if(arguments.length===0)node=tree;if(node==null||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(n=>nodes(n));return [node,...nodes(node.props?.children)];}
 function label(n){if(n==null)return '';if(Array.isArray(n))return n.map(label).join('');if(typeof n!=='object')return String(n);return label(n.props?.children);}
 await flush();return {flush,nodes,label,cleanup(){cleanups.forEach(fn=>fn?.());}};
}
(async()=>{
 for(const name of ['guest-web','retailer-web']){
  let calls=[],fail=false;
  const mockFetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:!fail,json:async()=>fail?{error:'AI unavailable'}:{reply:'Có sản phẩm phù hợp',filters:{quantity:10,unit:'kg',maxTotalPrice:200000},products:[{id:1,name:'Lúa ST25',price:15000,unit:'kg',quantity:100,status:'APPROVED',imageUrl:'photo.png'},{id:2,name:'Pending product',price:1,unit:'kg',quantity:100,status:'PENDING'}]}};};
  const h=await harness('/workspace/frontend/web/'+name+'/src/components/ShoppingAssistant.tsx',mockFetch,{retailer:name==='retailer-web'});
  h.nodes().find(n=>n.type==='button'&&h.label(n).includes('Hỏi AI')).props.onClick();await h.flush();assert(h.nodes().some(n=>n.props?.role==='dialog'));
  const input=()=>h.nodes().find(n=>n.type==='textarea');input().props.onChange({target:{value:'Tôi cần 10 kg gạo ST25, ngân sách 200 nghìn'}});await h.flush();h.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await h.flush();
  assert.equal(calls.length,1);assert.equal(calls[0].body.message,'Tôi cần 10 kg gạo ST25, ngân sách 200 nghìn');assert(h.nodes().some(n=>n.type==='a'&&n.props.href===(name==='guest-web'?'http://localhost:3000':'')+'/marketplace?productId=1'));assert(!h.nodes().some(n=>h.label(n).includes('Pending product')));assert(h.nodes().some(n=>n.type==='img'&&n.props.src==='photo.png'));
  input().props.onChange({target:{value:'Chỉ còn 100 nghìn thôi'}});await h.flush();h.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await h.flush();assert.equal(calls[1].body.history[0].content,calls[0].body.message);
  fail=true;input().props.onChange({target:{value:'Tìm rau'}});await h.flush();h.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await h.flush();assert(h.nodes().some(n=>n.type==='a'&&n.props.href===(name==='guest-web'?'/products':'/marketplace')));
  h.nodes().find(n=>n.type==='button'&&h.label(n)==='Bắt đầu tìm kiếm mới').props.onClick();await h.flush();assert(h.nodes().some(n=>n.type==='button'&&h.label(n).includes('Tìm gạo ST25')));h.cleanup();console.log('PASS '+name+': open chat, request, approved-only cards, correct trading ID link, follow-up history, error fallback, reset');
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
