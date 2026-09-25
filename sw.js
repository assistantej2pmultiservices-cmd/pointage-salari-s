```javascript
const CACHE_NAME = "pointage-v31";

const FILES = [
  "./",
  "./index.html"
];

/*
  ============================================================
  INSTALLATION
  ============================================================
*/

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(function(cache) {

        return cache.addAll(FILES);
      })
  );

  self.skipWaiting();
});

/*
  ============================================================
  ACTIVATION
  ============================================================
*/

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches
      .keys()
      .then(function(keys) {

        return Promise.all(

          keys.map(function(key) {

            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }

            return null;
          })
        );
      })
      .then(function() {

        return self.clients.claim();
      })
  );
});

/*
  ============================================================
  INTERCEPTION DES REQUÊTES
  ============================================================
*/

self.addEventListener("fetch", function(event) {

  /*
    Nous ne touchons pas aux POST.
    Les pointages vers Google Apps Script
    passent donc directement par le navigateur.
  */

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  /*
    Ne jamais intercepter Google Apps Script.
  */

  if (
    url.hostname === "script.google.com" ||
    url.hostname.endsWith(".googleusercontent.com")
  ) {
    return;
  }

  /*
    Ne gérer que les fichiers du même domaine
    que GitHub Pages.
  */

  if (url.origin !== self.location.origin) {
    return;
  }

  /*
    Cache-first :
    1. cache
    2. réseau
    3. index.html hors connexion
  */

  event.respondWith(

    caches
      .match(event.request)
      .then(function(cachedResponse) {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)

          .then(function(response) {

            /*
              On ne met en cache que les réponses valides.
            */

            if (
              !response ||
              response.status !== 200
            ) {
              return response;
            }

            const copie = response.clone();

            caches
              .open(CACHE_NAME)
              .then(function(cache) {

                cache.put(
                  event.request,
                  copie
                );
              });

            return response;
          })

          .catch(function() {

            /*
              Si le téléphone est hors connexion,
              on recharge l'application principale.
            */

            return caches.match("./index.html");
          });
      })
  );
});

/*
  ============================================================
  MISE À JOUR FORCÉE
  ============================================================
*/

self.addEventListener("message", function(event) {

  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```
