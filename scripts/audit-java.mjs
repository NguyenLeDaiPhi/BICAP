import fs from 'node:fs';import cp from 'node:child_process';import path from 'node:path';
const root=process.cwd(),report='reports/full-audit-2026-10-04';fs.mkdirSync(report,{recursive:true});
const dirs=fs.readdirSync('services').filter(d=>fs.existsSync('services/'+d+'/pom.xml'));const results=[];
let cursor=0;
async function worker(){while(cursor<dirs.length){const name=dirs[cursor++],dir=path.join(root,'services',name),pom=path.join(dir,'pom.audit-tests.xml');
fs.writeFileSync(pom,fs.readFileSync(path.join(dir,'pom.xml'),'utf8').replace('<build>','<build><directory>target/full-audit-verification</directory>'));
const log=fs.createWriteStream(path.join(root,report,name+'-tests.log'));let exitCode;
try{exitCode=await new Promise(resolve=>{const child=cp.spawn('cmd.exe',['/d','/s','/c','mvnw.cmd -o -f pom.audit-tests.xml test'],{cwd:dir,windowsHide:true});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});child.on('error',()=>resolve(-1));child.on('close',resolve);});}finally{log.end();fs.unlinkSync(pom);}
const folder=path.join(dir,'target','full-audit-verification','surefire-reports');let suites=[];
if(fs.existsSync(folder))for(const file of fs.readdirSync(folder).filter(f=>f.startsWith('TEST-')&&f.endsWith('.xml'))){const xml=fs.readFileSync(path.join(folder,file),'utf8'),tag=xml.match(/<testsuite[^>]*>/)?.[0]||'';const attr=k=>tag.match(new RegExp(k+'="([^"\\r\\n]*)"'))?.[1];suites.push({name:attr('name'),tests:Number(attr('tests')),errors:Number(attr('errors')),failures:Number(attr('failures')),skipped:Number(attr('skipped'))});}
const result={service:name,exitCode,suites};results.push(result);fs.writeFileSync(path.join(root,report,'java-tests.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(result));}}
await Promise.all([worker(),worker()]);

process.exitCode = results.some(result => result.exitCode !== 0) ? 1 : 0;
