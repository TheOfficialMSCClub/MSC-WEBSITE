from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import json,sys
source=Path(sys.argv[1]);dest=Path(sys.argv[2]);files=sorted(source.glob('*.png'))
expected=141 if '--premium' in sys.argv else 101 if '--cinematic' in sys.argv else 41
if len(files)!=expected or files[-1].stem!=f'{expected-1:03}':raise SystemExit(f'Expected {expected} completed frames')
bounds=[]
for p in files:
 im=Image.open(p).convert('RGBA');box=im.getchannel('A').point(lambda x:255 if x>235 else 0).getbbox()
 if not box:raise SystemExit('Empty rendered frame '+str(p))
 if box[0]==0 or box[1]==0 or box[2]==im.width or box[3]==im.height:raise SystemExit('Product clips in frame '+p.stem)
 bounds.append(box)
left=max(0,min(x[0] for x in bounds)-45);top=max(0,min(x[1] for x in bounds)-25)
right=min(im.width,max(x[2] for x in bounds)+45);bottom=min(im.height,max(x[3] for x in bounds)+28)
box=(left,top,right,bottom);dest.mkdir(exist_ok=True,parents=True)
def package(p):
 frame=Image.open(p).convert('RGBA').crop(box)
 # Transparency must reach every edge; a shadow-catcher matte must never return.
 alpha=frame.getchannel('A')
 edges=[alpha.crop((0,0,frame.width,1)),alpha.crop((0,frame.height-1,frame.width,frame.height)),alpha.crop((0,0,1,frame.height)),alpha.crop((frame.width-1,0,frame.width,frame.height))]
 if any(edge.getextrema()[1]>0 for edge in edges):raise ValueError('Nontransparent edge in frame '+p.stem)
 frame.save(dest/(p.stem+'.webp'),quality=93 if expected>=101 else 90,method=5)
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(package,files))
manifest={'directory':'assets/'+dest.name,'count':expected,'width':right-left,'height':bottom-top,'format':'webp','description':'Original studio-rendered aluminium case: opening, reverse orbit, interior approach, and floating briefing cards' if expected>=101 else 'Original studio-rendered aluminium briefcase opening sequence'}
if expected==141:
 manifest['bounds']=[[b[0]-left,b[1]-top,b[2]-left,b[3]-top] for b in bounds]
 poster=Image.open(files[0]).convert('RGBA');b=poster.getchannel('A').getbbox();pb=(max(0,b[0]-24),max(0,b[1]-24),min(poster.width,b[2]+24),min(poster.height,b[3]+24));poster.crop(pb).save(dest/'poster.webp',quality=94,method=5);manifest['poster']='assets/'+dest.name+'/poster.webp'
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'frames':len(files),'crop':box,'width':manifest['width'],'height':manifest['height'],'total_bytes':sum(x.stat().st_size for x in dest.glob('*.webp'))}))
