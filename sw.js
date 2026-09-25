const CACHE_NAME = "pointage-cache-v1";

const FICHIERS = [
  "./",
  "./index.html",
  "./sw.js"
];


/* =========================================================
   INSTALLATION
========================================================= */

self.addEventListener(
  "install",
  function(event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(function(cache) {

          return cache.addAll(FICHIERS);

        })
    );

    self.skipWaiting();
  }
);


/* =========================================================
   ACTIVATION
========================================================= */

self.addEventListener(
  "activate",
  function(event) {

    event.waitUntil(

      caches
        .keys()
        .then(function(noms) {

          return Promise.all(

            noms.map(function(nom) {

              if (
                nom !== CACHE_NAME
              ) {

                return caches.delete(nom);
              }

            })

          );

        })
    );

    self.clients.claim();
  }
);


/* =========================================================
   REQUETES
========================================================= */

self.addEventListener(
  "fetch",
  function(event) {

    /*
      Pour l'application elle-même :
      cache d'abord, puis réseau.

      Pour les appels externes Google Apps Script,
      on laisse le navigateur gérer directement.
    */

    const url =
      new URL(event.request.url);

    if (
      url.origin !== self.location.origin
    ) {

      return;
    }

    event.respondWith(

      caches
        .match(event.request)
        .then(function(reponseCache) {

          if (reponseCache) {
            return reponseCache;
          }

          return fetch(event.request)
            .then(function(reponse) {

              if (
                reponse &&
                reponse.status === 200
              ) {

                const copie =
                  reponse.clone();

                caches
                  .open(CACHE_NAME)
                  .then(function(cache) {

                    cache.put(
                      event.request,
                      copie
                    );

                  });
              }

              return reponse;
            });

        })

    );
  }
);
