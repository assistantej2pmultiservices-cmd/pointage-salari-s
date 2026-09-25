```javascript
const CACHE_NAME = "pointage-v31";


/* =====================================================
   FICHIERS À METTRE EN CACHE
===================================================== */

const FILES = [
  "./",
  "./index.html"
];


/* =====================================================
   INSTALLATION
===================================================== */

self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(function(cache) {

          return cache.addAll(FILES);

        })

    );

    /*
       Active immédiatement le nouveau
       Service Worker.
    */

    self.skipWaiting();

  }
);


/* =====================================================
   ACTIVATION
===================================================== */

self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      caches
        .keys()
        .then(function(keys) {

          return Promise.all(

            keys.map(function(key) {

              if (
                key !== CACHE_NAME
              ) {

                return caches.delete(key);

              }

            })

          );

        })
        .then(function() {

          /*
             Prend immédiatement le contrôle
             des pages ouvertes.
          */

          return self.clients.claim();

        })

    );

  }
);


/* =====================================================
   REQUÊTES
===================================================== */

self.addEventListener(
  "fetch",
  function(event) {


    /*
       On ne traite que GET.
    */

    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    const url =
      new URL(event.request.url);


    /*
       IMPORTANT :

       Ne jamais intercepter les requêtes
       Google Apps Script.

       Le pointage doit aller directement
       vers Google.
    */

    if (
      url.hostname.includes(
        "script.google.com"
      )
    ) {

      return;

    }


    /*
       Requêtes du même site uniquement.
    */

    if (
      url.origin !== self.location.origin
    ) {

      return;

    }


    event.respondWith(

      caches
        .match(event.request)
        .then(function(cachedResponse) {


          /*
             Si le fichier est déjà en cache,
             on l'utilise immédiatement.
          */

          if (
            cachedResponse
          ) {

            return cachedResponse;

          }


          /*
             Sinon, on va chercher le fichier
             sur GitHub Pages.
          */

          return fetch(
            event.request
          )

          .then(function(response) {


            /*
               Vérification réponse.
            */

            if (
              !response ||
              response.status !== 200
            ) {

              return response;

            }


            /*
               Copie de la réponse pour
               le cache.
            */

            const copie =
              response.clone();


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
               Si Internet est absent,
               on revient sur index.html.
            */

            return caches.match(
              "./index.html"
            );

          });

        })

    );

  }
);


/* =====================================================
   MESSAGE DEPUIS INDEX.HTML
===================================================== */

self.addEventListener(
  "message",
  function(event) {


    if (
      event.data ===
      "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }

  }
);
```
