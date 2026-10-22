// An authenticated migration snapshot. Abuse-limit hashes are deliberately
// excluded: the new host gets a fresh rate salt and starts fresh limits.
export const BACKUP_FORMAT = 'msc-club-backup-v1';
export const TABLE_COLUMNS = {
  club_submissions: ['id','type','email','name','details','interests','consent','consent_version','status','email_status','confirm_token','confirm_expires','unsubscribe_token','created_at','updated_at','source','medium','campaign','session_id'],
  club_email_jobs: ['id','submission_id','kind','token','payload','status','provider_id','error','created_at','updated_at'],
  club_activity: ['id','session','event','target','source','medium','campaign','referrer','device','created_at']
};
const integerColumns = new Set(['consent','confirm_expires','created_at','updated_at']);
const nullable = new Set(['confirm_token','confirm_expires','token','provider_id','error']);
export async function backupResponse(env, now) {
  const names=Object.keys(TABLE_COLUMNS),limit=10000;
  // D1 batch reads execute as one transaction, keeping related tables together.
  const results=await env.DB.batch(names.map(table=>env.DB.prepare(`SELECT ${TABLE_COLUMNS[table].join(',')} FROM ${table} ORDER BY id LIMIT ${limit+1}`)));
  const tables=Object.fromEntries(names.map((name,i)=>[name,results[i].results]));
  if(Object.values(tables).some(rows=>rows.length>limit))return Response.json({error:'This database exceeds the dashboard backup limit. Use a full database export; no partial backup was created.'},{status:413,headers:{'Cache-Control':'private, no-store'}});
  const json=JSON.stringify({format:BACKUP_FORMAT,createdAt:new Date(now).toISOString(),tables});
  if(new TextEncoder().encode(json).length>12*1024*1024)return Response.json({error:'Use a full database export for this backup size. No partial backup was created.'},{status:413,headers:{'Cache-Control':'private, no-store'}});
  return new Response(json,{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="msc-migration-backup.json"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
export function backupToSQL(backup) {
  if(backup?.format!==BACKUP_FORMAT||!backup.tables||Object.keys(backup.tables).sort().join()!==Object.keys(TABLE_COLUMNS).sort().join())throw Error('Unsupported or incomplete MSC backup.');
  const literal=(value,column)=>{
    if(value===null&&nullable.has(column))return 'NULL';
    if(integerColumns.has(column)){if(!Number.isSafeInteger(value))throw Error('Invalid integer in backup.');return String(value);}
    if(typeof value!=='string'||value.length>30000)throw Error('Invalid text in backup.');
    // Hex literals preserve quotes, Unicode and control characters without SQL
    // interpolation. They are cast back to TEXT, never interpreted as SQL.
    return "CAST(X'"+Array.from(new TextEncoder().encode(value),b=>b.toString(16).padStart(2,'0')).join('')+"' AS TEXT)";
  };
  const names=Object.keys(TABLE_COLUMNS),lines=[
    '-- Private MSC data. Import ONLY into an empty, migrated database.',
    'CREATE TABLE IF NOT EXISTS msc_restore_guard (must_be_zero INTEGER NOT NULL CHECK (must_be_zero=0));',
    'INSERT INTO msc_restore_guard SELECT '+names.map(t=>`(SELECT count(*) FROM ${t})`).join('+')+';'
  ];
  for(const table of names){const columns=TABLE_COLUMNS[table],rows=backup.tables[table];if(!Array.isArray(rows)||rows.length>10000)throw Error('Invalid backup table.');
    const ids=new Set();for(const row of rows){if(!row||Object.keys(row).sort().join()!==[...columns].sort().join()||ids.has(row.id))throw Error('Invalid or duplicate backup row.');ids.add(row.id);
      lines.push(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(c=>literal(row[c],c)).join(',')});`);
    }
  }
  lines.push('DROP TABLE msc_restore_guard;');return lines.join('\n')+'\n';
}
