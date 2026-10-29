// ==============================================================================================================================
// === GESTIÓN DE REVISITAS Y NOTAS ===
// === Módulo completo de Revisitas personales, historial de visitas, proximidad GPS y notas ===
// ==============================================================================================================================

let notasMostradas = true;
const KEY_REVISITAS = "terrosa_revisitas_data";

// --------------------------------------------------------------------------------------
// Sistema Centralizado de Notificaciones Toasts y Modales de Confirmación
// (Sustituye completamente los alerts y confirms nativos de "kokevazquez dice")
// --------------------------------------------------------------------------------------
window.mostrarToastDiscreto = function (mensaje, icono = "✨", duracion = 2700) {
  const prev = document.getElementById("toastDiscretoGlobal");
  if (prev) prev.remove();

  const toast = document.createElement("div");
  toast.id = "toastDiscretoGlobal";
  toast.className = "terrosa-toast-discreto";
  toast.innerHTML = `
    <span style="font-size:15px; flex-shrink:0;">${icono}</span>
    <span style="overflow:hidden; text-overflow:ellipsis;">${escaparTexto(mensaje)}</span>
  `;
  document.body.appendChild(toast);

  // Animación de entrada
  setTimeout(() => {
    toast.classList.add("mostrar");
  }, 15);

  // Animación de salida
  setTimeout(() => {
    toast.classList.remove("mostrar");
    setTimeout(() => {
      if (document.body.contains(toast)) document.body.removeChild(toast);
    }, 240);
  }, duracion);
};

window.mostrarConfirmacionModal = function ({
  titulo = "¿Estás seguro?",
  mensaje = "",
  icono = "🗑️",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro = true,
  onConfirm,
  onCancel
}) {
  const prev = document.getElementById("modalConfirmacionGlobal");
  if (prev) prev.remove();

  const modal = document.createElement("div");
  modal.id = "modalConfirmacionGlobal";
  modal.className = "terrosa-modal-overlay";
  modal.style.zIndex = "1000005";

  modal.innerHTML = `
    <div class="terrosa-modal-card" style="max-width:320px; padding:22px 20px; text-align:center;">
      <div style="font-size:32px; margin-bottom:8px;">${icono}</div>
      <h3 style="margin:0 0 6px 0; font-size:17.5px; font-weight:800; color:#0f172a;">${escaparTexto(titulo)}</h3>
      <p style="margin:0 0 18px 0; font-size:13.5px; color:#64748b; line-height:1.4;">${escaparTexto(mensaje)}</p>
      <div style="display:flex; gap:8px;">
        <button id="btnCancelConfirmModal" style="flex:1; height:42px; border-radius:12px; border:1px solid #cbd5e1; background:#f1f5f9; color:#475569; font-weight:700; font-size:13.5px; cursor:pointer; outline:none;">
          ${escaparTexto(textoCancelar)}
        </button>
        <button id="btnAcceptConfirmModal" style="flex:1; height:42px; border-radius:12px; border:none; background:${peligro ? '#dc2626' : '#2563eb'}; color:#ffffff; font-weight:800; font-size:13.5px; cursor:pointer; outline:none; box-shadow:0 3px 10px ${peligro ? 'rgba(220,38,38,0.25)' : 'rgba(37,99,235,0.25)'};">
          ${escaparTexto(textoConfirmar)}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCancelConfirmModal").onclick = () => {
    cerrar();
    if (onCancel) onCancel();
  };

  modal.querySelector("#btnAcceptConfirmModal").onclick = () => {
    cerrar();
    if (onConfirm) onConfirm();
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      cerrar();
      if (onCancel) onCancel();
    }
  };
};

// --------------------------------------------------------------------------------------
// Utilidades de Datos de Revisitas (100% locales en el dispositivo del publicador)
// --------------------------------------------------------------------------------------
window.obtenerRevisitasLocales = function () {
  try {
    return JSON.parse(localStorage.getItem(KEY_REVISITAS) || "[]");
  } catch (e) {
    return [];
  }
};

window.guardarRevisitasLocales = function (arr) {
  try {
    localStorage.setItem(KEY_REVISITAS, JSON.stringify(arr));
  } catch (e) {}
  if (typeof window.refrescarIndicadoresNotas === "function") {
    window.refrescarIndicadoresNotas();
  }
};

// --------------------------------------------------------------------------------------
// Indicadores en el Mapa con Clic Interactivo
// (Al picarle al icono 👥 o 📒 muestra la información de esa cuadra)
// --------------------------------------------------------------------------------------
window.refrescarIndicadoresNotas = function () {
  if (window.indicadoresNotas && window.indicadoresNotas.length > 0) {
    window.indicadoresNotas.forEach(m => {
      try { map.removeLayer(m); } catch (e) {}
    });
    window.indicadoresNotas = [];
  }

  if (!notasMostradas) return;

  const revisitas = window.obtenerRevisitasLocales();

  window.todosLosTerritorios.forEach(territorio => {
    const notasTerritorio = JSON.parse(localStorage.getItem(territorio._id + "_notas") || "{}");
    territorio.eachLayer(function (pol) {
      const tieneNotas = (notasTerritorio[pol._id] && notasTerritorio[pol._id].length > 0);
      const revsDeCuadra = revisitas.filter(r => r.territorioId === territorio._id && r.cuadraId === pol._id);
      const tieneRevisitas = revsDeCuadra.length > 0;

      if (tieneRevisitas || tieneNotas) {
        try {
          const latlngs = pol.getLatLngs()[0];
          const coords = latlngs.map(ll => [ll.lng, ll.lat]);
          coords.push([coords[0][0], coords[0][1]]);
          const centroide = turf.centroid(turf.polygon([coords]));
          const cLat = centroide.geometry.coordinates[1];
          const cLng = centroide.geometry.coordinates[0];

          const iconChar = tieneRevisitas ? "👥" : "📒";
          const bgBadge = tieneRevisitas ? "#eff6ff" : "#fef3c7";
          const borderBadge = tieneRevisitas ? "#3b82f6" : "#f59e0b";

          // Marcador INTERACTIVO para que al tocarlo abra la información
          const marker = L.marker([cLat, cLng], {
            interactive: true,
            icon: L.divIcon({
              className: "indicador-nota-clickable",
              html: `<div style="background:${bgBadge}; border:1.8px solid ${borderBadge}; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-size:13px; box-shadow:0 3px 8px rgba(0,0,0,0.22); cursor:pointer;">${iconChar}</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            })
          }).addTo(map);

          marker.on("click", (e) => {
            if (e && e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
            if (tieneRevisitas) {
              window.mostrarRevisitasDeCuadra(territorio._id, pol._id, pol);
            } else if (tieneNotas) {
              window.verNotas(pol._id, territorio._id);
            }
          });

          window.indicadoresNotas.push(marker);
        } catch (e) {}
      }
    });
  });
};

