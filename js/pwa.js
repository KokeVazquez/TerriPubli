// ==============================================================================================================================
// === REGISTRO DE SERVICE WORKER (PWA) ===
// ==============================================================================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Solo registrar si se sirve por http/https o localhost (no en file:///)
    if (window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('✅ ServiceWorker registrado con éxito, ámbito:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ No se pudo registrar el ServiceWorker:', error);
        });
    }
  });
}

