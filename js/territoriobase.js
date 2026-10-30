// =============================
// === Territorio Base ===
// =============================

let _ultimoMenuAbierto = 0;

function vincularMenuCuadra(pol, territorioId) {
  const tId = territorioId || pol._territorioId || "territorio";
  pol._territorioId = tId;

  // 1. Clic para computadoras y ratón (Leaflet event en PC)
  pol.off('click');
  pol.on('click', function (e) {
    if (e && e.originalEvent) {
      e.originalEvent.stopPropagation();
    }
    // Si no hay territorio enfocado o se hace clic en un territorio distinto, enfocar ese territorio
    if (!window.territorioActivo || window.territorioActivo._id !== tId) {
      if (typeof window.seleccionarTerritorioDirecto === 'function') {
        window.seleccionarTerritorioDirecto(tId);
      }
    }
  });

  // 2. Clic derecho en PC (Leaflet event) -> Abre el menú de la cuadra
  pol.off('contextmenu');
  pol.on('contextmenu', function (e) {
    if (e && e.originalEvent) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
    }
    mostrarMenu(e, pol, null, tId);
  });

  // 3. Toque y pulsación nativa directa en móvil
  function attachPathTouch() {
    const el = pol.getElement ? pol.getElement() : pol._path;
    if (!el) return;

    let pressTimer = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let hasMoved = false;

    if (el._touchCleanup) {
      el._touchCleanup();
    }

    function onTouchStart(e) {
      hasMoved = false;
      startTime = Date.now();
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if (t) {
        startX = t.clientX;
        startY = t.clientY;
      }
      clearTimeout(pressTimer);
      // Pulsación prolongada: 1 segundo (1000ms) para abrir el menú
      pressTimer = setTimeout(() => {
        if (!hasMoved) {
          mostrarMenu({ clientX: startX, clientY: startY }, pol, null, tId);
        }
      }, 1000);
    }

    function onTouchMove(e) {
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if (t) {
        let dx = Math.abs(t.clientX - startX);
        let dy = Math.abs(t.clientY - startY);
        if (dx > 12 || dy > 12) {
          hasMoved = true;
          clearTimeout(pressTimer);
        }
      }
    }

    function onTouchEnd(e) {
      clearTimeout(pressTimer);
      const touchDuration = Date.now() - startTime;
      // Si fue un toque rápido (menos de 600ms) sin arrastrar el mapa:
      if (!hasMoved && touchDuration < 600) {
        // Si no hay territorio activo o tocamos un territorio distinto, cambiar y enfocarlo de una
        if (!window.territorioActivo || window.territorioActivo._id !== tId) {
          if (typeof window.seleccionarTerritorioDirecto === 'function') {
            window.seleccionarTerritorioDirecto(tId);
          }
        }
      }
    }

    function onTouchCancel() {
      clearTimeout(pressTimer);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    el._touchCleanup = function () {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }

  if (pol.getElement && pol.getElement()) {
    attachPathTouch();
  } else {
    pol.on('add', attachPathTouch);
  }
}

// Distingue cuadras reales predicables de baldíos, escuelas, parques o supermercados
window.esCuadraPredicable = function (pol) {
  if (!pol) return false;
  const id = String(pol.id || pol._id || "");
  const label = pol.label !== undefined ? pol.label : pol._label;
  const lblStr = label !== null && label !== undefined ? String(label).trim() : "";
  return id.startsWith("Cuadra") || (/^\d+$/.test(lblStr));
};

function crearTerritorio(datosTerritorio) {
  // ------------------------------
  // 1. Crear grupo
  // ------------------------------
  var grupo = L.featureGroup().addTo(map);
  grupo._id = datosTerritorio.id;

  // ------------------------------
  // 2. Notas guardadas
  // ------------------------------
  var notasPoligonos = JSON.parse(localStorage.getItem(datosTerritorio.id + "_notas") || "{}");

  // ------------------------------
  // 3. Crear polígonos
  // ------------------------------
  datosTerritorio.poligonos.forEach(function (d) {
    var pol = L.polygon(d.coords, {
      color: d.color,
      fillOpacity: d.fillOpacity,
      weight: d.weight
    }).addTo(grupo);

    pol._id = d.id;
    pol._territorioId = datosTerritorio.id;
    pol._link = d.link;
    pol._esPredicable = window.esCuadraPredicable(d);

    // Guardamos estilo original
    pol._originalStyle = {
      color: pol.options.color,
      fillColor: pol.options.fillColor || pol.options.color,
      fillOpacity: pol.options.fillOpacity,
      weight: pol.options.weight
    };

    pol._selected = false;

    // Etiqueta
    if (d.label) pol._label = d.label;

    // Vincular menú para clic simple, clic derecho y pulsación prolongada
    vincularMenuCuadra(pol, datosTerritorio.id);
  });

  // ------------------------------
  // 4. Agregar a la lista global
  // ------------------------------
  window.todosLosTerritorios = window.todosLosTerritorios || [];
  window.todosLosTerritorios.push(grupo);

  return { grupo: grupo, notasPoligonos: notasPoligonos };
}

// =============================
// === Menú contextual ===
// =============================

window.abrirUbicacionCuadra = function () {
  const menu = document.getElementById("menuContextual");
  const link = menu ? menu.getAttribute("data-link") : "";
  if (link && link.trim() !== "" && link !== "undefined") {
    window.open(link, "_blank");
  } else {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto("Ubicación de Google Maps no disponible para esta cuadra", "📍");
    } else {
      alert("Ubicación de Google Maps no disponible para esta cuadra.");
    }
  }
  ocultarMenu(true);
};

