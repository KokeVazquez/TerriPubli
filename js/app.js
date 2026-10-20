// ==============================================================================================================================
// === APP PRINCIPAL: TERRITORIOS ROSARIO ===
// ==============================================================================================================================

// ==============================================================================================================================
// 1. Inicialización del Mapa
// ==============================================================================================================================
const TOTAL_CUADRAS = 389; // número total de polígonos/cuadras

var map = L.map("map", {
  maxZoom: 22,
  zoomControl: false,
  doubleClickZoom: false
});

var boundsIniciales = L.latLngBounds([[28.600, -106.075], [28.618, -106.070]]);
map.fitBounds(boundsIniciales, { padding: [5, 5] });

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
  maxZoom: 22
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
  map.flyToBounds(bounds, { padding: [20, 20] });

  map.once('moveend', function () {
    map.setZoom(map.getZoom() + 1.0);
    ocultarLoader();
    if (callback) callback();
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
// 5. Registrar Capitán
// ==============================================================================================================================
function registrarCapitan(pol) {
  popupRegistrarCapitan(pol);
}

function mostrarPopupConfirmacionCentro(mensaje) {
  const popup = document.createElement("div");
  popup.innerText = mensaje;
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: #4caf50;
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    text-align: center;
    max-width: 80%;
  `;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "1";
    popup.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%, -50%) scale(0.8)";
    setTimeout(() => {
      if (document.body.contains(popup)) document.body.removeChild(popup);
    }, 300);
  }, 2000);
}

function popupRegistrarCapitan(pol) {
  const territorioId = pol._territorioId || "territorio";

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;
    z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="
      background:white; padding:25px; border-radius:12px; width:300px; text-align:center;
      box-shadow:0 5px 20px rgba(0,0,0,0.3); position:relative;
    ">
      <button id="cerrarPopupCapitan" style="
        position:absolute; top:8px; right:8px; font-size:18px; border:none; background:none; cursor:pointer;">✖</button>
      <h3 style="margin-bottom:15px; margin-top:0;">Registrar Capitán</h3>
      <input id="inputCapitan" placeholder="Nombre del capitán" style="width:90%; padding:6px; margin-bottom:10px; box-sizing:border-box;"/>
      <input id="inputFecha" type="date" style="width:90%; padding:6px; margin-bottom:15px; box-sizing:border-box;"/>
      <button id="guardarCapitan" style="
        padding:8px 15px; background:#4caf50; color:white; border:none; border-radius:6px; cursor:pointer;
      ">Guardar</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#cerrarPopupCapitan").addEventListener("click", () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  });

  modal.querySelector("#guardarCapitan").addEventListener("click", () => {
    const capitan = modal.querySelector("#inputCapitan").value.trim();
    const fecha = modal.querySelector("#inputFecha").value.trim();
    if (!capitan || !fecha) return alert("Ingresa nombre y fecha");

    let registros = JSON.parse(localStorage.getItem(territorioId + "_capitanes") || "{}");
    if (!registros[pol._id]) registros[pol._id] = [];
    registros[pol._id].push(`Capitán: ${capitan} | Fecha: ${fecha}`);
    localStorage.setItem(territorioId + "_capitanes", JSON.stringify(registros));

    if (document.body.contains(modal)) document.body.removeChild(modal);
    mostrarPopupConfirmacionCentro("Capitán registrado con éxito!");

    pol._selected = true;
    pol.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.9 });

    filtrarPorMes();
  });
}

// ==============================================================================================================================
// 6. Filtrar por Mes
// ==============================================================================================================================
function filtrarPorMes() {
  const filtroMesElem = document.getElementById('filtroMes');
  const mes = filtroMesElem ? filtroMesElem.value : "";
  const mostrarTodos = (mes === "todos");

  // Limpiar iconos anteriores
  window.indicadoresNotas.forEach(m => map.removeLayer(m));
  window.indicadoresNotas = [];

  // Limpiar overlay gris previo
  if (window.overlayGris) {
    map.removeLayer(window.overlayGris);
    window.overlayGris = null;
  }

  const mundo = [[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]];
  let huecos = [];
  window.poligonosSeleccionadosPorMes = [];

  window.todosLosTerritorios.forEach(territorio => {
    const registros = JSON.parse(localStorage.getItem(territorio._id + "_capitanes") || "{}");

    territorio.eachLayer(pol => {
      let trabajadoEsteMes = false;

      (registros[pol._id] || []).forEach(reg => {
        const fecha = reg.split('| Fecha:')[1]?.trim();
        if (fecha) {
          const mesRegistro = fecha.slice(5, 7);
          if (mostrarTodos || mesRegistro === mes.padStart(2, '0')) {
            trabajadoEsteMes = true;
          }
        }
      });

      if (trabajadoEsteMes) {
        pol._selected = true;
        window.poligonosSeleccionadosPorMes.push(pol._id);

        pol.setStyle({
          color: "yellow",
          weight: 5,
          fillColor: "gray",
          fillOpacity: 0.7
        });

        // Crear icono de palomita
        const latlngs = pol.getLatLngs()[0];
        const coords = latlngs.map(ll => [ll.lng, ll.lat]);
        coords.push([coords[0][0], coords[0][1]]);
        const centroide = turf.centroid(turf.polygon([coords]));
        const cLat = centroide.geometry.coordinates[1];
        const cLng = centroide.geometry.coordinates[0];

        const marker = L.marker([cLat, cLng], {
          interactive: false,
          icon: L.divIcon({
            className: "indicador-nota",
            html: "✅",
            iconSize: [25, 25],
            iconAnchor: [12, 12]
          })
        }).addTo(map);

        window.indicadoresNotas.push(marker);

        if (pol.getLatLngs) huecos.push(pol.getLatLngs()[0].map(ll => [ll.lat, ll.lng]));
      } else {
        pol._selected = false;
        pol.setStyle(pol._originalStyle);
      }
    });
  });

  // Calcular porcentaje de avance
  const cantidadPalomitas = window.indicadoresNotas.length;
  const porcentaje = ((cantidadPalomitas / TOTAL_CUADRAS) * 100).toFixed(2);
  const porcentajeElem = document.getElementById("porcentajeAvance");
  if (porcentajeElem) porcentajeElem.textContent = porcentaje + "%";

  // Overlay gris con ventana sobre los trabajados
  if (huecos.length > 0) {
    window.overlayGris = L.polygon([mundo, ...huecos], {
      color: "#000",
      fillColor: "#000",
      fillOpacity: 0.6,
      stroke: false,
      interactive: false
    }).addTo(map);
  }
}

// ==============================================================================================================================
// 7. Enfocar Territorio y Etiquetas
// ==============================================================================================================================
function enfocarTerritorio(grupo) {
  territorioActivo = grupo;

  window.todosLosTerritorios.forEach(t => {
    t.eachLayer(pol => {
      pol.setStyle(pol._originalStyle);
    });
  });

  territorioActivo.eachLayer(pol => {
    pol._territorioId = grupo._id || "territorio";

    pol.setStyle(pol._selected
      ? { color: "gray", fillColor: "gray", fillOpacity: 0.9 }
      : pol._originalStyle
    );

    vincularMenuCuadra(pol, grupo._id);
  });

  if (overlayGris) map.removeLayer(overlayGris);

  var mundo = [[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]];
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

function cambiarTerritorio() {
  map.closePopup();
  var selector = document.getElementById("selectorTerritorios");
  var valor = selector.value;
  selector.blur();

  ocultarMenu();
  etiquetasActivas.forEach(m => map.removeLayer(m));
  etiquetasActivas = [];

  if (valor === "areaGrande") {
    selector.value = "";
    territorioActivo = null;
    flyWithLoader(boundsIniciales);
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

  let presionadoTimeout;

  btnArea.addEventListener("click", function () {
    map.closePopup();
    document.getElementById("selectorTerritorios").value = "";
    ocultarMenu();

    if (overlayGris) {
      map.removeLayer(overlayGris);
      overlayGris = null;
    }

    etiquetasActivas.forEach(m => map.removeLayer(m));
    etiquetasActivas = [];

    window.todosLosTerritorios.forEach(territorio => {
      territorio.eachLayer(pol => {
        pol.setStyle(pol._originalStyle);
      });
    });

    territorioActivo = null;
    flyWithLoader(boundsIniciales);

    const customSelectTerr = document.getElementById("customSelectorTerritorios");
    if (customSelectTerr) {
      const selectedTerr = customSelectTerr.querySelector(".selected");
      if (selectedTerr) selectedTerr.textContent = "-- Selecciona un territorio --";
      customSelectTerr.classList.remove("active");
    }
  });

  function resetFiltroMes() {
    const filtroMes = document.getElementById("filtroMes");
    const customSelect = document.getElementById("customFiltroMes");
    if (filtroMes) filtroMes.value = "inicio";
    if (customSelect) {
      const selected = customSelect.querySelector(".selected");
      if (selected) selected.textContent = "Mes";
    }
    filtrarPorMes();
  }

  btnArea.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    resetFiltroMes();
  });

  btnArea.addEventListener("mousedown", function () {
    presionadoTimeout = setTimeout(resetFiltroMes, 800);
  });
  btnArea.addEventListener("mouseup", () => clearTimeout(presionadoTimeout));
  btnArea.addEventListener("mouseleave", () => clearTimeout(presionadoTimeout));
  btnArea.addEventListener("touchstart", function () {
    presionadoTimeout = setTimeout(resetFiltroMes, 800);
  });
  btnArea.addEventListener("touchend", () => clearTimeout(presionadoTimeout));
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
// 10. Geolocalización
// ==============================================================================================================================
let marcadorUbicacion = null;
let seguimientoActivo = false;
let watchId = null;

function activarUbicacion() {
  const btnAreaGrande = document.getElementById("btnAreaGrande");
  const menuPanel = document.getElementById('menu-panel');

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }

  if (seguimientoActivo) {
    navigator.geolocation.clearWatch(watchId);
    seguimientoActivo = false;
    if (marcadorUbicacion) {
      map.removeLayer(marcadorUbicacion);
      marcadorUbicacion = null;
    }
    if (btnAreaGrande) btnAreaGrande.click();
    if (menuPanel && menuPanel.classList.contains('show')) {
      menuPanel.classList.remove('show');
    }
    return;
  }

  let loader = document.createElement('div');
  loader.id = "loaderUbicacion";
  loader.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      z-index: 99999;
    ">
      <div style="
        width: 60px; height: 60px; border: 6px solid #fff; border-top: 6px solid #3498db;
        border-radius: 50%; animation: spinLoader 1s linear infinite;
      "></div>
    </div>
  `;
  document.body.appendChild(loader);

  seguimientoActivo = true;

  watchId = navigator.geolocation.watchPosition(
    function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      if (marcadorUbicacion) {
        marcadorUbicacion.setLatLng([lat, lon]);
      } else {
        marcadorUbicacion = L.marker([lat, lon]).addTo(map);
        map.setView([lat, lon], 17);
      }

      const loaderActivo = document.getElementById("loaderUbicacion");
      if (loaderActivo) loaderActivo.remove();
    },
    function (err) {
      alert("Error al obtener ubicación: " + err.message);
      seguimientoActivo = false;
      const loaderActivo = document.getElementById("loaderUbicacion");
      if (loaderActivo) loaderActivo.remove();
    },
    { enableHighAccuracy: true }
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
  inicializarEventosTerminados();

  // Selects personalizados
  initCustomSelect("customFiltroMes", "filtroMes", filtrarPorMes);
  initCustomSelect("customSelectorTerritorios", "selectorTerritorios", cambiarTerritorio);

  // Filtro de mes eventos nativos
  const filtroMes = document.getElementById("filtroMes");
  if (filtroMes) {
    filtroMes.addEventListener("input", filtrarPorMes);
    filtroMes.addEventListener("change", filtrarPorMes);
  }

  // Menú hamburguesa
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const menuPanel = document.getElementById('menu-panel');
  const backupBtnMenu = document.getElementById('btnCopiaSeguridad');
  const restoreBtnMenu = document.getElementById('btnRestaurar');
  const btnUbicacionMenu = document.getElementById('btnUbicacion');

  if (hamburgerBtn && menuPanel) {
    hamburgerBtn.addEventListener('click', (e) => {
      menuPanel.classList.toggle('show');
      e.stopPropagation();
    });

    function cerrarMenu() {
      if (menuPanel.classList.contains('show')) menuPanel.classList.remove('show');
    }

    if (backupBtnMenu) {
      backupBtnMenu.addEventListener('click', (e) => {
        cerrarMenu();
        hacerCopiaSeguridad();
        e.stopPropagation();
      });
    }

    if (restoreBtnMenu) {
      restoreBtnMenu.addEventListener('click', (e) => {
        cerrarMenu();
        restaurarCopia();
        e.stopPropagation();
      });
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

  // Safari iPhone reset de zoom automático en blur de inputs
  window.addEventListener("focusout", function () {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }
  });
});

