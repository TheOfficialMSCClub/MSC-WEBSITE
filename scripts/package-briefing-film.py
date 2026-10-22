"""Package the matched case and projected physical-paper corners at native pixel scale."""
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import json,sys,shutil
source,dest=map(Path,sys.argv[1:3]);dest.mkdir(parents=True,exist_ok=True)
def package(i):
 im=Image.open(source/f'{i:03}.png').convert('RGBA');alpha=im.getchannel('A');opaque=alpha.point(lambda x:255 if x>235 else 0).getbbox();box=alpha.getbbox()
 if not opaque or not box:raise ValueError(f'Empty frame {i}')
 if box[0]<=0 or box[1]<=0 or box[2]>=im.width or box[3]>=im.height:raise ValueError(f'Source silhouette clips in frame {i}')
 crop=(max(0,box[0]-24),max(0,box[1]-24),min(im.width,box[2]+24),min(im.height,box[3]+24));frame=im.crop(crop);frame.save(dest/f'{i:03}.webp',quality=93,method=5)
 anchors=json.loads((source/f'{i:03}.json').read_text())['papers'];papers=[[[x-crop[0],y-crop[1]]for x,y in corners]for corners in anchors]
 return [opaque[0]-crop[0],opaque[1]-crop[1],opaque[2]-crop[0],opaque[3]-crop[1]],list(frame.size),papers
with ThreadPoolExecutor(max_workers=4)as pool:results=list(pool.map(package,range(141)))
shutil.copyfile(dest/'000.webp',dest/'poster.webp')
manifest={'count':141,'width':results[0][1][0],'height':results[0][1][1],'directory':'assets/'+dest.name,'description':'Equal-width, equal-depth clamshell halves; physical briefing sheets transition into Learn, Network and Succeed','bounds':[r[0]for r in results],'dimensions':[r[1]for r in results],'papers':[r[2]for r in results],'poster':'assets/'+dest.name+'/poster.webp'}
(dest/'manifest.json').write_text(json.dumps(manifest,separators=(',',':'))+'\n');print(json.dumps({'frames':141,'paper_anchor_sets':len(results)*3,'bytes':sum(p.stat().st_size for p in dest.glob('*.webp'))}))
