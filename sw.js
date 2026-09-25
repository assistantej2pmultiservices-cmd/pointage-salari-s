```javascript
const CACHE_NAME = "pointage-v40";

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

      caches.keys()
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

  }
);


self.addEventListener(
  "fetch",
  function(event) {

    /*
     * On ne touche surtout pas aux requêtes
     * vers Google Apps Script.
     */

    if (event.request.method !== "GET") {
      return;
    }


    const url =
      new URL(event.request.url);


    if (
      url.hostname === "script.google.com" ||
      url.hostname.endsWith(
        ".googleusercontent.com"
      )
    ) {

      return;

    }


    /*
     * Seulement les fichiers de ton site.
     */

    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    event.respondWith(

      caches
        .match(event.request)
        .then(function(cached) {

          if (cached) {
            return cached;
          }


          return fetch(event.request)
            .then(function(response) {

              if (
                response &&
                response.status === 200
              ) {

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

              }

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
```
