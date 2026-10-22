"""Summit's compact preview and editorial event page, generated from club content."""
from html import escape as e

STAGES=[('trail','The trail','Introduction'),('ridge','The ridge','What you’ll gain'),('peak','The summit','The prize')]

def ascent_scene(event, full=False):
 slides=[]
 for i,(key,label,theme) in enumerate(STAGES):
  if i==0:
   title='STRATEGY<br><em>SUMMIT.</em>'
   deck='Technology. Strategy.<br>An idea worth taking further.'
   body='<p class="summit-slide-detail">A student-led case competition bringing technology, strategy and entrepreneurship together.</p>' if full else ''
   meta='Teams of 4–5 · All programs welcome'
   href='#summit-brief' if full else '/strategy-summit'
   link='Step into the competition' if full else 'Explore the competition'
  elif i==1:
   title='A higher<br><em>perspective.</em>'
   deck='Take your thinking further.'
   body='<ul class="summit-slide-gains"><li><strong>Stronger skills</strong><span>Research, analyse and present a real-world case.</span></li><li><strong>Industry insights</strong><span>Explore technology, go-to-market strategy and start-ups.</span></li><li><strong>Connections &amp; confidence</strong><span>Meet peers and industry professionals. Find your voice.</span></li></ul>'
   meta='An industry panel · A real-world challenge · Networking'
   href='#summit-takeaways' if full else '/strategy-summit#summit-takeaways'
   link='What you’ll take away'
  else:
   title='The summit.<br><em>The prize.</em>'
   deck='Bring your best thinking to the top.'
   body='<div class="summit-prize-note"><span>Prize announcement</span><strong>Coming soon.</strong><p>The prize details will be announced through MSC.</p></div>'
   meta='Your team. Your idea. Your next ascent.'
   href='#summit-registration' if full else '/strategy-summit#summit-registration'
   link='Take your place'
  heading='h1' if full and i==0 else ('h2' if full else ('h3' if i==0 else 'h4'))
  slides.append(f'''<div class="summit-slide {('active' if i==0 else '')}" data-summit-slide="{i}" data-stage-label="{label}" role="group" aria-roledescription="slide" aria-label="{e(theme)}" aria-hidden="{str(i!=0).lower()}" {('inert' if i else '')}>

<div class="summit-slide-copy"><p class="summit-eyebrow">MSC presents / Second edition <span>{e(theme)}</span></p><{heading} class="summit-slide-title" {('id="summit-title"' if i==0 and not full else '')}>{title}</{heading}><p class="summit-slide-deck">{deck}</p>{body}<a class="summit-link" href="{href}">{link} <span aria-hidden="true">↗</span></a><p class="summit-slide-meta">{meta}</p></div></div>''')
 scenery='<div class="ascent-route" aria-hidden="true">'+''.join(f'<img class="route-still {("current" if i==0 else "")}" data-route-still="{i}" src="/assets/summit-route-v8/stop-{i}.webp" alt="" width="3840" height="2160" loading="{("eager" if full else "lazy")}">' for i in range(3))+''.join(f'<video data-route-video="{start}-{end}" data-route-from="{start}" data-route-to="{end}" data-src="/assets/summit-route-v8/{start}-{end}.mp4" poster="/assets/summit-route-v8/stop-{start}.webp" muted playsinline preload="none" disablepictureinpicture tabindex="-1"></video>' for start in range(3) for end in range(3) if start!=end)+'</div>'
 flakes=''.join(f'<i style="--x:{(i*37+11)%100}%;--delay:-{i*.73:.2f}s;--duration:{10+i%9}s;--size:{2+i%4}px;--snow-opacity:{.4+(i%4)*.13:.2f};--snow-blur:{.6 if i%5==0 else 0}px"></i>' for i in range(56))
 return f'''<div class="summit-ascent-scene" data-summit-scene data-ascent="0" role="region" aria-roledescription="carousel" aria-label="Strategy Summit mountain journey" tabindex="-1">{scenery}{''.join(slides)}<div class="ascent-snow" aria-hidden="true">{flakes}</div><div class="ascent-scenery-label" aria-hidden="true">A DIFFERENT PERSPECTIVE / STRATEGY SUMMIT</div><div class="ascent-controls" role="group" aria-label="Change mountain view"><button class="ascent-arrow ascent-prev" type="button" data-ascent-prev aria-label="Previous mountain view"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="m17 5-9 9 9 9"/></svg></button><button class="ascent-arrow ascent-next" type="button" data-ascent-next aria-label="Next mountain view"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="m11 5 9 9-9 9"/></svg></button></div><div class="ascent-footer"><span class="ascent-current-label">The trail</span></div><p class="sr-only ascent-status" role="status" aria-live="polite"></p></div>'''

def summit_markup(event):
 return f'<article class="summit-preview" aria-labelledby="summit-title">{ascent_scene(event)}</article>'

