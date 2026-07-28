// Camino service worker — offline cache + scheduled notifications.
// Cache strategy: cache-first for app shell, network-first for everything else.
// Notifications: relays the page's schedule via postMessage; fires when timer hits.

var CACHE_NAME = 'camino-v22';
var APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){ /* best-effort */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function(){
      // Tell every open page to reload so it picks up the new code immediately.
      return self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clients){
        clients.forEach(function(c){ try { c.postMessage({type:'sw-updated'}); } catch(e){} });
      });
    })
  );
  self.clients.claim();
});

// Network-first for app shell (html/css/js/json) — always pull fresh when online,
// fall back to cache only when offline. Avoids the stale-asset trap.
self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;
  // Voice clips are hash-named and immutable — cache-first, never refetch.
  // (manifest.json stays network-first below so new generations roll out.)
  if(req.url.indexOf('/audio/tts/') !== -1 && req.url.indexOf('manifest.json') === -1){
    event.respondWith(
      caches.match(req).then(function(cached){
        if(cached) return cached;
        return fetch(req).then(function(res){
          if(res && res.status === 200){
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(cache){ cache.put(req, clone); });
          }
          return res;
        });
      })
    );
    return;
  }
  event.respondWith(
    fetch(req).then(function(res){
      if(res && res.status === 200 && res.type === 'basic'){
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(req, clone); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(cached){
        return cached || new Response('', {status:503});
      });
    })
  );
});

// Scheduled-reminder support.
// The page posts {type:'schedule-daily', hour:H, minute:M} on enable.
// We register a setTimeout for the next fire. When the SW is alive (during
// active use or open tabs), this fires reliably. For truly-closed-app delivery
// you need a push server (out of scope for prototype).

var reminderTimer = null;

function nextReminderMs(hour, minute){
  var now = new Date();
  var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if(target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function scheduleDailyReminder(hour, minute, title, body){
  if(reminderTimer){ clearTimeout(reminderTimer); reminderTimer = null; }
  var delay = nextReminderMs(hour, minute);
  reminderTimer = setTimeout(function(){
    self.registration.showNotification(title || 'Camino', {
      body: body || 'Time for your daily lesson!',
      tag: 'camino-daily',
      renotify: true
    });
    // Reschedule for the next day
    scheduleDailyReminder(hour, minute, title, body);
  }, delay);
}

self.addEventListener('message', function(event){
  var data = event.data || {};
  if(data.type === 'schedule-daily' && typeof data.hour === 'number'){
    scheduleDailyReminder(data.hour, data.minute || 0, data.title, data.body);
  } else if(data.type === 'cancel-daily'){
    if(reminderTimer){ clearTimeout(reminderTimer); reminderTimer = null; }
  } else if(data.type === 'show-notification'){
    self.registration.showNotification(data.title || 'Camino', {
      body: data.body || '',
      tag: data.tag || 'camino-now',
      renotify: true
    });
  }
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clientList){
      for(var i=0;i<clientList.length;i++){
        var c = clientList[i];
        if('focus' in c) return c.focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
