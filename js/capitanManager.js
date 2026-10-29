// ==============================================================================================================================
// === TERROSA — MÓDULO DE CAPITANES Y APROBACIÓN S-13 ===
// ==============================================================================================================================

(function () {
  "use strict";

  const PIN_ENCARGADO_DEFAULT = "8318";
  const URL_API_GOOGLE_SHEETS = "https://script.google.com/macros/s/AKfycbysLvd2KoADFWNsFflNolxQjrHVFn7rW9oDdewPyt7MfPoPbZ3w6qEALYoypQVJTerCmg/exec";

  // Usuarios con permiso de ingresar al Modo Capitán
  const USUARIOS_ACCESO_CAPITAN = [
    "Koke",
    "Merari Rosales"
  ];

  // Base de datos oficial de Capitanes disponibles para reportar territorios
  const LISTA_CAPITANES_OFICIAL = [
    "Jorge Vázquez",
    "Merari Rosales",
    "Alex García",
    "Alfredo Dávila",
    "César Pineda",
    "Daniel López",
    "Diego Cerecedo",
    "Edgar Rodríguez",
    "Elijah Rodríguez",
    "Félix Acuña",
    "Fernando García",
    "Heber Ramos",
    "Jaciel Barrios",
    "Jair Barraza",
    "Jesús Alba",
    "Josué Ramos",
    "Luis Gardea",
    "Moisés García",
    "Oscar Hernández",
    "René Molina",
    "Ricardo Salinas",
    "Rinat Reséndiz"
  ];

  // --- Utilidades de búsqueda, normalización y validación estricta de capitanes oficiales ---
  function normalizarTextoBusqueda(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function buscarCapitanesSugeridos(query) {
    const qn = normalizarTextoBusqueda(query);
    if (!qn) return [...LISTA_CAPITANES_OFICIAL];

    const prefixMatches = [];
    const wordPrefixMatches = [];
    const containsMatches = [];

    for (let i = 0; i < LISTA_CAPITANES_OFICIAL.length; i++) {
      const c = LISTA_CAPITANES_OFICIAL[i];
      const cn = normalizarTextoBusqueda(c);
      const words = cn.split(/\s+/);
      if (cn.startsWith(qn)) {
        prefixMatches.push(c);
      } else if (words.some(w => w.startsWith(qn))) {
        wordPrefixMatches.push(c);
      } else if (cn.includes(qn)) {
        containsMatches.push(c);
      }
    }
    return [...prefixMatches, ...wordPrefixMatches, ...containsMatches];
  }

  function resolverCapitanOficial(texto) {
    const q = normalizarTextoBusqueda(texto);
    if (!q) return null;
    // 1. Coincidencia exacta sin importar mayúsculas ni acentos
    const exact = LISTA_CAPITANES_OFICIAL.find(c => normalizarTextoBusqueda(c) === q);
    if (exact) return exact;

    // 2. Coincidencia por primer nombre o inicio de palabra único
    const prefijos = LISTA_CAPITANES_OFICIAL.filter(c => {
      const cn = normalizarTextoBusqueda(c);
      const words = cn.split(/\s+/);
      return words[0] === q || cn.startsWith(q + " ");
    });
    if (prefijos.length === 1) return prefijos[0];

    return null;
  }

  function vincularAutocompleteCapitan(inputEl, dropdownEl, badgeEstadoEl, onSelect) {
    if (!inputEl || !dropdownEl) return;

    function renderSugerencias(query) {
      const lista = buscarCapitanesSugeridos(query);
      if (lista.length === 0) {
        dropdownEl.innerHTML = `
          <div style="padding:10px 14px; font-size:12.5px; color:#94a3b8; text-align:center;">
            Sin coincidencias en la lista oficial
          </div>
        `;
      } else {
        dropdownEl.innerHTML = lista.map(c => `
          <div class="sugerencia-capitan-item" data-nombre="${escaparTextoSeguro(c)}" style="
            padding:10px 14px; cursor:pointer; font-size:13.5px; font-weight:700; color:#1e293b;
            display:flex; align-items:center; justify-content:space-between;
            border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;
          ">
            <span>👤 ${escaparTextoSeguro(c)}</span>
            <span style="font-size:11px; color:#16a34a; background:#dcfce7; padding:2px 7px; border-radius:10px; font-weight:700;">Oficial ✓</span>
          </div>
        `).join("");
      }
      dropdownEl.style.display = "block";
    }

    inputEl.addEventListener("focus", () => {
      renderSugerencias(inputEl.value);
    });

    inputEl.addEventListener("input", () => {
      renderSugerencias(inputEl.value);
      actualizarEstadoVisual();
    });

    dropdownEl.addEventListener("pointerdown", (e) => {
      const item = e.target.closest(".sugerencia-capitan-item");
      if (item) {
        e.preventDefault();
        const seleccionado = item.dataset.nombre;
        inputEl.value = seleccionado;
        dropdownEl.style.display = "none";
        actualizarEstadoVisual();
        if (typeof onSelect === "function") onSelect(seleccionado);
        window.reproducirSonidoClick("tap");
      }
    });

    function actualizarEstadoVisual() {
      const oficial = resolverCapitanOficial(inputEl.value);
      if (!inputEl.value.trim()) {
        inputEl.style.borderColor = "#cbd5e1";
        inputEl.style.boxShadow = "none";
        if (badgeEstadoEl) badgeEstadoEl.innerHTML = "";
      } else if (oficial) {
        inputEl.style.borderColor = "#16a34a";
        inputEl.style.boxShadow = "0 0 0 2px rgba(22, 163, 74, 0.18)";
        if (badgeEstadoEl) badgeEstadoEl.innerHTML = '<span style="color:#16a34a; font-size:15px; font-weight:800;" title="Capitán oficial verificado">✓</span>';
      } else {
        inputEl.style.borderColor = "#f59e0b";
        inputEl.style.boxShadow = "0 0 0 2px rgba(245, 158, 11, 0.18)";
        if (badgeEstadoEl) badgeEstadoEl.innerHTML = '<span style="color:#f59e0b; font-size:15px; font-weight:800;" title="No coincide con la lista oficial">⚠️</span>';
      }
    }

    document.addEventListener("click", (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.style.display = "none";
        const match = resolverCapitanOficial(inputEl.value);
        if (match) {
          inputEl.value = match;
        }
        actualizarEstadoVisual();
      }
    });

    actualizarEstadoVisual();
  }

  // Sistema de audio táctil háptico moderno (Web Audio API nativo y ligero)
  let _audioCtx = null;
  function getAudioContext() {
    try {
      if (!_audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) _audioCtx = new AudioCtx();
      }
      if (_audioCtx && _audioCtx.state === "suspended") {
        _audioCtx.resume().catch(() => { });
      }
      return _audioCtx;
    } catch (e) {
      return null;
    }
  }

  window.reproducirSonidoClick = function (tipo = "tap") {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (tipo === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (tipo === "delete") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (tipo === "toggle") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.035);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
      } else { // tap común
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
        osc.start(now);
        osc.stop(now + 0.038);
      }
    } catch (e) { }
  };

  // Helper unificado y robusto para parsear fechas de cualquier origen (ISO YYYY-MM-DD, DD/MM/YYYY, etc.)
  function parsearFechaReporte(fechaStr) {
    if (!fechaStr) return { anio: "", mes: "", dia: "", fechaISO: "", fechaDisplay: "" };
    const str = String(fechaStr).trim();

    // Caso 1: YYYY-MM-DD o YYYY/MM/DD
    const mISO = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (mISO) {
      const anio = mISO[1];
      const mes = mISO[2].padStart(2, "0");
      const dia = mISO[3].padStart(2, "0");
      return {
        anio,
        mes,
        dia,
        fechaISO: `${anio}-${mes}-${dia}`,
        fechaDisplay: `${dia}/${mes}/${anio}`
      };
    }

    // Caso 2: DD/MM/YYYY o DD-MM-YYYY
    const mDMY = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (mDMY) {
      const dia = mDMY[1].padStart(2, "0");
      const mes = mDMY[2].padStart(2, "0");
      const anio = mDMY[3];
      return {
        anio,
        mes,
        dia,
        fechaISO: `${anio}-${mes}-${dia}`,
        fechaDisplay: `${dia}/${mes}/${anio}`
      };
    }

    // Caso 3: Objeto Date nativo
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const anio = String(d.getFullYear());
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return {
        anio,
        mes,
        dia,
        fechaISO: `${anio}-${mes}-${dia}`,
        fechaDisplay: `${dia}/${mes}/${anio}`
      };
    }

    return { anio: "", mes: "", dia: "", fechaISO: str, fechaDisplay: str };
  }

  function formatearFechaCorta(fechaStr) {
    const p = parsearFechaReporte(fechaStr);
    return p.fechaDisplay || fechaStr;
  }

  // Obtener fecha actual en zona horaria local (evita desfase UTC después de las 6:00 PM)
  function obtenerFechaLocalISO() {
    const d = new Date();
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }

  function escaparTextoSeguro(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 1. Obtener estado actual y versión activa (Anterior vs Nueva)
  window.getModoActual = function () {
    return localStorage.getItem("terrosa_modo") || "publicador";
  };

  window.getCapitanNombre = function () {
    return localStorage.getItem("terrosa_capitan_nombre") || "";
  };

  window.getVersionTerritorioActiva = function () {
    return "anterior";
  };

  function perteneceAVersionActiva(rep) {
    return true;
  }

  // Extrae solo el número de territorio (ej: "territorio42" -> "42") para guardar limpio en Excel
  function obtenerNumeroTerritorioLimpio(tId, tNum) {
    const numStr = String(tNum !== undefined && tNum !== null ? tNum : "").trim();
    if (/^\d+$/.test(numStr)) return String(parseInt(numStr, 10));
    const m = String(tId || "").match(/(\d+)/);
    if (m) return String(parseInt(m[1], 10));
    return numStr || String(tId || "").trim();
  }

  // Devuelve el ID de grupo del mapa Leaflet (ej: "42" -> "territorio42")
  function obtenerTerritorioIdLimpio(rep) {
    const idRaw = String((rep && (rep.territorioId || rep.territorioNumero)) || "")
      .replace(/^(nueva_|anterior_)/, "")
      .trim();
    if (/^\d+$/.test(idRaw)) {
      return "territorio" + parseInt(idRaw, 10);
    }
    if (idRaw.toLowerCase().includes("negocios")) {
      return "territorionegocios";
    }
    return idRaw;
  }

  // Convierte ID de polígono del mapa ("Cuadra1_Territorio42") a código corto de Excel ("T42C1")
  function aCodigoCortoCuadra(cId, numTerr) {
    const raw = String(cId || "").trim();
    if (!raw) return "";
    const mCorto = raw.match(/^T(\d+)C(\d+)$/i);
    if (mCorto) return `T${mCorto[1]}C${mCorto[2]}`;
    const mLargo = raw.match(/^Cuadra(\d+)_Territorio(\d+)$/i);
    if (mLargo) return `T${mLargo[2]}C${mLargo[1]}`;
    const nT = obtenerNumeroTerritorioLimpio("", numTerr);
    if (/^\d+$/.test(raw) && nT) return `T${nT}C${raw}`;
    return raw;
  }

  // Devuelve tanto el código corto ("T42C1") como el ID del polígono del mapa ("Cuadra1_Territorio42")
  function obtenerVariantesIdCuadra(cId, numTerr) {
    const raw = String(cId || "").trim();
    const res = [raw];
    const mCorto = raw.match(/^T(\d+)C(\d+)$/i);
    if (mCorto) {
      res.push(`Cuadra${mCorto[2]}_Territorio${mCorto[1]}`);
      res.push(`T${mCorto[1]}C${mCorto[2]}`);
      return res;
    }
    const mLargo = raw.match(/^Cuadra(\d+)_Territorio(\d+)$/i);
    if (mLargo) {
      res.push(`T${mLargo[2]}C${mLargo[1]}`);
      res.push(`Cuadra${mLargo[1]}_Territorio${mLargo[2]}`);
      return res;
    }
    const nT = obtenerNumeroTerritorioLimpio("", numTerr);
    if (/^\d+$/.test(raw) && nT) {
      res.push(`T${nT}C${raw}`);
      res.push(`Cuadra${raw}_Territorio${nT}`);
    }
    return res;
  }

  // Extrae solo el número de cuadra para mostrar en tarjetas ("T42C1" -> "1")
  function formatearEtiquetaCuadraCorta(cId) {
    const raw = String(cId || "").trim();
    const mCorto = raw.match(/^T\d+C(\d+)$/i);
    if (mCorto) return mCorto[1];
    const mLargo = raw.match(/^Cuadra(\d+)_Territorio\d+$/i);
    if (mLargo) return mLargo[1];
    return raw.replace(/^[a-zA-Z0-9]+_c/, "");
  }

  // Deduplicación inteligente: si dos reportes tienen el mismo territorio, misma fecha, mismo capitán y mismas cuadras, se conserva solo uno (priorizando el ID oficial de la nube YYYYMMDD_T...)
  function deduplicarListaReportes(lista) {
    if (!Array.isArray(lista)) return [];
    const mapaUnicos = new Map();

    lista.forEach(r => {
      if (!r || typeof r !== "object") return;
      const tNum = String(obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero));
      const fIso = String(r.fecha || "").slice(0, 10);
      const capLimpio = String(r.capitan || "").trim().toLowerCase();
      const cuadrasKey = Array.isArray(r.cuadras)
        ? r.cuadras.map(c => aCodigoCortoCuadra(c, tNum)).sort().join(",")
        : "";

      const hashKey = `${tNum}_${fIso}_${capLimpio}_${cuadrasKey}`;

      if (!mapaUnicos.has(hashKey)) {
        mapaUnicos.set(hashKey, r);
      } else {
        const existente = mapaUnicos.get(hashKey);
        // Si el reporte actual tiene formato de ID oficial de Google Sheets (YYYYMMDD_T...), sustituye al ID viejo local
        const esOficialActual = /^\d{8}_T\d+_\d+$/.test(String(r.id || ""));
        const esOficialExistente = /^\d{8}_T\d+_\d+$/.test(String(existente.id || ""));
        if (esOficialActual && !esOficialExistente) {
          mapaUnicos.set(hashKey, r);
        }
      }
    });

    return Array.from(mapaUnicos.values());
  }

  // Purgar por completo todas las llaves viejas y deduplicar reportes guardados
  function purgarBasuraLocalStorage() {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.endsWith("_estado") || k.endsWith("_capitanes"))) {
          localStorage.removeItem(k);
        }
      }

      // Limpiar automáticamente reportes duplicados que hayan quedado de versiones o IDs anteriores
      const rawReportes = localStorage.getItem("terrosa_reportes_pendientes");
      if (rawReportes) {
        const lista = JSON.parse(rawReportes);
        if (Array.isArray(lista) && lista.length > 0) {
          const listaLimpia = deduplicarListaReportes(lista);
          if (listaLimpia.length !== lista.length) {
            localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(listaLimpia));
          }
        }
      }

      // Parámetro de emergencia para desbloquear o limpiar bloqueos residuales
      if (window.location.search.includes("desbloquear") || window.location.hash.includes("desbloquear")) {
        localStorage.removeItem("terrosa_acceso_bloqueado");
        localStorage.removeItem("terrosa_dispositivo_id");
      }
      localStorage.removeItem("terrosa_acceso_bloqueado");
    } catch (e) { }
  }

  // 2. Inicializador del módulo
  window.inicializarModuloCapitan = function () {
    purgarBasuraLocalStorage();
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
    // Verificar estado de autorización de este dispositivo en la nube
    if (typeof window.verificarAccesoEnNube === "function") {
      window.verificarAccesoEnNube();
    }
    // Si es un usuario nuevo en este dispositivo, solicitar amablemente su nombre
    setTimeout(() => {
      if (typeof window.abrirModalBienvenidaNombre === "function") {
        window.abrirModalBienvenidaNombre();
      }
    }, 700);
  };

  // 3. Actualizar interfaz según el modo (Publicador vs Capitán)
  window.actualizarInterfazSegunModo = function actualizarInterfazSegunModo() {
    const modo = window.getModoActual();
    const nombreCapitan = window.getCapitanNombre();
    const esCapitan = (modo === "capitan");

    // Marcar clase en body para adaptar la barra inferior y superior
    document.body.classList.toggle("modo-capitan", esCapitan);

    // Ajustar cabecera superior
    const tituloPrincipal = document.getElementById("tituloHeaderPrincipal");
    const subtituloHeader = document.getElementById("subtituloHeader");
    const btnIngresar = document.getElementById("btnIngresarHeader");
    const badgeCapitan = document.getElementById("badgeCapitanHeader");
    const txtNombreBadge = document.getElementById("txtNombreCapitanHeader");

    if (tituloPrincipal) {
      tituloPrincipal.innerHTML = '<span class="header-title-row1">Mapa</span><span class="header-title-row2">Congregación Rosario</span>';
    }

    if (esCapitan) {
      if (subtituloHeader) {
        subtituloHeader.style.display = "inline-flex";
        subtituloHeader.textContent = "Modo Capitán";
        subtituloHeader.className = "top-header-subtitle modo-capitan";
      }
      if (btnIngresar) btnIngresar.style.display = "none";
      if (badgeCapitan) {
        badgeCapitan.style.display = "inline-flex";
        const capPrimer = (nombreCapitan || "Capitán").split(/\s+/)[0];
        if (txtNombreBadge) txtNombreBadge.textContent = capPrimer;
      }
    } else {
      if (subtituloHeader) {
        subtituloHeader.style.display = "inline-flex";
        subtituloHeader.textContent = "Modo Publicador";
        subtituloHeader.className = "top-header-subtitle modo-publicador";
      }
      if (btnIngresar) {
        btnIngresar.style.display = "inline-flex";
        const pubNombre = (localStorage.getItem("terrosa_nombre_publicador") || "").trim();
        if (pubNombre) {
          // Usar solo el primer nombre para evitar tapar el título central
          const primerNombre = pubNombre.split(/\s+/)[0];
          btnIngresar.innerHTML = `<span>👤</span> <span style="max-width:56px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escaparTextoSeguro(primerNombre)}</span> <span style="font-size:9px; opacity:0.6;">▾</span>`;
          btnIngresar.title = `Perfil: ${pubNombre} (Toca para editar o entrar como Capitán)`;
        } else {
          btnIngresar.innerHTML = `<span>👤</span> <span>Perfil</span> <span style="font-size:9px; opacity:0.6;">▾</span>`;
          btnIngresar.title = "Toca para identificarte o ingresar como Capitán";
        }
      }
      if (badgeCapitan) badgeCapitan.style.display = "none";
    }

    // Elementos exclusivos de Capitán (ej: botón Reportar, botón Historial, Filtros de Fecha)
    const capitanOnlyElements = document.querySelectorAll(".capitan-only");
    capitanOnlyElements.forEach(el => {
      if (el.id === "filtroFechaBarra") {
        el.style.display = esCapitan ? "flex" : "none";
      } else {
        el.style.display = esCapitan ? "inline-flex" : "none";
      }
    });

    // Elementos exclusivos de Publicador (ej: botón Notas personal)
    const publicadorOnlyElements = document.querySelectorAll(".publicador-only");
    publicadorOnlyElements.forEach(el => {
      el.style.display = esCapitan ? "none" : "inline-flex";
    });

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
    // Botón Perfil / Ingreso en la cabecera (asignación única idempotente)
    const btnIngresar = document.getElementById("btnIngresarHeader");
    if (btnIngresar) {
      btnIngresar.onclick = (e) => {
        e.stopPropagation();
        window.reproducirSonidoClick("tap");
        abrirMenuPerfilPublicador();
      };
    }

    // Tocar el badge con el nombre en la cabecera permite cambiar el perfil o cerrar sesión
    const badgeHeader = document.getElementById("badgeCapitanHeader");
    if (badgeHeader) {
      badgeHeader.onclick = (e) => {
        e.stopPropagation();
        window.reproducirSonidoClick("tap");
        abrirMenuPerfilCapitan();
      };
    }
  }

  // 5. Modal para Iniciar Sesión de Capitán con PIN (Exclusivo Koke y Merari Rosales)
  window.abrirModalLoginCapitan = function () {
    // Eliminar cualquier modal previo para evitar duplicados en pantalla
    document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());

    const actual = window.getCapitanNombre();
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay login-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; color:#0f172a; font-size:18.5px; font-weight:800;">🔑 Acceso de Capitán</h3>
          <button id="btnCerrarLoginModal" class="btn-icon-square">✕</button>
        </div>
        <p style="font-size:13px; color:#64748b; margin-top:0; margin-bottom:14px;">
          Selecciona tu usuario autorizado e ingresa el código PIN:
        </p>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:11.5px; font-weight:700; color:#475569; text-transform:uppercase;">Usuario Autorizado</label>
            <select id="selectNombreLogin" style="
              width:100%; padding:11px 14px; border:1.5px solid #cbd5e1; border-radius:14px; font-size:15px; font-weight:700; box-sizing:border-box; margin-top:4px; outline:none; font-family:inherit; background:#ffffff; color:#0f172a;
            ">
              <option value="" disabled ${!actual ? "selected" : ""}>-- Selecciona tu usuario --</option>
              ${USUARIOS_ACCESO_CAPITAN.map(u => `<option value="${u}" ${actual === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
          </div>

          <div>
            <label style="font-size:11.5px; font-weight:700; color:#475569; text-transform:uppercase;">Código PIN</label>
            <input type="password" id="inputPinLogin" placeholder="••••" maxlength="8" inputmode="numeric" style="
              width:100%; padding:11px 14px; border:1.5px solid #cbd5e1; border-radius:14px; font-size:20px; letter-spacing:6px; text-align:center; box-sizing:border-box; margin-top:4px; outline:none; font-family:inherit;
            " />
            <div id="loginErrorMsg" style="color:#ef4444; font-size:12.5px; font-weight:700; margin-top:6px; min-height:16px; text-align:center;"></div>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:16px;">
          <button id="btnCancelarLogin" type="button" style="
            flex:1; padding:12px; background:#f1f5f9; border:none; border-radius:14px; font-weight:700; color:#475569; cursor:pointer; font-size:14px;
          ">Cancelar</button>
          <button id="btnConfirmarLogin" type="button" style="
            flex:1; padding:12px; background:linear-gradient(135deg, #1a73e8, #1557b0); border:none; border-radius:14px; font-weight:800; color:#ffffff; cursor:pointer; font-size:14px; box-shadow:0 3px 10px rgba(26,115,232,0.3);
          ">Ingresar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      modal.remove();
      document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        window.reproducirSonidoClick("tap");
        cerrar();
      }
    };

    modal.querySelector("#btnCerrarLoginModal").onclick = () => {
      window.reproducirSonidoClick("tap");
      cerrar();
    };
    modal.querySelector("#btnCancelarLogin").onclick = () => {
      window.reproducirSonidoClick("tap");
      cerrar();
    };

    const inputPin = modal.querySelector("#inputPinLogin");
    const selectNombre = modal.querySelector("#selectNombreLogin");
    const errorMsg = modal.querySelector("#loginErrorMsg");
    setTimeout(() => inputPin.focus(), 120);

    const intentarLogin = () => {
      const nombre = (selectNombre.value || "").trim();
      const pin = (inputPin.value || "").trim();

      if (!nombre) {
        if (errorMsg) errorMsg.textContent = "Selecciona un usuario autorizado.";
        return;
      }
      if (!USUARIOS_ACCESO_CAPITAN.includes(nombre)) {
        if (errorMsg) errorMsg.textContent = "Acceso restringido únicamente a Koke y Merari Rosales.";
        return;
      }
      if (!pin) {
        if (errorMsg) errorMsg.textContent = "Por favor ingresa tu código PIN.";
        inputPin.focus();
        return;
      }
      if (pin !== PIN_ENCARGADO_DEFAULT) {
        window.reproducirSonidoClick("delete");
        if (errorMsg) errorMsg.textContent = "Código equivocado";
        inputPin.value = "";
        inputPin.focus();
        return;
      }

      if (errorMsg) errorMsg.textContent = "";

      try {
        const logins = JSON.parse(localStorage.getItem("terrosa_conexiones_log") || "[]");
        logins.push({
          capitan: nombre,
          fechaHora: new Date().toLocaleString()
        });
        localStorage.setItem("terrosa_conexiones_log", JSON.stringify(logins.slice(-50)));
      } catch (e) { }

      localStorage.setItem("terrosa_capitan_nombre", nombre);
      localStorage.setItem("terrosa_modo", "capitan");
      window.reproducirSonidoClick("success");
      cerrar();
      actualizarInterfazSegunModo();
      mostrarToastDiscreto("Modo Capitán activado ✅");
    };

    const btnConfirmar = modal.querySelector("#btnConfirmarLogin");
    btnConfirmar.onclick = (e) => {
      e.preventDefault();
      intentarLogin();
    };
    btnConfirmar.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });

    inputPin.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        intentarLogin();
      }
    });
  };
  function abrirModalLoginCapitan() {
    window.abrirModalLoginCapitan();
  }

  // 5.1. Menú al tocar el Badge del Capitán (Cambio rápido de usuario autorizado y salida a Modo Publicador)
  window.abrirMenuPerfilCapitan = function abrirMenuPerfilCapitan() {
    // Eliminar cualquier modal previo para evitar duplicados en pantalla
    document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());

    const nombre = window.getCapitanNombre() || USUARIOS_ACCESO_CAPITAN[0];

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:340px; padding:22px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">👤 Perfil Activo</h3>
          <button id="btnCerrarMenuPerfilX" class="btn-icon-square">✕</button>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:4px;">Administrador en sesión</label>
          <div style="display:flex; gap:8px;">
            <select id="inputPerfilNombreDirecto" style="
              flex:1; padding:10px 14px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:14.5px; font-weight:700; color:#0f172a; outline:none; font-family:inherit; background:#f8fafc;
            ">
              ${USUARIOS_ACCESO_CAPITAN.map(u => `<option value="${u}" ${nombre === u ? "selected" : ""}>${u}</option>`).join("")}
            </select>
            <button id="btnGuardarNombreDirecto" style="
              padding:10px 14px; background:#1a73e8; color:white; border:none; border-radius:12px; font-weight:700; font-size:13px; cursor:pointer;
            ">Guardar</button>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button id="btnCerrarSesionModo" style="
            padding:12px 14px; background:#fef2f2; border:1px solid #fee2e2; border-radius:14px; font-weight:700; color:#dc2626; cursor:pointer; font-size:13.5px; text-align:left;
          ">🔒 Salir a Modo Publicador</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      modal.remove();
      document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());
    };

    modal.querySelector("#btnCerrarMenuPerfilX").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    const inputNombre = modal.querySelector("#inputPerfilNombreDirecto");
    const guardarNombre = () => {
      const nuevo = inputNombre.value.trim();
      if (nuevo) {
        localStorage.setItem("terrosa_capitan_nombre", nuevo);
        actualizarInterfazSegunModo();
        window.reproducirSonidoClick("success");
        mostrarToastDiscreto("Usuario actualizado ✅");
        cerrar();
      }
    };

    modal.querySelector("#btnGuardarNombreDirecto").onclick = guardarNombre;

    modal.querySelector("#btnCerrarSesionModo").onclick = (e) => {
      e.stopPropagation();
      cerrar();
      localStorage.setItem("terrosa_modo", "publicador");
      actualizarInterfazSegunModo();
      window.reproducirSonidoClick("delete");
      mostrarToastDiscreto("Modo Publicador activado");
    };
  }

  // 5.2. Menú de Perfil de Publicador (Editar nombre o Ingresar como Capitán con PIN)
  window.abrirMenuPerfilPublicador = function abrirMenuPerfilPublicador() {
    window.reproducirSonidoClick("tap");
    document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());

    const actualPub = (localStorage.getItem("terrosa_nombre_publicador") || "").trim();

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:340px; padding:22px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">👤 Perfil de Publicador</h3>
          <button id="btnCerrarMenuPubX" class="btn-icon-square">✕</button>
        </div>

        <p style="font-size:13px; color:#64748b; margin-top:0; margin-bottom:14px;">
          Identifícate en este dispositivo para personalizar tu experiencia:
        </p>

        <!-- Sección de Nombre -->
        <div style="margin-bottom:16px;">
          <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:4px;">Tu Nombre y Apellido</label>
          <input type="text" id="inputNombrePublicador" value="${escaparTextoSeguro(actualPub)}" placeholder="Escribe tu nombre..." autocomplete="name" style="
            width:100%; padding:11px 14px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:14.5px; font-weight:700; color:#0f172a; outline:none; font-family:inherit; background:#ffffff; box-sizing:border-box;
          " />
          <button id="btnGuardarNombrePublicador" style="
            width:100%; margin-top:10px; padding:11px; background:#1a73e8; color:white; border:none; border-radius:12px; font-weight:700; font-size:13.5px; cursor:pointer; box-shadow:0 2px 6px rgba(26,115,232,0.25);
          ">💾 Guardar Nombre</button>
        </div>

        <div style="border-top:1px solid #e2e8f0; margin:16px 0;"></div>

        <!-- Acceso a Capitán -->
        <div style="margin-bottom:14px;">
          <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:6px;">¿Eres Capitán o Encargado?</label>
          <button id="btnIrLoginCapitanDesdePub" style="
            width:100%; padding:11px 14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; font-weight:800; color:#1e293b; cursor:pointer; font-size:13.5px; display:flex; align-items:center; justify-content:center; gap:8px;
          ">
            <span>🔑</span> <span>Ingresar con PIN</span>
          </button>
        </div>

        <div style="border-top:1px solid #f1f5f9; padding-top:10px; text-align:center;">
          <button id="btnReiniciarDatosLocales" type="button" style="
            background:transparent; border:none; color:#94a3b8; font-size:11.5px; font-weight:700; cursor:pointer; padding:6px 10px; border-radius:8px; transition:all 0.15s ease;
          ">🗑️ Borrar notas y datos locales</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      modal.remove();
      document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());
    };

    modal.querySelector("#btnCerrarMenuPubX").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    const inputNom = modal.querySelector("#inputNombrePublicador");

    modal.querySelector("#btnGuardarNombrePublicador").onclick = () => {
      const nuevo = inputNom.value.trim();
      if (!nuevo) {
        mostrarToastDiscreto("Por favor escribe tu nombre");
        return;
      }
      localStorage.setItem("terrosa_nombre_publicador", nuevo);
      actualizarInterfazSegunModo();
      if (typeof window.verificarAccesoEnNube === "function") {
        window.verificarAccesoEnNube(nuevo);
      }
      window.reproducirSonidoClick("success");
      mostrarToastDiscreto("Perfil actualizado ✅");
      cerrar();
    };

    inputNom.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        modal.querySelector("#btnGuardarNombrePublicador").click();
      }
    });

    const btnReiniciar = modal.querySelector("#btnReiniciarDatosLocales");
    if (btnReiniciar) {
      btnReiniciar.onclick = () => {
        if (confirm("¿Estás seguro de que deseas borrar todas tus notas personales y reiniciar los datos locales de la app en este dispositivo?")) {
          localStorage.clear();
          window.location.reload();
        }
      };
    }

    modal.querySelector("#btnIrLoginCapitanDesdePub").onclick = () => {
      cerrar();
      abrirModalLoginCapitan();
    };
  };

  // 5.3. Modal de Bienvenida para solicitar el nombre en la primera apertura (Sin sugerencias)
  window.abrirModalBienvenidaNombre = function abrirModalBienvenidaNombre() {
    if (localStorage.getItem("terrosa_nombre_publicador") || window.getModoActual() === "capitan") return;
    if (document.querySelector(".terrosa-modal-overlay")) return;

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.style.zIndex = "1000000";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:340px; padding:24px 20px; text-align:center;">
        <div style="font-size:38px; margin-bottom:8px;">👋</div>
        <h3 style="margin:0 0 6px 0; font-size:19px; font-weight:800; color:#0f172a;">¡Bienvenido a TerRosa!</h3>
        <p style="font-size:13px; color:#64748b; margin:0 0 16px 0;">
          Para personalizar tu mapa en este dispositivo, escribe tu nombre:
        </p>

        <div style="text-align:left; margin-bottom:14px;">
          <input type="text" id="inputBienvenidaNombre" placeholder="Tu nombre y apellido..." autocomplete="name" style="
            width:100%; padding:12px 14px; border:1.5px solid #cbd5e1; border-radius:14px; font-size:15px; font-weight:700; color:#0f172a; outline:none; font-family:inherit; background:#ffffff; box-sizing:border-box;
          " />
        </div>

        <button id="btnComenzarBienvenida" style="
          width:100%; padding:12px; background:linear-gradient(135deg, #1a73e8, #1557b0); color:white; border:none; border-radius:14px; font-weight:800; font-size:14.5px; cursor:pointer; box-shadow:0 3px 10px rgba(26,115,232,0.3);
        ">Comenzar 🚀</button>
      </div>
    `;

    document.body.appendChild(modal);

    const inputB = modal.querySelector("#inputBienvenidaNombre");

    const guardar = () => {
      const val = (inputB.value || "").trim();
      if (!val) {
        mostrarToastDiscreto("Por favor ingresa tu nombre");
        return;
      }
      localStorage.setItem("terrosa_nombre_publicador", val);
      actualizarInterfazSegunModo();
      if (typeof window.verificarAccesoEnNube === "function") {
        window.verificarAccesoEnNube(val);
      }
      window.reproducirSonidoClick("success");
      modal.remove();
      mostrarToastDiscreto(`¡Bienvenido, ${val}! 🎉`);
    };

    modal.querySelector("#btnComenzarBienvenida").onclick = guardar;
    inputB.addEventListener("keydown", (e) => {
      if (e.key === "Enter") guardar();
    });
  };

  // 5.4. Control de Acceso y Registro de Dispositivos en Google Sheets
  function obtenerIdDispositivoLocal() {
    let devId = localStorage.getItem("terrosa_dispositivo_id");
    if (!devId) {
      devId = "disp_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      localStorage.setItem("terrosa_dispositivo_id", devId);
    }
    return devId;
  }

  function mostrarPantallaBloqueo(mensaje) {
    document.querySelectorAll(".terrosa-modal-overlay").forEach(m => m.remove());
    let lockOverlay = document.getElementById("pantallaBloqueoAcceso");
    if (!lockOverlay) {
      lockOverlay = document.createElement("div");
      lockOverlay.id = "pantallaBloqueoAcceso";
      lockOverlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:#0f172a; color:#ffffff; z-index:99999999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; box-sizing:border-box;";
      document.body.appendChild(lockOverlay);
    }
    lockOverlay.innerHTML = `
      <div style="font-size:52px; margin-bottom:14px;">🔒</div>
      <h2 style="margin:0 0 10px 0; font-size:22px; font-weight:800; color:#ffffff;">Acceso Restringido</h2>
      <p id="txtMensajeBloqueo" style="font-size:14.5px; color:#94a3b8; max-width:320px; line-height:1.5; margin:0 0 20px 0;">
        ${mensaje || "Esta aplicación requiere autorización del encargado de territorios de la Congregación Rosario."}
      </p>
      <button id="btnReintentarAcceso" style="
        background:#1a73e8; color:white; border:none; padding:10px 22px; border-radius:50px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(26,115,232,0.4); margin-bottom:20px; display:inline-flex; align-items:center; gap:8px;
      ">
        <span>🔄</span> <span>Comprobar estado</span>
      </button>
      <div style="font-size:12px; color:#64748b; background:#1e293b; padding:8px 14px; border-radius:10px;">
        ID Dispositivo: <b>${obtenerIdDispositivoLocal()}</b>
      </div>
    `;

    const btnRetry = lockOverlay.querySelector("#btnReintentarAcceso");
    if (btnRetry) {
      btnRetry.onclick = () => {
        btnRetry.innerHTML = `<span>⏳</span> <span>Comprobando...</span>`;
        btnRetry.disabled = true;
        window.verificarAccesoEnNube(null, (permitido) => {
          if (!permitido) {
            btnRetry.disabled = false;
            btnRetry.innerHTML = `<span>🔄</span> <span>Sigue restringido</span>`;
            setTimeout(() => {
              btnRetry.innerHTML = `<span>🔄</span> <span>Comprobar estado</span>`;
            }, 2000);
          }
        });
      };
    }
  }

  function quitarPantallaBloqueo() {
    localStorage.removeItem("terrosa_acceso_bloqueado");
    const lockOverlay = document.getElementById("pantallaBloqueoAcceso");
    if (lockOverlay) {
      lockOverlay.remove();
    }
  }

  window.verificarAccesoEnNube = function verificarAccesoEnNube(nombreOpcional, callback) {
    const devId = obtenerIdDispositivoLocal();
    const nombre = (nombreOpcional || localStorage.getItem("terrosa_nombre_publicador") || localStorage.getItem("terrosa_capitan_nombre") || "").trim();

    // Si aún no tiene nombre guardado en este dispositivo, no enviar registro fantasma
    if (!nombre) {
      if (typeof callback === "function") callback(true);
      return;
    }

    // Ping POST para registrar / actualizar último acceso
    try {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          accion: "verificar_acceso",
          dispositivoId: devId,
          nombre: nombre,
          fechaHora: new Date().toISOString()
        })
      }).catch(() => { });
    } catch (e) { }

    // Consulta GET en vivo sin caché para verificar si el estado es Activo o Bloqueado
    fetch(`${URL_API_GOOGLE_SHEETS}?accion=verificar_acceso&dispositivoId=${encodeURIComponent(devId)}&t=${Date.now()}`)
      .then(r => r.json())
      .then(res => {
        if (res && res.permitido === false) {
          mostrarPantallaBloqueo(res.mensaje);
          if (typeof callback === "function") callback(false);
        } else {
          // ¡Estado Activo / Permitido! Desbloqueamos la pantalla
          quitarPantallaBloqueo();
          if (typeof callback === "function") callback(true);
        }
      })
      .catch(err => {
        // En caso de fallo de red, no bloquear la pantalla
        quitarPantallaBloqueo();
        if (typeof callback === "function") callback(true);
      });
  };

  // 6. Botón Registrar Territorio e Historial en Barra Inferior
  function vincularBotonRegistrar() {
    const btnRegistrar = document.getElementById("btnRegistrarTerritorio");
    if (btnRegistrar) {
      btnRegistrar.onclick = () => {
        abrirModalRegistroTerritorio();
      };
    }
  }

  function vincularBotonHistorial() {
    const btnHistorial = document.getElementById("btnHistorialCapitan");
    if (btnHistorial) {
      btnHistorial.onclick = () => {
        window.abrirModalHistorialRegistros();
      };
    }
  }

  // 6.1. Modal de Historial ("Territorios trabajados") — Rediseño Minimalista con Buscador
  // 6.1. Modal de Historial ("Territorios trabajados") — Pantalla Fija con Buscador y Filtro Multimes
  window.abrirModalHistorialRegistros = function () {
    window.reproducirSonidoClick("tap");
    const todosReportes = deduplicarListaReportes(JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]"))
      .filter(r => perteneceAVersionActiva(r));

    // Heredar filtro activo del mapa principal
    let filtroAnioSel = anioFiltroActivo || "2026";
    let mesesHistorialSel = new Set(mesesFiltroActivos);

    function obtenerTextoBotonMesesHistorial() {
      if (mesesHistorialSel.size === 0 || mesesHistorialSel.size === 12) {
        return "🗓️ Mes: Todos";
      } else if (mesesHistorialSel.size === 1) {
        const num = Array.from(mesesHistorialSel)[0];
        const mObj = NOMBRES_MESES.find(m => m.num === num);
        return `🗓️ Mes: ${mObj ? mObj.nombre : num}`;
      } else if (mesesHistorialSel.size === 2) {
        const arr = Array.from(mesesHistorialSel).map(num => {
          const mObj = NOMBRES_MESES.find(m => m.num === num);
          return mObj ? mObj.abrev : num;
        });
        return `🗓️ Mes: ${arr.join(", ")}`;
      } else {
        return `🗓️ Meses (${mesesHistorialSel.size})`;
      }
    }

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large" style="height:min(86vh, 640px); min-height:480px; display:flex; flex-direction:column; padding:20px 18px; box-sizing:border-box;">
        <!-- Cabecera Minimalista -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
          <h3 style="margin:0; font-size:19px; font-weight:800; color:#0f172a;">Territorios trabajados</h3>
          <div style="display:flex; align-items:center; gap:6px;">
            <button id="btnSyncHistorialModal" class="btn-icon-square" title="Sincronizar con la nube">🔄</button>
            <button id="btnCerrarHistorial" class="btn-icon-square" title="Cerrar">✕</button>
          </div>
        </div>

        <!-- Buscador Rápido (Un solo emoji de lupa en el icono) -->
        <div style="position:relative; margin-bottom:10px; flex-shrink:0;">
          <input type="text" id="buscadorHistorial" placeholder="Buscar territorio o capitán..." autocomplete="off" style="
            width:100%; padding:9px 12px 9px 34px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13.5px; font-weight:600; box-sizing:border-box; outline:none; font-family:inherit; background:#ffffff; color:#0f172a;
          " />
          <span style="position:absolute; left:11px; top:50%; transform:translateY(-50%); font-size:14px; color:#94a3b8; pointer-events:none;">🔍</span>
        </div>

        <!-- Dos Filtros: Año de Servicio y Selector de Mes (Soporta 1 mes, varios meses o todos) -->
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-shrink:0;">
          <select id="filtroHistorialAnio" style="
            flex:1; min-width:0; height:42px; min-height:42px; padding:0 10px; border-radius:12px; border:1.5px solid #cbd5e1; font-size:13.5px; font-weight:700; color:#0f172a; background:#f8fafc; outline:none; box-sizing:border-box; cursor:pointer;
          ">
            <option value="2026" ${filtroAnioSel === "2026" ? "selected" : ""}>📅 Serv. 2026</option>
            <option value="2025" ${filtroAnioSel === "2025" ? "selected" : ""}>📅 Serv. 2025</option>
            <option value="todos" ${filtroAnioSel === "todos" ? "selected" : ""}>📅 Todos los años</option>
          </select>

          <button type="button" id="btnHistorialMesesFiltro" style="
            flex:1; min-width:0; height:42px; min-height:42px; display:flex; align-items:center; justify-content:space-between; text-align:left; cursor:pointer; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:0 12px; font-weight:700; font-size:13.5px; color:#0f172a; outline:none; white-space:nowrap; overflow:hidden; box-sizing:border-box;
          ">
            <span id="txtHistorialMesLabel" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${obtenerTextoBotonMesesHistorial()}</span>
            <span style="font-size:11px; margin-left:4px; opacity:0.7; flex-shrink:0;">▾</span>
          </button>
        </div>

        <!-- Lista de Tarjetas Estéticas con Contenedor Fijo y Scroll Interno -->
        <div id="listaItemsHistorial" style="overflow-y:auto; flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; padding-right:2px;"></div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarHistorial").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    const btnSync = modal.querySelector("#btnSyncHistorialModal");
    if (btnSync) {
      btnSync.onclick = () => {
        window.reproducirSonidoClick("tap");
        btnSync.classList.add("sync-spinning");
        window.sincronizarConNube(true).then(() => {
          btnSync.classList.remove("sync-spinning");
          renderizarListaFiltrada();
        });
      };
    }

    const selectAnio = modal.querySelector("#filtroHistorialAnio");
    const btnMesesFiltro = modal.querySelector("#btnHistorialMesesFiltro");
    const txtMesLabel = modal.querySelector("#txtHistorialMesLabel");
    const inputBuscador = modal.querySelector("#buscadorHistorial");
    const cont = modal.querySelector("#listaItemsHistorial");

    function renderizarListaFiltrada() {
      const reportes = deduplicarListaReportes(JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]"))
        .filter(r => perteneceAVersionActiva(r));

      const query = (inputBuscador ? inputBuscador.value : "").trim().toLowerCase();
      const filtrarMes = (mesesHistorialSel.size > 0 && mesesHistorialSel.size < 12);

      const filtrados = reportes.filter(r => {
        const p = parsearFechaReporte(r.fecha);
        if (!p.anio) return true;

        // Filtro de Año de Servicio
        if (filtroAnioSel !== "todos" && !perteneceAAnioServicio(r.fecha, filtroAnioSel)) return false;

        // Filtro de Meses (Soporta 1 mes, varios meses o todos)
        if (filtrarMes && !mesesHistorialSel.has(p.mes)) return false;

        // Filtro de Búsqueda de Texto
        if (query) {
          const tNum = String(r.territorioNumero || r.territorioId || "").toLowerCase();
          const cap = String(r.capitan || "").toLowerCase();
          const com = String(r.comentario || "").toLowerCase();
          const fechaStr = String(r.fecha || "").toLowerCase();
          const matchTerr = (tNum === query) || tNum.includes(query) || `t-${tNum}`.includes(query) || `territorio ${tNum}`.includes(query);
          const matchCap = cap.includes(query);
          const matchCom = com.includes(query);
          const matchFecha = fechaStr.includes(query);
          if (!matchTerr && !matchCap && !matchCom && !matchFecha) return false;
        }

        return true;
      });

      const listaOrdenada = [...filtrados].reverse();
      cont.innerHTML = "";

      if (listaOrdenada.length === 0) {
        cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:50px 16px; font-size:15px; font-weight:700;">Sin resultados</div>';
        return;
      }

      listaOrdenada.forEach(rep => {
        const card = document.createElement("div");
        card.className = "card-historial-minimal";

        const statusDot = '<span title="Registrado en S-13" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; margin-left:5px;"></span>';

        const labelsCuadras = (rep.cuadrasLabels && rep.cuadrasLabels.length > 0)
          ? rep.cuadrasLabels.join(", ")
          : (Array.isArray(rep.cuadras) ? rep.cuadras.map(c => formatearEtiquetaCuadraCorta(c)).join(", ") : "");

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
            <div style="background:#eff6ff; color:#1d4ed8; font-weight:800; font-size:14.5px; border-radius:12px; padding:7px 11px; min-width:38px; text-align:center; flex-shrink:0;">
              T-${rep.territorioNumero}
            </div>
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:center;">
                <span style="font-weight:800; color:#1e293b; font-size:14.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escaparTextoSeguro(rep.capitan || 'Capitán')}</span>
                ${statusDot}
              </div>
              <div style="font-size:12px; color:#64748b; margin-top:2px;">
                📅 ${formatearFechaCorta(rep.fecha)} • Cuadras: ${labelsCuadras || rep.cuadrasTotal || rep.totalCuadras || ""}
              </div>
              ${rep.comentario ? `<div style="font-size:11.5px; color:#475569; background:#f8fafc; padding:3px 7px; border-radius:6px; margin-top:3px; max-width:fit-content; border:1px solid #e2e8f0;">💬 ${escaparTextoSeguro(rep.comentario)}</div>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <button class="btn-action-square btn-editar" title="Editar" data-id="${rep.id}">✏️</button>
            <button class="btn-action-square btn-eliminar" title="Eliminar" data-id="${rep.id}">🗑️</button>
          </div>
        `;
        cont.appendChild(card);
      });

      cont.querySelectorAll(".btn-editar").forEach(btn => {
        btn.onclick = () => {
          window.reproducirSonidoClick("tap");
          const id = btn.dataset.id;
          abrirModalEditarRegistro(id, () => {
            renderizarListaFiltrada();
          });
        };
      });

      cont.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          if (confirm("¿Estás seguro de eliminar este registro del historial?")) {
            window.reproducirSonidoClick("delete");
            descartarReporte(id);
            renderizarListaFiltrada();
          }
        };
      });
    }

    if (inputBuscador) {
      inputBuscador.addEventListener("input", () => {
        renderizarListaFiltrada();
      });
    }

    selectAnio.addEventListener("change", () => {
      window.reproducirSonidoClick("tap");
      filtroAnioSel = selectAnio.value;
      renderizarListaFiltrada();
    });

    // Selector de Meses en Historial (1 mes, varios meses o todos)
    function abrirSelectorMesesHistorial(mesesActuales, onAplicar) {
      window.reproducirSonidoClick("tap");
      const subModal = document.createElement("div");
      subModal.className = "terrosa-modal-overlay submodal-meses";
      subModal.style.zIndex = "1000005";

      const mesActual = String(new Date().getMonth() + 1).padStart(2, "0");
      const mesesTemp = new Set(mesesActuales);

      let itemsHtml = "";
      NOMBRES_MESES.forEach(m => {
        const isChecked = mesesTemp.has(m.num);
        const isCurrent = (m.num === mesActual);
        itemsHtml += `
          <div id="itemMesHist_${m.num}" style="display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border-radius:10px; background:${isChecked ? 'rgba(26,115,232,0.1)' : 'transparent'}; border:1px solid ${isChecked ? '#93c5fd' : 'transparent'}; transition:all 0.15s ease;">
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1; margin:0;">
              <input type="checkbox" value="${m.num}" class="chk-mes-hist" ${isChecked ? 'checked' : ''} style="width:17px; height:17px; accent-color:#1a73e8; cursor:pointer;"/>
              <span style="font-weight:700; font-size:14px; color:#1e293b;">${m.nombre} ${isCurrent ? '<span style="font-size:10px; font-weight:800; color:#2563eb; background:#dbeafe; padding:2px 6px; border-radius:6px; margin-left:4px;">Actual</span>' : ''}</span>
            </label>
            <button type="button" class="btn-solo-mes-hist" data-mes="${m.num}" title="Ver solo ${m.nombre}" style="font-size:11px; padding:3px 8px; border-radius:6px; border:1.5px solid #cbd5e1; background:#ffffff; color:#334155; font-weight:800; cursor:pointer;">
              Solo
            </button>
          </div>
        `;
      });

      subModal.innerHTML = `
        <div class="terrosa-modal-card" style="max-width:320px; padding:20px 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Filtrar Historial por Mes</h3>
            <button id="btnCerrarSubModalMeses" class="btn-icon-square">✕</button>
          </div>
          <p style="margin:0 0 10px 0; font-size:12.5px; color:#64748b;">Elige uno, varios o todos los meses:</p>

          <!-- Botones de selección rápida -->
          <div style="display:flex; gap:6px; margin-bottom:10px;">
            <button type="button" id="btnMesActualSubModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
              📍 Actual
            </button>
            <button type="button" id="btnTodosMesesSubModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
              🗓️ Todos
            </button>
            <button type="button" id="btnLimpiarMesesSubModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #fee2e2; background:#fff5f5; color:#dc2626; cursor:pointer;">
              ✕ Limpiar
            </button>
          </div>
          
          <div id="listaMesesCheckSubModal" style="max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:3px; border:1px solid #e2e8f0; border-radius:14px; padding:6px; margin-bottom:14px; background:#f8fafc;">
            ${itemsHtml}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <button id="btnCancelarSubModalMeses" style="background:#f1f5f9; border:none; border-radius:12px; padding:11px 14px; font-size:13px; font-weight:700; color:#475569; cursor:pointer;">
              Cancelar
            </button>
            <button id="btnAplicarSubModalMeses" style="flex:1; background:linear-gradient(135deg, #1a73e8, #1557b0); border:none; border-radius:12px; padding:11px; font-size:14px; font-weight:800; color:white; cursor:pointer; box-shadow:0 3px 10px rgba(26,115,232,0.3);">
              Aplicar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(subModal);

      setTimeout(() => {
        const curElem = subModal.querySelector(`#itemMesHist_${mesActual}`);
        if (curElem) curElem.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 60);

      const cerrarSub = () => {
        window.reproducirSonidoClick("tap");
        if (document.body.contains(subModal)) document.body.removeChild(subModal);
      };

      subModal.querySelector("#btnCerrarSubModalMeses").onclick = cerrarSub;
      subModal.querySelector("#btnCancelarSubModalMeses").onclick = cerrarSub;
      subModal.onclick = (e) => {
        if (e.target === subModal) cerrarSub();
      };

      const chks = subModal.querySelectorAll(".chk-mes-hist");
      const actualizarEstilos = () => {
        chks.forEach(c => {
          const itemRow = c.closest("[id^='itemMesHist_']");
          if (itemRow) {
            itemRow.style.background = c.checked ? 'rgba(26,115,232,0.1)' : 'transparent';
            itemRow.style.borderColor = c.checked ? '#93c5fd' : 'transparent';
          }
        });
      };

      subModal.querySelector("#btnMesActualSubModal").onclick = () => {
        window.reproducirSonidoClick("tap");
        chks.forEach(c => c.checked = (c.value === mesActual));
        actualizarEstilos();
      };

      subModal.querySelector("#btnTodosMesesSubModal").onclick = () => {
        window.reproducirSonidoClick("tap");
        chks.forEach(c => c.checked = true);
        actualizarEstilos();
      };

      subModal.querySelector("#btnLimpiarMesesSubModal").onclick = () => {
        window.reproducirSonidoClick("tap");
        chks.forEach(c => c.checked = false);
        actualizarEstilos();
      };

      subModal.querySelectorAll(".btn-solo-mes-hist").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const mesElegido = btn.dataset.mes;
          window.reproducirSonidoClick("success");
          if (document.body.contains(subModal)) document.body.removeChild(subModal);
          onAplicar(new Set([mesElegido]));
        };
      });

      chks.forEach(c => {
        c.onchange = () => {
          window.reproducirSonidoClick("toggle");
          actualizarEstilos();
        };
      });

      subModal.querySelector("#btnAplicarSubModalMeses").onclick = () => {
        window.reproducirSonidoClick("success");
        const resSet = new Set();
        chks.forEach(c => {
          if (c.checked) resSet.add(c.value);
        });
        if (document.body.contains(subModal)) document.body.removeChild(subModal);
        onAplicar(resSet);
      };
    }

    btnMesesFiltro.onclick = () => {
      abrirSelectorMesesHistorial(mesesHistorialSel, (nuevosMeses) => {
        mesesHistorialSel = nuevosMeses;
        txtMesLabel.textContent = obtenerTextoBotonMesesHistorial();
        renderizarListaFiltrada();
      });
    };

    renderizarListaFiltrada();
  };

  // 6.2. Modal para Editar un Registro existente — Rediseño Minimalista
  function abrirModalEditarRegistro(id, callback) {
    window.reproducirSonidoClick("tap");
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    if (!rep) return;

    const fechaISO = parsearFechaReporte(rep.fecha).fechaISO || obtenerFechaLocalISO();
    const capitanesEdit = [...LISTA_CAPITANES_OFICIAL];
    if (rep.capitan && !capitanesEdit.includes(rep.capitan)) {
      capitanesEdit.unshift(rep.capitan);
    }

    const numTLimpio = obtenerNumeroTerritorioLimpio(rep.territorioId, rep.territorioNumero);
    const itemT = (window.TERRITORIOS_DATA && Array.isArray(window.TERRITORIOS_DATA))
      ? window.TERRITORIOS_DATA.find(x => {
        const n = x.datos.numeroTerritorio !== undefined ? x.datos.numeroTerritorio : x.datos.id;
        return String(obtenerNumeroTerritorioLimpio(x.datos.id, n)) === String(numTLimpio);
      })
      : null;

    const cuadrasDisponibles = (itemT && itemT.datos.poligonos)
      ? itemT.datos.poligonos.filter(pol => typeof window.esCuadraPredicable === "function" ? window.esCuadraPredicable(pol) : true)
      : [];

    const repCuadrasList = Array.isArray(rep.cuadras) ? rep.cuadras : (rep.cuadras ? String(rep.cuadras).split(",") : []);
    function estaCuadraEnReporte(cPolId) {
      const variantes = obtenerVariantesIdCuadra(cPolId, numTLimpio);
      const cortoPol = aCodigoCortoCuadra(cPolId, numTLimpio);
      return repCuadrasList.some(c => {
        const cStr = String(c || "").trim();
        if (!cStr) return false;
        const cortoC = aCodigoCortoCuadra(cStr, numTLimpio);
        return cortoC === cortoPol || variantes.includes(cStr) || cStr === cPolId;
      });
    }

    let cuadrasHtml = "";
    if (cuadrasDisponibles.length === 0) {
      cuadrasHtml = `<div style="font-size:12px; color:#94a3b8; text-align:center; padding:10px;">${repCuadrasList.length > 0 ? repCuadrasList.join(', ') : 'Sin cuadras registradas'}</div>`;
    } else {
      cuadrasHtml = cuadrasDisponibles.map(pol => {
        const polId = pol.id || ("Cuadra" + pol.numeroCuadra + "_Territorio" + numTLimpio);
        const isChecked = estaCuadraEnReporte(polId);
        const label = pol.label ? String(pol.label).trim() : (pol.numeroCuadra ? `Cuadra ${pol.numeroCuadra}` : formatearEtiquetaCuadraCorta(polId));
        return `
          <label class="chip-cuadra-item ${isChecked ? 'selected' : ''}" style="
            display:flex; align-items:center; gap:9px; padding:7px 10px; border-radius:10px; cursor:pointer; background:${isChecked ? 'rgba(37,99,235,0.08)' : '#ffffff'}; border:1px solid ${isChecked ? '#93c5fd' : '#e2e8f0'}; transition:all 0.15s ease;
          ">
            <input type="checkbox" value="${escaparTextoSeguro(polId)}" class="chk-edit-cuadra" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:#2563eb; cursor:pointer;" />
            <span style="font-size:13px; font-weight:700; color:#1e293b; flex:1;">${escaparTextoSeguro(label)}</span>
          </label>
        `;
      }).join("");
    }

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:360px; max-height:88vh; display:flex; flex-direction:column; padding:22px 20px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
          <h3 style="margin:0; color:#0f172a; font-size:18px; font-weight:800;">✏️ Editar Registro</h3>
          <button id="btnCerrarModalEditReg" class="btn-icon-square">✕</button>
        </div>
        <div style="font-size:13px; font-weight:700; color:#2563eb; margin-bottom:12px;">Territorio ${escaparTextoSeguro(numTLimpio)}</div>

        <div style="display:flex; flex-direction:column; gap:11px; overflow-y:auto; padding-right:2px; flex:1;">
          <div style="position:relative;">
            <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Capitán</label>
            <div style="display:flex; align-items:center; position:relative;">
              <input type="text" id="editCapitanInput" value="${escaparTextoSeguro(rep.capitan || '')}" placeholder="Escribe o selecciona..." autocomplete="off" style="
                width:100%; padding:10px 32px 10px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:14px; font-weight:700; box-sizing:border-box; margin-top:3px; outline:none; font-family:inherit; background:#fff; color:#0f172a;
              "/>
              <span id="badgeEditCapitanEstado" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none;"></span>
            </div>
            <div id="editSugerenciasCapitan" style="
              display:none; position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:99999; background:#fff; border:1.5px solid #3b82f6; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.18); max-height:190px; overflow-y:auto;
            "></div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Fecha</label>
            <input type="date" id="editFecha" value="${fechaISO}" style="width:100%; padding:10px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13.5px; font-weight:600; box-sizing:border-box; margin-top:3px; outline:none; font-family:inherit;"/>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Cuadras trabajadas</label>
              ${cuadrasDisponibles.length > 0 ? `
                <button id="btnToggleEditCuadras" type="button" style="
                  background:#ef4444; color:#ffffff; border:none; border-radius:16px; padding:4px 10px; font-size:11px; font-weight:800; cursor:pointer; box-shadow:0 2px 5px rgba(239,68,68,0.25);
                ">Seleccionar todas</button>
              ` : ''}
            </div>
            <div id="editContenedorCuadras" style="
              max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:12px; padding:7px; background:#f8fafc; display:flex; flex-direction:column; gap:5px;
            ">
              ${cuadrasHtml}
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Comentario</label>
            <input type="text" id="editComentario" value="${escaparTextoSeguro(rep.comentario || '')}" placeholder="Escribe aquí..." style="width:100%; padding:10px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13.5px; box-sizing:border-box; margin-top:3px; outline:none; font-family:inherit;"/>
          </div>
        </div>

        <div style="display:flex; gap:8px; margin-top:14px; padding-top:4px;">
          <button id="btnCancelarEdicion" style="flex:1; padding:11px; background:#f1f5f9; border:none; border-radius:12px; font-weight:700; color:#475569; cursor:pointer; font-size:13.5px;">Cancelar</button>
          <button id="btnGuardarEdicion" style="flex:1; padding:11px; background:linear-gradient(135deg, #1a73e8, #1557b0); border:none; border-radius:12px; font-weight:800; color:white; cursor:pointer; font-size:13.5px; box-shadow:0 3px 10px rgba(26,115,232,0.3);">Guardar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalEditReg").onclick = cerrar;
    vincularAutocompleteCapitan(
      modal.querySelector("#editCapitanInput"),
      modal.querySelector("#editSugerenciasCapitan"),
      modal.querySelector("#badgeEditCapitanEstado")
    );
    modal.querySelector("#btnCancelarEdicion").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    const btnToggle = modal.querySelector("#btnToggleEditCuadras");
    if (btnToggle) {
      btnToggle.onclick = () => {
        window.reproducirSonidoClick("tap");
        const chks = modal.querySelectorAll(".chk-edit-cuadra");
        if (chks.length === 0) return;
        const todas = Array.from(chks).every(c => c.checked);
        chks.forEach(c => {
          c.checked = !todas;
          const chip = c.closest(".chip-cuadra-item");
          if (chip) {
            chip.classList.toggle("selected", !todas);
            chip.style.background = !todas ? 'rgba(37,99,235,0.08)' : '#ffffff';
            chip.style.borderColor = !todas ? '#93c5fd' : '#e2e8f0';
          }
        });
        btnToggle.textContent = todas ? "Seleccionar todas" : "Desmarcar todas";
      };
    }

    modal.querySelectorAll(".chk-edit-cuadra").forEach(c => {
      c.onchange = () => {
        window.reproducirSonidoClick("toggle");
        const chip = c.closest(".chip-cuadra-item");
        if (chip) {
          chip.classList.toggle("selected", c.checked);
          chip.style.background = c.checked ? 'rgba(37,99,235,0.08)' : '#ffffff';
          chip.style.borderColor = c.checked ? '#93c5fd' : '#e2e8f0';
        }
      };
    });

    modal.querySelector("#btnGuardarEdicion").onclick = () => {
      const capitanRaw = (modal.querySelector("#editCapitanInput").value || "").trim();
      const capitanOficial = resolverCapitanOficial(capitanRaw);
      if (!capitanOficial) {
        alert("Por favor selecciona un hermano de la lista oficial de capitanes (ej. Koke, Merari Rosales, Jair Barraza). No se permiten nombres no registrados.");
        modal.querySelector("#editCapitanInput").focus();
        return;
      }
      const nuevoCapitan = capitanOficial;
      const nuevaFecha = modal.querySelector("#editFecha").value;
      const nuevoComentario = modal.querySelector("#editComentario").value.trim();

      if (!nuevoCapitan) return alert("Por favor ingresa el nombre del capitán.");
      if (!nuevaFecha) return alert("Por favor ingresa una fecha.");

      const chksEdit = Array.from(modal.querySelectorAll(".chk-edit-cuadra:checked"));
      if (cuadrasDisponibles.length > 0 && chksEdit.length === 0) {
        return alert("Selecciona al menos una cuadra trabajada.");
      }

      if (chksEdit.length > 0) {
        const nuevasCuadrasIds = chksEdit.map(c => aCodigoCortoCuadra(c.value, numTLimpio));
        const nuevasCuadrasLabels = chksEdit.map(c => {
          const val = c.value;
          const polData = (itemT && itemT.datos.poligonos) ? itemT.datos.poligonos.find(p => p.id === val) : null;
          return (polData && polData.label) ? String(polData.label).trim() : formatearEtiquetaCuadraCorta(val);
        });
        rep.cuadras = nuevasCuadrasIds;
        rep.cuadrasLabels = nuevasCuadrasLabels;
        rep.cuadrasTotal = chksEdit.length;
        rep.totalCuadrasTerritorio = cuadrasDisponibles.length || chksEdit.length;
      }

      rep.capitan = nuevoCapitan;
      rep.fecha = nuevaFecha;
      rep.comentario = nuevoComentario;
      rep.estado = "APROBADO";

      localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

      // Sincronizar en la nube con Google Sheets
      if (URL_API_GOOGLE_SHEETS) {
        fetch(URL_API_GOOGLE_SHEETS, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ accion: "editar_reporte", action: "editar_reporte", reporte: rep, reporteId: rep.id, id: rep.id })
        }).catch(err => console.warn("Error enviando edición a Google Sheets:", err));
      }

      // Si hay filtros o colores, refrescar
      if (typeof window.ejecutarFiltroFecha === "function") {
        window.ejecutarFiltroFecha();
      } else if (typeof window.actualizarColoresCuadrasCapitan === "function") {
        window.actualizarColoresCuadrasCapitan();
      }

      window.reproducirSonidoClick("success");
      mostrarToastDiscreto("Registro actualizado ✅");
      cerrar();
      if (callback) callback();
    };
  }

  // Helper para detectar qué cuadras de un territorio ya se trabajaron en un mes específico y con qué fecha
  function obtenerInfoCuadrasTrabajadasEnMes(territorioId, territorioNumero, anioTarget, mesTarget) {
    const mapaCuadras = new Map();
    const listaReportesT = [];
    const numTarget = obtenerNumeroTerritorioLimpio(territorioId, territorioNumero);
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    lista.forEach(r => {
      if (!perteneceAVersionActiva(r)) return;
      const numR = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
      if (numR === numTarget || String(r.territorioId) === String(territorioId)) {
        const p = parsearFechaReporte(r.fecha);
        if (p.anio === String(anioTarget) && parseInt(p.mes, 10) === parseInt(mesTarget, 10)) {
          listaReportesT.push({
            fecha: p.fechaDisplay,
            capitan: r.capitan || "Capitán",
            cuadras: r.cuadras || []
          });
          if (Array.isArray(r.cuadras)) {
            r.cuadras.forEach(cId => {
              const variantes = obtenerVariantesIdCuadra(cId, numR);
              variantes.forEach(vId => {
                if (!mapaCuadras.has(vId)) {
                  mapaCuadras.set(vId, {
                    fechaDisplay: p.fechaDisplay,
                    capitan: r.capitan || "Capitán"
                  });
                }
              });
            });
          }
        }
      }
    });
    return { mapaCuadras, listaReportesT };
  }

  // 7. Modal de Registro de Territorio / Cuadras — Modo Lote (Múltiples territorios) con Autocompletado Oficial
  window.abrirModalRegistroTerritorio = function (preTerritorioId, preCuadraId) {
    window.reproducirSonidoClick("tap");
    const capitanActivo = window.getCapitanNombre() || "Koke";
    const hoy = obtenerFechaLocalISO();

    let territorioActivo = preTerritorioId;
    if (!territorioActivo) {
      const select = document.getElementById("selectorTerritorios");
      if (select && select.value) territorioActivo = select.value;
    }

    // Lista en memoria de territorios agregados en este reporte en lote
    let territoriosEnLote = [];

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large" style="padding:22px 20px; max-width:440px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; color:#0f172a; font-size:18.5px; font-weight:800;">📝 Reportar Territorios</h3>
            <span style="font-size:11.5px; color:#64748b; font-weight:600;">Agrega uno o varios territorios y guarda todo junto</span>
          </div>
          <button id="btnCerrarModalReg" class="btn-icon-square">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:11px; max-height:74vh; overflow-y:auto; padding-right:2px;">
          <!-- Encabezado del reporte: Capitán oficial y Fecha -->
          <div style="display:flex; gap:10px; align-items:flex-start;">
            <div style="flex:1.2; position:relative;">
              <label style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; display:flex; justify-content:space-between;">
                <span>Capitán</span>
                <span style="font-size:10px; color:#2563eb; font-weight:700;">Lista oficial</span>
              </label>
              <div style="display:flex; align-items:center; position:relative;">
                <input type="text" id="regInputCapitan" value="${escaparTextoSeguro(capitanActivo)}" placeholder="Escribe (ej. ja, re, al)..." autocomplete="off" style="
                  width:100%; padding:10px 32px 10px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:14px; font-weight:700; box-sizing:border-box; margin-top:3px; background:#fff; outline:none; font-family:inherit; color:#0f172a;
                "/>
                <span id="badgeRegCapitanEstado" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none;"></span>
              </div>
              <div id="regSugerenciasCapitan" style="
                display:none; position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:99999; background:#fff; border:1.5px solid #3b82f6; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.18); max-height:190px; overflow-y:auto;
              "></div>
            </div>

            <div style="flex:0.8;">
              <label style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase;">Fecha</label>
              <input type="date" id="regFecha" value="${hoy}" style="
                width:100%; padding:10px 10px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13px; font-weight:700; box-sizing:border-box; margin-top:3px; background:#fff; outline:none; font-family:inherit;
              "/>
            </div>
          </div>

          <!-- Tarjeta de Selección de Territorio y Cuadras -->
          <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:16px; padding:12px 12px 14px; display:flex; flex-direction:column; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase;">Territorio</label>
              <select id="regSelectTerritorio" style="
                width:100%; padding:10px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:14px; font-weight:700; box-sizing:border-box; margin-top:3px; background:#fff; outline:none; font-family:inherit;
              ">
                <option value="">-- Elige un territorio --</option>
              </select>
            </div>

            <!-- Cuadras trabajadas -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <label style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase;">Cuadras trabajadas</label>
                <button id="btnToggleTodasCuadras" type="button" style="
                  background:#ef4444; color:#ffffff; border:none; border-radius:16px; padding:5px 12px; font-size:11.5px; font-weight:800; cursor:pointer; box-shadow:0 2px 6px rgba(239,68,68,0.25); transition:transform 0.15s;
                ">Seleccionar todas</button>
              </div>
              
              <div id="regContenedorCuadras" style="
                max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:12px; padding:8px; background:#ffffff; display:flex; flex-direction:column; gap:5px;
              ">
                <div style="font-size:12.5px; color:#94a3b8; text-align:center; padding:14px;">Elige un territorio para ver sus cuadras</div>
              </div>
            </div>

            <!-- Comentario opcional -->
            <details class="comentario-desplegable" style="background:#ffffff; border-radius:12px; padding:6px 10px;">
              <summary style="font-size:12px; font-weight:700; color:#64748b; cursor:pointer;">💬 Comentario (opcional)</summary>
              <textarea id="regComentario" rows="2" placeholder="Notas sobre este territorio..." style="width:100%; margin-top:6px; padding:8px; border:1px solid #cbd5e1; border-radius:8px; font-size:13px; box-sizing:border-box; outline:none; font-family:inherit;"></textarea>
            </details>

            <!-- Casilla Visita SC -->
            <label style="display:flex; align-items:center; gap:7px; font-size:12px; font-weight:700; color:#475569; cursor:pointer; user-select:none; padding:2px 0;">
              <input type="checkbox" id="regVisitaSC" style="width:15px; height:15px; cursor:pointer; accent-color:#1a73e8;"/>
              <span>Trabajado durante la Visita del S.C.</span>
            </label>

            <!-- Botón para añadir este territorio al lote -->
            <button id="btnAgregarTerritorioLote" type="button" style="
              width:100%; padding:10px 14px; background:#0284c7; color:white; border:none; border-radius:12px; font-size:13.5px; font-weight:800; cursor:pointer; box-shadow:0 3px 8px rgba(2,132,199,0.28); display:flex; align-items:center; justify-content:center; gap:6px; transition:transform 0.15s;
            ">
              <span>➕ Agregar territorio al reporte</span>
            </button>
          </div>

          <!-- Lista acumulada de territorios en lote -->
          <div id="regSeccionLote" style="display:flex; flex-direction:column; gap:6px; margin-top:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:11.5px; font-weight:800; color:#334155; text-transform:uppercase;">
                📋 Territorios listos (<span id="regConteoLote">0</span>)
              </label>
              <span id="regAvisoLote" style="font-size:11px; color:#94a3b8; font-weight:600;">O guarda directo si es 1</span>
            </div>
            <div id="regListaLoteCards" style="max-height:140px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
              <div id="regMsgLoteVacio" style="font-size:12px; color:#94a3b8; text-align:center; padding:10px; border:1px dashed #cbd5e1; border-radius:12px; background:#f8fafc;">
                Ningún territorio agregado a la lista aún
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de Guardar Definitivo -->
        <div style="margin-top:14px;">
          <button id="btnEnviarReporte" style="
            width:100%; padding:13px; background:linear-gradient(135deg, #1a73e8, #1557b0); color:white; border:none; border-radius:14px; font-size:14.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(26,115,232,0.35); transition:transform 0.15s;
          ">Guardar Reporte ✅</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalReg").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    // Vincular autocompletado y validación de capitán
    const inputCap = modal.querySelector("#regInputCapitan");
    const dropdownCap = modal.querySelector("#regSugerenciasCapitan");
    const badgeCap = modal.querySelector("#badgeRegCapitanEstado");
    vincularAutocompleteCapitan(inputCap, dropdownCap, badgeCap);

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

    // Renderizar las cuadras del territorio seleccionado
    function renderizarCuadras(tId) {
      if (!tId) {
        contenedorCuadras.innerHTML = '<div style="font-size:12.5px; color:#94a3b8; text-align:center; padding:14px;">Elige un territorio para ver sus cuadras</div>';
        btnToggleTodas.textContent = "Seleccionar todas";
        return;
      }

      const item = window.TERRITORIOS_DATA.find(x => x.datos.id === tId);
      if (!item || !item.datos.poligonos) {
        contenedorCuadras.innerHTML = '<div style="font-size:12.5px; color:#94a3b8; text-align:center; padding:14px;">Sin cuadras registradas</div>';
        return;
      }

      const cuadrasPredicables = item.datos.poligonos.filter(pol =>
        typeof window.esCuadraPredicable === "function" ? window.esCuadraPredicable(pol) : true
      );

      // Revisar cuáles cuadras ya se trabajaron en este mes
      const numT = item.datos.numeroTerritorio !== undefined ? item.datos.numeroTerritorio : tId;
      const fechaSeleccionada = modal.querySelector("#regFecha").value || hoy;
      const pFecha = parsearFechaReporte(fechaSeleccionada);
      const infoMes = obtenerInfoCuadrasTrabajadasEnMes(tId, numT, pFecha.anio, pFecha.mes);

      contenedorCuadras.innerHTML = "";

      // Aviso si el territorio ya tiene reportes en este mes
      if (infoMes.listaReportesT.length > 0) {
        const ult = infoMes.listaReportesT[0];
        const aviso = document.createElement("div");
        aviso.style.cssText = "background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:6px 10px; margin-bottom:5px; font-size:12px; color:#1e40af; font-weight:700; display:flex; align-items:center; gap:6px;";
        aviso.innerHTML = `<span>🗓️</span> <span>Trabajado el <b>${ult.fecha}</b> (${ult.capitan})</span>`;
        contenedorCuadras.appendChild(aviso);
      }

      cuadrasPredicables.forEach((pol, idx) => {
        const cuadraNum = (pol.label !== null && pol.label !== undefined && String(pol.label).trim() !== "")
          ? String(pol.label).trim()
          : (idx + 1);

        const infoCuadra = infoMes.mapaCuadras.get(pol.id);
        const yaTrabajada = !!infoCuadra;
        const isPreselected = (preCuadraId && pol.id === preCuadraId);
        const estaMarcada = isPreselected || yaTrabajada;

        const chip = document.createElement("div");
        chip.className = `chip-cuadra-item ${estaMarcada ? "selected" : ""} ${yaTrabajada ? "trabajada-mes" : ""}`;
        chip.innerHTML = `
          <div style="display:flex; align-items:center; gap:9px;">
            <input type="checkbox" value="${pol.id}" class="chk-cuadra" ${estaMarcada ? "checked" : ""} style="width:16px; height:16px; accent-color:#1a73e8; cursor:pointer; pointer-events:none;"/>
            <span style="font-weight:700; font-size:13.5px; color:#1e293b;">Cuadra ${cuadraNum}</span>
          </div>
          ${yaTrabajada ? `<span class="chip-badge-mes">🗓️ Trabajado ${infoCuadra.fechaDisplay}</span>` : ''}
        `;

        chip.addEventListener("click", () => {
          const chk = chip.querySelector(".chk-cuadra");
          chk.checked = !chk.checked;
          chip.classList.toggle("selected", chk.checked);
          window.reproducirSonidoClick("toggle");
          const todosChks = contenedorCuadras.querySelectorAll(".chk-cuadra");
          const todasChecked = todosChks.length > 0 && Array.from(todosChks).every(c => c.checked);
          btnToggleTodas.textContent = todasChecked ? "Desmarcar todas" : "Seleccionar todas";
        });

        contenedorCuadras.appendChild(chip);
      });

      const todosChksInicial = contenedorCuadras.querySelectorAll(".chk-cuadra");
      const todasCheckedInicial = todosChksInicial.length > 0 && Array.from(todosChksInicial).every(c => c.checked);
      btnToggleTodas.textContent = todasCheckedInicial ? "Desmarcar todas" : "Seleccionar todas";
    }

    if (selectTerr.value) {
      renderizarCuadras(selectTerr.value);
    }

    selectTerr.addEventListener("change", () => {
      window.reproducirSonidoClick("tap");
      renderizarCuadras(selectTerr.value);
    });

    modal.querySelector("#regFecha").addEventListener("change", () => {
      if (selectTerr.value) {
        renderizarCuadras(selectTerr.value);
      }
    });

    btnToggleTodas.addEventListener("click", () => {
      window.reproducirSonidoClick("tap");
      const chks = contenedorCuadras.querySelectorAll(".chk-cuadra");
      if (chks.length === 0) return;
      const todas = Array.from(chks).every(c => c.checked);
      chks.forEach(c => {
        c.checked = !todas;
        const chip = c.closest(".chip-cuadra-item");
        if (chip) chip.classList.toggle("selected", !todas);
      });
      btnToggleTodas.textContent = todas ? "Seleccionar todas" : "Desmarcar todas";
    });

    // Función para refrescar la lista de tarjetas de lote
    function actualizarVistaLote() {
      const contenedor = modal.querySelector("#regListaLoteCards");
      const conteo = modal.querySelector("#regConteoLote");
      const aviso = modal.querySelector("#regAvisoLote");
      const btnGuardar = modal.querySelector("#btnEnviarReporte");

      conteo.textContent = territoriosEnLote.length;

      if (territoriosEnLote.length === 0) {
        contenedor.innerHTML = `
          <div id="regMsgLoteVacio" style="font-size:12px; color:#94a3b8; text-align:center; padding:10px; border:1px dashed #cbd5e1; border-radius:12px; background:#f8fafc;">
            Ningún territorio agregado a la lista aún
          </div>
        `;
        if (aviso) aviso.textContent = "O guarda directo si es 1";
        btnGuardar.textContent = "Guardar Reporte ✅";
        return;
      }

      if (aviso) aviso.textContent = "Listos para enviar";
      btnGuardar.textContent = `Guardar todos los reportes (${territoriosEnLote.length}) ✅`;

      contenedor.innerHTML = territoriosEnLote.map((item, idx) => `
        <div style="
          display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:8px 12px; box-shadow:0 2px 5px rgba(0,0,0,0.03);
        ">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="font-weight:800; font-size:14px; color:#0f172a;">Territorio ${item.numTLimpio}</span>
              <span style="background:#e0f2fe; color:#0369a1; font-size:11px; font-weight:700; padding:1.5px 7px; border-radius:10px;">${item.chksCount} cuadras</span>
              ${item.visitaSC ? `<span style="background:#fef3c7; color:#b45309; font-size:10.5px; font-weight:700; padding:1.5px 6px; border-radius:8px;">S.C.</span>` : ''}
            </div>
            <div style="font-size:11.5px; color:#64748b; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${item.cuadrasLabels.join(", ")}${item.comentario ? ` • <span style="color:#d97706;">💬 ${escaparTextoSeguro(item.comentario)}</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn-quitar-lote" data-idx="${idx}" title="Eliminar de la lista" style="
            background:#fee2e2; border:none; border-radius:8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:#ef4444; font-size:14px; cursor:pointer; margin-left:8px; flex-shrink:0;
          ">🗑️</button>
        </div>
      `).join("");

      contenedor.querySelectorAll(".btn-quitar-lote").forEach(btn => {
        btn.onclick = () => {
          const i = parseInt(btn.dataset.idx, 10);
          if (!isNaN(i) && i >= 0 && i < territoriosEnLote.length) {
            territoriosEnLote.splice(i, 1);
            window.reproducirSonidoClick("delete");
            actualizarVistaLote();
          }
        };
      });
    }

    // Función para extraer y validar los datos del territorio seleccionado en el formulario
    function obtenerDatosTerritorioActual() {
      const tId = selectTerr.value;
      if (!tId) return null;

      const chks = Array.from(contenedorCuadras.querySelectorAll(".chk-cuadra:checked"));
      if (chks.length === 0) return null;

      const itemT = window.TERRITORIOS_DATA.find(x => x.datos.id === tId);
      const numT = itemT ? (itemT.datos.numeroTerritorio !== undefined ? itemT.datos.numeroTerritorio : tId) : tId;
      const numTLimpio = obtenerNumeroTerritorioLimpio(tId, numT);
      const cuadrasIds = chks.map(c => aCodigoCortoCuadra(c.value, numTLimpio));

      const cuadrasLabels = chks.map(c => {
        const val = c.value;
        const polData = (itemT && itemT.datos.poligonos) ? itemT.datos.poligonos.find(p => p.id === val) : null;
        return (polData && polData.label) ? String(polData.label).trim() : formatearEtiquetaCuadraCorta(val);
      });

      const cuadrasRealesT = (itemT && itemT.datos.poligonos)
        ? itemT.datos.poligonos.filter(pol => typeof window.esCuadraPredicable === "function" ? window.esCuadraPredicable(pol) : true)
        : [];
      const totalCuadras = cuadrasRealesT.length || chks.length;
      const comentario = modal.querySelector("#regComentario").value.trim();
      const visitaSC = modal.querySelector("#regVisitaSC").checked;

      return {
        tId,
        numTLimpio,
        cuadrasIds,
        cuadrasLabels,
        totalCuadras,
        chksCount: chks.length,
        comentario,
        visitaSC
      };
    }

    // Botón: ➕ Agregar territorio al reporte
    modal.querySelector("#btnAgregarTerritorioLote").onclick = () => {
      const capitanVal = (modal.querySelector("#regInputCapitan") ? modal.querySelector("#regInputCapitan").value : "").trim();
      const capitanOficial = resolverCapitanOficial(capitanVal);
      if (!capitanOficial) {
        alert("Por favor selecciona un hermano de la lista oficial de capitanes (ej. Koke, Merari Rosales, Jair Barraza). No se permiten nombres no registrados.");
        modal.querySelector("#regInputCapitan").focus();
        return;
      }
      modal.querySelector("#regInputCapitan").value = capitanOficial;

      const datosT = obtenerDatosTerritorioActual();
      if (!datosT) {
        if (!selectTerr.value) {
          alert("Por favor selecciona un territorio.");
          selectTerr.focus();
        } else {
          alert("Por favor selecciona al menos una cuadra trabajada.");
        }
        return;
      }

      const idxExistente = territoriosEnLote.findIndex(item => String(item.numTLimpio) === String(datosT.numTLimpio));
      if (idxExistente >= 0) {
        territoriosEnLote[idxExistente] = datosT;
      } else {
        territoriosEnLote.push(datosT);
      }

      // Limpiar selección de territorio para agregar el siguiente con facilidad
      selectTerr.value = "";
      renderizarCuadras("");
      modal.querySelector("#regComentario").value = "";
      const det = modal.querySelector(".comentario-desplegable");
      if (det) det.removeAttribute("open");

      window.reproducirSonidoClick("toggle");
      actualizarVistaLote();
    };

    // Botón: Guardar Reporte Definitivo (individual o en lote)
    modal.querySelector("#btnEnviarReporte").onclick = () => {
      const capitanVal = (modal.querySelector("#regInputCapitan") ? modal.querySelector("#regInputCapitan").value : "").trim();
      const capitanOficial = resolverCapitanOficial(capitanVal);
      if (!capitanOficial) {
        alert("Por favor selecciona un hermano de la lista oficial de capitanes (ej. Koke, Merari Rosales, Jair Barraza). No se permiten nombres no registrados.");
        modal.querySelector("#regInputCapitan").focus();
        return;
      }
      modal.querySelector("#regInputCapitan").value = capitanOficial;

      // Si el usuario tiene un territorio seleccionado con cuadras marcadas y no le dio al botón de agregar, incluirlo automáticamente
      const datosTActual = obtenerDatosTerritorioActual();
      if (datosTActual) {
        const idxExistente = territoriosEnLote.findIndex(item => String(item.numTLimpio) === String(datosTActual.numTLimpio));
        if (idxExistente >= 0) {
          territoriosEnLote[idxExistente] = datosTActual;
        } else {
          territoriosEnLote.push(datosTActual);
        }
      }

      if (territoriosEnLote.length === 0) {
        return alert("Por favor selecciona al menos un territorio y sus cuadras trabajadas.");
      }

      const fecha = modal.querySelector("#regFecha").value || hoy;
      const listaLocal = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
      const reportesGuardados = [];

      territoriosEnLote.forEach((item, index) => {
        const tStamp = Date.now() + index;
        const fechaLimpia = String(fecha || "").replace(/-/g, "").slice(0, 8);
        const consecutivo = listaLocal.length + 1;
        const cleanId = `${fechaLimpia}_T${item.numTLimpio}_${consecutivo}`;
        const nuevoReporte = {
          id: cleanId,
          fecha: fecha,
          version: "anterior",
          territorioId: String(item.numTLimpio),
          territorioNumero: String(item.numTLimpio),
          cuadras: item.cuadrasIds,
          cuadrasLabels: item.cuadrasLabels,
          cuadrasTotal: item.chksCount,
          totalCuadrasTerritorio: item.totalCuadras,
          capitan: capitanOficial,
          comentario: item.comentario,
          visitaSC: item.visitaSC,
          estado: "APROBADO",
          timestamp: tStamp
        };
        listaLocal.push(nuevoReporte);
        reportesGuardados.push(nuevoReporte);
      });

      localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(listaLocal));
      actualizarContadorPendientes();
      if (typeof window.actualizarColoresCuadrasCapitan === "function") {
        window.actualizarColoresCuadrasCapitan();
      }

      // Sincronizar en la nube con Google Sheets (en lote y con fallback individual)
      if (URL_API_GOOGLE_SHEETS) {
        fetch(URL_API_GOOGLE_SHEETS, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            accion: "nuevos_reportes",
            action: "nuevos_reportes",
            reportes: reportesGuardados
          })
        }).catch(() => {
          reportesGuardados.forEach(rep => {
            fetch(URL_API_GOOGLE_SHEETS, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                accion: "nuevo_reporte",
                action: "nuevo_reporte",
                reporte: rep,
                reporteId: rep.id,
                id: rep.id
              })
            }).catch(() => { });
          });
        });
      }

      window.reproducirSonidoClick("success");
      cerrar();
      mostrarConfirmacionReportesMultiples(reportesGuardados);
    };
  };

  // 8. Almacenamiento de reportes pendientes (Sin archivos JSON locales de _estado o _capitanes)
  function guardarReportePendiente(reporte) {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    lista.push(reporte);
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    actualizarContadorPendientes();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }

    // Sincronizar nuevo reporte en la nube con Google Sheets
    if (URL_API_GOOGLE_SHEETS) {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          accion: "nuevo_reporte",
          action: "nuevo_reporte",
          reporte: reporte
        })
      }).catch(err => console.warn("Error enviando reporte a Google Sheets:", err));
    }
  }

  function actualizarContadorPendientes() {
    const badge = document.getElementById("badgeReportesPendientes");
    if (badge) {
      badge.style.display = "none";
    }
    const dot = document.querySelector(".avatar-capitan-dot");
    if (dot) {
      dot.style.background = "#22c55e";
      dot.style.boxShadow = "none";
    }
  }

  // 9. Confirmación discreta y opción de notificar por WhatsApp (Soporta individual y múltiples)
  function mostrarConfirmacionReportesMultiples(reportes) {
    if (!reportes || reportes.length === 0) return;
    const lista = Array.isArray(reportes) ? reportes : [reportes];

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";

    const primerRep = lista[0];
    let fechaFormateada = primerRep.fecha || "";
    if (fechaFormateada.includes("-")) {
      const p = fechaFormateada.split("-");
      if (p.length === 3) fechaFormateada = `${p[2]}-${p[1]}-${p[0]}`;
    }

    let msgTexto = "";
    if (lista.length === 1) {
      const r = lista[0];
      const labels = (r.cuadrasLabels && r.cuadrasLabels.length > 0)
        ? r.cuadrasLabels.join(", ")
        : r.cuadras.map(c => formatearEtiquetaCuadraCorta(c)).join(", ");
      const txtCuadra = (r.cuadrasTotal === 1) ? `la cuadra *${labels}*` : `las cuadras *${labels}*`;
      msgTexto = `*${r.capitan}*: Se termina hoy *${fechaFormateada}*, ${txtCuadra} del territorio *${r.territorioNumero}*.`;
    } else {
      const lineas = lista.map(r => {
        const labels = (r.cuadrasLabels && r.cuadrasLabels.length > 0)
          ? r.cuadrasLabels.join(", ")
          : r.cuadras.map(c => formatearEtiquetaCuadraCorta(c)).join(", ");
        const txtCuadra = (r.cuadrasTotal === 1) ? `la cuadra *${labels}*` : `las cuadras *${labels}*`;
        return `• Territorio *${r.territorioNumero}*: ${txtCuadra}`;
      });
      msgTexto = `*${primerRep.capitan}*: Se reportan hoy *${fechaFormateada}*:
${lineas.join("\n")}`;
    }

    const msgWhatsApp = encodeURIComponent(msgTexto);

    modal.innerHTML = `
      <div class="terrosa-modal-card" style="text-align:center; padding:24px 20px 18px; position:relative; max-width:${lista.length > 1 ? '320px' : '280px'};">
        <a href="https://api.whatsapp.com/send?text=${msgWhatsApp}" target="_blank" title="Notificar por WhatsApp" style="
          position:absolute; top:12px; right:12px; display:inline-flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:50%; background:#25D366; box-shadow:0 3px 8px rgba(37,211,102,0.35); text-decoration:none;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.05-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.2 8.2 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
          </svg>
        </a>

        <div style="font-size:32px; margin-bottom:8px;">${lista.length > 1 ? '🎉' : '✅'}</div>
        <h3 style="margin:0 0 8px 0; color:#1e293b; font-size:17.5px; font-weight:800;">
          ${lista.length > 1 ? `Reportes registrados (${lista.length})` : 'Reporte registrado'}
        </h3>

        ${lista.length > 1 ? `
          <div style="max-height:130px; overflow-y:auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:8px 10px; margin-bottom:14px; text-align:left; font-size:12px; color:#334155;">
            ${lista.map(r => `
              <div style="padding:4px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;">
                <b>Territorio ${r.territorioNumero}:</b>
                <span style="color:#0284c7; font-weight:700;">${r.cuadrasTotal} cuadras</span>
              </div>
            `).join("")}
          </div>
        ` : '<div style="margin-bottom:14px;"></div>'}

        <button id="btnCerrarExitoReporte" style="
          width:100%; padding:11px; background:#1a73e8; border:none; border-radius:12px; font-weight:700; color:white; cursor:pointer; font-size:14px;
        ">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#btnCerrarExitoReporte").onclick = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };
  }

  function mostrarConfirmacionReporte(reporte) {
    mostrarConfirmacionReportesMultiples([reporte]);
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

    modal.onclick = (e) => {
      if (e.target === modal) {
        window.reproducirSonidoClick("tap");
        cerrar();
      }
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
      btnBuzon.onclick = () => {
        pedirPinEncargado(() => {
          abrirModalBuzonAprobaciones();
        });
      };
    }
  }

  function abrirModalBuzonAprobaciones() {
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const pendientes = lista.filter(r => r.estado === "PENDIENTE" && perteneceAVersionActiva(r));
    const versionTxt = window.getVersionTerritorioActiva() === "nueva" ? "Nueva" : "Anterior";

    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";
    modal.innerHTML = `
      <div class="terrosa-modal-card terrosa-modal-large">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0; color:#1e293b; font-size:17px; font-weight:800;">🔔 Aprobaciones ${versionTxt} (${pendientes.length})</h3>
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
          <span style="font-size:12px; color:#64748b; font-weight:600;">📅 ${formatearFechaCorta(rep.fecha)}</span>
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
    } catch (e) { }
  }

  function registrarMutacionEliminado(id) {
    try {
      const setElim = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_eliminadas") || "[]"));
      setElim.add(id);
      localStorage.setItem("terrosa_mutaciones_eliminadas", JSON.stringify(Array.from(setElim)));

      const setApr = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_aprobadas") || "[]"));
      setApr.delete(id);
      localStorage.setItem("terrosa_mutaciones_aprobadas", JSON.stringify(Array.from(setApr)));
    } catch (e) { }
  }

  // 11. Acción de Aprobar Reporte (Sin guardar basura local en _capitanes o _estado)
  function aprobarReporte(id) {
    registrarMutacionAprobado(id);
    const lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const rep = lista.find(r => r.id === id);
    if (!rep) return;

    rep.estado = "APROBADO";
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

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
        body: JSON.stringify({
          accion: "aprobar_reporte",
          action: "aprobar_reporte",
          id: id,
          reporteId: id
        })
      }).catch(err => console.warn("Error enviando aprobación a Google Sheets:", err));
    }
  }

  function descartarReporte(id) {
    registrarMutacionEliminado(id);
    let lista = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    lista = lista.filter(r => r.id !== id);
    localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));

    actualizarContadorPendientes();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }

    // Sincronizar descarte con Google Sheets
    if (URL_API_GOOGLE_SHEETS) {
      fetch(URL_API_GOOGLE_SHEETS, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          accion: "descartar_reporte",
          action: "descartar_reporte",
          id: id,
          reporteId: id
        })
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

  // 12.5. Limpieza total de caché huérfana y estados locales
  window.limpiarCacheCuadrasFantasma = function () {
    purgarBasuraLocalStorage();
    if (typeof window.actualizarColoresCuadrasCapitan === "function") {
      window.actualizarColoresCuadrasCapitan();
    }
    mostrarToastDiscreto("Caché limpiada y mapa restaurado ✅");
  };

  // 13. Pintar cuadras en gris (solo en Modo Capitán y para reportes de la versión activa)
  window.actualizarColoresCuadrasCapitan = function () {
    if (!window.todosLosTerritorios || !Array.isArray(window.todosLosTerritorios)) return;

    // En Modo Publicador: CERO grises, todo 100% colorido con sus estilos originales
    const modo = window.getModoActual();
    if (modo !== "capitan") {
      window.todosLosTerritorios.forEach(grupo => {
        grupo.eachLayer(pol => {
          if (pol._originalStyle) {
            pol._selected = false;
            pol.setStyle(pol._originalStyle);
          }
        });
      });
      return;
    }

    // Si hay un filtro de fecha activo en la cabecera, respetarlo
    if (window.hayFiltroFechaActivo && window.hayFiltroFechaActivo()) {
      window.ejecutarFiltroFecha();
      return;
    }

    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const cuadrasReportadasPorTerritorio = {};

    reportes.forEach(rep => {
      if ((rep.estado === "PENDIENTE" || rep.estado === "APROBADO" || !rep.estado) && perteneceAVersionActiva(rep)) {
        const tIdLimpio = obtenerTerritorioIdLimpio(rep);
        const numR = obtenerNumeroTerritorioLimpio(rep.territorioId, rep.territorioNumero);
        if (!cuadrasReportadasPorTerritorio[tIdLimpio]) {
          cuadrasReportadasPorTerritorio[tIdLimpio] = new Set();
        }
        if (Array.isArray(rep.cuadras)) {
          rep.cuadras.forEach(cId => {
            obtenerVariantesIdCuadra(cId, numR).forEach(v => cuadrasReportadasPorTerritorio[tIdLimpio].add(v));
          });
        }
      }
    });

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const setReportadas = cuadrasReportadasPorTerritorio[tId] || new Set();

      grupo.eachLayer(pol => {
        if (!pol._originalStyle) return;

        // Solo cuadras predicables que estén en un reporte activo de esta versión
        const esGris = (pol._esPredicable !== false) && setReportadas.has(pol._id);
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

  let _filtroFechaBarraInicializado = false;
  let filtroIncompletosActivo = false;
  let mesesFiltroActivos = new Set();

  // Función para determinar si una fecha ISO pertenece al Año de Servicio seleccionado
  // Cada año de servicio es de septiembre a agosto: ej. 2025 es hasta 31/08/2026; 2026 es de 01/09/2026 a 31/08/2027.
  function perteneceAAnioServicio(fechaISO, targetAnio) {
    if (!fechaISO) return false;
    if (!targetAnio || targetAnio === "todos") return true;
    const str = String(fechaISO).slice(0, 10);
    const anioNum = parseInt(targetAnio, 10);
    if (isNaN(anioNum)) return true;

    if (anioNum === 2025) {
      return str <= "2026-08-31";
    }
    const inicio = `${anioNum}-09-01`;
    const fin = `${anioNum + 1}-08-31`;
    return str >= inicio && str <= fin;
  }

  let anioFiltroActivo = "2026";

  window.hayFiltroFechaActivo = function () {
    const mesActivo = mesesFiltroActivos.size > 0 && mesesFiltroActivos.size < 12;
    const anioActivo = anioFiltroActivo !== "todos";
    return mesActivo || anioActivo;
  };

  function abrirModalSeleccionarAnio() {
    window.reproducirSonidoClick("tap");
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";

    const opciones = [
      { id: "2026", titulo: "Año de Serv. 2026", sub: "Septiembre 2026 a Agosto 2027 (Actual)" },
      { id: "2025", titulo: "Año de Serv. 2025", sub: "Hasta 31 de Agosto de 2026" },
      { id: "todos", titulo: "Todos los años", sub: "Mostrar todos los registros sin filtro de año" }
    ];

    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:320px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Año de Servicio</h3>
          <button id="btnCerrarModalAnio" class="btn-icon-square">✕</button>
        </div>
        <p style="margin:0 0 14px 0; font-size:12.5px; color:#64748b;">Elige el año de servicio para filtrar:</p>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${opciones.map(op => {
      const esActivo = (anioFiltroActivo === op.id);
      return `
              <div class="opcion-anio-item" data-id="${op.id}" style="
                display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-radius:14px; cursor:pointer; background:${esActivo ? 'rgba(37,99,235,0.08)' : '#f8fafc'}; border:1.5px solid ${esActivo ? '#2563eb' : '#e2e8f0'}; transition:all 0.15s ease;
              ">
                <div>
                  <div style="font-size:14px; font-weight:800; color:${esActivo ? '#1d4ed8' : '#1e293b'};">${op.titulo}</div>
                  <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${op.sub}</div>
                </div>
                ${esActivo ? '<span style="font-size:16px; color:#2563eb; font-weight:900;">✓</span>' : ''}
              </div>
            `;
    }).join("")}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalAnio").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    modal.querySelectorAll(".opcion-anio-item").forEach(item => {
      item.onclick = () => {
        const val = item.dataset.id;
        anioFiltroActivo = val;
        localStorage.setItem("terrosa_filtro_anio", anioFiltroActivo);
        actualizarEtiquetaBotonAnio();
        window.reproducirSonidoClick("tap");
        window.ejecutarFiltroFecha();
        if (document.body.contains(modal)) document.body.removeChild(modal);
      };
    });
  }

  function actualizarEtiquetaBotonAnio() {
    const lbl = document.getElementById("txtFiltroAnioLabel");
    if (!lbl) return;
    if (anioFiltroActivo === "2026") {
      lbl.textContent = "📅 Serv. 2026";
    } else if (anioFiltroActivo === "2025") {
      lbl.textContent = "📅 Serv. 2025";
    } else {
      lbl.textContent = "📅 Años: Todos";
    }
  }

  window.abrirModalSeleccionarMeses = function abrirModalSeleccionarMeses() {
    const modal = document.createElement("div");
    modal.className = "terrosa-modal-overlay";

    const mesActual = String(new Date().getMonth() + 1).padStart(2, "0");

    let itemsHtml = "";
    NOMBRES_MESES.forEach(m => {
      const isChecked = mesesFiltroActivos.has(m.num);
      const isCurrent = (m.num === mesActual);
      itemsHtml += `
        <div id="itemMes_${m.num}" style="display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border-radius:10px; background:${isChecked ? 'rgba(26,115,232,0.1)' : 'transparent'}; border:1px solid ${isChecked ? '#93c5fd' : 'transparent'}; transition:all 0.15s ease;">
          <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1; margin:0;">
            <input type="checkbox" value="${m.num}" class="chk-mes-filtro" ${isChecked ? 'checked' : ''} style="width:17px; height:17px; accent-color:#1a73e8; cursor:pointer;"/>
            <span style="font-weight:700; font-size:14px; color:#1e293b;">${m.nombre} ${isCurrent ? '<span style="font-size:10px; font-weight:800; color:#2563eb; background:#dbeafe; padding:2px 6px; border-radius:6px; margin-left:4px;">Actual</span>' : ''}</span>
          </label>
          <button type="button" class="btn-solo-mes" data-mes="${m.num}" title="Ver solo ${m.nombre}" style="font-size:11px; padding:3px 8px; border-radius:6px; border:1.5px solid #cbd5e1; background:#ffffff; color:#334155; font-weight:800; cursor:pointer;">
            Solo
          </button>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="terrosa-modal-card" style="max-width:320px; padding:20px 18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Filtrar por Mes</h3>
          <button id="btnCerrarModalMeses" class="btn-icon-square">✕</button>
        </div>
        <p style="margin:0 0 10px 0; font-size:12.5px; color:#64748b;">Elige uno o varios meses para ver lo trabajado:</p>

        <!-- Botones de selección rápida -->
        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <button type="button" id="btnMesActualModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
            📍 Actual
          </button>
          <button type="button" id="btnTodosMesesModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
            🗓️ Todos
          </button>
          <button type="button" id="btnLimpiarMesesModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #fee2e2; background:#fff5f5; color:#dc2626; cursor:pointer;">
            ✕ Limpiar
          </button>
        </div>
        
        <div id="listaMesesCheck" style="max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:3px; border:1px solid #e2e8f0; border-radius:14px; padding:6px; margin-bottom:14px; background:#f8fafc;">
          ${itemsHtml}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <button id="btnCancelarMesesModal" style="background:#f1f5f9; border:none; border-radius:12px; padding:11px 14px; font-size:13px; font-weight:700; color:#475569; cursor:pointer;">
            Cancelar
          </button>
          <button id="btnAplicarMeses" style="flex:1; background:linear-gradient(135deg, #1a73e8, #1557b0); border:none; border-radius:12px; padding:11px; font-size:14px; font-weight:800; color:white; cursor:pointer; box-shadow:0 3px 10px rgba(26,115,232,0.3);">
            Aplicar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    modal.querySelector("#btnCerrarModalMeses").onclick = cerrar;
    modal.querySelector("#btnCancelarMesesModal").onclick = cerrar;
    modal.onclick = (e) => {
      if (e.target === modal) cerrar();
    };

    setTimeout(() => {
      const curElem = modal.querySelector(`#itemMes_${mesActual}`);
      if (curElem) curElem.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);

    const listaCheck = modal.querySelector("#listaMesesCheck");
    const chks = listaCheck.querySelectorAll(".chk-mes-filtro");

    const actualizarEstilosCheckboxes = () => {
      chks.forEach(c => {
        const itemRow = c.closest("[id^='itemMes_']");
        if (itemRow) {
          itemRow.style.background = c.checked ? 'rgba(26,115,232,0.1)' : 'transparent';
          itemRow.style.borderColor = c.checked ? '#93c5fd' : 'transparent';
        }
      });
    };

    // Botón Mes Actual rápido
    modal.querySelector("#btnMesActualModal").onclick = () => {
      window.reproducirSonidoClick("tap");
      chks.forEach(c => {
        c.checked = (c.value === mesActual);
      });
      actualizarEstilosCheckboxes();
    };

    // Botón Todos
    modal.querySelector("#btnTodosMesesModal").onclick = () => {
      window.reproducirSonidoClick("tap");
      chks.forEach(c => {
        c.checked = true;
      });
      actualizarEstilosCheckboxes();
    };

    // Botón Limpiar
    modal.querySelector("#btnLimpiarMesesModal").onclick = () => {
      window.reproducirSonidoClick("tap");
      chks.forEach(c => {
        c.checked = false;
      });
      actualizarEstilosCheckboxes();
    };

    // Botones "Solo" al lado de cada mes (aplica inmediatamente el mes seleccionado)
    modal.querySelectorAll(".btn-solo-mes").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const mesElegido = btn.dataset.mes;
        mesesFiltroActivos.clear();
        mesesFiltroActivos.add(mesElegido);
        localStorage.setItem("terrosa_filtro_meses", JSON.stringify([mesElegido]));
        actualizarEtiquetaBotonMeses();
        window.ejecutarFiltroFecha();
        window.reproducirSonidoClick("success");
        if (document.body.contains(modal)) document.body.removeChild(modal);
      };
    });

    chks.forEach(c => {
      c.onchange = () => {
        window.reproducirSonidoClick("toggle");
        actualizarEstilosCheckboxes();
      };
    });

    modal.querySelector("#btnAplicarMeses").onclick = () => {
      window.reproducirSonidoClick("success");
      mesesFiltroActivos.clear();
      chks.forEach(c => {
        if (c.checked) mesesFiltroActivos.add(c.value);
      });
      localStorage.setItem("terrosa_filtro_meses", JSON.stringify(Array.from(mesesFiltroActivos)));
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
    } else if (mesesFiltroActivos.size === 1) {
      const num = Array.from(mesesFiltroActivos)[0];
      const mObj = NOMBRES_MESES.find(m => m.num === num);
      lbl.textContent = `Mes: ${mObj ? mObj.nombre : num}`;
    } else if (mesesFiltroActivos.size === 2) {
      const arr = Array.from(mesesFiltroActivos).map(num => {
        const mObj = NOMBRES_MESES.find(m => m.num === num);
        return mObj ? mObj.abrev : num;
      });
      lbl.textContent = `Mes: ${arr.join(", ")}`;
    } else {
      lbl.textContent = `Mes (${mesesFiltroActivos.size})`;
    }

    if (btnLimpiar) {
      btnLimpiar.style.display = window.hayFiltroFechaActivo() ? "inline-flex" : "none";
    }
  }

  window.ejecutarFiltroFecha = function () {
    if (!window.todosLosTerritorios || !Array.isArray(window.todosLosTerritorios)) return;

    // En Modo Publicador nunca debe haber grises
    if (window.getModoActual() !== "capitan") {
      window.todosLosTerritorios.forEach(grupo => {
        grupo.eachLayer(pol => {
          if (pol._originalStyle) {
            pol._selected = false;
            pol.setStyle(pol._originalStyle);
          }
        });
      });
      return;
    }

    const btnLimpiar = document.getElementById("btnLimpiarFiltroFecha");
    const anio = anioFiltroActivo || "2026";

    const filtrarPorMes = (mesesFiltroActivos.size > 0 && mesesFiltroActivos.size < 12);
    const hayFiltro = (filtrarPorMes || anio !== "todos");
    if (btnLimpiar) btnLimpiar.style.display = hayFiltro ? "inline-flex" : "none";

    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const cuadrasCoincidentes = {};

    reportes.forEach(rep => {
      if (!rep.fecha || !perteneceAVersionActiva(rep)) return;
      if (!perteneceAAnioServicio(rep.fecha, anio)) return;

      const p = parsearFechaReporte(rep.fecha);
      if (filtrarPorMes && !mesesFiltroActivos.has(p.mes)) return;

      if (Array.isArray(rep.cuadras)) {
        const tIdLimpio = obtenerTerritorioIdLimpio(rep);
        const numR = obtenerNumeroTerritorioLimpio(rep.territorioId, rep.territorioNumero);
        if (!cuadrasCoincidentes[tIdLimpio]) cuadrasCoincidentes[tIdLimpio] = new Set();
        rep.cuadras.forEach(cId => {
          obtenerVariantesIdCuadra(cId, numR).forEach(v => cuadrasCoincidentes[tIdLimpio].add(v));
        });
      }
    });

    let territoriosIncompletosCount = 0;

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const setMatch = cuadrasCoincidentes[tId] || new Set();

      // Contar cuadras totales y hechas para detectar incompletos
      let totalPredicables = 0;
      let hechas = 0;
      grupo.eachLayer(pol => {
        if (pol._esPredicable !== false) {
          totalPredicables++;
          if (setMatch.has(pol._id)) hechas++;
        }
      });

      const esIncompleto = (totalPredicables > 0 && hechas > 0 && hechas < totalPredicables);
      if (esIncompleto) territoriosIncompletosCount++;

      grupo.eachLayer(pol => {
        if (!pol._originalStyle) return;

        const fueHecha = (pol._esPredicable !== false) && setMatch.has(pol._id);

        if (filtroIncompletosActivo) {
          if (esIncompleto) {
            // Territorio incompleto: destacar cuadras hechas en gris y pendientes en naranja/ámbar
            if (fueHecha) {
              pol.setStyle({
                color: "#334155",
                fillColor: "#64748b",
                fillOpacity: 0.85,
                weight: 2
              });
            } else {
              pol.setStyle({
                color: "#d97706",
                fillColor: "#fef3c7",
                fillOpacity: 0.82,
                weight: 2.5
              });
            }
          } else {
            // Territorios completos (100%) o sin iniciar (0%): atenuar
            pol.setStyle({
              color: "#cbd5e1",
              fillColor: fueHecha ? "#94a3b8" : "#f1f5f9",
              fillOpacity: 0.12,
              opacity: 0.28,
              weight: 1
            });
          }
        } else {
          // Vista normal de filtro
          if (fueHecha) {
            pol._selected = true;
            pol.setStyle({
              color: "#334155",
              fillColor: "#64748b",
              fillOpacity: 0.9,
              weight: 2
            });
          } else {
            pol._selected = false;
            pol.setStyle(pol._originalStyle);
          }
        }
      });
    });
  };

  function inicializarFiltroFechaBarra() {
    const btnAnio = document.getElementById("btnModalFiltroAnio");
    const btnMeses = document.getElementById("btnModalFiltroMeses");
    const btnLimpiar = document.getElementById("btnLimpiarFiltroFecha");

    if (!_filtroFechaBarraInicializado) {
      _filtroFechaBarraInicializado = true;

      // Cargar año guardado o por defecto 2026
      const anioGuardado = localStorage.getItem("terrosa_filtro_anio");
      anioFiltroActivo = anioGuardado || "2026";

      // Cargar meses guardados o por defecto el mes actual
      const mesesGuardados = localStorage.getItem("terrosa_filtro_meses");
      mesesFiltroActivos.clear();
      if (mesesGuardados !== null) {
        try {
          const arr = JSON.parse(mesesGuardados);
          if (Array.isArray(arr)) {
            arr.forEach(m => mesesFiltroActivos.add(String(m).padStart(2, "0")));
          }
        } catch (e) { }
      } else {
        // Primera vez en el dispositivo: mes actual
        const mesActual = String(new Date().getMonth() + 1).padStart(2, "0");
        mesesFiltroActivos.add(mesActual);
        localStorage.setItem("terrosa_filtro_meses", JSON.stringify([mesActual]));
      }

      if (btnAnio) {
        btnAnio.onclick = () => {
          abrirModalSeleccionarAnio();
        };
      }

      if (btnMeses) {
        btnMeses.onclick = () => {
          abrirModalSeleccionarMeses();
        };
      }

      const btnIncompletos = document.getElementById("btnFiltroIncompletos");
      if (btnIncompletos) {
        btnIncompletos.onclick = () => {
          window.reproducirSonidoClick("tap");
          filtroIncompletosActivo = !filtroIncompletosActivo;
          btnIncompletos.classList.toggle("incompletos-activo", filtroIncompletosActivo);
          window.ejecutarFiltroFecha();
          if (filtroIncompletosActivo) {
            mostrarToastDiscreto("⏳ Territorios incompletos destacados en el mapa");
          }
        };
      }

      if (btnLimpiar) {
        btnLimpiar.onclick = () => {
          window.reproducirSonidoClick("tap");
          mesesFiltroActivos.clear();
          localStorage.setItem("terrosa_filtro_meses", JSON.stringify([]));
          actualizarEtiquetaBotonMeses();
          window.ejecutarFiltroFecha();
        };
      }
    }

    actualizarEtiquetaBotonAnio();
    actualizarEtiquetaBotonMeses();
    window.ejecutarFiltroFecha();
  }

  // 15. Sincronización en la Nube con Google Sheets (Merge optimista y seguro)
  window.sincronizarConNube = async function (mostrarFeedback = false) {
    if (!URL_API_GOOGLE_SHEETS) return;
    try {
      if (mostrarFeedback) mostrarToastDiscreto("Sincronizando con Google Sheets... ⏳");

      const res = await fetch(URL_API_GOOGLE_SHEETS, { method: "GET" });
      const data = await res.json();

      const listaReportes = (data && Array.isArray(data.reportes))
        ? data.reportes
        : ((data && Array.isArray(data.historial)) ? data.historial : null);

      if (data && (data.exito || data.status === "success") && listaReportes) {
        const eliminadosLocales = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_eliminadas") || "[]"));
        const aprobadosLocales = new Set(JSON.parse(localStorage.getItem("terrosa_mutaciones_aprobadas") || "[]"));

        // Limpiar de mutaciones pendientes lo que la nube ya confirmó
        listaReportes.forEach(r => {
          if (r.estado === "APROBADO") aprobadosLocales.delete(r.id);
        });
        const idsNube = new Set(listaReportes.map(r => r.id));
        eliminadosLocales.forEach(id => {
          if (!idsNube.has(id)) eliminadosLocales.delete(id);
        });
        localStorage.setItem("terrosa_mutaciones_aprobadas", JSON.stringify(Array.from(aprobadosLocales)));
        localStorage.setItem("terrosa_mutaciones_eliminadas", JSON.stringify(Array.from(eliminadosLocales)));

        // Normalizar fechas y códigos cortos sin desfase de zona horaria UTC
        let reportesNormalizados = listaReportes
          .filter(r => !eliminadosLocales.has(r.id))
          .map(r => {
            const parsed = parsearFechaReporte(r.fecha);
            if (parsed.fechaISO) {
              r.fecha = parsed.fechaISO;
            }
            const numLimpio = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
            r.territorioId = String(numLimpio);
            r.territorioNumero = String(numLimpio);
            if (Array.isArray(r.cuadras)) {
              r.cuadras = r.cuadras.map(c => aCodigoCortoCuadra(c, numLimpio));
            }
            r.estado = "APROBADO";
            return r;
          });

        // Preservar reportes recién creados en local que aún van subiendo a la nube (evitando duplicar con reportes ya existentes con IDs viejos)
        const listaLocal = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
        listaLocal.forEach(rLoc => {
          if (!eliminadosLocales.has(rLoc.id)) {
            const existeEnNube = reportesNormalizados.some(rNub => {
              if (rNub.id === rLoc.id) return true;
              const tNub = String(rNub.territorioNumero || rNub.territorioId);
              const tLoc = String(rLoc.territorioNumero || rLoc.territorioId);
              const fNub = String(rNub.fecha).slice(0, 10);
              const fLoc = String(rLoc.fecha).slice(0, 10);
              const capNub = String(rNub.capitan || "").trim().toLowerCase();
              const capLoc = String(rLoc.capitan || "").trim().toLowerCase();
              return (tNub === tLoc && fNub === fLoc && capNub === capLoc);
            });
            if (!existeEnNube) {
              reportesNormalizados.push(rLoc);
            }
          }
        });

        // Deduplicación garantizada
        reportesNormalizados = deduplicarListaReportes(reportesNormalizados);

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

  // Ajustar modales y enfocar inputs automáticamente cuando se abre el teclado virtual en móvil
  document.addEventListener("focusin", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) {
      const card = e.target.closest(".terrosa-modal-card");
      if (card) {
        setTimeout(() => {
          try {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          } catch (err) { }
        }, 160);
      }
    }
  });

  // 16. Sonido táctil en barras y selectores principales (evitando duplicar en modales que tienen su propio sonido)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".terrosa-modal-overlay")) return;
    const btn = e.target.closest(".pill-btn, .custom-select .selected, .options li, .filtro-pildora-btn, .filtro-fecha-btn-limpiar, #menuContextual button");
    if (btn && typeof window.reproducirSonidoClick === "function") {
      window.reproducirSonidoClick("tap");
    }
  }, true);

  // Auto-inicialización garantizada de eventos y botones
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (typeof window.inicializarModuloCapitan === "function") {
        window.inicializarModuloCapitan();
      }
    });
  } else {
    if (typeof window.inicializarModuloCapitan === "function") {
      window.inicializarModuloCapitan();
    }
  }

})();

