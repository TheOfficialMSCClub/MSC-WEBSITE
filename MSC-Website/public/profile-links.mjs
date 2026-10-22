// Only public LinkedIn profile URLs are valid for individual council links.
export function memberLinkedInURL(member){
 try{const url=new URL(member?.linkedin);return url.protocol==='https:'&&/^(www\.|ca\.)?linkedin\.com$/.test(url.hostname)&&/^\/in\/[^/]+\/?$/.test(url.pathname)&&!url.username&&!url.password&&!url.search&&!url.hash?url.href:'';}catch{return '';}
}
