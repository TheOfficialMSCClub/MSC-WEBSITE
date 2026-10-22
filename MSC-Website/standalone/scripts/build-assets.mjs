import {cpSync, rmSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(resolve(root, 'wrangler.json'), 'utf8'));
const origin = new URL(config.vars.MSC_PUBLIC_ORIGIN);
if (origin.protocol !== 'https:' || origin.origin !== config.vars.MSC_PUBLIC_ORIGIN) throw Error('Configure an HTTPS public origin first.');
rmSync(resolve(root, '.assets'), {recursive: true, force: true});
cpSync(resolve(root, '../public'), resolve(root, '.assets'), {recursive: true});
for (const file of ['index.html', 'strategy-summit.html', 'robots.txt', 'sitemap.xml']) {
  const path = resolve(root, '.assets', file);
  writeFileSync(path, readFileSync(path, 'utf8').replaceAll('https://msc-council.jaydenli-epic.chatgpt.site', origin.origin));
}
console.log('Prepared website assets for ' + origin.origin);
