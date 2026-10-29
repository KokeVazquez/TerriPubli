// ==============================================================================================================================
// === APP PRINCIPAL: TERRITORIOS ROSARIO ===
// ==============================================================================================================================

// ==============================================================================================================================
// 1. Inicialización del Mapa
// ==============================================================================================================================
const TOTAL_CUADRAS = 389; // número total de polígonos/cuadras

// Renderer SVG con padding extendido para evitar recortes al arrastrar o hacer zoom
var myRenderer = L.svg({ padding: 1.5 });

var map = L.map("map", {
  renderer: myRenderer,
  tap: false,               // Desactiva emulación antigua de tap en iOS para permitir toques nativos precisos
  maxZoom: 22,
  minZoom: 10,
  zoomControl: false,
  doubleClickZoom: false,
  zoomSnap: 0,              // Zoom fluido y continuo como una foto (sin saltos)
  zoomDelta: 0.25,          // Pasos finos
  wheelPxPerZoomLevel: 100, // Suavidad en rueda de ratón o gestos
  fadeAnimation: true,
  zoomAnimation: true
});

// Centro y zoom equilibrados para vista general de Área Grande
var CENTRO_AREA_GRANDE = [28.6107, -106.0699];
var ZOOM_AREA_GRANDE = 14.5;
var boundsIniciales = L.latLngBounds([[28.601, -106.088], [28.620, -106.052]]);

map.setView(CENTRO_AREA_GRANDE, ZOOM_AREA_GRANDE);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
  maxZoom: 22,
  maxNativeZoom: 19,
  subdomains: ["a", "b", "c"],
  keepBuffer: 10,
  updateWhenIdle: false,
  updateWhenZooming: true
}).addTo(map);

// ==============================================================================================================================
// 2. Variables Globales de Estado
// ==============================================================================================================================
let territorioActivo = null;
let etiquetasActivas = [];
window.indicadoresNotas = window.indicadoresNotas || [];
var overlayGris = null;

// ==============================================================================================================================
// 3. Indicador de Carga (Loader)
// ==============================================================================================================================
function mostrarLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function ocultarLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

function flyWithLoader(bounds, callback) {
  mostrarLoader();
  let finalizado = false;

  function concluir() {
    if (finalizado) return;
    finalizado = true;
    ocultarLoader();
    if (callback) callback();
  }

  // Fallback de seguridad por si el mapa ya está en esos mismos límites y Leaflet no emite 'moveend'
  const timerSeguridad = setTimeout(concluir, 850);

  map.once("moveend", function () {
    clearTimeout(timerSeguridad);
    concluir();
  });

  // Encuadrar respetando el espacio de la cabecera superior y la barra inferior
  map.flyToBounds(bounds, {
    paddingTopLeft: [20, 92],
    paddingBottomRight: [20, 98],
    duration: 0.7
  });
}

// ==============================================================================================================================
// 4. Menú Contextual en Mapa
// ==============================================================================================================================
// Se utiliza la función protegida ocultarMenu() definida en territoriobase.js
map.on("click", function () {
  if (typeof ocultarMenu === "function") {
    ocultarMenu(false);
  }
});