// --------------------------------------------------------------------------------------
// Modal Discreto: Ver Revisitas de una Cuadra Específica (al tocar el icono 👥 en el mapa)
// --------------------------------------------------------------------------------------
window.mostrarRevisitasDeCuadra = function (territorioId, cuadraId, pol) {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }

  const prevModal = document.getElementById("modalRevisitasCuadraDetalle");
  if (prevModal) prevModal.remove();

  const todas = window.obtenerRevisitasLocales();
  const revsDeCuadra = todas.filter(r => r.territorioId === territorioId && r.cuadraId === cuadraId);

  // Título legible
  let nombreTerritorio = "Territorio";
  const numMatch = String(territorioId || "").match(/(\d+)/);
  if (numMatch) {
    nombreTerritorio = `Territorio ${numMatch[1]}`;
  } else if (String(territorioId || "").toLowerCase().includes("negocios")) {
    nombreTerritorio = "Negocios";
  }

  const rawLabel = pol && pol._label ? String(pol._label).trim() : "";
  const nombreCuadra = rawLabel
    ? (/^cuadra/i.test(rawLabel) ? rawLabel : `Cuadra ${rawLabel}`)
    : (cuadraId ? String(cuadraId).replace(/^.*?Cuadra/i, "Cuadra ") : "Cuadra");
  const tituloCompleto = `${nombreTerritorio}, ${nombreCuadra}`;

  const modal = document.createElement("div");
  modal.id = "modalRevisitasCuadraDetalle";
  modal.className = "terrosa-modal-overlay";

  modal.innerHTML = `
    <div class="terrosa-modal-card terrosa-modal-large" style="max-height:86vh; display:flex; flex-direction:column; padding:18px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">👥 Revisitas (${revsDeCuadra.length})</h3>
          <span style="font-size:12px; font-weight:700; color:#2563eb;">${escaparTexto(tituloCompleto)}</span>
        </div>
        <button id="btnCerrarDetalleCuadra" class="btn-icon-square">✕</button>
      </div>

      <div id="listaRevsCuadraCont" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:10px; padding-right:2px;"></div>

      <div style="margin-top:12px; flex-shrink:0;">
        <button id="btnAgregarOtraRevAqui" style="width:100%; height:40px; border-radius:12px; background:#eff6ff; color:#2563eb; border:1.5px dashed #93c5fd; font-weight:700; font-size:13.5px; cursor:pointer;">
          ➕ Agregar otra revisita en esta cuadra
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCerrarDetalleCuadra").onclick = cerrar;

  modal.querySelector("#btnAgregarOtraRevAqui").onclick = () => {
    cerrar();
    let cLat = 0, cLng = 0;
    if (pol && pol.getBounds) {
      try {
        const c = pol.getBounds().getCenter();
        cLat = c.lat;
        cLng = c.lng;
      } catch (e) {}
    }
    window.abrirModalCrearRevisita(territorioId, cuadraId, tituloCompleto, cLat, cLng);
  };

  const cont = modal.querySelector("#listaRevsCuadraCont");

  function renderizarRevsCuadra() {
    cont.innerHTML = "";
    const actualizadas = window.obtenerRevisitasLocales().filter(r => r.territorioId === territorioId && r.cuadraId === cuadraId);

    if (actualizadas.length === 0) {
      cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:24px 10px; font-size:13.5px;">No hay revisitas registradas en esta cuadra.</div>';
      return;
    }

    actualizadas.forEach(rev => {
      const card = document.createElement("div");
      card.className = "revisita-card";
      const iconoCat = rev.categoria === "Mujer" ? "👩" : (rev.categoria === "Joven" ? "🧑" : (rev.categoria === "Adulto Mayor" ? "👵" : (rev.categoria === "Familia" ? "🏠" : "👨")));
      const ultVisita = (rev.visitas && rev.visitas.length > 0) ? rev.visitas[0] : { fecha: rev.fechaCreacion, notas: "" };
      const numVisitas = (rev.visitas && rev.visitas.length > 0) ? rev.visitas.length : 1;

      card.innerHTML = `
        <div class="revisita-card-header">
          <div>
            <div class="revisita-persona-titulo">
              <span>${iconoCat}</span>
              <span>${escaparTexto(rev.nombre)}</span>
            </div>
            <div class="revisita-direccion-row" style="margin-top:2px;">
              <span>${escaparTexto(rev.direccion || "Sin dirección fija")}</span>
            </div>
          </div>
        </div>

        <div class="revisita-notas-preview">
          <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:2px;">Última conversación (${escaparTexto(ultVisita.fecha)}):</div>
          <div>${escaparTexto(ultVisita.notas)}</div>
        </div>

        <div class="revisita-actions-row">
          <button class="btn-revisita-action add btn-add-v">
            ➕ Visita
          </button>
          <button class="btn-revisita-action nav btn-nav-v">
            🧭 Cómo llegar
          </button>
          <button class="btn-revisita-action del btn-del-v">
            🗑️
          </button>
        </div>
      `;

      card.querySelector(".btn-add-v").onclick = () => {
        window.abrirModalAgregarVisita(rev.id, () => {
          renderizarRevsCuadra();
        });
      };

      card.querySelector(".btn-nav-v").onclick = () => {
        let destLat = rev.lat;
        let destLng = rev.lng;
        if (!destLat || !destLng) {
          if (pol && pol.getBounds) {
            const c = pol.getBounds().getCenter();
            destLat = c.lat;
            destLng = c.lng;
          }
        }
        if (destLat && destLng && typeof window.comoLlegarACoord === "function") {
          window.comoLlegarACoord(destLat, destLng, rev.nombre);
        } else {
          window.mostrarToastDiscreto("Ubicación no disponible para trazar ruta", "🧭");
        }
      };

      card.querySelector(".btn-del-v").onclick = () => {
        window.mostrarConfirmacionModal({
          titulo: "¿Eliminar revisita?",
          mensaje: `¿Deseas eliminar la revisita de "${rev.nombre}"?`,
          icono: "🗑️",
          textoConfirmar: "Eliminar",
          peligro: true,
          onConfirm: () => {
            const todasRestantes = window.obtenerRevisitasLocales().filter(r => r.id !== rev.id);
            window.guardarRevisitasLocales(todasRestantes);
            window.mostrarToastDiscreto(`Revisita de "${rev.nombre}" eliminada`, "🗑️");
            renderizarRevsCuadra();
          }
        });
      };

      cont.appendChild(card);
    });
  }

  renderizarRevsCuadra();
};

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
          let count = 0;
          _intervaloDestello = setInterval(() => {
            count++;
            if (count % 2 === 1) {
              pol.setStyle({ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.92, weight: 4 });
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
// Modal: Crear Nueva Revisita
// --------------------------------------------------------------------------------------
window.abrirModalCrearRevisita = function (territorioId, cuadraId, tituloCuadra, lat, lng) {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }

  const prevModal = document.getElementById("modalCrearRevisita");
  if (prevModal) prevModal.remove();

  const fechaHoy = new Date().toISOString().split("T")[0];

  const modal = document.createElement("div");
  modal.id = "modalCrearRevisita";
  modal.className = "terrosa-modal-overlay";

  modal.innerHTML = `
    <div class="terrosa-modal-card" style="max-width:360px; max-height:90vh; overflow-y:auto; padding:20px 18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">👤</span>
          <div>
            <h3 style="margin:0; font-size:17.5px; font-weight:800; color:#0f172a;">Nueva Revisita</h3>
            <span style="font-size:12px; font-weight:700; color:#2563eb;">${escaparTexto(tituloCuadra || "Cuadra")}</span>
          </div>
        </div>
        <button id="btnCerrarCrearRevisita" class="btn-icon-square">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <!-- Nombre de la persona -->
        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Nombre de la persona / Familia *</label>
          <input type="text" id="revNombrePersona" placeholder="Ej: Juan Pérez" style="width:100%; height:40px; border-radius:12px; border:1.5px solid #cbd5e1; padding:0 12px; font-size:14px; box-sizing:border-box; outline:none; background:#f8fafc;" />
        </div>

        <!-- Categoría / Tipo de persona -->
        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Categoría</label>
          <div class="chips-categoria-container" id="revChipsCategoria">
            <button type="button" class="chip-categoria seleccionado" data-cat="Hombre">👨 Hombre</button>
            <button type="button" class="chip-categoria" data-cat="Mujer">👩 Mujer</button>
            <button type="button" class="chip-categoria" data-cat="Joven">🧑 Joven</button>
            <button type="button" class="chip-categoria" data-cat="Adulto Mayor">👵 Adulto Mayor</button>
            <button type="button" class="chip-categoria" data-cat="Familia">🏠 Familia</button>
          </div>
        </div>

        <!-- Dirección y Número Exterior -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:12px; font-weight:700; color:#475569;">Dirección / Calle y Número</label>
            <button type="button" id="btnAutollenarGpsRev" style="background:none; border:none; color:#2563eb; font-size:11.5px; font-weight:700; cursor:pointer; padding:0;">📍 Usar mi GPS</button>
          </div>
          <input type="text" id="revDireccion" placeholder="Ej: Calle 16 #2408 (Casa azul)" style="width:100%; height:40px; border-radius:12px; border:1.5px solid #cbd5e1; padding:0 12px; font-size:14px; box-sizing:border-box; outline:none; background:#f8fafc;" />
        </div>

        <!-- Fecha primera visita -->
        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Fecha de visita</label>
          <input type="date" id="revFechaVisita" value="${fechaHoy}" style="width:100%; height:38px; border-radius:12px; border:1.5px solid #cbd5e1; padding:0 12px; font-size:13.5px; box-sizing:border-box; outline:none; background:#f8fafc;" />
        </div>

        <!-- Tema platicado / Publicación dejada -->
        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">¿De qué hablaron? / Pregunta pendiente</label>
          <textarea id="revNotasConversacion" rows="3" placeholder="Ej: Aceptó el folleto Disfrute de la vida. Muy amable. Quedamos de contestar la pregunta 2." style="width:100%; padding:10px 12px; border-radius:12px; border:1.5px solid #cbd5e1; font-size:13.5px; box-sizing:border-box; outline:none; background:#f8fafc; resize:none; font-family:inherit;"></textarea>
        </div>

        <!-- Botón Guardar -->
        <button id="btnGuardarNuevaRevisita" style="width:100%; height:44px; border-radius:14px; background:#2563eb; color:#ffffff; font-size:15px; font-weight:800; border:none; cursor:pointer; margin-top:4px; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
          💾 Guardar Revisita
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCerrarCrearRevisita").onclick = cerrar;

  // Selección de chip de categoría
  let categoriaSeleccionada = "Hombre";
  modal.querySelectorAll(".chip-categoria").forEach(chip => {
    chip.onclick = () => {
      modal.querySelectorAll(".chip-categoria").forEach(c => c.classList.remove("seleccionado"));
      chip.classList.add("seleccionado");
      categoriaSeleccionada = chip.getAttribute("data-cat");
    };
  });

  // Usar GPS si está disponible
  let revLat = lat || (window.userCurrentLocation ? window.userCurrentLocation.lat : null);
  let revLng = lng || (window.userCurrentLocation ? window.userCurrentLocation.lon : null);

  modal.querySelector("#btnAutollenarGpsRev").onclick = () => {
    if (window.userCurrentLocation && window.userCurrentLocation.lat) {
      revLat = window.userCurrentLocation.lat;
      revLng = window.userCurrentLocation.lon;
      const inputDir = modal.querySelector("#revDireccion");
      if (!inputDir.value.trim()) {
        inputDir.value = "Ubicación GPS fijada";
      }
      window.mostrarToastDiscreto("Ubicación GPS fijada para esta revisita", "📍");
    } else {
      window.mostrarToastDiscreto("Enciende primero tu ubicación GPS en el mapa", "📍");
    }
  };

  // Guardar revisita
  modal.querySelector("#btnGuardarNuevaRevisita").onclick = () => {
    const nombre = modal.querySelector("#revNombrePersona").value.trim();
    if (!nombre) {
      window.mostrarToastDiscreto("Por favor escribe el nombre de la persona o familia", "⚠️");
      modal.querySelector("#revNombrePersona").focus();
      return;
    }

    const direccion = modal.querySelector("#revDireccion").value.trim();
    const fecha = modal.querySelector("#revFechaVisita").value || fechaHoy;
    const notas = modal.querySelector("#revNotasConversacion").value.trim();

    const nuevaRevisita = {
      id: "rev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      territorioId: territorioId,
      cuadraId: cuadraId,
      tituloCuadra: tituloCuadra,
      nombre: nombre,
      categoria: categoriaSeleccionada,
      direccion: direccion,
      lat: revLat,
      lng: revLng,
      fechaCreacion: fecha,
      visitas: [
        {
          fecha: fecha,
          notas: notas || "Primera conversación."
        }
      ]
    };

    const lista = window.obtenerRevisitasLocales();
    lista.unshift(nuevaRevisita);
    window.guardarRevisitasLocales(lista);

    if (typeof window.reproducirSonidoClick === "function") {
      window.reproducirSonidoClick("success");
    }

    cerrar();
    window.mostrarToastDiscreto(`Revisita de "${nombre}" guardada con éxito`, "✅");
  };
};