window.navegarCuadraMenu = function () {
  const menu = document.getElementById("menuContextual");
  const lat = parseFloat(menu ? menu.getAttribute("data-lat") : "0");
  const lng = parseFloat(menu ? menu.getAttribute("data-lng") : "0");
  const titulo = menu ? menu.getAttribute("data-titulo") : "Cuadra";
  ocultarMenu(true);
  if (lat && lng && typeof window.comoLlegarACoord === "function") {
    window.comoLlegarACoord(lat, lng, titulo);
  } else {
    window.abrirUbicacionCuadra();
  }
};

window.compartirWhatsAppCuadra = function () {
  const menu = document.getElementById("menuContextual");
  const linkMaps = menu ? menu.getAttribute("data-link") : "";
  const titulo = menu ? menu.getAttribute("data-titulo") : "Cuadra de Territorio";
  const tId = menu ? menu.getAttribute("data-territorio-id") : "";
  const cLabel = menu ? menu.getAttribute("data-cuadra-label") : "";

  // Generar enlace directo a la App de Territorios Rosario
  const loc = window.location;
  const baseUrl = loc.protocol + "//" + loc.host + loc.pathname;
  let numT = (String(tId).match(/(\d+)/) || [,""])[1];
  if (!numT && String(tId).toLowerCase().includes("negocios")) numT = "negocios";

  let linkApp = `${baseUrl}?t=${numT || tId}`;
  if (cLabel) linkApp += `&c=${encodeURIComponent(cLabel)}`;

  const mensaje = `📍 *${titulo}* (Territorios Rosario)\n\n📲 *Abrir directo en la App:* \n${linkApp}` +
    (linkMaps && linkMaps !== "undefined" && linkMaps.trim() !== "" ? `\n\n🗺️ *Abrir en Google Maps:* \n${linkMaps}` : "");

  // Soporte nativo para iPhone Safari y Android (menú compartir del sistema)
  if (navigator.share) {
    navigator.share({
      title: `${titulo} - Territorios Rosario`,
      text: mensaje,
      url: linkApp
    }).catch(err => {
      if (err && err.name !== "AbortError") {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, "_blank");
      }
    });
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`, "_blank");
  }
  ocultarMenu(true);
};

function mostrarMenu(e, pol, notasPoligonos, territorioId) {
  const menu = document.getElementById("menuContextual");
  if (!menu) return;

  const tId = territorioId || pol._territorioId || "territorio";
  const link = pol._link || "";
  const pId = pol._id || "";

  // Formato exacto: "Territorio X, Cuadra Y"
  let nombreTerritorio = "Territorio";
  const numMatch = tId.match(/(\d+)/);
  if (numMatch) {
    nombreTerritorio = `Territorio ${numMatch[1]}`;
  } else if (tId.toLowerCase().includes("negocios")) {
    nombreTerritorio = "Negocios";
  }

  const rawLabel = pol._label ? String(pol._label).trim() : "";
  const nombreCuadra = rawLabel
    ? (/^cuadra/i.test(rawLabel) ? rawLabel : `Cuadra ${rawLabel}`)
    : (pol._id ? String(pol._id).replace(/^Cuadra/i, "Cuadra ") : "Cuadra");
  const tituloCompleto = `${nombreTerritorio}, ${nombreCuadra}`;

  let cLat = 0, cLng = 0;
  if (pol && pol.getBounds) {
    try {
      const center = pol.getBounds().getCenter();
      cLat = center.lat;
      cLng = center.lng;
    } catch (e) {}
  }

  // Guardar datos en atributos para uso de botones
  menu.setAttribute("data-link", link);
  menu.setAttribute("data-titulo", tituloCompleto);
  menu.setAttribute("data-lat", cLat);
  menu.setAttribute("data-lng", cLng);
  menu.setAttribute("data-territorio-id", tId);
  menu.setAttribute("data-cuadra-label", rawLabel || pId);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (e) {
    if (typeof e.clientX === 'number' && e.clientX > 0) {
      x = e.clientX;
      y = e.clientY;
    } else if (e.containerPoint) {
      x = e.containerPoint.x;
      y = e.containerPoint.y;
    } else if (e.originalEvent) {
      const oe = e.originalEvent;
      if (typeof oe.clientX === 'number' && oe.clientX > 0) {
        x = oe.clientX;
        y = oe.clientY;
      } else if (oe.touches && oe.touches.length > 0) {
        x = oe.touches[0].clientX;
        y = oe.touches[0].clientY;
      } else if (oe.changedTouches && oe.changedTouches.length > 0) {
        x = oe.changedTouches[0].clientX;
        y = oe.changedTouches[0].clientY;
      }
    } else if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
    }
  }

  // Si no se detectó coordenada directa, centrar sobre la cuadra en pantalla
  if (x === window.innerWidth / 2 && pol && pol.getBounds && window.map) {
    try {
      const pt = window.map.latLngToContainerPoint(pol.getBounds().getCenter());
      x = pt.x;
      y = pt.y;
    } catch (err) {}
  }

  // Prevenir que el menú se salga de los bordes o quede oculto tras las barras superior/inferior
  const menuWidth = 205;
  const menuHeight = 225;
  if (x + menuWidth > window.innerWidth - 12) x = window.innerWidth - menuWidth - 12;
  if (x < 12) x = 12;
  if (y + menuHeight > window.innerHeight - 98) y = window.innerHeight - menuHeight - 98;
  if (y < 86) y = 86;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
  _ultimoMenuAbierto = Date.now();

  const esModoCapitan = (typeof window.getModoActual === "function" && window.getModoActual() === "capitan");
  const botonReportarCapitan = esModoCapitan ? `
    <button onclick="ocultarMenu(true); if (typeof abrirModalRegistroTerritorio === 'function') abrirModalRegistroTerritorio('${tId}', '${pId}');" style="color:#1a73e8; font-weight:700;">📝 Reportar cuadra</button>
    <button onclick="ocultarMenu(true); if (typeof abrirModalTarjetaS12 === 'function') abrirModalTarjetaS12('${tId}');" style="color:#059669; font-weight:700;">📄 Tarjeta S-12 (PDF)</button>
  ` : "";

  menu.innerHTML = `
    <div class="menu-contextual-header">
      <span class="menu-contextual-title">${tituloCompleto}</span>
      <button class="menu-contextual-close" onclick="ocultarMenu(true)" title="Cerrar">✕</button>
    </div>
    ${botonReportarCapitan}
    <button onclick="ocultarMenu(true); if (typeof abrirModalCrearRevisita === 'function') abrirModalCrearRevisita('${tId}', '${pId}', '${escaparHtmlSeguro(tituloCompleto)}', ${cLat}, ${cLng});" style="color:#0284c7; font-weight:700;">👤 Agregar Revisita</button>
    <button onclick="navegarCuadraMenu();">🧭 Cómo llegar</button>
    <button onclick="abrirUbicacionCuadra();">📍 Ubicación</button>
    <button onclick="anadirNotaPopup('${pId}', '${tId}');">➕ Añadir nota</button>
    <button onclick="verNotas('${pId}', '${tId}');">📒 Notas de cuadra</button>
    <button class="btn-whatsapp" onclick="compartirWhatsAppCuadra()"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: -2px; margin-right: 6px;"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.69C7.02 10.9 7.9 12.06 8.02 12.23C8.14 12.4 9.73 14.85 12.18 15.91C12.76 16.16 13.22 16.31 13.57 16.42C14.16 16.61 14.7 16.58 15.13 16.52C15.61 16.45 16.6 15.92 16.81 15.33C17.02 14.74 17.02 14.24 16.96 14.13C16.9 14.02 16.74 13.96 16.5 13.84C16.26 13.72 15.08 13.14 14.86 13.06C14.64 12.98 14.48 12.94 14.32 13.18C14.16 13.42 13.7 13.96 13.56 14.12C13.42 14.28 13.28 14.3 13.04 14.18C12.8 14.06 12.03 13.81 11.12 13C10.41 12.37 9.93 11.59 9.79 11.35C9.65 11.11 9.77 10.98 9.89 10.86C10 10.75 10.14 10.57 10.28 10.41C10.42 10.25 10.47 10.13 10.56 9.95C10.65 9.77 10.61 9.61 10.55 9.49C10.49 9.37 10.03 8.24 9.84 7.78C9.65 7.33 9.46 7.39 9.32 7.38C9.18 7.38 9.02 7.38 8.86 7.38C8.7 7.38 8.53 7.33 8.53 7.33Z"/></svg>WhatsApp</button>
  `;
}

function ocultarMenu(force) {
  // Evitar cerrar accidentalmente si se abrió hace menos de 400ms por el evento click del mapa tras soltar el dedo
  if (!force && Date.now() - _ultimoMenuAbierto < 400) {
    return;
  }
  const menu = document.getElementById("menuContextual");
  if (menu) menu.style.display = "none";
}

function escaparHtmlSeguro(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =============================
// === Notas ===
// =============================

function anadirNotaPopup(id, territorioId) {
  ocultarMenu(true);
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");

  const modalFondo = document.createElement("div");
  modalFondo.id = "modalAñadirNota";
  modalFondo.className = "terrosa-modal-overlay";

  modalFondo.innerHTML = `
    <div class="terrosa-modal-card" style="max-width:340px; padding:22px 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">➕ Añadir nota</h3>
        <button id="cerrarModalNotaX" class="btn-icon-square">✕</button>
      </div>
      <textarea id="inputNota" rows="4" placeholder="Escribe tu nota aquí..." style="
        width: 100%;
        padding: 11px 14px;
        border-radius: 14px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        color: #0f172a;
        font-family: inherit;
        font-size: 14.5px;
        margin-bottom: 14px;
        resize: none;
        box-sizing: border-box;
        outline: none;
      "></textarea>
      <div style="display:flex; gap:8px;">
        <button id="cancelarNota" style="
          flex:1;
          background: #f1f5f9;
          border: none;
          border-radius: 12px;
          color: #475569;
          font-weight: 700;
          padding: 11px 15px;
          font-size: 13.5px;
          cursor: pointer;
        ">Cancelar</button>
        <button id="guardarNota" style="
          flex:1;
          background: linear-gradient(135deg, #1a73e8, #1557b0);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 800;
          padding: 11px 15px;
          font-size: 13.5px;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(26,115,232,0.3);
        ">Guardar ✅</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalFondo);

  const cerrar = () => {
    if (document.body.contains(modalFondo)) document.body.removeChild(modalFondo);
  };

  modalFondo.querySelector("#cancelarNota").onclick = cerrar;
  modalFondo.querySelector("#cerrarModalNotaX").onclick = cerrar;

  const input = modalFondo.querySelector("#inputNota");
  setTimeout(() => input.focus(), 80);

  modalFondo.querySelector("#guardarNota").onclick = () => {
    const texto = input.value.trim();
    if (!texto) return;
    if (!notasPoligonos[id]) notasPoligonos[id] = [];
    notasPoligonos[id].push(texto);
    localStorage.setItem(territorioId + "_notas", JSON.stringify(notasPoligonos));
    cerrar();
    if (typeof window.refrescarIndicadoresNotas === "function") {
      window.refrescarIndicadoresNotas();
    }
    if (typeof window.reproducirSonidoClick === "function") {
      window.reproducirSonidoClick("success");
    }
  };
}

function verNotas(id, territorioId) {
  ocultarMenu(true);
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");
  mostrarNotasPopup(id, notasPoligonos, territorioId);
}

function mostrarNotasPopup(id, notasPoligonos, territorioId) {
  map.closePopup();
  var listaOriginal = notasPoligonos[id] || [];
  var itemsValidos = [];
  listaOriginal.forEach((nota, realIndex) => {
    const txt = typeof nota === "string" ? nota : (nota.texto || JSON.stringify(nota));
    if (!txt.startsWith("Trabajado por:")) {
      itemsValidos.push({ texto: txt, realIndex: realIndex });
    }
  });

  var contenido = "<div style='font-family:system-ui; font-size:13.5px; min-width:190px;'><b style='font-size:15px; color:#1e293b;'>📒 Notas de esta cuadra:</b><br><br>";
  if (itemsValidos.length === 0) {
    contenido += "<span style='color:#64748b;'>No hay notas registradas.</span>";
  } else {
    itemsValidos.forEach((item, idx) => {
      contenido += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f1f5f9; gap:8px;">
          <span style="word-break:break-word;">${idx + 1}. <b>${escaparHtmlSeguro(item.texto)}</b></span>
          <button onclick="confirmarEliminarNotaPopup('${id}', ${item.realIndex}, '${territorioId}')" style="background:#fee2e2; border:none; border-radius:6px; padding:4px 8px; color:#dc2626; cursor:pointer; font-weight:bold; flex-shrink:0;">🗑️</button>
        </div>
      `;
    });
  }
  contenido += "</div>";

  L.popup().setLatLng(map.getCenter()).setContent(contenido).openOn(map);
}

function confirmarEliminarNotaPopup(id, index, territorioId) {
  map.closePopup();
  L.popup().setLatLng(map.getCenter()).setContent(`
    <div style="font-family:system-ui; padding:4px;">
      <b style="color:#0f172a; font-size:14px;">¿Eliminar esta nota?</b><br><br>
      <div style="display:flex; gap:8px;">
        <button onclick="eliminarNota('${id}', ${index}, '${territorioId}')" style="background:#dc2626; color:white; border:none; border-radius:8px; padding:6px 14px; font-weight:bold; cursor:pointer;">Sí, borrar</button>
        <button onclick="map.closePopup()" style="background:#f1f5f9; color:#475569; border:none; border-radius:8px; padding:6px 14px; font-weight:bold; cursor:pointer;">Cancelar</button>
      </div>
    </div>
  `).openOn(map);
}

function eliminarNota(id, index, territorioId) {
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");
  if (notasPoligonos[id]) {
    notasPoligonos[id].splice(index, 1);
    if (notasPoligonos[id].length === 0) delete notasPoligonos[id];
  }
  localStorage.setItem(territorioId + "_notas", JSON.stringify(notasPoligonos));
  map.closePopup();
  if (typeof window.refrescarIndicadoresNotas === "function") {
    window.refrescarIndicadoresNotas();
  }
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("delete");
  }
}