// ==============================================================================================================================
// 5. Enfocar Territorio y Etiquetas
// ==============================================================================================================================
function enfocarTerritorio(grupo) {
  territorioActivo = grupo;
  window.territorioActivo = grupo;

  // Asegurar que los colores correspondan al modo activo (colorido en Publicador, grises en Capitán)
  if (typeof window.ejecutarFiltroFecha === "function" && window.hayFiltroFechaActivo && window.hayFiltroFechaActivo()) {
    window.ejecutarFiltroFecha();
  } else if (typeof window.actualizarColoresCuadrasCapitan === "function") {
    window.actualizarColoresCuadrasCapitan();
  } else {
    window.todosLosTerritorios.forEach(t => {
      t.eachLayer(pol => {
        if (pol._originalStyle) pol.setStyle(pol._originalStyle);
      });
    });
  }

  if (overlayGris) map.removeLayer(overlayGris);

  var mundo = [[85, -179.9], [85, 179.9], [-85, 179.9], [-85, -179.9]];
  var huecos = [];
  territorioActivo.eachLayer(pol => {
    if (pol.getLatLngs) huecos.push(pol.getLatLngs()[0].map(ll => [ll.lat, ll.lng]));
  });

  overlayGris = L.polygon([mundo, ...huecos], {
    color: "#000",
    fillColor: "#000",
    fillOpacity: 0.6,
    stroke: false,
    interactive: false
  }).addTo(map);

  // Traer los polígonos del territorio enfocado AL FRENTE del mapa SVG
  if (territorioActivo && territorioActivo.bringToFront) {
    territorioActivo.bringToFront();
  }

  mostrarEtiquetas();

  // En Modo Capitán: mostrar cintillo informativo con estado del territorio
  if (typeof window.mostrarTarjetaInfoCapitan === "function") {
    window.mostrarTarjetaInfoCapitan(grupo);
  }
}

function mostrarEtiquetas() {
  etiquetasActivas.forEach(m => map.removeLayer(m));
  etiquetasActivas = [];

  if (!territorioActivo) return;

  territorioActivo.eachLayer(function (pol) {
    if (pol._label) {
      let latlngs = pol.getLatLngs()[0];
      let coords = latlngs.map(ll => [ll.lng, ll.lat]);
      coords.push([coords[0][0], coords[0][1]]);
      let centroide = turf.centroid(turf.polygon([coords]));
      let cLat = centroide.geometry.coordinates[1];
      let cLng = centroide.geometry.coordinates[0];

      let marker = L.marker([cLat, cLng], {
        interactive: false,
        icon: L.divIcon({
          className: "etiqueta-poligono",
          html: pol._label,
          iconSize: null,
          iconAnchor: [0, 0]
        })
      }).addTo(map);

      etiquetasActivas.push(marker);
    }
  });
}

// Selección directa de territorio desde cualquier cuadra
window.seleccionarTerritorioDirecto = function (territorioId) {
  if (!territorioId) return;

  const match = territorioId.match(/^territorio(\d+)$/);
  let grupo = null;
  let nombreVisible = "";

  if (match) {
    grupo = window["territorio" + match[1]];
    nombreVisible = "Territorio " + match[1];
  } else if (territorioId === "territorionegocios") {
    grupo = window.territorionegocios;
    nombreVisible = "Territorio Negocios";
  }

  if (!grupo || grupo.getLayers().length === 0) return;

  const selector = document.getElementById("selectorTerritorios");
  if (selector) selector.value = territorioId;

  const customSelect = document.getElementById("customSelectorTerritorios");
  if (customSelect) {
    const selected = customSelect.querySelector(".selected");
    if (selected) {
      const opt = customSelect.querySelector(`li[data-value="${territorioId}"]`);
      selected.textContent = opt ? opt.textContent : nombreVisible;
    }
  }

  if (typeof ocultarMenu === "function") {
    ocultarMenu(true);
  }

  flyWithLoader(grupo.getBounds(), function () {
    enfocarTerritorio(grupo);
  });
};

function cambiarTerritorio() {
  map.closePopup();
  var selector = document.getElementById("selectorTerritorios");
  var valor = selector.value;
  selector.blur();

  if (typeof ocultarMenu === "function") ocultarMenu(true);
  etiquetasActivas.forEach(m => map.removeLayer(m));
  etiquetasActivas = [];

  if (valor === "areaGrande") {
    const btnArea = document.getElementById("btnAreaGrande");
    if (btnArea) btnArea.click();
    return;
  }

  // Soporte tanto para 'territorioX' como para 'territorionegocios'
  const match = valor.match(/^territorio(\d+)$/);
  let grupo = null;
  if (match) {
    grupo = window["territorio" + match[1]];
  } else if (valor === "territorionegocios") {
    grupo = window.territorionegocios;
  }

  if (grupo && grupo.getLayers().length > 0) {
    flyWithLoader(grupo.getBounds(), function () {
      enfocarTerritorio(grupo);
    });
  }
}

