// ==============================================================================================================================
// === TERROSA — MÓDULO DE CAPITANES Y APROBACIÓN S-13 ===
// ==============================================================================================================================

(function () {
  "use strict";

  const PIN_ENCARGADO_DEFAULT = "1234";
  const URL_API_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbysLvd2KoADFWNsFflNolxQjrHVFn7rW9oDdewPyt7MfPoPbZ3w6qEALYoypQVJTerCmg/exec";

  // 1. Obtener estado actual
  window.getModoActual = function () {
    return localStorage.getItem("terrosa_modo") || "publicador";
  };

  window.getCapitanNombre = function () {
    return localStorage.getItem("terrosa_capitan_nombre") || "";
  };

  // 2. Inicializador del módulo
  window.inicializarModuloCapitan = function () {
    actualizarInterfazSegunModo();
    vincularEventosModo();
    vincularBotonRegistrar();
    vincularBotonHistorial();
    vincularBuzonEncargado();
    inicializarFiltroFechaBarra();
    // Sincronizar en segundo plano con la base de datos en Google Sheets
    if (typeof window.sincronizarConNube === "function") {
      window.sincronizarConNube();
    }
  };

  // 3. Actualizar interfaz según el modo (Publicador vs Capitán)
  function actualizarInterfazSegunModo() {
    const modo = window.getModoActual();
    const nombreCapitan = window.getCapitanNombre();
    const esCapitan = (modo === "capitan");

    // Marcar clase en body para adaptar la barra inferior y superior
    document.body.classList.toggle("modo-capitan", esCapitan);

    // Actualizar botones del selector de modo
    document.querySelectorAll(".modo-toggle-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.modo === modo);
    });

    // Elementos exclusivos de Capitán (ej: botón Reportar, botón Historial)
    const capitanOnlyElements = document.querySelectorAll(".capitan-only");
    capitanOnlyElements.forEach(el => {
      el.style.display = esCapitan ? "inline-flex" : "none";
    });

    // Elementos exclusivos de Publicador (ej: botón Notas personal)
    const publicadorOnlyElements = document.querySelectorAll(".publicador-only");
    publicadorOnlyElements.forEach(el => {
      el.style.display = esCapitan ? "none" : "inline-flex";
    });

    // Badge con solo el nombre del capitán en la cabecera superior (ej: "Koke")
    const badgeCapitanHeader = document.getElementById("badgeCapitanHeader");
    if (badgeCapitanHeader) {
      if (esCapitan && nombreCapitan) {
        badgeCapitanHeader.textContent = nombreCapitan;
        badgeCapitanHeader.style.display = "inline-flex";
      } else {
        badgeCapitanHeader.style.display = "none";
      }
    }

    const seccionEncargado = document.getElementById("seccionEncargado");
    if (seccionEncargado) {
      seccionEncargado.style.display = esCapitan ? "block" : "none";
      actualizarContadorPendientes();
    }

    // Sincronizar colores en gris de cuadras reportadas/aprobadas
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }
  }

  // 4. Conmutar entre Publicador y Capitán
  function vincularEventosModo() {
    const botonesModo = document.querySelectorAll(".modo-toggle-btn");
    botonesModo.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const nuevoModo = btn.dataset.modo;
        const modoActual = window.getModoActual();

        if (nuevoModo === "capitan") {
          const capitanGuardado = window.getCapitanNombre();
          if (!capitanGuardado) {
            // Pedir nombre si es la primera vez
            abrirModalCrearPerfilCapitan(() => {
              localStorage.setItem("terrosa_modo", "capitan");
              actualizarInterfazSegunModo();
            });
            return;
          }
        }

        localStorage.setItem("terrosa_modo", nuevoModo);
        actualizarInterfazSegunModo();
      });
    });

    // Tocar el badge con el nombre en la cabecera permite cambiar el perfil del capitán
    const badgeHeader = document.getElementById("badgeCapitanHeader");
    if (badgeHeader) {
      badgeHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalCrearPerfilCapitan(() => {
          actualizarInterfazSegunModo();
        });
      });
    }

    // Botón para cambiar nombre de capitán (si existiera en menús)
    const btnCambiar = document.getElementById("btnCambiarCapitan");
    if (btnCambiar) {
      btnCambiar.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalCrearPerfilCapitan(() => {
          actualizarInterfazSegunModo();
        });
      });
    }
  }

  // 5. Modal para crear/editar perfil de Capitán
  function abrirModalCrearPerfilCapitan(callback) {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card">
        <h3 style="margin-top:0; color:#1e293b; font-size:18px; text-align:center;">Perfil de Capitán</h3>
        <p style="font-size:13.5px; color:#64748b; text-align:center; margin-bottom:16px;">
          Ingresa tu nombre para firmar tus reportes de territorio automáticamente:
        </p>
        <input type="text" id="inputNombreCapitanModal" placeholder="Ej. Josué Ramos" value="${window.getCapitanNombre()}" style="
          width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:12px; font-size:15px; box-sizing:border-box; outline:none; font-family:inherit; margin-bottom:16px;
        " />
        <div style="display:flex; gap:8px;">
          <button id="btnCancelarPerfil" style="
            flex:1; padding:12px; background:#f1f5f9; border:none; border-radius:12px; font-weight:600; color:#475569; cursor:pointer; font-size:14px;
          ">Cancelar</button>
          <button id="btnGuardarPerfil" style="
            flex:1; padding:12px; background:#1a73e8; border:none; border-radius:12px; font-weight:700; color:#ffffff; cursor:pointer; font-size:14px;
          ">Continuar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector("#inputNombreCapitanModal");
    setTimeout(() => input.focus(), 100);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCancelarPerfil").onclick = cerrar;

    modal.querySelector("#btnGuardarPerfil").onclick = () => {
      const nombre = input.value.trim();
      if (!nombre) {
        alert("Por favor ingresa tu nombre para continuar.");
        return;
      }
      localStorage.setItem("terrosa_capitan_nombre", nombre);
      cerrar();
      if (callback) callback(nombre);
    };
  }

  // 6. Botón Registrar Territorio e Historial en Barra Inferior
  function vincularBotonRegistrar() {
    const btnRegistrar = document.getElementById("btnRegistrarTerritorio");
    if (btnRegistrar) {
      btnRegistrar.addEventListener("click", () => {
        abrirModalRegistroTerritorio();
      });
    }
  }

  function vincularBotonHistorial() {
    const btnHistorial = document.getElementById("btnHistorialCapitan");
    if (btnHistorial) {
      btnHistorial.addEventListener("click", () => {
        window.abrirModalHistorialRegistros();
      });
    }
  }

  // 6.1. Modal de Historial de Registros y Edición
  window.abrirModalHistorialRegistros = function () {
    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const listaOrdenada = [...reportes].reverse();

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large" style="max-height:85vh; display:flex; flex-direction:column; padding:18px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:18px; font-weight:800; color:#1e293b;">📋 Historial de Registros</h3>
            <span style="font-size:12px; color:#64748b;">Edita o elimina si hubo algún error</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button id="btnLimpiarCacheModal" title="Limpiar cuadras viejas en gris" style="background:#fef2f2; border:none; border-radius:8px; padding:6px 9px; font-size:11.5px; font-weight:700; color:#dc2626; cursor:pointer;">🧹 Limpiar</button>
            <button id="btnSyncHistorialModal" title="Sincronizar" style="background:#e0f2fe; border:none; border-radius:8px; padding:6px 9px; font-size:11.5px; font-weight:700; color:#0284c7; cursor:pointer;">🔄 Nube</button>
            <button id="btnCerrarHistorial" style="background:none; border:none; font-size:22px; cursor:pointer; color:#64748b; padding:2px;">✖</button>
          </div>
        </div>

        <div id="listaItemsHistorial" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:8px; padding-right:2px;">
          ${listaOrdenada.length === 0 ? '<div style="text-align:center; color:#94a3b8; padding:30px;">No hay registros guardados aún.</div>' : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarHistorial").onclick = cerrar;

    const btnLimpiar = modal.querySelector("#btnLimpiarCacheModal");
    if (btnLimpiar) {
      btnLimpiar.onclick = () => {
        if (confirm("¿Limpiar cuadras en gris huérfanas y sincronizar mapa con el historial?")) {
          window.limpiarCacheCuadrasFantasma();
          cerrar();
          window.abrirModalHistorialRegistros();
        }
      };
    }

    const btnSync = modal.querySelector("#btnSyncHistorialModal");
    if (btnSync) {
      btnSync.onclick = () => {
        btnSync.textContent = "Sincronizando...";
        window.sincronizarConNube(true).then(() => {
          cerrar();
          window.abrirModalHistorialRegistros();
        });
      };
    }

    const cont = modal.querySelector("#listaItemsHistorial");
    listaOrdenada.forEach(rep => {
      const card = document.createElement("div");
      card.style.cssText = "background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;";
      
      const esAprobado = (rep.estado === "APROBADO");
      const badgeEstado = esAprobado 
        ? '<span style="background:#dcfce7; color:#15803d; font-size:11px; font-weight:800; padding:2px 7px; border-radius:12px;">✅ Aprobado</span>'
        : '<span style="background:#fef3c7; color:#b45309; font-size:11px; font-weight:800; padding:2px 7px; border-radius:12px;">🟡 Pendiente</span>';

      const labelsCuadras = (rep.cuadrasLabels && rep.cuadrasLabels.length > 0)
        ? rep.cuadrasLabels.join(", ")
        : (Array.isArray(rep.cuadras) ? rep.cuadras.map(c => c.replace(/^[a-zA-Z0-9]+_c/, '')).join(", ") : "");

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; color:#1e293b; font-size:15px;">Territorio ${rep.territorioNumero}</span>
          ${badgeEstado}
        </div>
        <div style="font-size:13px; color:#334155; line-height:1.4;">
          <div><b>Capitán:</b> <span class="txt-capitan-val">${rep.capitan}</span></div>
          <div><b>Fecha:</b> <span class="txt-fecha-val">${rep.fecha}</span></div>
          <div><b>Cuadras:</b> ${labelsCuadras || rep.cuadrasTotal}</div>
        </div>
        ${rep.comentario ? `<div style="font-size:12px; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:6px;">💬 ${rep.comentario}</div>` : ''}
        
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
          <button class="btn-editar-historial" data-id="${rep.id}" style="padding:6px 12px; background:#e0f2fe; color:#0369a1; border:none; border-radius:8px; font-weight:700; font-size:12.5px; cursor:pointer;">
            ✏️ Editar
          </button>
          <button class="btn-eliminar-historial" data-id="${rep.id}" style="padding:6px 12px; background:#fee2e2; color:#b91c1c; border:none; border-radius:8px; font-weight:700; font-size:12.5px; cursor:pointer;">
            🗑️ Eliminar
          </button>
        </div>
      `;
      cont.appendChild(card);
    });

    cont.querySelectorAll(".btn-editar-historial").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        abrirModalEditarRegistro(id, () => {
          cerrar();
          window.abrirModalHistorialRegistros();
        });
      };
    });

    cont.querySelectorAll(".btn-eliminar-historial").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm("¿Estás seguro de eliminar este registro del historial?")) {
          descartarReporte(id);
          cardElementRemove(btn);
        }
      };
    });

    function cardElementRemove(btn) {
      const card = btn.closest("div[style*='border']");
      if (card) card.remove();
      const remaining = cont.querySelectorAll(".btn-editar-historial").length;
      if (remaining === 0) {
        cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:30px;">No hay registros guardados aún.</div>';
      }
    }
  };

  // 6.2. Modal para Editar un Registro existente
  function abrirModalEditarRegistro(id, callback) {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    if (!rep) return;

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:320px; padding:20px 18px 16px;">
        <h3 style="margin:0 0 4px 0; color:#1e293b; font-size:17.5px; font-weight:800;">✏️ Editar Registro</h3>
        <div style="font-size:13px; font-weight:700; color:#1a73e8; margin-bottom:12px;">Territorio ${rep.territorioNumero}</div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Capitán</label>
            <input type="text" id="editCapitanNombre" value="${rep.capitan}" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; font-weight:600; box-sizing:border-box; margin-top:3px;"/>
          </div>

          <div>
            <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Fecha</label>
            <input type="date" id="editFecha" value="${rep.fecha}" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; font-weight:600; box-sizing:border-box; margin-top:3px;"/>
          </div>

          <div>
            <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Comentario</label>
            <input type="text" id="editComentario" value="${rep.comentario || ''}" placeholder="Opcional" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:13px; box-sizing:border-box; margin-top:3px;"/>
          </div>
        </div>

        <div style="display:flex; gap:8px; margin-top:16px;">
          <button id="btnCancelarEdicion" style="flex:1; padding:11px; background:#f1f5f9; border:none; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; font-size:13.5px;">Cancelar</button>
          <button id="btnGuardarEdicion" style="flex:1; padding:11px; background:#1a73e8; border:none; border-radius:10px; font-weight:700; color:white; cursor:pointer; font-size:13.5px;">Guardar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCancelarEdicion").onclick = cerrar;

    modal.querySelector("#btnGuardarEdicion").onclick = () => {
      const nuevoCapitan = modal.querySelector("#editCapitanNombre").value.trim();
      const nuevaFecha = modal.querySelector("#editFecha").value;
      const nuevoComentario = modal.querySelector("#editComentario").value.trim();

      if (!nuevoCapitan) return alert("Por favor ingresa el nombre del capitán.");
      if (!nuevaFecha) return alert("Por favor ingresa una fecha.");

      rep.capitan = nuevoCapitan;
      rep.fecha = nuevaFecha;
      rep.comentario = nuevoComentario;

      localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

      // Sincronizar en la nube con Google Sheets
      if (URL_API_GOOGLE_SHEETS) {
        fetch(URL_API_GOOGLE_SHEETS, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ accion: "editar_reporte", reporte: rep })
        }).catch(err => console.warn("Error enviando edición a Google Sheets:", err));
      }

      // Si hay filtros o colores, refrescar
      if (typeof window.actualizarColoresCuadrasCapitan === "function") {
        window.actualizarColoresCuadrasCapitan();
      }

      mostrarToastDiscreto("Registro actualizado ✅");
      cerrar();
      if (callback) callback();
    };
  }

  // 7. Modal de Registro de Territorio / Cuadras
  window.abrirModalRegistroTerritorio = function (preTerritorioId, preCuadraId) {
    const nombreCapitan = window.getCapitanNombre() || "Capitán";
    const hoy = new Date().toISOString().slice(0, 10);

    // Territorio actual seleccionado en el mapa
    let territorioActivo = preTerritorioId;
    if (!territorioActivo) {
      const select = document.getElementById("selectorTerritorios");
      if (select && select.value) territorioActivo = select.value;
    }

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; color:#1e293b; font-size:18px; font-weight:800;">📝 Reportar Territorio</h3>
          <button id="btnCerrarModalReg" style="background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; padding:4px;">✖</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; max-height:75vh; overflow-y:auto; padding-right:2px;">
          <!-- Capitán y Fecha -->
          <div style="display:flex; gap:8px;">
            <div style="flex:1;">
              <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Capitán</label>
              <input type="text" id="regCapitanNombre" value="${nombreCapitan}" style="
                width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; font-weight:600; box-sizing:border-box;
              "/>
            </div>
            <div style="flex:1;">
              <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Fecha</label>
              <input type="date" id="regFecha" value="${hoy}" style="
                width:100%; padding:9px 10px; border:1px solid #cbd5e1; border-radius:10px; font-size:13.5px; font-weight:600; box-sizing:border-box;
              "/>
            </div>
          </div>

          <!-- Selector de Territorio -->
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Seleccionar Territorio</label>
            <select id="regSelectTerritorio" style="
              width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; font-weight:600; box-sizing:border-box; margin-top:3px; background:#fff;
            ">
              <option value="">-- Elige un territorio --</option>
            </select>
          </div>

          <!-- Lista de Cuadras -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Cuadras trabajadas</label>
              <button id="btnToggleTodasCuadras" type="button" style="
                background:none; border:none; color:#1a73e8; font-size:12px; font-weight:700; cursor:pointer; padding:0;
              ">Seleccionar todas</button>
            </div>
            <div id="regContenedorCuadras" style="
              max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:12px; padding:10px; background:#f8fafc; display:flex; flex-direction:column; gap:6px;
            ">
              <div style="font-size:13px; color:#94a3b8; text-align:center; padding:10px;">Elige un territorio para ver sus cuadras</div>
            </div>
          </div>

          <!-- Comentario opcional -->
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase;">Comentario (Opcional)</label>
            <input type="text" id="regComentario" placeholder="Ej. Faltaron dos casas por lluvia" style="
              width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:10px; font-size:13.5px; box-sizing:border-box; margin-top:3px;
            "/>
          </div>

          <!-- Casilla Visita SC -->
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:#475569; cursor:pointer;">
            <input type="checkbox" id="regVisitaSC" style="width:16px; height:16px; cursor:pointer; accent-color:#1a73e8;"/>
            <span>Trabajado durante la Visita del S.C.</span>
          </label>
        </div>

        <!-- Botones de Acción -->
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px;">
          <button id="btnEnviarReporte" style="
            width:100%; padding:13px; background:#1a73e8; color:white; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(26,115,232,0.3);
          ">Enviar Reporte para Aprobación ✅</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalReg").onclick = cerrar;

    // Poblar selector de territorios
    const selectTerr = modal.querySelector("#regSelectTerritorio");
    if (window.TERRITORIOS_DATA && Array.isArray(window.TERRITORIOS_DATA)) {
      window.TERRITORIOS_DATA.forEach(t => {
        const d = t.datos;
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = `Territorio ${d.numeroTerritorio !== undefined ? d.numeroTerritorio : d.id}`;
        if (territorioActivo && d.id === territorioActivo) opt.selected = true;
        selectTerr.appendChild(opt);
      });
    }

    const contenedorCuadras = modal.querySelector("#regContenedorCuadras");
    const btnToggleTodas = modal.querySelector("#btnToggleTodasCuadras");

    // Función para renderizar cuadras del territorio seleccionado
    function renderizarCuadras(tId) {
      if (!tId) {
        contenedorCuadras.innerHTML = '<div style="font-size:13px; color:#94a3b8; text-align:center; padding:10px;">Elige un territorio para ver sus cuadras</div>';
        return;
      }

      const item = window.TERRITORIOS_DATA.find(x => x.datos.id === tId);
      if (!item || !item.datos.poligonos) {
        contenedorCuadras.innerHTML = '<div style="font-size:13px; color:#94a3b8; text-align:center; padding:10px;">Sin cuadras registradas</div>';
        return;
      }

      contenedorCuadras.innerHTML = "";
      item.datos.poligonos.forEach((pol, idx) => {
        const cuadraNum = pol.label || (idx + 1);
        const label = document.createElement("label");
        label.style.cssText = "display:flex; align-items:center; gap:8px; font-size:13.5px; color:#334155; cursor:pointer; padding:3px 0;";
        const isPreselected = (preCuadraId && pol.id === preCuadraId);
        label.innerHTML = `
          <input type="checkbox" value="${pol.id}" class="chk-cuadra" ${isPreselected ? "checked" : ""} style="width:16px; height:16px; accent-color:#1a73e8; cursor:pointer;"/>
          <span style="font-weight:600;">Cuadra ${cuadraNum}</span>
        `;
        contenedorCuadras.appendChild(label);
      });
    }

    // Cargar cuadras iniciales si hay territorio preseleccionado
    if (selectTerr.value) {
      renderizarCuadras(selectTerr.value);
    }

    selectTerr.addEventListener("change", () => {
      renderizarCuadras(selectTerr.value);
    });

    btnToggleTodas.addEventListener("click", () => {
      const chks = contenedorCuadras.querySelectorAll(".chk-cuadra");
      if (chks.length === 0) return;
      const todas = Array.from(chks).every(c => c.checked);
      chks.forEach(c => c.checked = !todas);
      btnToggleTodas.textContent = todas ? "Seleccionar todas" : "Desmarcar todas";
    });

    // Guardar Reporte
    modal.querySelector("#btnEnviarReporte").onclick = () => {
      const capitan = modal.querySelector("#regCapitanNombre").value.trim();
      const fecha = modal.querySelector("#regFecha").value;
      const tId = selectTerr.value;
      const chks = Array.from(contenedorCuadras.querySelectorAll(".chk-cuadra:checked"));
      const comentario = modal.querySelector("#regComentario").value.trim();
      const visitaSC = modal.querySelector("#regVisitaSC").checked;

      if (!capitan) return alert("Por favor ingresa tu nombre.");
      if (!tId) return alert("Por favor selecciona un territorio.");
      if (chks.length === 0) return alert("Selecciona al menos una cuadra trabajada.");

      const itemT = window.TERRITORIOS_DATA.find(x => x.datos.id === tId);
      const numT = itemT ? (itemT.datos.numeroTerritorio !== undefined ? itemT.datos.numeroTerritorio : tId) : tId;
      const cuadrasIds = chks.map(c => c.value);

      // Obtener números de cuadras legibles para el mensaje
      const cuadrasLabels = chks.map(c => {
        const val = c.value;
        const polData = (itemT && itemT.datos.poligonos) ? itemT.datos.poligonos.find(p => p.id === val) : null;
        return (polData && polData.label) ? polData.label : val.replace(/^[a-zA-Z0-9]+_c/, '');
      });

      const totalCuadras = (itemT && itemT.datos.poligonos) ? itemT.datos.poligonos.length : chks.length;

      // Crear objeto de reporte pendiente
      const nuevoReporte = {
        id: "rep_" + Date.now(),
        fecha: fecha,
        territorioId: tId,
        territorioNumero: numT,
        cuadras: cuadrasIds,
        cuadrasLabels: cuadrasLabels,
        cuadrasTotal: chks.length,
        totalCuadrasTerritorio: totalCuadras,
        capitan: capitan,
        comentario: comentario,
        visitaSC: visitaSC,
        estado: "PENDIENTE",
        timestamp: Date.now()
      };

      guardarReportePendiente(nuevoReporte);
      cerrar();

      mostrarConfirmacionReporte(nuevoReporte);
    };
  };

  // 8. Almacenamiento de reportes pendientes
  function guardarReportePendiente(reporte) {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    lista.push(reporte);
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    // Marcar en estado local del territorio para que se pinte en gris
    if (reporte.territorioId && Array.isArray(reporte.cuadras)) {
      const estadoT = JSON.parse(localStorage.getItem(reporte.territorioId + "_estado") || "{}");
      reporte.cuadras.forEach(cId => {
        estadoT[cId] = true;
      });
      localStorage.setItem(reporte.territorioId + "_estado", JSON.stringify(estadoT));
    }

    actualizarContadorPendientes();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }

    // Sincronizar nuevo reporte en la nube con Google Sheets
    if (URL_API_GOOGLE_SHEETS) {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "nuevo_reporte", reporte: reporte })
      }).catch(err => console.warn("Error enviando reporte a Google Sheets:", err));
    }
  }

  function actualizarContadorPendientes() {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const pendientes = lista.filter(r => r.estado === "PENDIENTE");
    const badge = document.getElementById("badgeReportesPendientes");
    if (badge) {
      badge.textContent = pendientes.length;
      badge.style.display = pendientes.length > 0 ? "inline-block" : "none";
    }
  }

  // 9. Confirmación discreta y opción de notificar por WhatsApp
  function mostrarConfirmacionReporte(reporte) {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";

    // Formatear fecha: DD-MM-YYYY
    let fechaFormateada = reporte.fecha || "";
    if (fechaFormateada.includes("-")) {
      const p = fechaFormateada.split("-");
      if (p.length === 3) fechaFormateada = `${p[2]}-${p[1]}-${p[0]}`;
    }

    // Identificar cuadras en texto
    const labels = (reporte.cuadrasLabels && reporte.cuadrasLabels.length > 0)
      ? reporte.cuadrasLabels.join(", ")
      : reporte.cuadras.map(c => c.replace(/^[a-zA-Z0-9]+_c/, '')).join(", ");

    const textoCuadra = (reporte.cuadrasTotal === 1)
      ? `la cuadra *${labels}*`
      : `las cuadras *${labels}*`;

    // Mensaje con formato exacto solicitado
    const msgTexto = `*${reporte.capitan}*: Se termina hoy *${fechaFormateada}*, ${textoCuadra} del territorio *${reporte.territorioNumero}*.`;
    const msgWhatsApp = encodeURIComponent(msgTexto);

    modal.innerHTML = `
      <div class="terrosa-modal-card" style="text-align:center; padding:24px 20px 18px; position:relative; max-width:280px;">
        <!-- Logo discreto de WhatsApp -->
        <a href="https://api.whatsapp.com/send?text=${msgWhatsApp}" target="_blank" title="Notificar por WhatsApp" style="
          position:absolute; top:12px; right:12px; display:inline-flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:50%; background:#25D366; box-shadow:0 3px 8px rgba(37,211,102,0.35); text-decoration:none;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.05-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.2 8.2 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
          </svg>
        </a>

        <div style="font-size:32px; margin-bottom:8px;">✅</div>
        <h3 style="margin:0 0 18px 0; color:#1e293b; font-size:17.5px; font-weight:800;">Reporte registrado</h3>

        <button id="btnCerrarExito" style="
          width:100%; padding:11px; background:#1a73e8; border:none; border-radius:12px; font-weight:700; color:white; cursor:pointer; font-size:14px;
        ">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#btnCerrarExito").onclick = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };
  }

  // 10. Buzón de Aprobaciones del Encargado con Modal de PIN personalizado
  function pedirPinEncargado(callbackExito) {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:300px; text-align:center; padding:22px 18px 16px;">
        <h3 style="margin:0 0 6px 0; color:#1e293b; font-size:18px; font-weight:800;">Pendientes por aprobar</h3>
        <p style="margin:0 0 14px 0; color:#64748b; font-size:14px; font-weight:600;">Ingresa el PIN</p>
        <input type="password" id="inputPinEncargado" inputmode="numeric" placeholder="••••" maxlength="8" style="
          width:100%; text-align:center; font-size:24px; letter-spacing:8px; padding:10px; border:1.5px solid #cbd5e1; border-radius:12px; outline:none; box-sizing:border-box; margin-bottom:6px;
        " />
        <div id="msgErrorPin" style="color:#dc2626; font-size:12.5px; font-weight:700; min-height:18px; margin-bottom:10px;"></div>
        <div style="display:flex; gap:8px;">
          <button id="btnCancelarPin" style="
            flex:1; padding:11px; background:#f1f5f9; border:none; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; font-size:13.5px;
          ">Cancelar</button>
          <button id="btnAceptarPin" style="
            flex:1; padding:11px; background:#1a73e8; border:none; border-radius:10px; font-weight:700; color:white; cursor:pointer; font-size:13.5px;
          ">Aceptar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector("#inputPinEncargado");
    const msgError = modal.querySelector("#msgErrorPin");
    setTimeout(() => input.focus(), 80);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCancelarPin").onclick = cerrar;

    const validar = () => {
      const pin = input.value.trim();
      if (pin === PIN_ENCARGADO_DEFAULT) {
        cerrar();
        callbackExito();
      } else {
        msgError.textContent = "PIN incorrecto";
        input.value = "";
        input.focus();
      }
    };

    modal.querySelector("#btnAceptarPin").onclick = validar;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") validar();
    });
  }

  function vincularBuzonEncargado() {
    const btnBuzon = document.getElementById("btnBuzonReportes");
    if (btnBuzon) {
      btnBuzon.addEventListener("click", () => {
        pedirPinEncargado(() => {
          abrirModalBuzonAprobaciones();
        });
      });
    }
  }

  function abrirModalBuzonAprobaciones() {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const pendientes = lista.filter(r => r.estado === "PENDIENTE");

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0; color:#1e293b; font-size:17.5px; font-weight:800;">🔔 Aprobaciones S-13 (${pendientes.length})</h3>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="btnSyncNubeModal" title="Sincronizar con Google Sheets" style="background:#e0f2fe; border:none; border-radius:8px; padding:6px 11px; font-size:12px; font-weight:700; color:#0284c7; cursor:pointer;">🔄 Sincronizar</button>
            <button id="btnCerrarBuzon" style="background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; padding:4px;">✖</button>
          </div>
        </div>

        <div id="listaItemsBuzon" style="max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${pendientes.length === 0 ? '<div style="text-align:center; color:#94a3b8; padding:30px;">No hay reportes pendientes por aprobar. 🎉</div>' : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
      actualizarContadorPendientes();
    };

    modal.querySelector("#btnCerrarBuzon").onclick = cerrar;

    const btnSync = modal.querySelector("#btnSyncNubeModal");
    if (btnSync) {
      btnSync.onclick = () => {
        btnSync.textContent = "Sincronizando...";
        btnSync.disabled = true;
        window.sincronizarConNube(true).then(() => {
          btnSync.textContent = "🔄 Sincronizar";
          btnSync.disabled = false;
          cerrar();
          abrirModalBuzonAprobaciones();
        });
      };
    }

    const cont = modal.querySelector("#listaItemsBuzon");
    pendientes.forEach(rep => {
      const card = document.createElement("div");
      card.style.cssText = "background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px;";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; color:#1e293b; font-size:15px;">Territorio ${rep.territorioNumero}</span>
          <span style="font-size:12px; color:#64748b; font-weight:600;">${rep.fecha}</span>
        </div>
        <div style="font-size:13.5px; color:#334155;">
          <b>Capitán:</b> ${rep.capitan} (${rep.cuadrasTotal} cuadras)
        </div>
        ${rep.comentario ? `<div style="font-size:12.5px; color:#f59e0b; background:#fef3c7; padding:4px 8px; border-radius:6px;">💬 ${rep.comentario}</div>` : ''}
        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="btn-aprobar-rep" data-id="${rep.id}" style="
            flex:1; padding:9px; background:#16a34a; color:white; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;
          ">Aprobar ✅</button>
          <button class="btn-rechazar-rep" data-id="${rep.id}" style="
            padding:9px 14px; background:#f1f5f9; color:#dc2626; border:none; border-radius:8px; font-weight:600; font-size:13px; cursor:pointer;
          ">Descartar</button>
        </div>
      `;
      cont.appendChild(card);
    });

    // Delegar acciones de Aprobar / Descartar
    cont.querySelectorAll(".btn-aprobar-rep").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        aprobarReporte(id);
        cardElementRemove(btn);
      });
    });

    cont.querySelectorAll(".btn-rechazar-rep").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        descartarReporte(id);
        cardElementRemove(btn);
      });
    });

    function cardElementRemove(btn) {
      const card = btn.closest("div[style*='border']");
      if (card) {
        card.remove();
        const remaining = cont.querySelectorAll(".btn-aprobar-rep").length;
        const tituloModal = modal.querySelector("h3");
        if (tituloModal) {
          tituloModal.textContent = `🔔 Aprobaciones S-13 (${remaining})`;
        }
        if (remaining === 0) {
          cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:30px;">¡Todos los reportes fueron revisados! 🎉</div>';
        }
      }
    }
  }

  // 10.5. Seguimiento de mutaciones optimistas para evitar parpadeos con la nube
  function registrarMutacionAprobado(id) {
    try {
      const set = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_aprobadas") || "[]"));
      set.add(id);
      localStorage.setItem("terrosa_mutaciones_aprobadas", JSON.stringify(Array.from(set)));
    } catch (e) {}
  }

  function registrarMutacionEliminado(id) {
    try {
      const setElim = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_eliminadas") || "[]"));
      setElim.add(id);
      localStorage.setItem("terrosa_mutaciones_eliminadas", JSON.stringify(Array.from(setElim)));

      const setApr = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_aprobadas") || "[]"));
      setApr.delete(id);
      localStorage.setItem("terrosa_mutaciones_aprobadas", JSON.stringify(Array.from(setApr)));
    } catch (e) {}
  }

  // 11. Acción de Aprobar Reporte (Registra formalmente en datos del mapa y S-13)
  function aprobarReporte(id) {
    registrarMutacionAprobado(id);
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    if (!rep) return;

    rep.estado = "APROBADO";
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    // Guardar en la estructura de capitanes del territorio
    const registrosT = JSON.parse(localStorage.getItem(`${rep.territorioId}_capitanes`) || "{}");
    const estadoT = JSON.parse(localStorage.getItem(`${rep.territorioId}_estado`) || "{}");

    rep.cuadras.forEach(cuadraId => {
      if (!registrosT[cuadraId]) registrosT[cuadraId] = [];
      let texto = `Trabajado por: ${rep.capitan} | Fecha: ${rep.fecha}`;
      if (rep.visitaSC) texto += ` | VisitaSC: ${rep.fecha.slice(0, 7)}`;
      registrosT[cuadraId].push(texto);
      estadoT[cuadraId] = true; // Se mantiene en gris tras la aprobación
    });
    localStorage.setItem(`${rep.territorioId}_capitanes`, JSON.stringify(registrosT));
    localStorage.setItem(`${rep.territorioId}_estado`, JSON.stringify(estadoT));

    actualizarContadorPendientes();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }
    mostrarToastDiscreto("Aprobado ✅");

    // Sincronizar aprobación con Google Sheets (llena la hoja oficial S-13 en Drive)
    if (URL_API_GOOGLE_SHEETS) {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "aprobar_reporte", id: id })
      }).catch(err => console.warn("Error enviando aprobación a Google Sheets:", err));
    }
  }

  function descartarReporte(id) {
    registrarMutacionEliminado(id);
    let lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    lista = lista.filter(r => r.id !== id);
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    // Si se descarta, verificar si sus cuadras deben regresar a su color original
    if (rep && rep.territorioId && Array.isArray(rep.cuadras)) {
      const estadoT = JSON.parse(localStorage.getItem(rep.territorioId + "_estado") || "{}");
      rep.cuadras.forEach(cId => {
        // Solo revertir si no existe en ningún otro reporte pendiente o aprobado
        const existeEnOtro = lista.some(otro =>
          (otro.estado === "PENDIENTE" || otro.estado === "APROBADO") &&
          otro.territorioId === rep.territorioId &&
          Array.isArray(otro.cuadras) &&
          otro.cuadras.includes(cId)
        );
        if (!existeEnOtro) {
          delete estadoT[cId];
        }
      });
      localStorage.setItem(rep.territorioId + "_estado", JSON.stringify(estadoT));
    }

    actualizarContadorPendientes();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }

    // Sincronizar descarte con Google Sheets
    if (URL_API_GOOGLE_SHEETS) {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "descartar_reporte", id: id })
      }).catch(err => console.warn("Error enviando descarte a Google Sheets:", err));
    }
  }

  // 12. Notificación flotante discreta tipo toast
  function mostrarToastDiscreto(mensaje) {
    const prev = document.getElementById("toastDiscreto");
    if (prev) prev.remove();

    const toast = document.createElement("div");
    toast.id = "toastDiscreto";
    toast.textContent = mensaje || "Aprobado";
    toast.style.cssText = `
      position: fixed;
      top: calc(90px + env(safe-area-inset-top, 0px));
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: rgba(30, 41, 59, 0.95);
      color: #ffffff;
      padding: 9px 22px;
      border-radius: 30px;
      font-size: 14.5px;
      font-weight: 800;
      z-index: 100000;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(-10px)";
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 1800);
  }

  // 12.5. Limpieza de caché huérfana de cuadras marcadas en gris
  window.limpiarCacheCuadrasFantasma = function () {
    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const validKeys = new Set();
    reportes.forEach(r => {
      if (r.territorioId) {
        validKeys.add(r.territorioId + "_estado");
      }
    });

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.endsWith("_estado") && !validKeys.has(k)) {
        localStorage.removeItem(k);
      }
    }

    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }
    mostrarToastDiscreto("Caché limpiada y mapa restaurado ✅");
  };

  // 13. Pintar cuadras en gris (trabajadas / reportadas) y restaurar originales
  window.actualizarColoresCuadrasCapitan = function () {
    if (!window.todosLosTerritorios || !Array.isArray(window.todosLosTerritorios)) return;

    // Si hay un filtro de fecha activo en la cabecera, respetarlo
    if (window.hayFiltroFechaActivo && window.hayFiltroFechaActivo()) {
      window.ejecutarFiltroFecha();
      return;
    }

    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const cuadrasReportadasPorTerritorio = {};

    reportes.forEach(rep => {
      if (rep.estado === "PENDIENTE" || rep.estado === "APROBADO") {
        if (!cuadrasReportadasPorTerritorio[rep.territorioId]) {
          cuadrasReportadasPorTerritorio[rep.territorioId] = new Set();
        }
        if (Array.isArray(rep.cuadras)) {
          rep.cuadras.forEach(cId => cuadrasReportadasPorTerritorio[rep.territorioId].add(cId));
        }
      }
    });

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const setReportadas = cuadrasReportadasPorTerritorio[tId] || new Set();

      // Limpiar y alinear el estado local estrictamente con los reportes existentes
      const nuevoEstadoLocal = {};
      setReportadas.forEach(cId => {
        nuevoEstadoLocal[cId] = true;
      });
      localStorage.setItem(tId + "_estado", JSON.stringify(nuevoEstadoLocal));

      grupo.eachLayer(pol => {
        if (!pol._originalStyle) return;

        // La cuadra es gris ÚNICAMENTE si existe en un reporte activo (pendiente o aprobado)
        const esGris = setReportadas.has(pol._id);
        if (esGris) {
          pol._selected = true;
          pol.setStyle({
            color: "#475569",
            fillColor: "#64748b",
            fillOpacity: 0.85,
            weight: 2
          });
        } else {
          pol._selected = false;
          pol.setStyle(pol._originalStyle);
        }
      });
    });
  };

  // 14. Filtro de Fecha en Barra Superior (Año y Selector Múltiple de Meses)
  const NOMBRES_MESES = [
    { num: "01", nombre: "Enero", abrev: "Ene" },
    { num: "02", nombre: "Febrero", abrev: "Feb" },
    { num: "03", nombre: "Marzo", abrev: "Mar" },
    { num: "04", nombre: "Abril", abrev: "Abr" },
    { num: "05", nombre: "Mayo", abrev: "May" },
    { num: "06", nombre: "Junio", abrev: "Jun" },
    { num: "07", nombre: "Julio", abrev: "Jul" },
    { num: "08", nombre: "Agosto", abrev: "Ago" },
    { num: "09", nombre: "Septiembre", abrev: "Sep" },
    { num: "10", nombre: "Octubre", abrev: "Oct" },
    { num: "11", nombre: "Noviembre", abrev: "Nov" },
    { num: "12", nombre: "Diciembre", abrev: "Dic" }
  ];

  let mesesFiltroActivos = new Set();

  window.hayFiltroFechaActivo = function () {
    return mesesFiltroActivos.size > 0 && mesesFiltroActivos.size < 12;
  };

  function abrirModalSeleccionarMeses() {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";

    let itemsHtml = "";
    NOMBRES_MESES.forEach(m => {
      const isChecked = mesesFiltroActivos.has(m.num);
      itemsHtml += `
        <label style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; cursor:pointer; background:${isChecked ? 'rgba(26,115,232,0.1)' : 'transparent'};">
          <input type="checkbox" value="${m.num}" class="chk-mes-filtro" ${isChecked ? 'checked' : ''} style="width:17px; height:17px; accent-color:#1a73e8; cursor:pointer;"/>
          <span style="font-weight:600; font-size:14px; color:#1e293b;">${m.nombre}</span>
        </label>
      `;
    });

    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:320px; padding:20px 18px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; font-size:17.5px; font-weight:800; color:#1e293b;">Seleccionar Meses</h3>
          <button id="btnCerrarModalMeses" style="background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; padding:2px;">✖</button>
        </div>
        <p style="margin:0 0 10px 0; font-size:12.5px; color:#64748b;">Elige uno o varios meses para filtrar lo trabajado:</p>
        
        <div id="listaMesesCheck" style="max-height:250px; overflow-y:auto; display:flex; flex-direction:column; gap:2px; border:1px solid #e2e8f0; border-radius:10px; padding:6px; margin-bottom:12px;">
          ${itemsHtml}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <button id="btnToggleTodosMeses" style="background:#f1f5f9; border:none; border-radius:8px; padding:10px 14px; font-size:13px; font-weight:700; color:#475569; cursor:pointer;">
            ${mesesFiltroActivos.size === 12 ? 'Limpiar' : 'Todos'}
          </button>
          <button id="btnAplicarMeses" style="flex:1; background:#1a73e8; border:none; border-radius:8px; padding:10px; font-size:14px; font-weight:700; color:white; cursor:pointer;">
            Aplicar Filtro
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalMeses").onclick = cerrar;

    const listaCheck = modal.querySelector("#listaMesesCheck");
    const chks = listaCheck.querySelectorAll(".chk-mes-filtro");

    modal.querySelector("#btnToggleTodosMeses").onclick = () => {
      const todos = Array.from(chks).every(c => c.checked);
      chks.forEach(c => {
        c.checked = !todos;
        c.closest("label").style.background = !todos ? 'rgba(26,115,232,0.1)' : 'transparent';
      });
      modal.querySelector("#btnToggleTodosMeses").textContent = !todos ? 'Limpiar' : 'Todos';
    };

    chks.forEach(c => {
      c.onchange = () => {
        c.closest("label").style.background = c.checked ? 'rgba(26,115,232,0.1)' : 'transparent';
      };
    });

    modal.querySelector("#btnAplicarMeses").onclick = () => {
      mesesFiltroActivos.clear();
      chks.forEach(c => {
        if (c.checked) mesesFiltroActivos.add(c.value);
      });
      actualizarEtiquetaBotonMeses();
      window.ejecutarFiltroFecha();
      cerrar();
    };
  }

  function actualizarEtiquetaBotonMeses() {
    const lbl = document.getElementById("txtFiltroMesesLabel");
    const btnLimpiar = document.getElementById("btnLimpiarFiltroFecha");
    if (!lbl) return;

    if (mesesFiltroActivos.size === 0 || mesesFiltroActivos.size === 12) {
      lbl.textContent = "Mes: Todos";
      if (btnLimpiar) btnLimpiar.style.display = "none";
    } else if (mesesFiltroActivos.size === 1) {
      const num = Array.from(mesesFiltroActivos)[0];
      const mObj = NOMBRES_MESES.find(m => m.num === num);
      lbl.textContent = `Mes: ${mObj ? mObj.nombre : num}`;
      if (btnLimpiar) btnLimpiar.style.display = "inline-flex";
    } else if (mesesFiltroActivos.size === 2) {
      const arr = Array.from(mesesFiltroActivos).map(num => {
        const mObj = NOMBRES_MESES.find(m => m.num === num);
        return mObj ? mObj.abrev : num;
      });
      lbl.textContent = `Mes: ${arr.join(", ")}`;
      if (btnLimpiar) btnLimpiar.style.display = "inline-flex";
    } else {
      lbl.textContent = `Mes (${mesesFiltroActivos.size})`;
      if (btnLimpiar) btnLimpiar.style.display = "inline-flex";
    }
  }

  window.ejecutarFiltroFecha = function () {
    if (!window.todosLosTerritorios || !Array.isArray(window.todosLosTerritorios)) return;

    const anioElem = document.getElementById("selectFiltroAnio");
    const btnLimpiar = document.getElementById("btnLimpiarFiltroFecha");
    const anio = anioElem ? anioElem.value : String(new Date().getFullYear());

    const activo = window.hayFiltroFechaActivo();
    if (btnLimpiar) btnLimpiar.style.display = activo ? "inline-flex" : "none";

    if (!activo) {
      const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
      const cuadrasReportadas = {};
      reportes.forEach(rep => {
        if (rep.estado === "PENDIENTE" || rep.estado === "APROBADO") {
          if (!cuadrasReportadas[rep.territorioId]) cuadrasReportadas[rep.territorioId] = new Set();
          if (Array.isArray(rep.cuadras)) rep.cuadras.forEach(cId => cuadrasReportadas[rep.territorioId].add(cId));
        }
      });

      window.todosLosTerritorios.forEach(grupo => {
        const tId = grupo._id;
        const setRep = cuadrasReportadas[tId] || new Set();
        const estLoc = JSON.parse(localStorage.getItem(tId + "_estado") || "{}");
        grupo.eachLayer(pol => {
          if (!pol._originalStyle) return;
          if (setRep.has(pol._id) || Boolean(estLoc[pol._id])) {
            pol._selected = true;
            pol.setStyle({ color: "#475569", fillColor: "#64748b", fillOpacity: 0.85, weight: 2 });
          } else {
            pol._selected = false;
            pol.setStyle(pol._originalStyle);
          }
        });
      });
      return;
    }

    // Prefijos seleccionados (ej: ["2026-10", "2026-11"])
    const prefijos = Array.from(mesesFiltroActivos).map(m => `${anio}-${m}`);

    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const cuadrasCoincidentes = {};

    reportes.forEach(rep => {
      if (!rep.fecha) return;
      const coincide = prefijos.some(p => rep.fecha.startsWith(p));
      if (coincide && Array.isArray(rep.cuadras)) {
        if (!cuadrasCoincidentes[rep.territorioId]) cuadrasCoincidentes[rep.territorioId] = new Set();
        rep.cuadras.forEach(cId => cuadrasCoincidentes[rep.territorioId].add(cId));
      }
    });

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const registros = JSON.parse(localStorage.getItem(tId + "_capitanes") || "{}");

      Object.keys(registros).forEach(polId => {
        const lineas = registros[polId] || [];
        const tieneFecha = lineas.some(linea => {
          const m = linea.match(/Fecha:\s*(\d{4}-\d{2})/);
          return m && prefijos.includes(m[1]);
        });
        if (tieneFecha) {
          if (!cuadrasCoincidentes[tId]) cuadrasCoincidentes[tId] = new Set();
          cuadrasCoincidentes[tId].add(polId);
        }
      });
    });

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const setMatch = cuadrasCoincidentes[tId] || new Set();

      grupo.eachLayer(pol => {
        if (!pol._originalStyle) return;

        if (setMatch.has(pol._id)) {
          pol.setStyle({
            color: "#334155",
            fillColor: "#64748b",
            fillOpacity: 0.9,
            weight: 2
          });
        } else {
          pol.setStyle(pol._originalStyle);
        }
      });
    });
  };

  function inicializarFiltroFechaBarra() {
    const anioElem = document.getElementById("selectFiltroAnio");
    const btnMeses = document.getElementById("btnModalFiltroMeses");
    const btnLimpiar = document.getElementById("btnLimpiarFiltroFecha");

    if (anioElem && anioElem.options.length === 0) {
      const anioActual = new Date().getFullYear();
      [anioActual - 1, anioActual, anioActual + 1].forEach(a => {
        const opt = document.createElement("option");
        opt.value = String(a);
        opt.textContent = String(a);
        if (a === anioActual) opt.selected = true;
        anioElem.appendChild(opt);
      });
    }

    if (anioElem) {
      anioElem.addEventListener("change", () => {
        window.ejecutarFiltroFecha();
      });
    }

    if (btnMeses) {
      btnMeses.addEventListener("click", () => {
        abrirModalSeleccionarMeses();
      });
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", () => {
        mesesFiltroActivos.clear();
        actualizarEtiquetaBotonMeses();
        window.ejecutarFiltroFecha();
      });
    }
  }

  // 15. Sincronización en la Nube con Google Sheets (Merge optimista y seguro)
  window.sincronizarConNube = async function (mostrarFeedback = false) {
    if (!URL_API_GOOGLE_SHEETS) return;
    try {
      if (mostrarFeedback) mostrarToastDiscreto("Sincronizando con Google Sheets... ⏳");

      const res = await fetch(URL_API_GOOGLE_SHEETS, { method: "GET" });
      const data = await res.json();

      if (data && data.exito && Array.isArray(data.reportes)) {
        const eliminadosLocales = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_eliminadas") || "[]"));
        const aprobadosLocales = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_aprobadas") || "[]"));

        // Limpiar de mutaciones pendientes lo que la nube ya confirmó
        data.reportes.forEach(r => {
          if (r.estado === "APROBADO") aprobadosLocales.delete(r.id);
        });
        const idsNube = new Set(data.reportes.map(r => r.id));
        eliminadosLocales.forEach(id => {
          if (!idsNube.has(id)) eliminadosLocales.delete(id);
        });
        localStorage.setItem("terrosa_mutaciones_aprobadas", JSON.stringify(Array.from(aprobadosLocales)));
        localStorage.setItem("terrosa_mutaciones_eliminadas", JSON.stringify(Array.from(eliminadosLocales)));

        // Normalizar fechas y filtrar los reportes eliminados localmente
        let reportesNormalizados = data.reportes
          .filter(r => !eliminadosLocales.has(r.id))
          .map(r => {
            let f = r.fecha || "";
            if (f && f.length > 10 && !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
              const d = new Date(f);
              if (!isNaN(d.getTime())) {
                const anio = d.getFullYear();
                const mes = ("0" + (d.getMonth() + 1)).slice(-2);
                const dia = ("0" + d.getDate()).slice(-2);
                f = `${anio}-${mes}-${dia}`;
              }
            }
            r.fecha = f;

            // Mantener como APROBADO si el usuario lo aprobó localmente y la nube aún está procesando
            if (aprobadosLocales.has(r.id)) {
              r.estado = "APROBADO";
            }
            return r;
          });

        // Preservar reportes recién creados en local que aún van subiendo a la nube
        const listaLocal = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
        listaLocal.forEach(rLoc => {
          if (!eliminadosLocales.has(rLoc.id)) {
            const existeEnNube = reportesNormalizados.some(rNub => rNub.id === rLoc.id);
            if (!existeEnNube) {
              reportesNormalizados.push(rLoc);
            }
          }
        });

        localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(reportesNormalizados));

        actualizarContadorPendientes();

        if (typeof window.actualizarColoresCuadrasCapitan === "function") {
          window.actualizarColoresCuadrasCapitan();
        }

        if (mostrarFeedback) mostrarToastDiscreto("Sincronizado con éxito ✅");
      }
    } catch (err) {
      console.warn("Modo offline o error al sincronizar con Google Sheets:", err);
      if (mostrarFeedback) mostrarToastDiscreto("Sin conexión a la nube ⚠️");
    }
  };

})();

