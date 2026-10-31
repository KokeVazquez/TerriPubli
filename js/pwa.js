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
          console.log('ServiceWorker registrado con éxito, ámbito:', registration.scope);
          // Forzar comprobación inmediata de nueva versión
          registration.update();
        })
        .catch((error) => {
          console.warn('No se pudo registrar el ServiceWorker:', error);
        });
    }
  });
}
