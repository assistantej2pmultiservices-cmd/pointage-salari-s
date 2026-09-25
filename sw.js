const CACHE_NAME = "pointage-v3";

const FILES = [
  "./",
  "./index.html"
];


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

    self.skipWaiting();

  }
);


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

              return null;

            })

          );

        })
        .then(function() {

          return self.clients.claim();

        })

    );

  }
);


self.addEventListener(
  "fetch",
  function(event) {

    const request =
      event.request;


    // Ne jamais mettre Google Apps Script
    // dans le cache.

    if (
      request.url.includes(
        "script.google.com"
      )
    ) {

      return;

    }


    if (
      request.method !== "GET"
    ) {

      return;

    }


    event.respondWith(

      caches
        .match(request)
        .then(function(cached) {

          if (cached) {

            return cached;

          }


          return fetch(request)

            .then(function(response) {

              if (
                !response ||
                response.status !== 200 ||
                response.type === "opaque"
              ) {

                return response;

              }


              const copie =
                response.clone();


              caches
                .open(CACHE_NAME)
                .then(function(cache) {

                  cache.put(
                    request,
                    copie
                  );

                });


              return response;

            })

            .catch(function() {

              return caches.match(
                "./index.html"
              );

            });

        })

    );

  }
);
