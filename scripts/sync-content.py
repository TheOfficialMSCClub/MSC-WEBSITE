"""Regenerate the first-paint content and structured data after editing content.json."""
from pathlib import Path
from html import escape as e
import json,re
from summit_markup import summit_markup, summit_page

root=Path(__file__).resolve().parents[1]/'public'
c=json.loads((root/'content.json').read_text());p=root/'index.html';s=p.read_text()
def photo(member):
 a=c['assets'][member['asset']];x,y,w,h=[v*(a['width'] if i%2==0 else a['height']) for i,v in enumerate(member['crop'])]
 return f'<svg class="photo-svg" viewBox="{x} {y} {w} {h}" preserveAspectRatio="xMidYMin slice" role="img" aria-label="{e(member["name"])}"><image href="{a["src"]}" width="{a["width"]}" height="{a["height"]}"/></svg>'
def generated(key,markup,initial):
 global s
 block=f'<!-- generated:{key}:start -->{markup}<!-- generated:{key}:end -->'
 pattern=rf'<!-- generated:{key}:start -->.*?<!-- generated:{key}:end -->'
 if re.search(pattern,s,re.S):s=re.sub(pattern,lambda _:block,s,flags=re.S)
 else:
  assert initial in s,key
  s=s.replace(initial,block+initial if initial in ('</head>','</body>') else block)

events=''.join(summit_markup(event) for event in c['events'] if event['id']=='summit')
generated('events','<div id="events-grid" class="events-grid single-event">'+events+'</div>','<div id="events-grid" class="events-grid" aria-live="polite"><p>Loading experiences…</p></div>')

members=''
for i,m in enumerate(c['members']+c.get('pendingMembers',[])):
 members+=f'<article class="member-card" id="member-{e(m["id"])}"><div class="portrait-frame"><div class="member-portrait">{photo(m)}</div><span class="portrait-frame-caption"><span>MSC / 26–27</span><span>{i+1:02}</span></span></div><span class="member-department">{e(m["department"])}</span><h3>{e(m["name"])}</h3><p>{e(m["role"])}</p></article>'
generated('members','<div id="members-grid" class="members-grid">'+members+'</div>','<div id="members-grid" class="members-grid"></div>')

groups=[('Kings',['Co-Presidents']),('Queens',['Corporate Relations']),('Rooks',['Events']),('Bishops',['Finance','Operations']),('Knights',['Marketing'])]
roster=''
for name,depts in groups:
 roster+=f'<div class="chess-department"><h3>{name}</h3><p>{e(" & ".join(depts))}</p>'
 for m in c['members']:
  if m['department'] in depts:roster+=f'<a href="#member-{e(m["id"])}">{e(m["name"])}</a>'
 roster+='</div>'
roster+='<div class="chess-department"><h3>Pawns</h3><p>New council introductions</p><span>15 profiles coming soon.</span></div>'
generated('roster','<div class="chess-roster" id="chess-roster" role="group" aria-label="Meet a council member">'+roster+'</div>','<div class="chess-roster" id="chess-roster" role="group" aria-label="Meet a council member"><p class="chess-roster-loading">Loading the council…</p></div>')


dept='<dl class="department-lines">'+''.join(f'<div><dt>{e(d["name"])}</dt><dd>{e(d["description"])}</dd></div>' for d in c['departments'])+'</dl>'
generated('departments',dept+'<div class="team-toolbar">','<div class="team-toolbar">')
payload=json.dumps(c,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
generated('data','<script type="application/json" id="site-content">'+payload+'</script>\n', '</body>')

schema={'@context':'https://schema.org','@type':'Organization','name':'Management Strategy Council','alternateName':'MSC','url':'https://msc-council.jaydenli-epic.chatgpt.site/','description':'The student strategy club at the University of Toronto Scarborough.','sameAs':[c['club']['instagram']]+([c['club']['linkedin']] if c['club'].get('linkedin') else []),'address':{'@type':'PostalAddress','streetAddress':'1265 Military Trail','addressLocality':'Toronto','addressRegion':'ON','postalCode':'M1C 1A4','addressCountry':'CA'}}
generated('schema','<script type="application/ld+json">'+json.dumps(schema,separators=(',',':'))+'</script>\n','</head>')

p.write_text(s)
print(f'Synced {len(c["members"])} members, {len(c["events"])} programs and {len(c.get("pendingMembers",[]))} forthcoming introductions.')

(root/"strategy-summit.html").write_text(summit_page(next(event for event in c["events"] if event["id"]=="summit")))
