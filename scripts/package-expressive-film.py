"""Reuse the opening bytes; package the larger-orbit frames without losing native scale."""
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import json,shutil,sys
source,previous,dest=map(Path,sys.argv[1:4]);old=json.loads((previous/'manifest.json').read_text());dest.mkdir(parents=True,exist_ok=True)
def package(i):
 name=f'{i:03}.webp'
 if i<=50:
  shutil.copyfile(previous/name,dest/name)
  return old['bounds'][i],[old['width'],old['height']]
 path=source/f'{i:03}.png';im=Image.open(path).convert('RGBA');alpha=im.getchannel('A');opaque=alpha.point(lambda x:255 if x>235 else 0).getbbox();box=alpha.getbbox()
 if not opaque or not box:raise ValueError(f'Empty frame {i}')
 if box[0]<=0 or box[1]<=0 or box[2]>=im.width or box[3]>=im.height:raise ValueError(f'Source silhouette clips in frame {i}')
 crop=(max(0,box[0]-24),max(0,box[1]-24),min(im.width,box[2]+24),min(im.height,box[3]+24));frame=im.crop(crop);frame.save(dest/name,quality=93,method=5)
 return [opaque[0]-crop[0],opaque[1]-crop[1],opaque[2]-crop[0],opaque[3]-crop[1]],list(frame.size)
with ThreadPoolExecutor(max_workers=4)as pool:results=list(pool.map(package,range(141)))
shutil.copyfile(previous/'poster.webp',dest/'poster.webp')
manifest={**old,'directory':'assets/'+dest.name,'description':'Original detailed case: unchanged opening, pronounced reverse orbit, overhead return and three staggered briefing-card flights','bounds':[r[0] for r in results],'dimensions':[r[1] for r in results],'poster':'assets/'+dest.name+'/poster.webp'}
(dest/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'frames':141,'unchanged_opening_frames':51,'bytes':sum(p.stat().st_size for p in dest.glob('*.webp'))}))
