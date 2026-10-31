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

  // Actualizar URL en barra del navegador con deep link (?t=X) sin recargar la página
  try {
    if (grupo && grupo._id && window.history && window.history.replaceState) {
      const numMatch = String(grupo._id).match(/(\d+)/);
      const paramVal = numMatch ? numMatch[1] : (String(grupo._id).toLowerCase().includes("negocios") ? "negocios" : grupo._id);
      const url = new URL(window.location);
      url.searchParams.set("t", paramVal);
      url.searchParams.delete("c");
      window.history.replaceState(null, "", url.toString());
    }
  } catch (e) {}

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
window.seleccionarTerritorioDirecto = function (territorioId, callbackOnEnfocado) {
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
    if (typeof callbackOnEnfocado === "function") {
      callbackOnEnfocado();
    }
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

  if (valor === "areaGrande" || valor === "" || !valor) {
    document.querySelectorAll(".s12-modal-overlay").forEach(m => m.remove());
    territorioActivo = null;
    window.territorioActivo = null;
    if (typeof window.ocultarTarjetaInfoCapitan === "function") {
      window.ocultarTarjetaInfoCapitan();
    }
    const tarjetaFlotante = document.getElementById("tarjetaInfoCapitan");
    if (tarjetaFlotante) {
      tarjetaFlotante.classList.remove("visible");
      tarjetaFlotante.style.display = "none";
    }
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
// 7.5 Enlaces Directos / Deep Links y Compartir Territorio (WhatsApp / Web Share)
// ==============================================================================================================================

// Compartir enlace directo a un territorio (o al territorio actualmente enfocado)
window.compartirTerritorioLink = async function (territorioId, cuadraLabel) {
  let targetId = territorioId;
  if (!targetId && window.territorioActivo) {
    targetId = window.territorioActivo._id;
  }

  const loc = window.location;
  const baseUrl = loc.protocol + "//" + loc.host + loc.pathname;

  let link = baseUrl;
  let nomVisible = "Territorios Rosario";
  let textoCuadra = "";

  if (targetId) {
    const numMatch = String(targetId).match(/(\d+)/);
    const numT = numMatch ? numMatch[1] : (String(targetId).toLowerCase().includes("negocios") ? "negocios" : targetId);
    nomVisible = formatearNombreTerritorioCorto(targetId);
    link = `${baseUrl}?t=${numT}`;

    if (cuadraLabel) {
      link += `&c=${encodeURIComponent(cuadraLabel)}`;
      textoCuadra = ` • Cuadra ${cuadraLabel}`;
    }
  }

  const mensajeTexto = `*${nomVisible}${textoCuadra}* (Congregación Rosario)\n\nAbre el mapa directamente aquí:\n${link}`;

  // Intentar compartir con Web Share API nativo (100% compatible con iPhone Safari y Android)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${nomVisible} - Territorios Rosario`,
        text: mensajeTexto,
        url: link
      });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }

  // Fallback 1: Copiar enlace al portapapeles
  let copiado = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(link);
      copiado = true;
    } catch (e) {}
  }

  if (copiado) {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto("Enlace copiado al portapapeles");
    }
  } else {
    // Fallback 2: Abrir WhatsApp Web con el texto preparado
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensajeTexto)}`;
    window.open(waUrl, "_blank");
  }
};

// Enfocar una cuadra específica dentro de un territorio por su letra o número (?c=B o ?c=2)
function enfocarCuadraEspecifica(territorioId, cuadraQuery) {
  if (!window.todosLosTerritorios || !cuadraQuery) return;
  const tGrupo = window.todosLosTerritorios.find(t => t._id === territorioId);
  if (!tGrupo) return;

  const q = String(cuadraQuery).trim().toLowerCase();
  let polEncontrado = null;

  tGrupo.eachLayer(pol => {
    if (polEncontrado) return;
    const label = pol._label ? String(pol._label).trim().toLowerCase() : "";
    const id = pol._id ? String(pol._id).trim().toLowerCase() : "";
    if (label === q || id.endsWith(q) || id === q || id.includes("cuadra" + q)) {
      polEncontrado = pol;
    }
  });

  if (polEncontrado && polEncontrado.getBounds) {
    map.flyToBounds(polEncontrado.getBounds(), { maxZoom: 18.5, duration: 0.8 });
    try {
      const origStyle = polEncontrado._originalStyle || { weight: 2, dashArray: null, color: polEncontrado.options.color };
      polEncontrado.setStyle({ weight: 4, dashArray: "6, 4", color: "#2563eb", opacity: 1 });
      const el = (polEncontrado.getElement && polEncontrado.getElement()) || polEncontrado._path;
      if (el) el.classList.add("gps-cuadra-activa");
      setTimeout(() => {
        polEncontrado.setStyle(origStyle);
        if (el) el.classList.remove("gps-cuadra-activa");
      }, 5000);
    } catch (e) {}
  }
}

// Analizar parámetros de URL al abrir la app (?t=24 o ?t=negocios &c=B)
function procesarDeepLink() {
  try {
    const params = new URLSearchParams(window.location.search);
    let tParam = params.get('t') || params.get('territorio');
    let cuadraParam = params.get('c') || params.get('cuadra');

    // Soporte para formato de hash (#t=24 o #t=24&c=1)
    if (!tParam && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));
      tParam = hashParams.get('t') || hashParams.get('territorio');
      if (!cuadraParam) cuadraParam = hashParams.get('c') || hashParams.get('cuadra');
    }

    if (!tParam) return;

    tParam = tParam.trim().toLowerCase();
    let targetTerritorioId = "";
    if (tParam === "negocios" || tParam === "territorionegocios") {
      targetTerritorioId = "territorionegocios";
    } else {
      const numMatch = tParam.match(/(\d+)/);
      if (numMatch) {
        targetTerritorioId = "territorio" + numMatch[1];
      }
    }

    if (!targetTerritorioId) return;

    // Dar tiempo al mapa para inicializar antes de enfocar el territorio
    setTimeout(() => {
      if (typeof window.seleccionarTerritorioDirecto === "function") {
        window.seleccionarTerritorioDirecto(targetTerritorioId, function () {
          if (cuadraParam) {
            enfocarCuadraEspecifica(targetTerritorioId, cuadraParam);
          }
        });

        const nomVisible = formatearNombreTerritorioCorto(targetTerritorioId);
        if (typeof window.mostrarToastDiscreto === "function") {
          window.mostrarToastDiscreto(`Mostrando ${nomVisible}${cuadraParam ? ' (Cuadra ' + cuadraParam + ')' : ''}`);
        }
      }
    }, 450);
  } catch (e) {
    console.error("Error al procesar deep link:", e);
  }
}

// ==============================================================================================================================
// 8. Botón Área Grande
// ==============================================================================================================================
function inicializarAreaGrande() {
  const btnArea = document.getElementById("btnAreaGrande");
  if (!btnArea) return;

  btnArea.addEventListener("click", function () {
    // 1. Cerrar cualquier modal S-12 abierto
    document.querySelectorAll(".s12-modal-overlay").forEach(m => m.remove());

    // 2. Anular territorio activo INMEDIATAMENTE para que ejecutarFiltroFecha no lo vuelva a abrir
    territorioActivo = null;
    window.territorioActivo = null;

    // 3. Ocultar popups y tarjeta informativa flotante de capitán
    map.closePopup();
    if (typeof window.ocultarTarjetaInfoCapitan === "function") {
      window.ocultarTarjetaInfoCapitan();
    }
    const tarjetaFlotante = document.getElementById("tarjetaInfoCapitan");
    if (tarjetaFlotante) {
      tarjetaFlotante.classList.remove("visible");
      tarjetaFlotante.style.display = "none";
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

    // Limpiar parámetro ?t= de la URL al volver a Área Grande
    try {
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location);
        url.searchParams.delete("t");
        url.searchParams.delete("c");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
      }
    } catch (e) {}

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

let cuadraResaltadaPorGps = null;
let ultimaNotificacionTerritorio = null;
let ultimoTiempoNotificacion = 0;

function limpiarResaltadoCuadraGps() {
  if (cuadraResaltadaPorGps) {
    try {
      if (cuadraResaltadaPorGps._originalStyle) {
        cuadraResaltadaPorGps.setStyle(cuadraResaltadaPorGps._originalStyle);
      } else {
        cuadraResaltadaPorGps.setStyle({ weight: 2, dashArray: null });
      }
      const el = cuadraResaltadaPorGps.getElement ? cuadraResaltadaPorGps.getElement() : null;
      if (el) el.classList.remove("gps-cuadra-activa");
    } catch (e) {}
    cuadraResaltadaPorGps = null;
  }
}

// Formateador amigable de nombres de territorio
function formatearNombreTerritorioCorto(territorioId) {
  if (!territorioId) return "Territorio";
  const numMatch = String(territorioId).match(/(\d+)/);
  if (numMatch) return `Territorio ${numMatch[1]}`;
  if (String(territorioId).toLowerCase().includes("negocios")) return "Territorio Negocios";
  return String(territorioId);
}

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
          let latlngs = pol.getLatLngs();
          while (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
            latlngs = latlngs[0];
          }
          if (!latlngs || latlngs.length < 3) return;
          const coords = latlngs.map(ll => [ll.lng, ll.lat]);
          const first = coords[0];
          const last = coords[coords.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            coords.push([first[0], first[1]]);
          }
          if (coords.length < 4) return;
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

// Formateador amigable de nombres (ej: "Territorio 3 • Cuadra 1")
function formatearUbicacionBanner(info) {
  if (!info) return "Estás fuera de los territorios";
  const tNom = formatearNombreTerritorioCorto(info.territorioId);
  const rawLbl = info.label ? String(info.label).trim() : "";
  const cNom = rawLbl
    ? (/^cuadra/i.test(rawLbl) ? rawLbl : `Cuadra ${rawLbl}`)
    : (info.cuadraId ? String(info.cuadraId).replace(/^.*?Cuadra/i, "Cuadra ") : "Cuadra");

  return `${tNom} • ${cNom}`;
}

// Enfocar el territorio donde está parado el usuario y centrar la vista
window.enfocarTerritorioActualUsuario = function () {
  if (window.userCurrentLocation && window.userCurrentLocation.info && window.userCurrentLocation.info.territorioId) {
    const tId = window.userCurrentLocation.info.territorioId;
    if (typeof window.seleccionarTerritorioDirecto === 'function') {
      window.seleccionarTerritorioDirecto(tId);
    }
    if (window.userCurrentLocation.lat && window.userCurrentLocation.lon) {
      setTimeout(() => {
        map.flyTo([window.userCurrentLocation.lat, window.userCurrentLocation.lon], 18, { duration: 0.6 });
      }, 350);
    }
  } else if (window.userCurrentLocation && window.userCurrentLocation.lat) {
    map.flyTo([window.userCurrentLocation.lat, window.userCurrentLocation.lon], 18, { duration: 0.6 });
  }
};

// Navegación / Cómo llegar (Abre Google Maps / Apple Maps con ruta paso a paso)
window.comoLlegarACoord = function (destLat, destLng, titulo) {
  if (!destLat || !destLng) {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto("Coordenadas no disponibles para trazar ruta");
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
      window.mostrarToastDiscreto("Tu dispositivo no soporta geolocalización");
    }
    return;
  }

  if (seguimientoActivo) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    seguimientoActivo = false;
    window.userCurrentLocation = null;
    limpiarResaltadoCuadraGps();
    ultimaNotificacionTerritorio = null;
    if (marcadorUbicacion) {
      map.removeLayer(marcadorUbicacion);
      marcadorUbicacion = null;
    }
    if (circuloPrecision) {
      map.removeLayer(circuloPrecision);
      circuloPrecision = null;
    }
    if (btnUbicacion) btnUbicacion.textContent = "Mi Ubicación";
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
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; height: 100dvh;
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
  if (btnUbicacion) btnUbicacion.textContent = "Detener Ubicación";
  if (btnFloatingGps) btnFloatingGps.classList.add("activo");
  if (bannerTop) {
    bannerTop.style.display = "flex";
    if (bannerText) bannerText.textContent = "Obteniendo señal GPS...";
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

      // Actualizar banner discreto superior y botón de acción directa
      if (bannerTop && bannerText) {
        bannerTop.style.display = "flex";
        bannerText.textContent = formatearUbicacionBanner(ubicacionTerritorial);

        const btnVerTerr = document.getElementById("btnGpsVerTerritorio");
        const pulseDot = document.getElementById("gpsPulseDot");

        if (ubicacionTerritorial && ubicacionTerritorial.territorioId) {
          if (pulseDot) pulseDot.className = "gps-pulse-dot activo-territorio";

          const terrActivoId = window.territorioActivo ? window.territorioActivo._id : "";
          if (btnVerTerr) {
            btnVerTerr.style.display = "inline-flex";
            if (terrActivoId === ubicacionTerritorial.territorioId) {
              btnVerTerr.textContent = "Enfocado";
              btnVerTerr.title = "Ya estás viendo este territorio";
              btnVerTerr.style.opacity = "0.75";
            } else {
              btnVerTerr.textContent = "Ver territorio";
              btnVerTerr.title = "Enfocar este territorio en el mapa";
              btnVerTerr.style.opacity = "1";
            }
          }
        } else {
          if (pulseDot) pulseDot.className = "gps-pulse-dot fuera";
          if (btnVerTerr) btnVerTerr.style.display = "none";
        }
      }

      // Resaltado visual en el mapa de la cuadra donde está caminando el usuario
      if (ubicacionTerritorial && ubicacionTerritorial.poligono) {
        if (cuadraResaltadaPorGps !== ubicacionTerritorial.poligono) {
          limpiarResaltadoCuadraGps();
          cuadraResaltadaPorGps = ubicacionTerritorial.poligono;
          try {
            cuadraResaltadaPorGps.setStyle({
              weight: 4,
              dashArray: "6, 4",
              color: "#2563eb",
              opacity: 1
            });
            const el = cuadraResaltadaPorGps.getElement ? cuadraResaltadaPorGps.getElement() : null;
            if (el) el.classList.add("gps-cuadra-activa");
          } catch (e) {}
        }
      } else {
        limpiarResaltadoCuadraGps();
      }

      // Notificación toast discreta al entrar a un territorio o cambiar de territorio
      const ahora = Date.now();
      if (ubicacionTerritorial && ubicacionTerritorial.territorioId) {
        if (ultimaNotificacionTerritorio !== ubicacionTerritorial.territorioId && (ahora - ultimoTiempoNotificacion > 10000)) {
          ultimaNotificacionTerritorio = ubicacionTerritorial.territorioId;
          ultimoTiempoNotificacion = ahora;
          const nomT = formatearNombreTerritorioCorto(ubicacionTerritorial.territorioId);
          const rawLbl = ubicacionTerritorial.label ? String(ubicacionTerritorial.label).trim() : "";
          const lblC = rawLbl ? (/^cuadra/i.test(rawLbl) ? rawLbl : `Cuadra ${rawLbl}`) : "";
          if (typeof window.mostrarToastDiscreto === "function") {
            window.mostrarToastDiscreto(`${nomT}${lblC ? ' • ' + lblC : ''}`);
          }
        }
      } else {
        ultimaNotificacionTerritorio = null;
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
        window.mostrarToastDiscreto("No se pudo obtener la ubicación GPS");
      }
      seguimientoActivo = false;
      limpiarResaltadoCuadraGps();
      ultimaNotificacionTerritorio = null;
      if (btnUbicacion) btnUbicacion.textContent = "Mi Ubicación";
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

  // Inicializar Control de Tema (Claro, Auto, Oscuro)
  inicializarSelectorTema();

  // Procesar enlace directo / Deep Link al abrir la aplicación (?t=24 o ?t=negocios &c=B)
  procesarDeepLink();

  if (hamburgerBtn && menuPanel) {
    hamburgerBtn.addEventListener('click', (e) => {
      const btnShareMenu = document.getElementById('btnMenuCompartirApp');
      if (btnShareMenu) {
        if (window.territorioActivo && window.territorioActivo._id) {
          const nom = formatearNombreTerritorioCorto(window.territorioActivo._id);
          btnShareMenu.textContent = `Compartir ${nom}`;
        } else {
          btnShareMenu.textContent = "Compartir enlace";
        }
      }
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

    const btnS12Menu = document.getElementById('btnMenuTarjetaS12');
    if (btnS12Menu) {
      btnS12Menu.addEventListener('click', (e) => {
        cerrarMenu();
        if (typeof window.abrirModalTarjetaS12 === 'function') window.abrirModalTarjetaS12();
        e.stopPropagation();
      });
    }

    const btnShareLink = document.getElementById('btnMenuCompartirApp');
    if (btnShareLink) {
      btnShareLink.addEventListener('click', (e) => {
        cerrarMenu();
        if (typeof window.compartirTerritorioLink === 'function') window.compartirTerritorioLink();
        e.stopPropagation();
      });
    }

    const btnResetMenu = document.getElementById('btnMenuLimpiarDatos');
    if (btnResetMenu) {
      btnResetMenu.addEventListener('click', (e) => {
        cerrarMenu();
        if (typeof window.confirmarResetLocal === 'function') window.confirmarResetLocal();
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

  // Centrar o enfocar territorio desde el banner superior de GPS
  const btnGpsCentrar = document.getElementById('btnGpsCentrar');
  const btnGpsVerTerr = document.getElementById('btnGpsVerTerritorio');
  const gpsBannerText = document.getElementById('gpsBannerText');

  if (btnGpsCentrar) {
    btnGpsCentrar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.enfocarTerritorioActualUsuario === 'function') {
        window.enfocarTerritorioActualUsuario();
      }
    });
  }

  if (btnGpsVerTerr) {
    btnGpsVerTerr.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.enfocarTerritorioActualUsuario === 'function') {
        window.enfocarTerritorioActualUsuario();
      }
    });
  }

  if (gpsBannerText) {
    gpsBannerText.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.enfocarTerritorioActualUsuario === 'function') {
        window.enfocarTerritorioActualUsuario();
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
      icono: "",
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
          window.mostrarToastDiscreto("Datos locales borrados con éxito");
        }
      }
    });
  }
};

// ==============================================================================================================================
// 12. Gestión de Tema Visual (Claro / Auto / Oscuro)
// ==============================================================================================================================
function inicializarSelectorTema() {
  const botonesTema = document.querySelectorAll(".btn-theme-opt");
  const temaGuardado = localStorage.getItem("terrosa_tema_visual") || "auto";

  function aplicarTema(modo) {
    let esOscuro = false;
    if (modo === "oscuro") {
      esOscuro = true;
    } else if (modo === "claro") {
      esOscuro = false;
    } else {
      // Auto (Predeterminado): se rige exclusivamente por el ajuste del sistema del dispositivo
      esOscuro = Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    document.body.classList.toggle("modo-oscuro", esOscuro);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", esOscuro ? "#0f172a" : "#e5e3df");
    }

    botonesTema.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-theme") === modo);
    });
  }

  botonesTema.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      if (typeof window.reproducirSonidoClick === "function") window.reproducirSonidoClick("tap");
      const nuevoModo = btn.getAttribute("data-theme");
      localStorage.setItem("terrosa_tema_visual", nuevoModo);
      aplicarTema(nuevoModo);

      const nombres = { claro: "Modo Claro", auto: "Modo Automático", oscuro: "Modo Oscuro" };
      if (typeof window.mostrarToastDiscreto === "function") {
        window.mostrarToastDiscreto(nombres[nuevoModo] || "Tema actualizado");
      }
    };
  });

  // Escuchar cambios de preferencia del sistema si está en 'auto'
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const modoAct = localStorage.getItem("terrosa_tema_visual") || "auto";
      if (modoAct === "auto") aplicarTema("auto");
    });
  }

  aplicarTema(temaGuardado);
}