// ==============================================================================================================================
// 8. Botón Área Grande
// ==============================================================================================================================
function inicializarAreaGrande() {
  const btnArea = document.getElementById("btnAreaGrande");
  if (!btnArea) return;

  btnArea.addEventListener("click", function () {
    map.closePopup();
    if (typeof window.ocultarTarjetaInfoCapitan === "function") {
      window.ocultarTarjetaInfoCapitan();
    }
    const selTerr = document.getElementById("selectorTerritorios");
    if (selTerr) selTerr.value = "";
    if (typeof ocultarMenu === "function") ocultarMenu(true);

    if (overlayGris) {
      map.removeLayer(overlayGris);
      overlayGris = null;
    }

    etiquetasActivas.forEach(m => map.removeLayer(m));
    etiquetasActivas = [];

    // Mantener colores según el modo activo
    if (typeof window.ejecutarFiltroFecha === "function" && window.hayFiltroFechaActivo && window.hayFiltroFechaActivo()) {
      window.ejecutarFiltroFecha();
    } else if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    } else {
      window.todosLosTerritorios.forEach(territorio => {
        territorio.eachLayer(pol => {
          if (pol._originalStyle) pol.setStyle(pol._originalStyle);
        });
      });
    }

    territorioActivo = null;
    window.territorioActivo = null;

    // Volar suavemente al centro del área grande con fallback contra bloqueo del loader
    mostrarLoader();
    let movConcluido = false;
    function finVueloArea() {
      if (movConcluido) return;
      movConcluido = true;
      ocultarLoader();
    }
    const timerSeg = setTimeout(finVueloArea, 850);
    map.once("moveend", function () {
      clearTimeout(timerSeg);
      finVueloArea();
    });
    map.flyTo(CENTRO_AREA_GRANDE, ZOOM_AREA_GRANDE, { duration: 0.7 });

    const customSelectTerr = document.getElementById("customSelectorTerritorios");
    if (customSelectTerr) {
      const selectedTerr = customSelectTerr.querySelector(".selected");
      if (selectedTerr) selectedTerr.textContent = "Territorio";
      customSelectTerr.classList.remove("active");
    }
  });
}

// ==============================================================================================================================
// 9. Custom Selects
// ==============================================================================================================================
function initCustomSelect(customId, originalId, callback) {
  const customSelect = document.getElementById(customId);
  if (!customSelect) return;

  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelectorAll(".options li");
  const originalSelect = document.getElementById(originalId);

  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllCustomSelects(customSelect);
    customSelect.classList.toggle("active");
  });

  options.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = opt.dataset.value;
      selected.textContent = opt.textContent;
      if (originalSelect) originalSelect.value = value;
      customSelect.classList.remove("active");
      if (callback) callback(value);
    });
  });

  const optionsContainer = customSelect.querySelector(".options");
  if (optionsContainer) {
    optionsContainer.addEventListener("touchmove", (e) => {
      e.stopPropagation();
    }, { passive: false });
  }
}

function closeAllCustomSelects(exception = null) {
  document.querySelectorAll(".custom-select").forEach(sel => {
    if (sel !== exception) sel.classList.remove("active");
  });
}

["click", "touchstart"].forEach(evt =>
  document.addEventListener(evt, (e) => {
    if (!e.target.closest(".custom-select")) closeAllCustomSelects();
  })
);

// ==============================================================================================================================
// 10. Geolocalización en Tiempo Real y "¿Dónde estoy parado?"
// ==============================================================================================================================
let marcadorUbicacion = null;
let circuloPrecision = null;
let seguimientoActivo = false;
let watchId = null;
window.userCurrentLocation = null;

