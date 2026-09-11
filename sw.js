const CACHE_NAME = "pointage-v3";

const FILES = [
  "./",
  "./index.html"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    })

  );

  self.clients.claim();

});


self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {

            if (
              response &&
              response.status === 200
            ) {

              const copie =
                response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    copie
                  );

                });

            }

            return response;

          })
          .catch(() => {

            return caches.match(
              "./index.html"
            );

          });

      })

  );

});
