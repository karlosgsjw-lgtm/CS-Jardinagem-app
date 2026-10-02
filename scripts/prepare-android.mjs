import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';

const root=process.cwd();
const source=path.join(root,'app');
const out=path.join(root,'build','www');

fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

function copyDir(src,dst){
  for(const entry of fs.readdirSync(src,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name.startsWith('.')) continue;
    const s=path.join(src,entry.name),d=path.join(dst,entry.name);
    if(entry.isDirectory()){fs.mkdirSync(d,{recursive:true});copyDir(s,d)}
    else fs.copyFileSync(s,d);
  }
}
copyDir(source,out);

const localEntry=path.join(root,'build','supabase-entry.js');
fs.writeFileSync(localEntry,"export { createClient } from '@supabase/supabase-js';\n");

await build({
  entryPoints:[localEntry],
  bundle:true,
  format:'esm',
  platform:'browser',
  target:['es2020'],
  outfile:path.join(out,'supabase-local.js'),
  minify:true
});

const index=path.join(out,'index.html');
let html=fs.readFileSync(index,'utf8');
html=html.replace(
  "import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';",
  "import {createClient} from './supabase-local.js';"
);
fs.writeFileSync(index,html);
console.log('CS Jardinagem preparado para APK em',out);