// --------------------------------------------------------------------------------------
// Modal: Agregar Nueva Visita a una Revisita Existente
// --------------------------------------------------------------------------------------
window.abrirModalAgregarVisita = function (revisitaId, onGuardado) {
  const lista = window.obtenerRevisitasLocales();
  const rev = lista.find(r => r.id === revisitaId);
  if (!rev) return;

  const fechaHoy = new Date().toISOString().split("T")[0];

  const modal = document.createElement("div");
  modal.id = "modalAgregarVisita";
  modal.className = "terrosa-modal-overlay";
  modal.style.zIndex = "1000002";

  modal.innerHTML = `
    <div class="terrosa-modal-card" style="max-width:340px; padding:20px 18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <h3 style="margin:0; font-size:17px; font-weight:800; color:#0f172a;">➕ Registrar Visita</h3>
          <span style="font-size:12.5px; font-weight:700; color:#2563eb;">${escaparTexto(rev.nombre)}</span>
        </div>
        <button id="btnCerrarVisitaX" class="btn-icon-square">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Fecha</label>
          <input type="date" id="inputFechaNuevaVisita" value="${fechaHoy}" style="width:100%; height:38px; border-radius:12px; border:1.5px solid #cbd5e1; padding:0 12px; font-size:13.5px; box-sizing:border-box; outline:none; background:#f8fafc;" />
        </div>

        <div>
          <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Notas de la visita / Publicación dejada</label>
          <textarea id="inputNotasNuevaVisita" rows="4" placeholder="¿Qué se habló en esta visita? ¿Qué pregunta quedó pendiente?" style="width:100%; padding:10px 12px; border-radius:12px; border:1.5px solid #cbd5e1; font-size:13.5px; box-sizing:border-box; outline:none; background:#f8fafc; resize:none; font-family:inherit;"></textarea>
        </div>

        <button id="btnGuardarVisitaItem" style="width:100%; height:42px; border-radius:14px; background:#2563eb; color:#ffffff; font-size:14.5px; font-weight:800; border:none; cursor:pointer; margin-top:4px;">
          💾 Guardar Visita
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCerrarVisitaX").onclick = cerrar;

  modal.querySelector("#btnGuardarVisitaItem").onclick = () => {
    const fecha = modal.querySelector("#inputFechaNuevaVisita").value || fechaHoy;
    const notas = modal.querySelector("#inputNotasNuevaVisita").value.trim();

    if (!notas) {
      window.mostrarToastDiscreto("Por favor escribe una breve nota de lo que platicaron", "⚠️");
      modal.querySelector("#inputNotasNuevaVisita").focus();
      return;
    }

    if (!Array.isArray(rev.visitas)) rev.visitas = [];
    rev.visitas.unshift({ fecha, notas });

    window.guardarRevisitasLocales(lista);

    if (typeof window.reproducirSonidoClick === "function") {
      window.reproducirSonidoClick("success");
    }

    cerrar();
    window.mostrarToastDiscreto("Visita registrada con éxito", "✅");
    if (onGuardado) onGuardado();
  };
};

// --------------------------------------------------------------------------------------
// Modal Principal: "Mis Revisitas y Notas" (con Pestañas, Búsqueda y Proximidad GPS)
// --------------------------------------------------------------------------------------
function abrirModalTodasNotas() {
  if (typeof window.reproducirSonidoClick === "function") {
    window.reproducirSonidoClick("tap");
  }

  if (document.getElementById("modalGlobalTodasNotas")) return;

  let pestanaActiva = "revisitas";
  let busquedaTexto = "";

  const modal = document.createElement("div");
  modal.id = "modalGlobalTodasNotas";
  modal.className = "terrosa-modal-overlay";

  modal.innerHTML = `
    <div class="terrosa-modal-card terrosa-modal-large" style="max-height:88vh; display:flex; flex-direction:column; padding:18px 16px;">
      <!-- Header Superior con Tabs -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
        <div style="display:flex; gap:8px;">
          <button id="tabBtnRevisitas" class="filtro-pildora-btn" style="background:#2563eb; color:#ffffff; border-color:#2563eb; font-size:13px; height:34px; padding:0 14px;">
            👥 Revisitas
          </button>
          <button id="tabBtnNotas" class="filtro-pildora-btn" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1; font-size:13px; height:34px; padding:0 14px;">
            📒 Notas
          </button>
        </div>
        <button id="btnCerrarModalNotasGen" class="btn-icon-square">✕</button>
      </div>

      <!-- Buscador rápido -->
      <div style="margin-bottom:12px; flex-shrink:0;">
        <input type="text" id="inputBuscarRevisitas" placeholder="🔍 Buscar por nombre, calle o territorio..." style="width:100%; height:38px; border-radius:12px; border:1.5px solid #cbd5e1; padding:0 12px; font-size:13.5px; box-sizing:border-box; outline:none; background:#f8fafc;" />
      </div>

      <!-- Contenedor scrolleable de lista -->
      <div id="contenedorListaNotas" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:10px; padding-right:2px;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const cerrar = () => {
    if (document.body.contains(modal)) document.body.removeChild(modal);
  };

  modal.querySelector("#btnCerrarModalNotasGen").onclick = cerrar;

  const tabRev = modal.querySelector("#tabBtnRevisitas");
  const tabNot = modal.querySelector("#tabBtnNotas");
  const inputBusqueda = modal.querySelector("#inputBuscarRevisitas");
  const cont = modal.querySelector("#contenedorListaNotas");

  tabRev.onclick = () => {
    pestanaActiva = "revisitas";
    tabRev.style.background = "#2563eb";
    tabRev.style.color = "#ffffff";
    tabRev.style.borderColor = "#2563eb";
    tabNot.style.background = "#f1f5f9";
    tabNot.style.color = "#475569";
    tabNot.style.borderColor = "#cbd5e1";
    inputBusqueda.placeholder = "🔍 Buscar revisita por nombre, calle o territorio...";
    renderizarContenido();
  };

  tabNot.onclick = () => {
    pestanaActiva = "notas";
    tabNot.style.background = "#2563eb";
    tabNot.style.color = "#ffffff";
    tabNot.style.borderColor = "#2563eb";
    tabRev.style.background = "#f1f5f9";
    tabRev.style.color = "#475569";
    tabRev.style.borderColor = "#cbd5e1";
    inputBusqueda.placeholder = "🔍 Buscar en notas de cuadras...";
    renderizarContenido();
  };

  inputBusqueda.oninput = (e) => {
    busquedaTexto = e.target.value.toLowerCase().trim();
    renderizarContenido();
  };

  window.actualizarDistanciasEnRevisitas = function () {
    if (pestanaActiva === "revisitas" && document.getElementById("modalGlobalTodasNotas")) {
      renderizarContenido();
    }
  };

  function renderizarContenido() {
    cont.innerHTML = "";

    if (pestanaActiva === "revisitas") {
      let revisitas = window.obtenerRevisitasLocales();

      if (busquedaTexto) {
        revisitas = revisitas.filter(r => {
          const nom = (r.nombre || "").toLowerCase();
          const dir = (r.direccion || "").toLowerCase();
          const terr = (r.territorioId || "").toLowerCase();
          const tit = (r.tituloCuadra || "").toLowerCase();
          return nom.includes(busquedaTexto) || dir.includes(busquedaTexto) || terr.includes(busquedaTexto) || tit.includes(busquedaTexto);
        });
      }

      if (window.userCurrentLocation && window.userCurrentLocation.lat) {
        revisitas.sort((a, b) => {
          const distA = (a.lat && a.lng) ? turf.distance(turf.point([window.userCurrentLocation.lon, window.userCurrentLocation.lat]), turf.point([a.lng, a.lat])) : 9999;
          const distB = (b.lat && b.lng) ? turf.distance(turf.point([window.userCurrentLocation.lon, window.userCurrentLocation.lat]), turf.point([b.lng, b.lat])) : 9999;
          return distA - distB;
        });
      }

      if (revisitas.length === 0) {
        cont.innerHTML = `
          <div style="text-align:center; color:#94a3b8; padding:36px 16px;">
            <div style="font-size:32px; margin-bottom:8px;">👤</div>
            <div style="font-size:14px; font-weight:700; color:#64748b;">No tienes revisitas registradas aún.</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">Haz clic derecho o mantén presionada una cuadra en el mapa y selecciona <b>"👤 Agregar Revisita"</b>.</div>
          </div>
        `;
        return;
      }

      revisitas.forEach(rev => {
        const card = document.createElement("div");
        card.className = "revisita-card";

        let distanciaBadge = "";
        if (rev.lat && rev.lng && typeof window.calcularDistanciaAUsuario === "function") {
          const distStr = window.calcularDistanciaAUsuario(rev.lat, rev.lng);
          if (distStr) {
            distanciaBadge = `<span class="revisita-badge-distancia">📍 a ${distStr}</span>`;
          }
        }

        const iconoCat = rev.categoria === "Mujer" ? "👩" : (rev.categoria === "Joven" ? "🧑" : (rev.categoria === "Adulto Mayor" ? "👵" : (rev.categoria === "Familia" ? "🏠" : "👨")));
        const ultVisita = (rev.visitas && rev.visitas.length > 0) ? rev.visitas[0] : { fecha: rev.fechaCreacion, notas: "" };
        const numVisitas = (rev.visitas && rev.visitas.length > 0) ? rev.visitas.length : 1;

        card.innerHTML = `
          <div class="revisita-card-header">
            <div style="min-width:0; flex:1;">
              <div class="revisita-persona-titulo">
                <span>${iconoCat}</span>
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escaparTexto(rev.nombre)}</span>
              </div>
              <div class="revisita-direccion-row" style="margin-top:2px;">
                <span>${escaparTexto(rev.direccion || "Sin dirección fijada")}</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
              <span class="revisita-badge-territorio">${escaparTexto(rev.tituloCuadra || rev.territorioId)}</span>
              ${distanciaBadge}
            </div>
          </div>

          <div class="revisita-notas-preview">
            <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:2px;">Última conversación (${escaparTexto(ultVisita.fecha)}):</div>
            <div>${escaparTexto(ultVisita.notas)}</div>
          </div>

          <div id="historialVisitas_${rev.id}" style="display:none;" class="revisita-historial-visitas">
            ${(rev.visitas || []).slice(1).map(v => `
              <div class="revisita-item-visita">
                <div class="revisita-item-fecha">📅 ${escaparTexto(v.fecha)}</div>
                <div>${escaparTexto(v.notas)}</div>
              </div>
            `).join("")}
          </div>

          <div class="revisita-actions-row">
            <button class="btn-revisita-action add btn-agregar-visita-accion" title="Registrar que volviste a visitar">
              ➕ Visita
            </button>
            ${numVisitas > 1 ? `
              <button class="btn-revisita-action map btn-toggle-historial" title="Ver visitas anteriores">
                📖 Historial (${numVisitas})
              </button>
            ` : ''}
            <button class="btn-revisita-action map btn-ir-revisita" title="Ver en el mapa">
              📍 Ir
            </button>
            <button class="btn-revisita-action nav btn-como-llegar-revisita" title="Abrir ruta paso a paso">
              🧭 Cómo llegar
            </button>
            <button class="btn-revisita-action del btn-borrar-revisita" title="Eliminar revisita">
              🗑️
            </button>
          </div>
        `;

        card.querySelector(".btn-agregar-visita-accion").onclick = () => {
          window.abrirModalAgregarVisita(rev.id, () => {
            renderizarContenido();
          });
        };

        const btnHistorial = card.querySelector(".btn-toggle-historial");
        if (btnHistorial) {
          btnHistorial.onclick = () => {
            const histDiv = card.querySelector(`#historialVisitas_${rev.id}`);
            if (histDiv) {
              const visible = histDiv.style.display !== "none";
              histDiv.style.display = visible ? "none" : "flex";
              btnHistorial.textContent = visible ? `📖 Historial (${numVisitas})` : `📖 Ocultar (${numVisitas})`;
            }
          };
        }

        card.querySelector(".btn-ir-revisita").onclick = () => {
          cerrar();
          irACuadra(rev.territorioId, rev.cuadraId);
        };

        card.querySelector(".btn-como-llegar-revisita").onclick = () => {
          let destLat = rev.lat;
          let destLng = rev.lng;

          if (!destLat || !destLng) {
            const terr = window.todosLosTerritorios.find(t => t._id === rev.territorioId);
            if (terr) {
              terr.eachLayer(pol => {
                if (pol._id === rev.cuadraId && pol.getBounds) {
                  const c = pol.getBounds().getCenter();
                  destLat = c.lat;
                  destLng = c.lng;
                }
              });
            }
          }

          if (destLat && destLng && typeof window.comoLlegarACoord === "function") {
            window.comoLlegarACoord(destLat, destLng, rev.nombre);
          } else {
            window.mostrarToastDiscreto("Ubicación geográfica no disponible", "🧭");
          }
        };

        card.querySelector(".btn-borrar-revisita").onclick = () => {
          window.mostrarConfirmacionModal({
            titulo: "¿Eliminar revisita?",
            mensaje: `¿Estás seguro de eliminar la revisita de "${rev.nombre}" y todo su historial de visitas?`,
            icono: "🗑️",
            textoConfirmar: "Eliminar",
            peligro: true,
            onConfirm: () => {
              const todas = window.obtenerRevisitasLocales().filter(r => r.id !== rev.id);
              window.guardarRevisitasLocales(todas);
              if (typeof window.reproducirSonidoClick === "function") {
                window.reproducirSonidoClick("delete");
              }
              window.mostrarToastDiscreto(`Revisita de "${rev.nombre}" eliminada`, "🗑️");
              renderizarContenido();
            }
          });
        };

        cont.appendChild(card);
      });
      return;
    }

    // ----------------------------------------------------
    // Pestaña: "Notas de Cuadra" (Notas de cuadras generales)
    // ----------------------------------------------------
    let todasNotas = [];
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
              todasNotas.push({
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

    if (busquedaTexto) {
      todasNotas = todasNotas.filter(n => n.texto.toLowerCase().includes(busquedaTexto) || String(n.territorioNum).includes(busquedaTexto));
    }

    if (todasNotas.length === 0) {
      cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:36px 16px; font-size:14px; font-weight:600;">No tienes notas guardadas en este momento.</div>';
      return;
    }

    todasNotas.forEach(n => {
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
        window.mostrarConfirmacionModal({
          titulo: "¿Eliminar nota?",
          mensaje: "¿Deseas eliminar esta nota de la cuadra?",
          icono: "🗑️",
          textoConfirmar: "Eliminar",
          peligro: true,
          onConfirm: () => {
            const notasTerr = JSON.parse(localStorage.getItem(n.territorioId + "_notas") || "{}");
            if (notasTerr[n.cuadraId]) {
              notasTerr[n.cuadraId].splice(n.index, 1);
              if (notasTerr[n.cuadraId].length === 0) delete notasTerr[n.cuadraId];
              localStorage.setItem(n.territorioId + "_notas", JSON.stringify(notasTerr));
            }
            if (typeof window.reproducirSonidoClick === "function") {
              window.reproducirSonidoClick("delete");
            }
            window.mostrarToastDiscreto("Nota eliminada", "🗑️");
            window.refrescarIndicadoresNotas();
            renderizarContenido();
          }
        });
      };

      cont.appendChild(card);
    });
  }

  renderizarContenido();
}

function escaparTexto(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --------------------------------------------------------------------------------------
// Vinculación de eventos al botón de Revisitas (en barra inferior)
// --------------------------------------------------------------------------------------
function inicializarEventosNotas() {
  const btnNotas = document.getElementById("btnMostrarTodasNotas");
  if (!btnNotas) return;

  btnNotas.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalTodasNotas();
  });

  btnNotas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    abrirModalTodasNotas();
  });

  setTimeout(() => {
    window.refrescarIndicadoresNotas();
  }, 1000);
}
