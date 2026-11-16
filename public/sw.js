/* DUNE offline shell v1. Navigation is network-first; hashed static assets are cache-first.
   A new worker waits until old tabs close. No forced reload during a simulation. */
const VERSION='dune-shell-v1';
const SHELL=['/','/mission-control','/device','/resilience','/engineering','/icon.svg','/dune-landscape.svg','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dune-shell-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;if(req.mode==='navigate'){event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(req,copy))}return response}).catch(async()=>await caches.match(req)||await caches.match('/mission-control')||Response.error()));return}event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(req,copy))}return response}))) });
