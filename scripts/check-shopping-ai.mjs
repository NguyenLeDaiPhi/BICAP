import fs from 'node:fs';import assert from 'node:assert/strict';
const history=[{role:'user',content:'Tôi cần 10 kg gạo ST25, tổng ngân sách tối đa 200 nghìn'}];
const cases=[
 {name:'Total budget positive',message:'Tôi cần 10 kg gạo ST25, tổng ngân sách tối đa 200 nghìn',check:data=>{assert(data.products.length>0);assert.equal(data.filters.maxTotalPrice,200000);assert.equal(data.filters.quantity,10);assert(data.products.every(p=>p.price*10<=200000));}},
 {name:'Unit price and variety',message:'Tìm gạo ST25 dưới 20 nghìn/kg',check:data=>{assert(data.products.length>0);assert.equal(data.filters.maxUnitPrice,20000);assert(data.products.every(p=>p.status==='APPROVED'&&p.quantity>0&&p.price<=20000));}},
 {name:'Conversation budget refinement',message:'Chỉ còn 100 nghìn thôi',history,check:data=>{assert.equal(data.filters.maxTotalPrice,100000);assert.equal(data.filters.quantity,10);assert.equal(data.products.length,0);}},
 {name:'Unsupported organic certificate',message:'Tôi muốn gạo có chứng nhận hữu cơ',check:data=>{assert.equal(data.products.length,0);assert(data.filters.unsupportedRequirements.length>0);}},
 {name:'Unavailable product',message:'Tìm xoài cát Hoà Lộc dưới 30 nghìn/kg',check:data=>{assert.equal(data.products.length,0);}},
 {name:'Stock constraint',message:'Tôi cần 2000 kg gạo ST25 giá dưới 20 nghìn/kg',check:data=>{assert.equal(data.filters.quantity,2000);assert.equal(data.products.length,0);}}
];
let results=[];
for(const item of cases){const start=Date.now();try{const response=await fetch((process.env.AUDIT_API_URL || 'http://localhost:8000') + '/api/assistant/search',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:3010'},body:JSON.stringify({message:item.message,history:item.history||[]}),signal:AbortSignal.timeout(95000)});const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));assert(['http://localhost:3010','*'].includes(response.headers.get('access-control-allow-origin')));item.check(data);results.push({name:item.name,passed:true,milliseconds:Date.now()-start,filters:data.filters,productIds:data.products.map(p=>p.id),reply:data.reply});}catch(error){results.push({name:item.name,passed:false,milliseconds:Date.now()-start,error:error.message});}console.log(JSON.stringify(results.at(-1)));fs.writeFileSync('reports/full-audit-2026-10-04/ai-live-checks.json',JSON.stringify(results,null,2));}
if(results.some(r=>!r.passed))process.exitCode=1;