// Determinar en qué territorio y cuadra se encuentra un punto GPS
window.obtenerUbicacionEnTerritorios = function (lat, lon) {
  if (!window.todosLosTerritorios || !Array.isArray(window.todosLosTerritorios)) return null;
  try {
    const pt = turf.point([lon, lat]);
    for (let i = 0; i < window.todosLosTerritorios.length; i++) {
      const grupo = window.todosLosTerritorios[i];
      let match = null;
      grupo.eachLayer(pol => {
        if (match) return;
        try {
          if (!pol.getLatLngs) return;
          const latlngs = pol.getLatLngs()[0];
          const coords = latlngs.map(ll => [ll.lng, ll.lat]);
          coords.push([coords[0][0], coords[0][1]]);
          const poly = turf.polygon([coords]);
          if (turf.booleanPointInPolygon(pt, poly)) {
            match = {
              territorioId: grupo._id,
              cuadraId: pol._id,
              label: pol._label || pol._id,
              poligono: pol
            };
          }
        } catch (e) {}
      });
      if (match) return match;
    }
  } catch (e) {}
  return null;
};

// Formateador amigable de nombres (ej: "Territorio 3, Cuadra 1")
function formatearUbicacionBanner(info) {
  if (!info) return "📍 Fuera de los territorios";
  let tNom = "Territorio";
  const numMatch = String(info.territorioId || "").match(/(\d+)/);
  if (numMatch) {
    tNom = `Territorio ${numMatch[1]}`;
  } else if (String(info.territorioId || "").toLowerCase().includes("negocios")) {
    tNom = "Negocios";
  }

  const rawLbl = info.label ? String(info.label).trim() : "";
  const cNom = rawLbl
    ? (/^cuadra/i.test(rawLbl) ? rawLbl : `Cuadra ${rawLbl}`)
    : (info.cuadraId ? String(info.cuadraId).replace(/^.*?Cuadra/i, "Cuadra ") : "Cuadra");

  return `📍 ${tNom}, ${cNom}`;
}

// Navegación / Cómo llegar (Abre Google Maps / Apple Maps con ruta paso a paso)
window.comoLlegarACoord = function (destLat, destLng, titulo) {
  if (!destLat || !destLng) {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto("Coordenadas no disponibles para trazar ruta", "🧭");
    } else {
      alert("Coordenadas no disponibles para trazar ruta.");
    }
    return;
  }
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  let url = "";
  if (esIOS) {
    // Abre Apple Maps en modo caminar con fallback directo
    url = `maps://?daddr=${destLat},${destLng}&dirflg=w`;
  } else {
    // Abre Google Maps en modo navegación a pie
    url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
  }

  // Si en iOS no se abre con el esquema custom, abrir link de Google Maps
  const win = window.open(url, "_blank");
  if (!win && esIOS) {
    window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
  }
};

// Calcular distancia relativa desde el usuario hasta un punto
window.calcularDistanciaAUsuario = function (targetLat, targetLng) {
  if (!window.userCurrentLocation || !window.userCurrentLocation.lat || !targetLat || !targetLng) return null;
  try {
    const from = turf.point([window.userCurrentLocation.lon, window.userCurrentLocation.lat]);
    const to = turf.point([targetLng, targetLat]);
    const distKm = turf.distance(from, to, { units: 'kilometers' });
    if (distKm < 1) {
      return Math.round(distKm * 1000) + " m";
    }
    return distKm.toFixed(1) + " km";
  } catch (e) {
    return null;
  }
};

