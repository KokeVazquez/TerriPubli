// ==============================================================================================================================
// === GESTIÓN DE NOTAS ===
// === Indicadores en mapa, visor de notas globales y edición/eliminación reactiva ===
// ==============================================================================================================================

let notasMostradas = false;

// Función para refrescar indicadores en el mapa al instante
window.refrescarIndicadoresNotas = function () {
  if (window.indicadoresNotas && window.indicadoresNotas.length > 0) {
    window.indicadoresNotas.forEach(m => {
      try { map.removeLayer(m); } catch (e) {}
    });
    window.indicadoresNotas = [];
  }

  if (notasMostradas) {
    window.todosLosTerritorios.forEach(territorio => {
      const notasTerritorio = JSON.parse(localStorage.getItem(territorio._id + "_notas") || "{}");
      territorio.eachLayer(function (pol) {
        if (notasTerritorio[pol._id] && notasTerritorio[pol._id].length > 0) {
          try {
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
                html: "📒",
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            }).addTo(map);
            window.indicadoresNotas.push(marker);
          } catch (e) {}
        }
      });
    });
  }
};

// Alternar visualización de iconos de notas en el mapa
function toggleIconosNotas() {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }
  notasMostradas = !notasMostradas;
  window.refrescarIndicadoresNotas();

  const btn = document.getElementById("btnMostrarTodasNotas");
  if (btn) {
    btn.classList.toggle("active", notasMostradas);
  }
}

// --------------------------------------------------------------------------------------
// Función para navegar y enfocar la cuadra exacta con animación de destello
// --------------------------------------------------------------------------------------
let _intervaloDestello = null;

function irACuadra(territorioId, cuadraId) {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }

  if (_intervaloDestello) {
    clearInterval(_intervaloDestello);
    _intervaloDestello = null;
  }

  if (typeof window.seleccionarTerritorioDirecto === "function") {
    window.seleccionarTerritorioDirecto(territorioId);
  }

  setTimeout(() => {
    const terr = window.todosLosTerritorios.find(t => t._id === territorioId);
    if (!terr) return;

    terr.eachLayer(pol => {
      if (pol._id === cuadraId) {
        try {
          map.flyToBounds(pol.getBounds(), {
            paddingTopLeft: [30, 100],
            paddingBottomRight: [30, 110],
            maxZoom: 18,
            duration: 0.6
          });
          // Efecto de pulso / destello para destacar la cuadra
          let count = 0;
          _intervaloDestello = setInterval(() => {
            count++;
            if (count % 2 === 1) {
              pol.setStyle({ color: "#e11d48", fillColor: "#fb7185", fillOpacity: 0.92, weight: 4 });
            } else if (pol._originalStyle) {
              pol.setStyle(pol._originalStyle);
            }
            if (count >= 6) {
              clearInterval(_intervaloDestello);
              _intervaloDestello = null;
              if (typeof window.actualizarColoresCuadrasCapitan === "function") {
                window.actualizarColoresCuadrasCapitan();
              } else if (pol._originalStyle) {
                pol.setStyle(pol._originalStyle);
              }
            }
          }, 240);
        } catch (e) {}
      }
    });
  }, 750);
}

