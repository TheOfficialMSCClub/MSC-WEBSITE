import {handleClub} from '../server/club.mjs';
import {pageResponse} from '../server/pages.mjs';
import {accessIdentity} from './auth.mjs';
const pages = new Set(['admin', 'welcome', 'privacy', 'confirm', 'unsubscribe']);
const authUI = {provider: 'club', loginUrl: '/admin', logoutUrl: '/cdn-cgi/access/logout', loginLabel: 'Sign in to MSC', loginDescription: 'Use an approved MSC email address. A sign-in code will be sent to your inbox.'};
const privateResponse = (message, status) => new Response(message, {status, headers: {'Cache-Control': 'private, no-store', 'Content-Type': 'text/plain; charset=utf-8'}});
export function createWorker({authenticate = accessIdentity} = {}) {
  return {async fetch(incoming, env) {
    const url = new URL(incoming.url);
    if (!env.MSC_PUBLIC_ORIGIN) return privateResponse('MSC hosting setup is incomplete.', 503);
    if (url.origin !== env.MSC_PUBLIC_ORIGIN) {
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || !['GET','HEAD'].includes(incoming.method)) return privateResponse('Use the official MSC website.', 421);
      return Response.redirect(env.MSC_PUBLIC_ORIGIN + url.pathname + url.search, 308);
    }
    // Delete platform identity headers even though the external handler also
    // receives an explicit authenticator. No external request can impersonate
    // a trusted Sites dispatch request.
    const headers = new Headers(incoming.headers);
    for (const name of [...headers.keys()]) if (name.startsWith('oai-')) headers.delete(name);
    const request = new Request(incoming, {headers});
    const path = url.pathname.replace(/\/$/, '') || '/';
    if (path.startsWith('/api/club/')) {
      return handleClub(request, env, {authenticate, authUI});
    }
    if (path === '/strategy-summit') {
      if (!['GET','HEAD'].includes(request.method)) return privateResponse('Method not allowed.',405);
      const assetURL=new URL(request.url);assetURL.pathname='/strategy-summit.html';
      return env.ASSETS.fetch(new Request(assetURL,request));
    }
    const kind = path.slice(1);
    if (pages.has(kind)) {
      if (!['GET','HEAD'].includes(request.method)) return privateResponse('Method not allowed.', 405);
      if (kind === 'admin' && !await authenticate(request, env)) return privateResponse('Club access is required. Check the MSC Access application and approved email list.', 401);
      const response = pageResponse(kind, {logoutUrl: authUI.logoutUrl, external: true});
      return request.method === 'HEAD' ? new Response(null, response) : response;
    }
    return env.ASSETS.fetch(request);
  }};
}
export default createWorker();
