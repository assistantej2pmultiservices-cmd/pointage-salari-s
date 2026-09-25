const CACHE_NAME = "pointage-v1";

const FILES = [
  "./",
  "./index.html"
];

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches.open(CACHE_NAME).then(function(cache) {

      return cache.addAll(FILES);

    })

  );

  self.skipWaiting();

});


self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys().then(function(keys) {

      return Promise.all(

        keys.map(function(key) {

          if (key !== CACHE_NAME) {

            return caches.delete(key);

          }

          return null;

        })

      );

    }).then(function() {

      return self.clients.claim();

    })

  );

});


self.addEventListener("fetch", function(event) {

  if (
    event.request.url.includes(
      "script.google.com"
    )
  ) {

    return;

  }


  if (
    event.request.method !== "GET"
  ) {

    return;

  }


  event.respondWith(

    caches.match(
      event.request
    ).then(function(cached) {

      if (cached) {

        return cached;

      }


      return fetch(
        event.request
      ).then(function(response) {

        if (
          !response ||
          response.status !== 200
        ) {

          return response;

        }


        const copie =
          response.clone();


        caches.open(
          CACHE_NAME
        ).then(function(cache) {

          cache.put(
            event.request,
            copie
          );

        });


        return response;

      }).catch(function() {

        return caches.match(
          "./index.html"
        );

      });

    })

  );

});