// --------------------------------------------------------------------------------------
// Modal Rediseñado de Todas las Notas (Moderno, Minimalista y con botón "Ir")
// --------------------------------------------------------------------------------------
function abrirModalTodasNotas() {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }

  // Evitar abrir modales duplicados si ya está abierto
  if (document.getElementById("modalGlobalTodasNotas")) return;

  const modal = document.createElement("div");
  modal.id = "modalGlobalTodasNotas";
  modal.className = "terrosa-modal-overlay";
  modal.innerHTML = `
    <div class="terrosa-modal-card terrosa-modal-large" style="max-height:85vh; display:flex; flex-direction:column; padding:20px 18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-shrink:0;">
        <h3 style="margin:0; font-size:19px; font-weight:800; color:#0f172a;">📒 Notas del Territorio</h3>
        <button id="btnCerrarModalNotasGen" class="btn-icon-square">✕</button>
      </div>

      <div id="contenedorListaNotas" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:8px; padding-right:2px;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCerrarModalNotasGen").onclick = cerrar;

  const cont = modal.querySelector("#contenedorListaNotas");

  function escaparTexto(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderizarNotas() {
    let todas = [];
    window.todosLosTerritorios.forEach(territorio => {
      const notasTerritorio = JSON.parse(localStorage.getItem(territorio._id + "_notas") || "{}");
      territorio.eachLayer(function (pol) {
        const notasPol = notasTerritorio[pol._id];
        if (notasPol && notasPol.length > 0) {
          notasPol.forEach((nota, index) => {
            const txt = typeof nota === "string" ? nota : nota.texto || JSON.stringify(nota);
            if (!txt.startsWith("Trabajado por:")) {
              const rawLbl = pol._label ? String(pol._label).trim() : "";
              const cuadraClean = rawLbl || String(pol._id).replace(/^.*?Cuadra/i, "").replace(/^[a-zA-Z0-9]+_c/i, "");
              todas.push({
                territorioId: territorio._id,
                territorioNum: territorio._id.replace(/\D/g, "") || "Neg",
                cuadraId: pol._id,
                cuadraNum: cuadraClean,
                texto: txt,
                index: index
              });
            }
          });
        }
      });
    });

    cont.innerHTML = "";

    if (todas.length === 0) {
      cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:36px 16px; font-size:14px; font-weight:600;">No tienes notas guardadas en este momento.</div>';
      return;
    }

    todas.forEach(n => {
      const card = document.createElement("div");
      card.className = "card-historial-minimal";
      const etiquetaCuadra = /^cuadra/i.test(String(n.cuadraNum)) ? n.cuadraNum : `Cuadra ${n.cuadraNum}`;

      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
          <div style="background:#fef3c7; color:#b45309; font-weight:800; font-size:13.5px; border-radius:12px; padding:6px 10px; min-width:38px; text-align:center; flex-shrink:0;">
            T-${n.territorioNum}
          </div>
          <div style="min-width:0; flex:1;">
            <div style="font-weight:700; color:#1e293b; font-size:14px; line-height:1.35; word-break:break-word;">
              ${escaparTexto(n.texto)}
            </div>
            <div style="font-size:11.5px; color:#64748b; margin-top:2px;">
              ${escaparTexto(etiquetaCuadra)}
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <button class="btn-action-square btn-ir-nota" title="Ir a la cuadra en el mapa" style="background:#eff6ff; color:#2563eb; font-weight:700; font-size:12.5px; padding:0 8px; width:auto; height:34px; gap:4px; border-radius:10px;">
            <span>📍</span> <span>Ir</span>
          </button>
          <button class="btn-action-square btn-eliminar-nota" title="Eliminar nota" style="background:#fee2e2; color:#dc2626; width:34px; height:34px; border-radius:10px;">
            🗑️
          </button>
        </div>
      `;

      card.querySelector(".btn-ir-nota").onclick = () => {
        cerrar();
        irACuadra(n.territorioId, n.cuadraId);
      };

      card.querySelector(".btn-eliminar-nota").onclick = () => {
        if (confirm("¿Eliminar esta nota?")) {
          const notasTerr = JSON.parse(localStorage.getItem(n.territorioId + "_notas") || "{}");
          if (notasTerr[n.cuadraId]) {
            notasTerr[n.cuadraId].splice(n.index, 1);
            if (notasTerr[n.cuadraId].length === 0) delete notasTerr[n.cuadraId];
            localStorage.setItem(n.territorioId + "_notas", JSON.stringify(notasTerr));
          }
          if (typeof window.reproducirSonidoClick === "function") {
            window.reproducirSonidoClick("delete");
          }
          window.refrescarIndicadoresNotas();
          renderizarNotas();
        }
      };

      cont.appendChild(card);
    });
  }

  renderizarNotas();
}

// --------------------------------------------------------------------------------------
// Vinculación de eventos al botón de Notas
// --------------------------------------------------------------------------------------
function inicializarEventosNotas() {
  const btnNotas = document.getElementById("btnMostrarTodasNotas");
  if (!btnNotas) return;

  let pressTimer = null;
  let longPressTriggered = false;

  // Click normal: alternar iconos en el mapa (solo si no fue pulsación larga)
  btnNotas.addEventListener("click", (e) => {
    if (longPressTriggered) {
      longPressTriggered = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleIconosNotas();
  });

  // Click derecho (PC): abrir modal de gestión
  btnNotas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    clearTimeout(pressTimer);
    abrirModalTodasNotas();
  });

  // Mantener presionado (móvil y táctil)
  function iniciarPresion() {
    longPressTriggered = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      abrirModalTodasNotas();
    }, 550);
  }

  function cancelarPresion() {
    clearTimeout(pressTimer);
  }

  btnNotas.addEventListener("touchstart", iniciarPresion, { passive: true });
  btnNotas.addEventListener("touchend", cancelarPresion, { passive: true });
  btnNotas.addEventListener("touchcancel", cancelarPresion, { passive: true });
  btnNotas.addEventListener("mousedown", iniciarPresion);
  btnNotas.addEventListener("mouseup", cancelarPresion);
  btnNotas.addEventListener("mouseleave", cancelarPresion);
}