function activarUbicacion() {
  const menuPanel = document.getElementById("menu-panel");
  const btnUbicacion = document.getElementById("btnUbicacion");
  const btnFloatingGps = document.getElementById("btnFloatingGps");
  const bannerTop = document.getElementById("gpsBannerTop");
  const bannerText = document.getElementById("gpsBannerText");

  if (!navigator.geolocation) {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto("Tu dispositivo no soporta geolocalización", "⚠️");
    } else {
      alert("Tu dispositivo o navegador no soporta geolocalización.");
    }
    return;
  }

  if (seguimientoActivo) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    seguimientoActivo = false;
    window.userCurrentLocation = null;
    if (marcadorUbicacion) {
      map.removeLayer(marcadorUbicacion);
      marcadorUbicacion = null;
    }
    if (circuloPrecision) {
      map.removeLayer(circuloPrecision);
      circuloPrecision = null;
    }
    if (btnUbicacion) btnUbicacion.textContent = "📍 Mi Ubicación";
    if (btnFloatingGps) btnFloatingGps.classList.remove("activo");
    if (bannerTop) bannerTop.style.display = "none";
    if (menuPanel && menuPanel.classList.contains("show")) {
      menuPanel.classList.remove("show");
    }
    return;
  }

  const prevLoader = document.getElementById("loaderUbicacion");
  if (prevLoader) prevLoader.remove();

  let loader = document.createElement("div");
  loader.id = "loaderUbicacion";
  loader.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
      z-index: 99999;
    ">
      <div style="
        background: white; padding: 20px 26px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      ">
        <div style="
          width: 42px; height: 42px; border: 4px solid #e2e8f0; border-top: 4px solid #1a73e8;
          border-radius: 50%; animation: spinLoader 0.9s linear infinite;
        "></div>
        <span style="font-size:13px; font-weight:700; color:#1e293b;">Obteniendo ubicación GPS...</span>
      </div>
    </div>
  `;
  document.body.appendChild(loader);

  seguimientoActivo = true;
  if (btnUbicacion) btnUbicacion.textContent = "📍 Detener Ubicación";
  if (btnFloatingGps) btnFloatingGps.classList.add("activo");
  if (bannerTop) {
    bannerTop.style.display = "flex";
    if (bannerText) bannerText.textContent = "📍 Obteniendo señal GPS...";
  }

  const iconoGps = L.divIcon({
    className: "marcador-gps-usuario",
    html: `<div style="width:18px; height:18px; background:#1a73e8; border:3px solid #ffffff; border-radius:50%; box-shadow:0 0 0 6px rgba(26,115,232,0.28), 0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  watchId = navigator.geolocation.watchPosition(
    function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 20;

      // Detectar cuadra y territorio exactos
      const ubicacionTerritorial = window.obtenerUbicacionEnTerritorios(lat, lon);
      window.userCurrentLocation = {
        lat: lat,
        lon: lon,
        accuracy: accuracy,
        info: ubicacionTerritorial
      };

      // Actualizar marcador y círculo de precisión
      if (marcadorUbicacion) {
        marcadorUbicacion.setLatLng([lat, lon]);
      } else {
        marcadorUbicacion = L.marker([lat, lon], { icon: iconoGps, interactive: false }).addTo(map);
        map.flyTo([lat, lon], 17.5, { duration: 0.7 });
      }

      if (circuloPrecision) {
        circuloPrecision.setLatLng([lat, lon]);
        circuloPrecision.setRadius(accuracy);
      } else {
        circuloPrecision = L.circle([lat, lon], {
          radius: accuracy,
          color: "#38bdf8",
          fillColor: "#38bdf8",
          fillOpacity: 0.12,
          weight: 1,
          interactive: false
        }).addTo(map);
      }

      // Actualizar banner discreto superior
      if (bannerTop && bannerText) {
        bannerTop.style.display = "flex";
        bannerText.textContent = formatearUbicacionBanner(ubicacionTerritorial);
      }

      // Refrescar distancias en revisitas si el modal está abierto
      if (typeof window.actualizarDistanciasEnRevisitas === "function") {
        window.actualizarDistanciasEnRevisitas();
      }

      const loaderActivo = document.getElementById("loaderUbicacion");
      if (loaderActivo) loaderActivo.remove();
    },
    function (err) {
      if (typeof window.mostrarToastDiscreto === "function") {
        window.mostrarToastDiscreto("No se pudo obtener la ubicación GPS", "⚠️");
      } else {
        alert("No se pudo obtener la ubicación: " + err.message);
      }
      seguimientoActivo = false;
      if (btnUbicacion) btnUbicacion.textContent = "📍 Mi Ubicación";
      if (btnFloatingGps) btnFloatingGps.classList.remove("activo");
      if (bannerTop) bannerTop.style.display = "none";
      const loaderActivo = document.getElementById("loaderUbicacion");
      if (loaderActivo) loaderActivo.remove();
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 4000 }
  );
}

