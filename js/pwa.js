// ==============================================================================================================================
// === REGISTRO DE SERVICE WORKER (PWA) Y PROMPT RÁPIDO DE INSTALACIÓN ===
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
          console.log('✅ ServiceWorker registrado con éxito, ámbito:', registration.scope);
          // Forzar comprobación inmediata de nueva versión
          registration.update();
        })
        .catch((error) => {
          console.warn('⚠️ No se pudo registrar el ServiceWorker:', error);
        });
    }
  });
}

// Botón de 1 toque para instalar la App en pantalla de inicio (Ideal para hermanos y hermanas mayores)
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  mostrarBotonInstalacionPWA();
});

function mostrarBotonInstalacionPWA() {
  if (document.getElementById('bannerInstalarAppPWA')) return;

  const banner = document.createElement('div');
  banner.id = 'bannerInstalarAppPWA';
  banner.style.cssText = `
    position: fixed;
    bottom: 84px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #ffffff;
    padding: 10px 16px;
    border-radius: 50px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.35);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: terrosaFadeIn 0.3s ease;
    border: 1px solid rgba(255,255,255,0.18);
    max-width: 90vw;
  `;
  banner.innerHTML = `
    <span style="font-size: 19px;">📲</span>
    <span style="font-size: 13px; font-weight: 700; white-space: nowrap;">¿Descargar la App?</span>
    <button id="btnEjecutarInstalarPWA" style="
      background: #1a73e8; color: white; border: none; padding: 7px 15px; border-radius: 50px; font-weight: 800; font-size: 12.5px; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 6px rgba(26,115,232,0.4);
    ">Instalar</button>
    <button id="btnCerrarBannerPWA" style="background: transparent; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 0 4px;" title="Cerrar">✕</button>
  `;

  document.body.appendChild(banner);

  banner.querySelector('#btnEjecutarInstalarPWA').onclick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        banner.remove();
      }
      deferredInstallPrompt = null;
    }
  };

  banner.querySelector('#btnCerrarBannerPWA').onclick = () => {
    banner.remove();
  };
}

window.addEventListener('appinstalled', () => {
  const b = document.getElementById('bannerInstalarAppPWA');
  if (b) b.remove();
  deferredInstallPrompt = null;
});

// Guía interactiva o disparo directo de instalación
window.abrirGuiaInstalacionPWA = function () {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    return;
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const modal = document.createElement('div');
  modal.className = 'terrosa-modal-overlay';
  modal.style.zIndex = '10000000';
  modal.innerHTML = `
    <div class="terrosa-modal-card" style="max-width:340px; padding:22px 20px; text-align:center;">
      <div style="font-size:38px; margin-bottom:8px;">📲</div>
      <h3 style="margin:0 0 8px 0; font-size:18.5px; font-weight:800; color:#0f172a;">Instalar TerRosa</h3>
      <p style="font-size:13px; color:#64748b; margin:0 0 16px 0; line-height:1.5;">
        ${isIOS 
          ? 'En iPhone / Safari:<br>Toca el botón <b>Compartir</b> (el recuadro con la flecha hacia arriba) y selecciona <b>"Agregar al inicio"</b> 📲.'
          : 'En Android / Chrome:<br>Toca los <b>3 puntos</b> arriba a la derecha y selecciona <b>"Instalar aplicación"</b> o <b>"Agregar a la pantalla principal"</b> 📲.'
        }
      </p>
      <button id="btnEntendidoGuiaPWA" style="
        width:100%; padding:11px; background:#1a73e8; color:white; border:none; border-radius:12px; font-weight:800; font-size:13.5px; cursor:pointer; box-shadow:0 2px 6px rgba(26,115,232,0.3);
      ">Entendido 👍</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#btnEntendidoGuiaPWA').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
};

