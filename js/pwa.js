// ==============================================================================================================================
// === REGISTRO DE SERVICE WORKER (PWA) ===
// ==============================================================================================================================

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    if (window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          // ServiceWorker registrado
          // Forzar comprobación inmediata de nueva versión
          registration.update();
        })
        .catch((error) => {
          // Error registrando ServiceWorker
        });
    }
  });
}
