import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const failures = [];
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]); }
for (const file of files('client/src/styles').filter(file=>file.endsWith('.css'))) {
  postcss.parse(fs.readFileSync(file,'utf8')).walkDecls('font-size',decl=>{
    const pixels=/^([\d.]+)px$/.exec(decl.value);
    if(pixels&&Number(pixels[1])<13)failures.push(`${file}:${decl.source.start.line} has ${decl.value} text`);
  });
}
const index=fs.readFileSync('client/src/index.css','utf8');
if(index.includes('legacy-aliases'))failures.push('Legacy color aliases remain in the active stylesheet.');
const banned=['Small steps. Brave journeys.','What must not get lost','field guide, not a maze','execution playbook','needing a nudge','All systems clear','Welcome back. 3 tasks'];
for(const file of files('client/src/components/jambavan').filter(file=>/\.tsx?$/.test(file)&&!file.includes('.test.'))){
  const source=fs.readFileSync(file,'utf8').replace(/\s+/g,' ');
  for(const phrase of banned)if(source.includes(phrase))failures.push(`${file} still contains ${JSON.stringify(phrase)}`);
}
const assets=JSON.parse(fs.readFileSync('docs/design/assets.json','utf8'));
for(const asset of assets){
  if(!fs.existsSync('client/public'+asset.file))failures.push(`Missing artwork ${asset.file}`);
  if(asset.bytes>200*1024)failures.push(`Artwork ${asset.file} exceeds 200 KB`);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`Design checks passed: type floor, plain copy, and ${assets.length} optimized artwork files.`);
