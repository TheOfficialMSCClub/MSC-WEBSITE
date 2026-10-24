import {cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {clubPage} from '../server/pages.mjs';


// This export changes only dist/. The original public/ and Worker stay intact.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'dist');
const base='/' + (process.env.PAGES_BASE_PATH ?? '/MSC-WEBSITE/').split('/').filter(Boolean).join('/') + '/';
const prefix=base==='//' ? '/' : base;
const siteURL=(process.env.PAGES_BASE_URL || 'https://jaydy005jaydy005.github.io/MSC-WEBSITE').replace(/\/$/,'');
rmSync(output,{recursive:true,force:true});
cpSync(resolve(root,'public'),output,{recursive:true});
for(const kind of ['welcome','privacy'])writeFileSync(resolve(output,kind+'.html'),clubPage(kind));
writeFileSync(resolve(output,'admin.html'),clubPage('privacy').replace(/<main[\s\S]*?<\/main>/,
  '<main class="privacy-page"><p class="eyebrow">MSC / Club office</p><h1>The working<br>side of MSC.</h1><p>The club office requires the full MSC application. This copy of the website does not provide administrator sign-in or store enquiries.</p><a class="office-button" href="/">Back to MSC →</a></main>'));


function localURL(value){
  if(value.startsWith('api/'))return '/'+value;
  const [path,suffix='']=value.split(/(?=[?#])/s,2);
  return prefix + (['strategy-summit','welcome','privacy','admin'].includes(path) ? path+'.html' : path) + suffix;
}
function walk(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(resolve(directory,entry.name)):[resolve(directory,entry.name)]);}
for(const file of walk(output)){
  // These are standalone image documents, not URL-bearing page templates.
  // Copy them byte-for-byte so SVG self-closing tags and textures stay valid.
  if(file.endsWith('.svg'))continue;
  if(!/\.(html|css|mjs|js|json|webmanifest|xml|txt|svg)$/.test(file))continue;
  let text=readFileSync(file,'utf8');
  // The existing letter component already supports copying to Instagram.
  // GitHub Pages has no server or database to receive enquiries.
  text=text.replace(/"endpoint"\s*:\s*"\/api\/club\/enquiry"/g,'"endpoint":""');
  if(file.endsWith('club-analytics.mjs'))text=text.replace('function enabled(){','function enabled(){return false;');
  if(file.endsWith('envelope.mjs'))text=text.replace("${!partner?'<label class=\"letter-email-optin\"", "${!partner&&endpoint?'<label class=\"letter-email-optin\"");
  // Match a complete quoted URL. A closing attribute quote followed by />
  // is markup, never a root-relative URL.
  text=text.replace(/(["'`])\/(?!\/)([^"'`\s<>\\]*)\1/g,(_,quote,value)=>quote+localURL(value)+quote);
  text=text.replaceAll('https://msc-council.jaydenli-epic.chatgpt.site',siteURL);
  if(file.endsWith('privacy.html')){
    text=text.replace(/<h2>Member and partner enquiries<\/h2>[\s\S]*?(?=<h2>Access, correction or deletion)/,
      '<h2>Member and partner introductions</h2><p>This GitHub Pages website prepares a letter in your browser. It does not submit or store the details you enter. Use Copy letter and send it to @msc.uoft on Instagram to complete your introduction.</p><h2>Analytics and email</h2><p>Club analytics and automatic email subscriptions are not active on this static website.</p>');
  }
  writeFileSync(file,text);
}
writeFileSync(resolve(output,'.nojekyll'),'');
console.log(`Prepared ${walk(output).length} files for ${siteURL}/ (base ${prefix}).`);

