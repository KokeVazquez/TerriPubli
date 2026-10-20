// ==============================================================================================================================
// === TERROSA — MÓDULO DE CAPITANES Y APROBACIÓN S-13 ===
// ==============================================================================================================================

(function () {
  "use strict";

  const PIN_ENCARGADO_DEFAULT = "1234";

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
    vincularBuzonEncargado();
  };

  // 3. Actualizar interfaz según el modo (Publicador vs Capitán)
  function actualizarInterfazSegunModo() {
    const modo = window.getModoActual();
    const nombreCapitan = window.getCapitanNombre();

    // Actualizar botones del selector de modo
    document.querySelectorAll(".modo-toggle-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.modo === modo);
    });

    // Elementos exclusivos de Capitán
    const esCapitan = (modo === "capitan");
    const capitanOnlyElements = document.querySelectorAll(".capitan-only");
    capitanOnlyElements.forEach(el => {
      el.style.display = esCapitan ? "inline-flex" : "none";
    });

    // Panel de info del capitán en el menú
    const perfilInfo = document.getElementById("perfilCapitanInfo");
    const txtNombre = document.getElementById("txtNombreCapitan");
    const seccionEncargado = document.getElementById("seccionEncargado");

    if (perfilInfo && txtNombre) {
      if (esCapitan && nombreCapitan) {
        txtNombre.textContent = nombreCapitan;
        perfilInfo.style.display = "block";
      } else {
        perfilInfo.style.display = "none";
      }
    }

    if (seccionEncargado) {
      seccionEncargado.style.display = esCapitan ? "block" : "none";
      actualizarContadorPendientes();
    }

    // Cabecera superior (subtítulo o badge sutil)
    const headerTitle = document.querySelector(".top-header-title");
    if (headerTitle) {
      let badge = document.getElementById("badgeModoActivo");
      if (esCapitan && nombreCapitan) {
        if (!badge) {
          badge = document.createElement("div");
          badge.id = "badgeModoActivo";
          badge.className = "top-header-badge";
          headerTitle.appendChild(badge);
        }
        badge.textContent = `Capitán: ${nombreCapitan}`;
        badge.style.display = "block";
      } else if (badge) {
        badge.style.display = "none";
      }
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

    // Botón para cambiar nombre de capitán
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

  // 6. Botón Registrar Territorio en Barra Inferior
  function vincularBotonRegistrar() {
    const btnRegistrar = document.getElementById("btnRegistrarTerritorio");
    if (btnRegistrar) {
      btnRegistrar.addEventListener("click", () => {
        abrirModalRegistroTerritorio();
      });
    }
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
      const numT = itemT ? itemT.datos.numeroTerritorio : tId;
      const cuadrasIds = chks.map(c => c.value);

      // Crear objeto de reporte pendiente
      const nuevoReporte = {
        id: "rep_" + Date.now(),
        fecha: fecha,
        territorioId: tId,
        territorioNumero: numT,
        cuadras: cuadrasIds,
        cuadrasTotal: chks.length,
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
    actualizarContadorPendientes();
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

  // 9. Confirmación y opción de notificar por WhatsApp
  function mostrarConfirmacionReporte(reporte) {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    const msgWhatsApp = encodeURIComponent(
      `Hno., le reporto que hoy ${reporte.fecha} terminamos el Territorio ${reporte.territorioNumero} (${reporte.cuadrasTotal} cuadras) — Capitán: ${reporte.capitan} ✅`
    );

    modal.innerHTML = `
      <div class="terrosa-modal-card">
        <div style="font-size:36px; text-align:center; margin-bottom:8px;">✅</div>
        <h3 style="margin:0 0 6px 0; color:#1e293b; text-align:center; font-size:18px;">¡Reporte Registrado!</h3>
        <p style="font-size:13.5px; color:#475569; text-align:center; margin-bottom:18px; line-height:1.4;">
          El territorio quedó enviado como <b>PENDIENTE</b>. El encargado lo revisará para integrarlo a la hoja oficial S-13.
        </p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <a href="https://wa.me/?text=${msgWhatsApp}" target="_blank" style="
            display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; background:#25D366; color:white; text-decoration:none; border-radius:12px; font-weight:700; font-size:14px;
          ">
            <span>💬 Notificar por WhatsApp</span>
          </a>
          <button id="btnCerrarExito" style="
            padding:11px; background:#f1f5f9; border:none; border-radius:12px; font-weight:600; color:#475569; cursor:pointer; font-size:13.5px;
          ">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#btnCerrarExito").onclick = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };
  }

  // 10. Buzón de Aprobaciones del Encargado
  function vincularBuzonEncargado() {
    const btnBuzon = document.getElementById("btnBuzonReportes");
    if (btnBuzon) {
      btnBuzon.addEventListener("click", () => {
        // Pedir PIN de encargado
        const pin = prompt("Ingresa el PIN de Encargado (Por defecto: 1234):");
        if (pin === null) return;
        if (pin !== PIN_ENCARGADO_DEFAULT) {
          alert("PIN incorrecto.");
          return;
        }
        abrirModalBuzonAprobaciones();
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
          <button id="btnCerrarBuzon" style="background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; padding:4px;">✖</button>
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
      if (card) card.remove();
      const remaining = cont.querySelectorAll(".btn-aprobar-rep").length;
      if (remaining === 0) {
        cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:30px;">¡Todos los reportes fueron revisados! 🎉</div>';
      }
    }
  }

  // 11. Acción de Aprobar Reporte (Registra formalmente en datos del mapa y S-13)
  function aprobarReporte(id) {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    if (!rep) return;

    rep.estado = "APROBADO";
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    // Guardar en la estructura de capitanes del territorio
    const registrosT = JSON.parse(localStorage.getItem(`${rep.territorioId}_capitanes`) || "{}");
    rep.cuadras.forEach(cuadraId => {
      if (!registrosT[cuadraId]) registrosT[cuadraId] = [];
      let texto = `Trabajado por: ${rep.capitan} | Fecha: ${rep.fecha}`;
      if (rep.visitaSC) texto += ` | VisitaSC: ${rep.fecha.slice(0, 7)}`;
      registrosT[cuadraId].push(texto);
    });
    localStorage.setItem(`${rep.territorioId}_capitanes`, JSON.stringify(registrosT));

    actualizarContadorPendientes();
    alert(`Reporte de Territorio ${rep.territorioNumero} aprobado con éxito ✅`);
  }

  function descartarReporte(id) {
    let lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    lista = lista.filter(r => r.id !== id);
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));
    actualizarContadorPendientes();
  }

})();
