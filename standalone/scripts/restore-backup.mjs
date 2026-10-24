import {readFileSync, writeFileSync} from 'node:fs';
import {backupToSQL} from '../../server/backup.mjs';
const [input, output] = process.argv.slice(2);
if(!input||!output)throw Error('Usage: node scripts/restore-backup.mjs ../backups/msc-migration-backup.json ../backups/restore.sql');
const text=readFileSync(input,'utf8');if(Buffer.byteLength(text)>12*1024*1024)throw Error('Backup is too large.');
writeFileSync(output,backupToSQL(JSON.parse(text)),{flag:'wx',mode:0o600});
console.log('Private SQL prepared. Nothing was uploaded or changed. Import only into an empty, migrated club database with sending off.');
