const CACHE_NAME = "pointage-salaries-v3";

const FICHIERS_A_METTRE_EN_CACHE = [
  "./",
  "./index.html"
];

// Installation : mémorise le formulaire pour pouvoir l'ouvrir hors connexion
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FICHIERS_A_METTRE_EN_CACHE))
  );

  self.skipWaiting();
});

// Activation : supprime les anciennes versions du cache
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

// Fonctionnement hors connexion
self.addEventListener("fetch", event => {

  // On ne touche pas aux envois vers Google Apps Script
  if (
    event.request.url.includes("script.google.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(reponseEnCache => {

        if (reponseEnCache) {
          return reponseEnCache;
        }

        return fetch(event.request)
          .then(reponse => {

            // Mémorise les nouvelles ressources du formulaire
            if (
              reponse &&
              reponse.status === 200 &&
              reponse.type === "basic"
            ) {

              const copie = reponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, copie);
                });
            }

            return reponse;
          })
          .catch(() => {

            // Si aucune connexion et page demandée,
            // on renvoie le formulaire déjà enregistré
            return caches.match("./index.html");
          });
      })
  );
});