// ==============================================================================================================================
// 11. Menú Hamburguesa e Inicialización en DOMContentLoaded
// ==============================================================================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar todos los territorios unificados
  inicializarTerritorios();

  // Inicializar eventos de módulos
  inicializarAreaGrande();
  inicializarEventosNotas();
  if (typeof inicializarModuloCapitan === "function") inicializarModuloCapitan();

  // Selects personalizados
  initCustomSelect("customSelectorTerritorios", "selectorTerritorios", cambiarTerritorio);

  // Menú hamburguesa
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const menuPanel = document.getElementById('menu-panel');
  const btnUbicacionMenu = document.getElementById('btnUbicacion');

  // Fijar exclusivamente a numeración original (viejita)
  localStorage.setItem("territorios_version", "anterior");
  window.TERRITORIO_VERSION_ACTIVA = "anterior";

  if (hamburgerBtn && menuPanel) {
    hamburgerBtn.addEventListener('click', (e) => {
      menuPanel.classList.toggle('show');
      e.stopPropagation();
    });

    function cerrarMenu() {
      if (menuPanel.classList.contains('show')) menuPanel.classList.remove('show');
    }

    if (btnUbicacionMenu) {
      btnUbicacionMenu.addEventListener('click', (e) => {
        cerrarMenu();
        activarUbicacion();
        e.stopPropagation();
      });
    }

    document.addEventListener('click', (e) => {
      if (!menuPanel.contains(e.target) && e.target !== hamburgerBtn) {
        cerrarMenu();
      }
    });
  }

  // Botón flotante GPS directo en el mapa
  const btnFloatingGps = document.getElementById('btnFloatingGps');
  if (btnFloatingGps) {
    btnFloatingGps.addEventListener('click', (e) => {
      e.stopPropagation();
      activarUbicacion();
    });
  }

  // Centrar en ubicación desde el banner superior
  const btnGpsCentrar = document.getElementById('btnGpsCentrar');
  if (btnGpsCentrar) {
    btnGpsCentrar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.userCurrentLocation && window.userCurrentLocation.lat) {
        map.flyTo([window.userCurrentLocation.lat, window.userCurrentLocation.lon], 18, { duration: 0.6 });
        if (window.userCurrentLocation.info && window.userCurrentLocation.info.territorioId) {
          if (typeof window.seleccionarTerritorioDirecto === 'function') {
            window.seleccionarTerritorioDirecto(window.userCurrentLocation.info.territorioId);
          }
        }
      }
    });
  }

  // Cerrar banner superior de GPS
  const btnGpsCerrar = document.getElementById('btnGpsCerrar');
  const gpsBannerTop = document.getElementById('gpsBannerTop');
  if (btnGpsCerrar && gpsBannerTop) {
    btnGpsCerrar.addEventListener('click', (e) => {
      e.stopPropagation();
      gpsBannerTop.style.display = 'none';
    });
  }

  // Safari iPhone reset de zoom automático en blur de inputs
  window.addEventListener("focusout", function () {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }
  });
});

window.confirmarResetLocal = function () {
  const menuPanel = document.getElementById('menu-panel');
  if (menuPanel && menuPanel.classList.contains('show')) menuPanel.classList.remove('show');

  if (typeof window.mostrarConfirmacionModal === "function") {
    window.mostrarConfirmacionModal({
      titulo: "¿Borrar datos locales?",
      mensaje: "Se borrarán tus revisitas y notas guardadas exclusivamente en este dispositivo. ¿Deseas continuar?",
      icono: "🗑️",
      textoConfirmar: "Borrar todo",
      peligro: true,
      onConfirm: () => {
        localStorage.removeItem("terrosa_revisitas_data");
        Object.keys(localStorage).forEach(k => {
          if (k.endsWith("_notas")) localStorage.removeItem(k);
        });
        if (typeof window.refrescarIndicadoresNotas === "function") {
          window.refrescarIndicadoresNotas();
        }
        if (typeof window.mostrarToastDiscreto === "function") {
          window.mostrarToastDiscreto("Datos locales borrados con éxito", "🗑️");
        }
      }
    });
  }
};


