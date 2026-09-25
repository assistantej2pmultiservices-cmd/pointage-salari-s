const CACHE_NAME = "pointage-v2";

const FICHIERS = [
  "./",
  "./index.html",
  "./sw.js"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FICHIERS))
  );

  self.skipWaiting();
});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(noms => {

        return Promise.all(

          noms.map(nom => {

            if (nom !== CACHE_NAME) {
              return caches.delete(nom);
            }

          })

        );
      })
  );

  self.clients.claim();
});


self.addEventListener("fetch", event => {

  const url =
    new URL(event.request.url);

  if (
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(

    caches.match(event.request)
      .then(reponse => {

        if (reponse) {
          return reponse;
        }

        return fetch(event.request)
          .then(reponseReseau => {

            if (
              reponseReseau &&
              reponseReseau.status === 200
            ) {

              const copie =
                reponseReseau.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    copie
                  );

                });
            }

            return reponseReseau;
          });

      })
  );
});
