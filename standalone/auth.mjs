import {createRemoteJWKSet, jwtVerify} from 'jose';
const keys = new Map();
export function accessIssuer(env) {
  try {
    const url = new URL(env.MSC_ACCESS_TEAM_DOMAIN);
    if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(url.hostname) || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}
// Only a verified Access application JWT can create an identity. Never trust a
// client-supplied email header, ChatGPT dispatch header, or unsigned token.
export async function accessIdentity(request, env, {keyResolver} = {}) {
  const issuer = accessIssuer(env), audience = env.MSC_ACCESS_AUD;
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!issuer || !audience || !token || token.length > 16000) return null;
  try {
    if (!keyResolver) {
      if (!keys.has(issuer)) keys.set(issuer, createRemoteJWKSet(new URL(issuer + '/cdn-cgi/access/certs')));
      keyResolver = keys.get(issuer);
    }
    const {payload} = await jwtVerify(token, keyResolver, {
      issuer, audience, algorithms: ['RS256'], requiredClaims: ['sub', 'email', 'exp', 'iat']
    });
    const allowed = String(env.MSC_ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || !allowed.includes(payload.email.toLowerCase())) return null;
    return {id: payload.sub, email: payload.email.toLowerCase()};
  } catch { return null; }
}