def summit_page(event):
 guide_labels=['The conversation','The challenge','The connections','The keepsakes']
 experience=''.join(f'''<details name="summit-experience" {'open' if i==0 else ''}><summary><span class="guide-number">0{i+1}</span><span><small>{guide_labels[i]}</small><strong>{e(item['name'])}</strong></span><span class="guide-toggle" aria-hidden="true">+</span></summary><div class="guide-description">{('<span class="summit-planned">Planned</span>' if item.get('planned') else '')}<p>{e(item['text'])}</p></div></details>''' for i,item in enumerate(event['experience']))
 takeaways=''.join(f'<li><span>0{i+1}</span><div><h3>{e(item["name"])}</h3><p>{e(item["text"])}</p></div><span class="takeaway-arrow" aria-hidden="true">↗</span></li>' for i,item in enumerate(event['takeaways']))
 return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Strategy Summit — MSC</title><meta name="description" content="A student-led technology and strategy case competition. Step into MSC’s second Strategy Summit. Teams of 4–5; all programs welcome."><meta name="theme-color" content="#321522"><link rel="icon" href="/assets/favicon.svg"><link rel="canonical" href="https://msc-council.jaydenli-epic.chatgpt.site/strategy-summit"><meta property="og:title" content="Strategy Summit — A different perspective"><meta property="og:description" content="Technology. Strategy. An idea worth taking further. Explore MSC’s second Strategy Summit."><meta property="og:image" content="https://msc-council.jaydenli-epic.chatgpt.site/assets/share.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/summit.css"><script type="module" src="/summit-interactive.mjs"></script></head>
<body class="summit-page"><a class="summit-skip" href="#summit-main">Skip to content</a>
<header class="summit-page-head"><a class="summit-brand" href="/">MSC<span>Management<br>Strategy Council</span></a><nav aria-label="Summit navigation"><a href="/#events">Back to MSC <span aria-hidden="true">↙</span></a><button id="site-motion" aria-pressed="false">Motion on</button></nav></header>
<main id="summit-main">
<section class="summit-page-hero">{ascent_scene(event, full=True)}</section>
<div class="summit-facts-bar"><div><span>The team</span><strong>4–5 students</strong></div><div><span>The invitation</span><strong>All programs welcome</strong></div><div><span>The community</span><strong>UofT tri-campus</strong></div><a href="#summit-registration"><span>Registration closes</span><strong>October 26 · Noon <b aria-hidden="true">↗</b></strong></a></div>
<nav class="summit-page-index" aria-label="Explore Strategy Summit"><a href="#summit-brief">01 / The brief</a><a href="#summit-experience">02 / Your experience</a><a href="#summit-takeaways">03 / What stays with you</a><a href="#summit-registration">04 / Take your place</a></nav>
<section class="summit-brief" id="summit-brief"><div class="summit-margin"><span>01 / THE BRIEF</span><span>OBSERVE<br>QUESTION<br>BUILD</span></div><div class="summit-brief-main"><p class="summit-eyebrow">There’s an opportunity in the everyday.</p><h2>See it differently.<br><em>Build something from it.</em></h2><div class="summit-brief-columns"><p class="summit-lede">{e(event['description'])}</p><div><p>This year, we’re bringing students into the technology, strategy and start-up space. Research a real-world scenario, gather evidence, and turn your observations into a recommendation worth presenting.</p><p>{e(event['audience'])} Every degree and major is welcome, with one shared competition division.</p></div></div><div class="summit-field-line"><span>EVERYDAY OBSERVATION</span><i aria-hidden="true">→</i><span>EVIDENCE &amp; INSIGHT</span><i aria-hidden="true">→</i><span>ENTREPRENEURIAL POSSIBILITY</span></div><p class="summit-history">Our second edition under the Strategy Summit name, following last year’s Summit and MSC’s earlier partnership in the Eclipse case competition.</p></div></section>
<section class="summit-experience-section" id="summit-experience"><div class="summit-experience-heading"><p class="summit-eyebrow">02 / Your experience</p><h2>Beyond<br><em>the case.</em></h2><p>A room full of perspectives.<br>A challenge to work through together.</p><div class="summit-altitude-mark" aria-hidden="true"><span>MSC</span><strong>SUMMIT</strong><span>SECOND EDITION / 2026</span></div></div><div class="summit-experience-guide">{experience}</div></section>
<section class="summit-takeaways" id="summit-takeaways"><div class="summit-takeaway-heading"><p class="summit-eyebrow">03 / What stays with you</p><h2>Leave with more<br><em>than an answer.</em></h2><p>The thinking, relationships and confidence to take your next idea further.</p></div><ol class="summit-takeaway-list">{takeaways}</ol></section>
<section class="summit-registration" id="summit-registration"><div class="summit-register-copy"><p class="summit-eyebrow">04 / Take your place</p><h2>Your team.<br>Your thinking.<br><em>Your next ascent.</em></h2><p>Gather 4–5 students from any program.<br>Find the registration link and event schedule through MSC.</p><a class="summit-link" href="https://www.instagram.com/msc.uoft/" target="_blank" rel="noopener noreferrer">Registration at @msc.uoft <span aria-hidden="true">↗</span></a></div><aside class="summit-pass" aria-label="Strategy Summit ticket information"><div class="summit-pass-top"><span>MSC / STRATEGY SUMMIT</span><span>ED. 02</span></div><p class="summit-pass-label">Registration closes</p><div class="summit-pass-date"><strong>26</strong><div>OCTOBER<span>AT NOON</span></div></div><dl><div><dt>Early-bird</dt><dd>$35 <small>through October 21</small></dd></div><div><dt>Regular</dt><dd>$40</dd></div></dl><div class="summit-pass-foot"><span>TEAMS OF 4–5</span><span>ALL PROGRAMS</span></div><p>Event schedule announced through MSC.</p></aside></section>
</main><footer class="summit-page-footer"><a href="/">Management Strategy Council / UTSC</a><a href="/privacy">Privacy</a><button id="analytics-preference" aria-pressed="true">Anonymous analytics: on</button></footer></body></html>'''
