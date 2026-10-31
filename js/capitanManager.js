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
            <span>${escaparTextoSeguro(c)}</span>
            <span style="font-size:11px; color:#16a34a; background:#dcfce7; padding:2px 7px; border-radius:10px; font-weight:700;">Oficial</span>
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
        if (badgeEstadoEl) badgeEstadoEl.innerHTML = '<span style="color:#16a34a; display:inline-flex; align-items:center;" title="Capitán oficial verificado"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
      } else {
        inputEl.style.borderColor = "#f59e0b";
        inputEl.style.boxShadow = "0 0 0 2px rgba(245, 158, 11, 0.18)";
        if (badgeEstadoEl) badgeEstadoEl.innerHTML = '<span style="color:#f59e0b; display:inline-flex; align-items:center;" title="No coincide con la lista oficial"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>';
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

  // Sanitización inteligente de cuadras acumuladas:
  // Corrige automáticamente cuando un reporte posterior heredó por error de la interfaz las cuadras de un reporte previo del mismo territorio y mes.
  // Ejemplo: si Luis Gardea hizo cuadras 1 y 2, y en la tarde Alfredo hizo solo la 4 pero se guardaron 1, 2 y 4,
  // esta función resta las cuadras previas ya trabajadas por Luis y deja a Alfredo únicamente con la cuadra 4 que él trabajó.
  function sanitizarReportesAcumulados(lista) {
    if (!Array.isArray(lista) || lista.length <= 1) return lista || [];

    // Agrupar por Territorio y Periodo (Año + Mes)
    const grupos = new Map();
    lista.forEach(r => {
      if (!r || !r.fecha) return;
      const tNum = String(obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero));
      const p = parsearFechaReporte(r.fecha);
      const grupoKey = `${tNum}_${p.anio}_${p.mes}`;
      if (!grupos.has(grupoKey)) grupos.set(grupoKey, []);
      grupos.get(grupoKey).push(r);
    });

    grupos.forEach((repsGrupo) => {
      if (repsGrupo.length <= 1) return;

      // Ordenar cronológicamente del más antiguo al más reciente
      repsGrupo.sort((a, b) => {
        const fa = (parsearFechaReporte(a.fecha).fechaISO || a.fecha || "");
        const fb = (parsearFechaReporte(b.fecha).fechaISO || b.fecha || "");
        if (fa !== fb) return fa.localeCompare(fb);
        const tA = a.timestamp || 0;
        const tB = b.timestamp || 0;
        return tA - tB;
      });

      const cuadrasAcumuladasSet = new Set();
      const tNum = String(obtenerNumeroTerritorioLimpio(repsGrupo[0].territorioId, repsGrupo[0].territorioNumero));

      repsGrupo.forEach((rep) => {
        if (!Array.isArray(rep.cuadras) || rep.cuadras.length === 0) return;

        const cuadrasNormalizadas = rep.cuadras.map(c => aCodigoCortoCuadra(c, tNum));
        const yaReclamadas = cuadrasNormalizadas.filter(c => cuadrasAcumuladasSet.has(c));
        const nuevasUnicas = cuadrasNormalizadas.filter(c => !cuadrasAcumuladasSet.has(c));

        // Si este reporte contiene cuadras ya reportadas por otro hermano antes y además tiene cuadras nuevas,
        // restaurar este reporte solo a sus cuadras nuevas que realmente corresponden a este capitán
        if (yaReclamadas.length > 0 && nuevasUnicas.length > 0) {
          rep.cuadras = nuevasUnicas;
          rep.cuadrasTotal = nuevasUnicas.length;
          rep.cuadrasLabels = nuevasUnicas.map(c => formatearEtiquetaCuadraCorta(c));
        }

        // Registrar las cuadras trabajadas en el acumulador del periodo
        (rep.cuadras || []).forEach(c => cuadrasAcumuladasSet.add(aCodigoCortoCuadra(c, tNum)));
      });
    });

    return lista;
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

      // Limpiar automáticamente reportes duplicados y corregir acumulaciones indebidas de cuadras
      const rawReportes = localStorage.getItem("terrosa_reportes_pendientes");
      if (rawReportes) {
        let lista = JSON.parse(rawReportes);
        if (Array.isArray(lista) && lista.length > 0) {
          const countAntes = lista.length;
          lista = deduplicarListaReportes(lista);
          lista = sanitizarReportesAcumulados(lista);
          localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(lista));
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
  let moduloCapitanYaInicializado = false;
  window.inicializarModuloCapitan = function () {
    if (moduloCapitanYaInicializado) return;
    moduloCapitanYaInicializado = true;
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
          btnIngresar.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> <span style="max-width:56px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escaparTextoSeguro(primerNombre)}</span> <span style="font-size:9px; opacity:0.6;">▾</span>`;
          btnIngresar.title = `Perfil: ${pubNombre} (Toca para editar o entrar como Capitán)`;
        } else {
          btnIngresar.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> <span>Perfil</span> <span style="font-size:9px; opacity:0.6;">▾</span>`;
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
      } else if (el.id === "btnMenuTarjetaS12") {
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

    // Ocultar tarjeta informativa si salimos de Modo Capitán
    if (!esCapitan && typeof window.ocultarTarjetaInfoCapitan === "function") {
      window.ocultarTarjetaInfoCapitan();
    }
  }

  // 4. Conmutar entre Publicador y Capitán
  function vincularEventosModo() {
    // Botón cerrar y compartir de la tarjeta informativa de Capitán
    const btnCerrarInfo = document.getElementById("btnCerrarInfoCapitan");
    if (btnCerrarInfo) {
      btnCerrarInfo.onclick = () => {
        if (typeof window.reproducirSonidoClick === "function") window.reproducirSonidoClick("tap");
        window.ocultarTarjetaInfoCapitan();
      };
    }

    const btnCompartirInfo = document.getElementById("btnCompartirTerritorioCapitan");
    if (btnCompartirInfo) {
      btnCompartirInfo.onclick = (e) => {
        e.stopPropagation();
        if (typeof window.reproducirSonidoClick === "function") window.reproducirSonidoClick("tap");
        const tarjeta = document.getElementById("tarjetaInfoCapitan");
        const tId = (tarjeta && tarjeta.dataset.territorioId) || (window.territorioActivo ? window.territorioActivo._id : null);
        const cLbl = (tarjeta && tarjeta.dataset.cuadraLabel) || null;
        if (typeof window.compartirTerritorioLink === "function") {
          window.compartirTerritorioLink(tId, cLbl);
        }
      };
    }

    const btnTarjetaS12 = document.getElementById("btnTarjetaS12Capitan");
    if (btnTarjetaS12) {
      btnTarjetaS12.onclick = (e) => {
        e.stopPropagation();
        if (typeof window.reproducirSonidoClick === "function") window.reproducirSonidoClick("tap");
        const tarjeta = document.getElementById("tarjetaInfoCapitan");
        const tId = (tarjeta && tarjeta.dataset.territorioId) || (window.territorioActivo ? window.territorioActivo._id : "1");
        if (typeof window.abrirModalTarjetaS12 === "function") {
          window.abrirModalTarjetaS12(tId);
        }
      };
    }

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
          <h3 style="margin:0; color:#0f172a; font-size:18.5px; font-weight:800;">Acceso de Capitán</h3>
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
      mostrarToastDiscreto("Modo Capitán activado");
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
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Perfil Activo</h3>
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
          ">Salir a Modo Publicador</button>
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
        mostrarToastDiscreto("Usuario actualizado");
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
          <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a;">Perfil de Publicador</h3>
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
          ">Guardar Nombre</button>
        </div>

        <div style="border-top:1px solid #e2e8f0; margin:16px 0;"></div>

        <!-- Acceso a Capitán -->
        <div style="margin-bottom:14px;">
          <label style="font-size:11.5px; font-weight:700; color:#64748b; text-transform:uppercase; display:block; margin-bottom:6px;">¿Eres Capitán o Encargado?</label>
          <button id="btnIrLoginCapitanDesdePub" style="
            width:100%; padding:11px 14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; font-weight:800; color:#1e293b; cursor:pointer; font-size:13.5px; display:flex; align-items:center; justify-content:center; gap:8px;
          ">
            <span>Ingresar con PIN</span>
          </button>
        </div>

        <div style="border-top:1px solid #f1f5f9; padding-top:10px; text-align:center;">
          <button id="btnReiniciarDatosLocales" type="button" style="
            background:transparent; border:none; color:#94a3b8; font-size:11.5px; font-weight:700; cursor:pointer; padding:6px 10px; border-radius:8px; transition:all 0.15s ease;
          ">Borrar notas y datos locales</button>
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
      mostrarToastDiscreto("Perfil actualizado");
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
        const accionBorrar = () => {
          // Preservar la identidad del dispositivo para no duplicar en Google Sheets
          const dispId = localStorage.getItem("terrosa_dispositivo_id");
          const regVersion = localStorage.getItem("territorios_version");
          localStorage.clear();
          if (dispId) localStorage.setItem("terrosa_dispositivo_id", dispId);
          if (regVersion) localStorage.setItem("territorios_version", regVersion);
          mostrarToastDiscreto("Datos locales reiniciados correctamente");
          setTimeout(() => window.location.reload(), 1200);
        };

        if (typeof window.mostrarConfirmacionModal === "function") {
          window.mostrarConfirmacionModal({
            titulo: "Reiniciar datos locales",
            mensaje: "¿Estás seguro de que deseas borrar tus notas y reiniciar los datos locales de la app en este dispositivo? Tu registro seguirá protegido.",
            icono: "",
            textoConfirmar: "Sí, reiniciar",
            textoCancelar: "Cancelar",
            peligro: true,
            onConfirm: accionBorrar
          });
        } else {
          accionBorrar();
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
        <h3 style="margin:0 0 6px 0; font-size:19px; font-weight:800; color:#0f172a;">Bienvenido a TerRosa</h3>
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
        ">Comenzar</button>
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
      mostrarToastDiscreto(`Bienvenido, ${val}`);
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
      <div style="width:52px; height:52px; border-radius:50%; background:#1e293b; color:#94a3b8; display:flex; align-items:center; justify-content:center; margin:0 auto 14px;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
      <h2 style="margin:0 0 10px 0; font-size:22px; font-weight:800; color:#ffffff;">Acceso Restringido</h2>
      <p id="txtMensajeBloqueo" style="font-size:14.5px; color:#94a3b8; max-width:320px; line-height:1.5; margin:0 0 20px 0;">
        ${mensaje || "Esta aplicación requiere autorización del encargado de territorios de la Congregación Rosario."}
      </p>
      <button id="btnReintentarAcceso" style="
        background:#1a73e8; color:white; border:none; padding:10px 22px; border-radius:50px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(26,115,232,0.4); margin-bottom:20px; display:inline-flex; align-items:center; gap:8px;
      ">
        <span>Comprobar estado</span>
      </button>
      <div style="font-size:12px; color:#64748b; background:#1e293b; padding:8px 14px; border-radius:10px;">
        ID Dispositivo: <b>${obtenerIdDispositivoLocal()}</b>
      </div>
    `;

    const btnRetry = lockOverlay.querySelector("#btnReintentarAcceso");
    if (btnRetry) {
      btnRetry.onclick = () => {
        btnRetry.innerHTML = `<span>Comprobando...</span>`;
        btnRetry.disabled = true;
        window.verificarAccesoEnNube(null, (permitido) => {
          if (!permitido) {
            btnRetry.disabled = false;
            btnRetry.innerHTML = `<span>Sigue restringido</span>`;
            setTimeout(() => {
              btnRetry.innerHTML = `<span>Comprobar estado</span>`;
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
    const todosReportes = sanitizarReportesAcumulados(deduplicarListaReportes(JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]")))
      .filter(r => perteneceAVersionActiva(r));

    // Heredar filtro activo del mapa principal
    let filtroAnioSel = anioFiltroActivo || "2026";
    let mesesHistorialSel = new Set(mesesFiltroActivos);

    function obtenerTextoBotonMesesHistorial() {
      if (mesesHistorialSel.size === 0 || mesesHistorialSel.size === 12) {
        return "Mes: Todos";
      } else if (mesesHistorialSel.size === 1) {
        const num = Array.from(mesesHistorialSel)[0];
        const mObj = NOMBRES_MESES.find(m => m.num === num);
        return `Mes: ${mObj ? mObj.nombre : num}`;
      } else if (mesesHistorialSel.size === 2) {
        const arr = Array.from(mesesHistorialSel).map(num => {
          const mObj = NOMBRES_MESES.find(m => m.num === num);
          return mObj ? mObj.abrev : num;
        });
        return `Mes: ${arr.join(", ")}`;
      } else {
        return `Meses (${mesesHistorialSel.size})`;
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
            <button id="btnHistorialVerS12" class="btn-icon-square" title="Ver e Imprimir Tarjeta S-12 (PDF)" style="width:auto; padding:0 10px; font-size:12px; font-weight:700; background:#f0fdf4; color:#166534; border:1.5px solid #bbf7d0;">Tarjeta S-12</button>
            <button id="btnSyncHistorialModal" class="btn-icon-square" title="Sincronizar con la nube"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg></button>
            <button id="btnCerrarHistorial" class="btn-icon-square" title="Cerrar">✕</button>
          </div>
        </div>

        <!-- Buscador Rápido con botón de limpiar -->
        <div style="position:relative; margin-bottom:8px; flex-shrink:0;">
          <input type="text" id="buscadorHistorial" placeholder="Escribe aquí..." autocomplete="off" style="
            width:100%; padding:9px 34px 9px 12px; border:1.5px solid #cbd5e1; border-radius:12px; font-size:13.5px; font-weight:600; box-sizing:border-box; outline:none; font-family:inherit; background:#ffffff; color:#0f172a;
          " />
          <button type="button" id="btnLimpiarBuscadorHistorial" style="display:none; position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:14px; font-weight:700; cursor:pointer; padding:4px;">✕</button>
        </div>

        <!-- Tres Filtros: Año de Servicio, Selector de Mes y Selector Rápido de Territorio -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1.25fr; gap:6px; margin-bottom:8px; flex-shrink:0;">
          <select id="filtroHistorialAnio" style="
            height:38px; padding:0 6px; border-radius:10px; border:1.5px solid #cbd5e1; font-size:12.5px; font-weight:700; color:#0f172a; background:#f8fafc; outline:none; box-sizing:border-box; cursor:pointer;
          ">
            <option value="2026" ${filtroAnioSel === "2026" ? "selected" : ""}>2026</option>
            <option value="2025" ${filtroAnioSel === "2025" ? "selected" : ""}>2025</option>
            <option value="todos" ${filtroAnioSel === "todos" ? "selected" : ""}>Todos los años</option>
          </select>

          <button type="button" id="btnHistorialMesesFiltro" style="
            height:38px; display:flex; align-items:center; justify-content:space-between; text-align:left; cursor:pointer; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:0 8px; font-weight:700; font-size:12.5px; color:#0f172a; outline:none; white-space:nowrap; overflow:hidden; box-sizing:border-box;
          ">
            <span id="txtHistorialMesLabel" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${obtenerTextoBotonMesesHistorial()}</span>
            <span style="font-size:10px; margin-left:2px; opacity:0.7; flex-shrink:0;">▾</span>
          </button>

          <select id="filtroHistorialTerritorio" style="
            height:38px; padding:0 6px; border-radius:10px; border:1.5px solid #cbd5e1; font-size:12.5px; font-weight:700; color:#0f172a; background:#f8fafc; outline:none; box-sizing:border-box; cursor:pointer;
          ">
            <option value="">Territorio: Todos</option>
            ${Array.from({ length: 84 }, (_, i) => `<option value="${i + 1}">Territorio ${i + 1}</option>`).join("")}
            <option value="negocios">Negocios</option>
          </select>
        </div>

        <!-- Contador dinámico de resultados -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:11.5px; color:#64748b; font-weight:700; padding:0 2px; flex-shrink:0;">
          <span id="lblContadorHistorial">Cargando registros...</span>
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

    const btnHistS12 = modal.querySelector("#btnHistorialVerS12");
    if (btnHistS12) {
      btnHistS12.onclick = () => {
        window.reproducirSonidoClick("tap");
        const valSel = selectTerritorio ? selectTerritorio.value : "";
        if (typeof window.abrirModalTarjetaS12 === "function") {
          window.abrirModalTarjetaS12(valSel || (window.territorioActivo ? window.territorioActivo._id : "1"));
        }
      };
    }

    const selectAnio = modal.querySelector("#filtroHistorialAnio");
    const selectTerritorio = modal.querySelector("#filtroHistorialTerritorio");
    const btnMesesFiltro = modal.querySelector("#btnHistorialMesesFiltro");
    const txtMesLabel = modal.querySelector("#txtHistorialMesLabel");
    const inputBuscador = modal.querySelector("#buscadorHistorial");
    const btnLimpiarBusq = modal.querySelector("#btnLimpiarBuscadorHistorial");
    const lblContador = modal.querySelector("#lblContadorHistorial");
    const cont = modal.querySelector("#listaItemsHistorial");

    function renderizarListaFiltrada() {
      const reportes = sanitizarReportesAcumulados(deduplicarListaReportes(JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]")))
        .filter(r => perteneceAVersionActiva(r));

      const query = (inputBuscador ? inputBuscador.value : "").trim().toLowerCase();
      const terrFiltro = (selectTerritorio ? selectTerritorio.value : "").trim().toLowerCase();
      const filtrarMes = (mesesHistorialSel.size > 0 && mesesHistorialSel.size < 12);

      if (btnLimpiarBusq) {
        btnLimpiarBusq.style.display = query ? "block" : "none";
      }

      const filtrados = reportes.filter(r => {
        const p = parsearFechaReporte(r.fecha);
        if (!p.anio) return true;

        // Filtro de Año de Servicio
        if (filtroAnioSel !== "todos" && !perteneceAAnioServicio(r.fecha, filtroAnioSel)) return false;

        // Filtro de Meses
        if (filtrarMes && !mesesHistorialSel.has(p.mes)) return false;

        // Filtro por selector rápido de territorio
        const tNumRaw = String(r.territorioNumero || r.territorioId || "").replace(/^territorio/i, "").trim().toLowerCase();
        if (terrFiltro && tNumRaw !== terrFiltro) return false;

        // Filtro de Búsqueda de Texto
        if (query) {
          const cap = String(r.capitan || "").toLowerCase();
          const com = String(r.comentario || "").toLowerCase();
          const fechaStr = String(r.fecha || "").toLowerCase();
          const fechaDisp = (p.fechaDisplay || "").toLowerCase();

          // Reconocer "t24", "t-24", "terr 24", "24"
          const queryTerrLimpio = query.replace(/^(t|terr|territorio)[-\s]*/i, "").trim();
          const matchTerrExacto = queryTerrLimpio && (tNumRaw === queryTerrLimpio);
          const matchTerrTexto = tNumRaw.includes(query) || `territorio ${tNumRaw}`.includes(query) || `t${tNumRaw}`.includes(query);
          const matchCap = cap.includes(query);
          const matchCom = com.includes(query);
          const matchFecha = fechaStr.includes(query) || fechaDisp.includes(query);

          if (!matchTerrExacto && !matchTerrTexto && !matchCap && !matchCom && !matchFecha) return false;
        }

        return true;
      });

      const listaOrdenada = [...filtrados].sort((a, b) => {
        const fa = (parsearFechaReporte(a.fecha).fechaISO) || a.fecha || "";
        const fb = (parsearFechaReporte(b.fecha).fechaISO) || b.fecha || "";
        return fb.localeCompare(fa);
      });
      cont.innerHTML = "";

      if (lblContador) {
        lblContador.textContent = `Mostrando ${listaOrdenada.length} de ${reportes.length} registros`;
      }

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
                ${formatearFechaCorta(rep.fecha)} • Cuadras: ${labelsCuadras || rep.cuadrasTotal || rep.totalCuadras || ""}
              </div>
              ${rep.comentario ? `<div style="font-size:11.5px; color:#475569; background:#f8fafc; padding:3px 7px; border-radius:6px; margin-top:3px; max-width:fit-content; border:1px solid #e2e8f0; word-break:normal; overflow-wrap:break-word;">${escaparTextoSeguro(rep.comentario)}</div>` : ''}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <button class="btn-action-square btn-s12-item" title="Ver e imprimir tarjeta S-12 (PDF)" data-terr="${rep.territorioNumero || rep.territorioId}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></button>
            <button class="btn-action-square btn-editar" title="Editar" data-id="${rep.id}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn-action-square btn-eliminar" title="Eliminar" data-id="${rep.id}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        `;
        cont.appendChild(card);
      });

      cont.querySelectorAll(".btn-s12-item").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          window.reproducirSonidoClick("tap");
          const tNum = btn.dataset.terr;
          if (typeof window.abrirModalTarjetaS12 === "function") {
            window.abrirModalTarjetaS12(tNum);
          }
        };
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
          const ejecutarEliminar = () => {
            if (typeof window.reproducirSonidoClick === "function") window.reproducirSonidoClick("delete");
            descartarReporte(id);
            renderizarListaFiltrada();
            mostrarToastDiscreto("Registro eliminado del historial");
          };

          if (typeof window.mostrarConfirmacionModal === "function") {
            window.mostrarConfirmacionModal({
              titulo: "Eliminar registro",
              mensaje: "¿Deseas eliminar este registro del historial?",
              icono: "trash",
              textoConfirmar: "Eliminar",
              textoCancelar: "Cancelar",
              peligro: true,
              onConfirm: ejecutarEliminar
            });
          } else {
            ejecutarEliminar();
          }
        };
      });
    }

    if (inputBuscador) {
      inputBuscador.addEventListener("input", () => {
        renderizarListaFiltrada();
      });
    }

    if (btnLimpiarBusq) {
      btnLimpiarBusq.addEventListener("click", () => {
        window.reproducirSonidoClick("tap");
        inputBuscador.value = "";
        renderizarListaFiltrada();
        inputBuscador.focus();
      });
    }

    if (selectTerritorio) {
      selectTerritorio.addEventListener("change", () => {
        window.reproducirSonidoClick("tap");
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
              Actual
            </button>
            <button type="button" id="btnTodosMesesSubModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
              Todos
            </button>
            <button type="button" id="btnLimpiarMesesSubModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #fee2e2; background:#fff5f5; color:#dc2626; cursor:pointer;">
              Limpiar
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
          <h3 style="margin:0; color:#0f172a; font-size:18px; font-weight:800;">Editar Registro</h3>
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
        mostrarToastDiscreto("Selecciona un hermano de la lista oficial de capitanes.");
        modal.querySelector("#editCapitanInput").focus();
        return;
      }
      const nuevoCapitan = capitanOficial;
      const nuevaFecha = modal.querySelector("#editFecha").value;
      const nuevoComentario = modal.querySelector("#editComentario").value.trim();

      if (!nuevoCapitan) {
        mostrarToastDiscreto("Por favor ingresa el nombre del capitán.");
        return;
      }
      if (!nuevaFecha) {
        mostrarToastDiscreto("Por favor ingresa una fecha.");
        return;
      }

      const chksEdit = Array.from(modal.querySelectorAll(".chk-edit-cuadra:checked"));
      if (cuadrasDisponibles.length > 0 && chksEdit.length === 0) {
        mostrarToastDiscreto("Selecciona al menos una cuadra trabajada.");
        return;
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
      mostrarToastDiscreto("Registro actualizado");
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
            <h3 style="margin:0; color:#0f172a; font-size:18.5px; font-weight:800;">Reportar Territorios</h3>
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
              <summary style="font-size:12px; font-weight:700; color:#64748b; cursor:pointer;">Comentario (opcional)</summary>
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
              <span>+ Agregar territorio al reporte</span>
            </button>
          </div>

          <!-- Lista acumulada de territorios en lote -->
          <div id="regSeccionLote" style="display:flex; flex-direction:column; gap:6px; margin-top:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:11.5px; font-weight:800; color:#334155; text-transform:uppercase;">
                Territorios listos (<span id="regConteoLote">0</span>)
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
          ">Guardar Reporte</button>
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
        const esCoincidencia = territorioActivo && (
          String(d.id).toLowerCase() === String(territorioActivo).toLowerCase() ||
          String(d.numeroTerritorio) === String(territorioActivo) ||
          String(d.id).toLowerCase() === ('territorio' + String(territorioActivo)).toLowerCase()
        );
        if (esCoincidencia) opt.selected = true;
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

      const item = window.TERRITORIOS_DATA.find(x => {
        const d = x.datos;
        return String(d.id).toLowerCase() === String(tId).toLowerCase() ||
               String(d.numeroTerritorio) === String(tId) ||
               String(d.id).toLowerCase() === ('territorio' + String(tId)).toLowerCase();
      });
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

      let forzarHabilitarTodas = false;

      function construirListaCuadras() {
        contenedorCuadras.innerHTML = "";
        let disponiblesCount = 0;

        // Aviso si el territorio ya tiene reportes en este mes
        if (infoMes.listaReportesT.length > 0) {
          const ult = infoMes.listaReportesT[0];
          const aviso = document.createElement("div");
          aviso.style.cssText = "background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:6px 10px; margin-bottom:5px; font-size:12px; color:#1e40af; font-weight:700; display:flex; align-items:center; gap:6px;";
          aviso.innerHTML = `<span>Trabajado el <b>${ult.fecha}</b> (${ult.capitan})</span>`;
          contenedorCuadras.appendChild(aviso);
        }

        cuadrasPredicables.forEach((pol, idx) => {
          const cuadraNum = (pol.label !== null && pol.label !== undefined && String(pol.label).trim() !== "")
            ? String(pol.label).trim()
            : (idx + 1);

          const infoCuadra = infoMes.mapaCuadras.get(pol.id);
          const yaTrabajada = !!infoCuadra && !forzarHabilitarTodas;
          const isPreselected = Boolean(preCuadraId && (pol.id === preCuadraId || String(cuadraNum) === String(preCuadraId)));

          const chip = document.createElement("div");

          if (yaTrabajada) {
            // Cuadra YA HECHA: Sin casilla de verificación, fondo gris, texto tachado y subtítulo con fecha y capitán
            chip.className = "chip-cuadra-item trabajada-mes";
            chip.style.cssText = "background:#f8fafc; border:1.5px solid #cbd5e1; opacity:0.88; cursor:default; display:flex; flex-direction:column; align-items:flex-start; gap:3px; padding:9px 12px; margin-bottom:4px;";
            chip.innerHTML = `
              <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                <span style="font-weight:700; font-size:13.5px; color:#64748b; text-decoration:line-through;">Cuadra ${cuadraNum}</span>
                <span style="font-size:10px; font-weight:800; color:#059669; background:#dcfce7; padding:2px 7px; border-radius:6px;">Hecha</span>
              </div>
              <div style="font-size:11px; color:#64748b; font-weight:500;">
                Terminada el ${infoCuadra.fechaDisplay}${infoCuadra.capitan ? ' por ' + escaparTextoSeguro(infoCuadra.capitan) : ''}
              </div>
            `;
          } else {
            // Cuadra DISPONIBLE: Con casilla de verificación activa
            disponiblesCount++;
            const estaMarcada = isPreselected;
            chip.className = `chip-cuadra-item ${estaMarcada ? "selected" : ""}`;
            chip.style.cssText = "cursor:pointer; padding:9px 12px; margin-bottom:4px;";
            chip.innerHTML = `
              <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                <div style="display:flex; align-items:center; gap:9px;">
                  <input type="checkbox" value="${pol.id}" class="chk-cuadra" ${estaMarcada ? "checked" : ""} style="width:17px; height:17px; accent-color:#1a73e8; cursor:pointer; pointer-events:none;"/>
                  <span style="font-weight:700; font-size:13.5px; color:#0f172a;">Cuadra ${cuadraNum}</span>
                </div>
                <span style="font-size:10.5px; font-weight:700; color:#2563eb; background:#eff6ff; padding:2px 7px; border-radius:6px;">Disponible</span>
              </div>
            `;

            chip.addEventListener("click", () => {
              const chk = chip.querySelector(".chk-cuadra");
              chk.checked = !chk.checked;
              chip.classList.toggle("selected", chk.checked);
              window.reproducirSonidoClick("toggle");
              const todosChks = contenedorCuadras.querySelectorAll(".chk-cuadra");
              const todasChecked = todosChks.length > 0 && Array.from(todosChks).every(c => c.checked);
              btnToggleTodas.textContent = todasChecked ? "Desmarcar todas" : "Seleccionar disponibles";
            });
          }

          contenedorCuadras.appendChild(chip);
        });

        // Si todas las cuadras estaban terminadas en el mes
        if (disponiblesCount === 0 && cuadrasPredicables.length > 0 && !forzarHabilitarTodas) {
          btnToggleTodas.style.display = "none";
          const avisoCompleto = document.createElement("div");
          avisoCompleto.style.cssText = "font-size:12px; color:#059669; background:#dcfce7; border:1px solid #bbf7d0; border-radius:10px; padding:9px 12px; margin-top:8px; font-weight:700; text-align:center;";
          avisoCompleto.textContent = "Todas las cuadras de este territorio ya se completaron en este mes.";
          contenedorCuadras.appendChild(avisoCompleto);

          const btnReabrir = document.createElement("button");
          btnReabrir.type = "button";
          btnReabrir.style.cssText = "display:block; width:100%; margin-top:8px; background:none; border:none; color:#2563eb; font-size:11.5px; font-weight:700; cursor:pointer; text-decoration:underline;";
          btnReabrir.textContent = "¿Deseas volver a predicar cuadras ya hechas?";
          btnReabrir.onclick = () => {
            forzarHabilitarTodas = true;
            btnToggleTodas.style.display = "inline-flex";
            construirListaCuadras();
          };
          contenedorCuadras.appendChild(btnReabrir);
        } else {
          btnToggleTodas.style.display = "inline-flex";
          const todosChksInicial = contenedorCuadras.querySelectorAll(".chk-cuadra");
          const todasCheckedInicial = todosChksInicial.length > 0 && Array.from(todosChksInicial).every(c => c.checked);
          btnToggleTodas.textContent = todasCheckedInicial ? "Desmarcar todas" : "Seleccionar disponibles";
        }
      }

      construirListaCuadras();
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
      btnToggleTodas.textContent = todas ? "Seleccionar disponibles" : "Desmarcar todas";
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
        btnGuardar.textContent = "Guardar Reporte";
        return;
      }

      if (aviso) aviso.textContent = "Listos para enviar";
      btnGuardar.textContent = `Guardar todos los reportes (${territoriosEnLote.length})`;

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
              ${item.cuadrasLabels.join(", ")}${item.comentario ? ` • <span style="color:#d97706;">${escaparTextoSeguro(item.comentario)}</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn-quitar-lote" data-idx="${idx}" title="Eliminar de la lista" style="
            background:#fee2e2; border:none; border-radius:8px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:#ef4444; cursor:pointer; margin-left:8px; flex-shrink:0;
          "><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
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

    // Botón: Agregar territorio al reporte
    modal.querySelector("#btnAgregarTerritorioLote").onclick = () => {
      const capitanVal = (modal.querySelector("#regInputCapitan") ? modal.querySelector("#regInputCapitan").value : "").trim();
      const capitanOficial = resolverCapitanOficial(capitanVal);
      if (!capitanOficial) {
        mostrarToastDiscreto("Selecciona un hermano de la lista oficial de capitanes.");
        modal.querySelector("#regInputCapitan").focus();
        return;
      }
      modal.querySelector("#regInputCapitan").value = capitanOficial;

      const datosT = obtenerDatosTerritorioActual();
      if (!datosT) {
        if (!selectTerr.value) {
          mostrarToastDiscreto("Por favor selecciona un territorio.");
          selectTerr.focus();
        } else {
          mostrarToastDiscreto("Selecciona al menos una cuadra trabajada.");
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
        mostrarToastDiscreto("Selecciona un hermano de la lista oficial de capitanes.");
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
        mostrarToastDiscreto("Selecciona al menos un territorio y sus cuadras.");
        return;
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

        <div style="width:42px; height:42px; border-radius:50%; background:#dcfce7; color:#16a34a; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
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
          <h3 style="margin:0; color:#1e293b; font-size:17px; font-weight:800;">Aprobaciones ${versionTxt} (${pendientes.length})</h3>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="btnSyncNubeModal" title="Sincronizar con Google Sheets" style="background:#e0f2fe; border:none; border-radius:8px; padding:6px 11px; font-size:12px; font-weight:700; color:#0284c7; cursor:pointer;">Sincronizar</button>
            <button id="btnCerrarBuzon" class="btn-icon-square">✕</button>
          </div>
        </div>

        <div id="listaItemsBuzon" style="max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${pendientes.length === 0 ? '<div style="text-align:center; color:#94a3b8; padding:30px;">No hay reportes pendientes por aprobar.</div>' : ''}
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
          btnSync.textContent = "Sincronizar";
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
          <span style="font-size:12px; color:#64748b; font-weight:600;">${formatearFechaCorta(rep.fecha)}</span>
        </div>
        <div style="font-size:13.5px; color:#334155;">
          <b>Capitán:</b> ${rep.capitan} (${rep.cuadrasTotal} cuadras)
        </div>
        ${rep.comentario ? `<div style="font-size:12.5px; color:#f59e0b; background:#fef3c7; padding:4px 8px; border-radius:6px; word-break:normal; overflow-wrap:break-word;">${rep.comentario}</div>` : ''}
        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="btn-aprobar-rep" data-id="${rep.id}" style="
            flex:1; padding:9px; background:#16a34a; color:white; border:none; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;
          ">Aprobar</button>
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
          tituloModal.textContent = `Aprobaciones S-13 (${remaining})`;
        }
        if (remaining === 0) {
          cont.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:30px;">Todos los reportes fueron revisados.</div>';
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
    mostrarToastDiscreto("Aprobado");

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
  function mostrarToastDiscreto(mensaje, icono = "", duracion = 2500) {
    if (typeof window.mostrarToastDiscreto === "function") {
      window.mostrarToastDiscreto(mensaje, icono, duracion);
      return;
    }

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
    mostrarToastDiscreto("Caché limpiada y mapa restaurado");
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

    // Refrescar tarjeta informativa de territorio si hay uno enfocado
    if (window.territorioActivo && typeof window.mostrarTarjetaInfoCapitan === "function") {
      window.mostrarTarjetaInfoCapitan(window.territorioActivo);
    }
  };

  // 14. Filtro de Fecha en Barra Superior (Año y Selector Múltiple de Meses ordenados por Año de Servicio: Sep a Ago)
  const NOMBRES_MESES = [
    { num: "09", nombre: "Septiembre", abrev: "Sep" },
    { num: "10", nombre: "Octubre", abrev: "Oct" },
    { num: "11", nombre: "Noviembre", abrev: "Nov" },
    { num: "12", nombre: "Diciembre", abrev: "Dic" },
    { num: "01", nombre: "Enero", abrev: "Ene" },
    { num: "02", nombre: "Febrero", abrev: "Feb" },
    { num: "03", nombre: "Marzo", abrev: "Mar" },
    { num: "04", nombre: "Abril", abrev: "Abr" },
    { num: "05", nombre: "Mayo", abrev: "May" },
    { num: "06", nombre: "Junio", abrev: "Jun" },
    { num: "07", nombre: "Julio", abrev: "Jul" },
    { num: "08", nombre: "Agosto", abrev: "Ago" }
  ];

  let _filtroFechaBarraInicializado = false;
  let filtroIncompletosActivo = false;
  let mesesFiltroActivos = new Set();
  let anioFiltroActivo = "2026";

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

  // Comprueba si un reporte de territorio cumple con el filtro activo de año y meses
  function reporteCumpleFiltroActivo(rep) {
    if (!rep || !rep.fecha || !perteneceAVersionActiva(rep)) return false;
    const anio = (typeof anioFiltroActivo !== "undefined" && anioFiltroActivo) ? anioFiltroActivo : "2026";
    if (!perteneceAAnioServicio(rep.fecha, anio)) return false;

    const filtrarPorMes = (typeof mesesFiltroActivos !== "undefined" && mesesFiltroActivos.size > 0 && mesesFiltroActivos.size < 12);
    if (filtrarPorMes) {
      const p = parsearFechaReporte(rep.fecha);
      if (!mesesFiltroActivos.has(p.mes)) return false;
    }
    return true;
  }

  // Genera texto descriptivo del periodo activo (ej. "Octubre (Año 2026)" o "Año 2026")
  function obtenerTextoPeriodoFiltro() {
    const anio = (typeof anioFiltroActivo !== "undefined" && anioFiltroActivo) ? anioFiltroActivo : "2026";
    const filtrarPorMes = (typeof mesesFiltroActivos !== "undefined" && mesesFiltroActivos.size > 0 && mesesFiltroActivos.size < 12);
    const textoAnio = (anio === "todos") ? "Todos los años" : `Año ${anio}`;
    if (!filtrarPorMes) {
      return textoAnio;
    }
    const mapNombres = {
      "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
      "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
      "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
    };
    const arr = Array.from(mesesFiltroActivos).map(m => mapNombres[m] || m);
    if (arr.length === 1) {
      return `${arr[0]} (${textoAnio})`;
    }
    return `${arr.length} meses (${textoAnio})`;
  }

  // 13.5 Tarjeta Informativa de Territorio / Cuadra enfocado en Modo Capitán
  window.mostrarTarjetaInfoCapitan = function (grupo) {
    if (window.getModoActual() !== "capitan") {
      window.ocultarTarjetaInfoCapitan();
      return;
    }
    const tarjeta = document.getElementById("tarjetaInfoCapitan");
    if (!tarjeta) return;

    if (!grupo || !grupo._id) {
      window.ocultarTarjetaInfoCapitan();
      return;
    }

    const tId = String(grupo._id).trim();
    const match = tId.match(/^territorio(\d+)$/i);
    const numTLimpio = match ? match[1] : (tId.toLowerCase().includes("negocios") ? "Negocios" : tId);
    const tituloTerr = match ? `Territorio ${numTLimpio}` : (tId.toLowerCase().includes("negocios") ? "Negocios" : tId);

    // Contar cuadras predicables en este grupo
    let totalCuadras = 0;
    const capasPredicables = [];
    if (typeof grupo.getLayers === "function") {
      grupo.getLayers().forEach(p => {
        if (p._esPredicable !== false) {
          totalCuadras++;
          capasPredicables.push(p);
        }
      });
    }

    // Obtener reportes guardados
    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const periodoTexto = obtenerTextoPeriodoFiltro();

    // Filtrar reportes para este territorio y periodo de servicio activo
    const repsT = reportes.filter(r => {
      if (!reporteCumpleFiltroActivo(r)) return false;
      const numR = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
      return String(numR) === String(numTLimpio);
    });

    const tituloEl = document.getElementById("infoCapitanTitulo");
    const estadoEl = document.getElementById("infoCapitanEstado");
    const subtextoEl = document.getElementById("infoCapitanSubtexto");

    tarjeta.dataset.territorioId = numTLimpio;
    tarjeta.dataset.cuadraLabel = "";

    // Mapear todas las cuadras hechas en el periodo para este territorio
    const cuadrasHechasSet = new Set();
    repsT.forEach(r => {
      if (Array.isArray(r.cuadras)) {
        const numR = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
        r.cuadras.forEach(cId => {
          obtenerVariantesIdCuadra(cId, numR).forEach(v => cuadrasHechasSet.add(v));
        });
      }
    });

    let cuadrasTrabajadas = 0;
    if (capasPredicables.length > 0) {
      capasPredicables.forEach(p => {
        const vars = obtenerVariantesIdCuadra(p._id, numTLimpio);
        if (p._label) obtenerVariantesIdCuadra(p._label, numTLimpio).forEach(v => vars.push(v));
        if (vars.some(v => cuadrasHechasSet.has(v))) {
          cuadrasTrabajadas++;
        }
      });
    } else {
      cuadrasTrabajadas = cuadrasHechasSet.size;
    }

    const totRef = totalCuadras || (repsT.length > 0 ? repsT[0].totalCuadrasTerritorio : 0) || 0;

    // Línea 1: Título del Territorio
    if (tituloEl) tituloEl.textContent = tituloTerr;

    if (repsT.length === 0 || cuadrasTrabajadas === 0) {
      // Línea 2: Estatus
      if (estadoEl) estadoEl.innerHTML = '<span class="badge-capitan-estado badge-sin-trabajar">Sin trabajar</span>';
      // Línea 3: Detalle más pequeño para que quepa y no se corte
      if (subtextoEl) subtextoEl.textContent = `No se ha reportado en ${periodoTexto}`;
    } else {
      repsT.sort((a, b) => {
        const fa = parsearFechaReporte(a.fecha).fechaISO || "";
        const fb = parsearFechaReporte(b.fecha).fechaISO || "";
        return fb.localeCompare(fa);
      });
      const repMasReciente = repsT[0];
      const pFecha = parsearFechaReporte(repMasReciente.fecha);
      const fechaDisp = pFecha.fechaDisplay || repMasReciente.fecha;
      const capitan = repMasReciente.capitan || "No asignado";

      const esCompleto = totRef > 0 && cuadrasTrabajadas >= totRef;

      if (esCompleto) {
        if (estadoEl) estadoEl.innerHTML = '<span class="badge-capitan-estado badge-completada">Completado</span>';
        if (subtextoEl) subtextoEl.textContent = `Terminado el ${fechaDisp} por ${capitan}`;
      } else {
        const faltantes = Math.max(1, totRef - cuadrasTrabajadas);
        if (estadoEl) estadoEl.innerHTML = `<span class="badge-capitan-estado badge-pendiente">Pendiente (${cuadrasTrabajadas}/${totRef || '?'})</span>`;
        if (subtextoEl) subtextoEl.textContent = `Faltan ${faltantes} cuadras • Último: ${capitan} (${fechaDisp})`;
      }
    }

    tarjeta.style.display = "flex";
    requestAnimationFrame(() => {
      tarjeta.classList.add("visible");
    });
  };

  // Mostrar información específica de una cuadra al tocarla o hacerle clic en Modo Capitán
  window.mostrarInfoCuadraCapitan = function (pol, territorioId) {
    if (window.getModoActual() !== "capitan") {
      window.ocultarTarjetaInfoCapitan();
      return;
    }
    const tarjeta = document.getElementById("tarjetaInfoCapitan");
    if (!tarjeta || !pol) return;

    const tId = territorioId || pol._territorioId || (window.territorioActivo ? window.territorioActivo._id : "territorio");
    const numTLimpio = obtenerNumeroTerritorioLimpio(tId, tId);
    const esNegocios = String(numTLimpio).toLowerCase().includes("negocios");
    const nombreTerritorio = esNegocios ? "Negocios" : `Territorio ${numTLimpio}`;

    const rawLabel = pol._label ? String(pol._label).trim() : "";
    const nombreCuadra = rawLabel
      ? (/^cuadra/i.test(rawLabel) ? rawLabel : `Cuadra ${rawLabel}`)
      : (pol._id ? String(pol._id).replace(/^Cuadra/i, "Cuadra ") : "Cuadra");
    const tituloCompleto = `${nombreTerritorio} • ${nombreCuadra}`;

    // Buscar reportes que coincidan con el periodo activo y contengan esta cuadra
    const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
    const variantesCuadra = new Set(obtenerVariantesIdCuadra(pol._id, numTLimpio));
    if (rawLabel) {
      obtenerVariantesIdCuadra(rawLabel, numTLimpio).forEach(v => variantesCuadra.add(v));
    }

    const repsCoincidentes = [];
    reportes.forEach(rep => {
      if (!reporteCumpleFiltroActivo(rep)) return;
      const numR = obtenerNumeroTerritorioLimpio(rep.territorioId, rep.territorioNumero);
      if (String(numR) !== String(numTLimpio)) return;

      if (Array.isArray(rep.cuadras)) {
        const contiene = rep.cuadras.some(cId => {
          const vars = obtenerVariantesIdCuadra(cId, numR);
          return vars.some(v => variantesCuadra.has(v));
        });
        if (contiene) {
          repsCoincidentes.push(rep);
        }
      }
    });

    const tituloEl = document.getElementById("infoCapitanTitulo");
    const estadoEl = document.getElementById("infoCapitanEstado");
    const subtextoEl = document.getElementById("infoCapitanSubtexto");
    const periodoTexto = obtenerTextoPeriodoFiltro();

    tarjeta.dataset.territorioId = numTLimpio;
    tarjeta.dataset.cuadraLabel = rawLabel || "";

    // Línea 1: Formato "Territorio 46 - Cuadra 4"
    if (tituloEl) tituloEl.textContent = `${nombreTerritorio} - ${nombreCuadra}`;

    if (repsCoincidentes.length > 0) {
      repsCoincidentes.sort((a, b) => {
        const fa = parsearFechaReporte(a.fecha).fechaISO || "";
        const fb = parsearFechaReporte(b.fecha).fechaISO || "";
        return fb.localeCompare(fa);
      });
      const rep = repsCoincidentes[0];
      const pFecha = parsearFechaReporte(rep.fecha);
      const fechaDisp = pFecha.fechaDisplay || rep.fecha;
      const capitan = rep.capitan || "No asignado";

      // Línea 2: Completada
      if (estadoEl) estadoEl.innerHTML = '<span class="badge-capitan-estado badge-completada">Completada</span>';
      // Línea 3: Detalle más pequeño para que quepa y no se corte
      if (subtextoEl) subtextoEl.textContent = `Terminada el ${fechaDisp} por ${capitan}`;
    } else {
      // Línea 2: Sin trabajar
      if (estadoEl) estadoEl.innerHTML = '<span class="badge-capitan-estado badge-sin-trabajar">Sin trabajar</span>';
      // Línea 3: Detalle más pequeño
      if (subtextoEl) subtextoEl.textContent = `Sin reportar en ${periodoTexto}`;
    }

    tarjeta.style.display = "flex";
    requestAnimationFrame(() => {
      tarjeta.classList.add("visible");
    });
  };

  window.ocultarTarjetaInfoCapitan = function () {
    const tarjeta = document.getElementById("tarjetaInfoCapitan");
    if (!tarjeta) return;
    tarjeta.classList.remove("visible");
    setTimeout(() => {
      if (!tarjeta.classList.contains("visible")) {
        tarjeta.style.display = "none";
      }
    }, 220);
  };

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
      lbl.textContent = "2026";
    } else if (anioFiltroActivo === "2025") {
      lbl.textContent = "2025";
    } else {
      lbl.textContent = "Todos";
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
            Actual
          </button>
          <button type="button" id="btnTodosMesesModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b; cursor:pointer;">
            Todos
          </button>
          <button type="button" id="btnLimpiarMesesModal" style="flex:1; padding:7px 4px; font-size:11.5px; font-weight:700; border-radius:10px; border:1px solid #fee2e2; background:#fff5f5; color:#dc2626; cursor:pointer;">
            Limpiar
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
      lbl.textContent = mObj ? mObj.nombre : num;
    } else if (mesesFiltroActivos.size <= 3) {
      const arr = Array.from(mesesFiltroActivos).map(num => {
        const mObj = NOMBRES_MESES.find(m => m.num === num);
        return mObj ? mObj.abrev : num;
      });
      lbl.textContent = arr.join(", ");
    } else {
      lbl.textContent = `${mesesFiltroActivos.size} meses`;
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
    const hayFiltro = (filtrarPorMes || anio !== "todos" || filtroIncompletosActivo);
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
    });

    const txtIncompletos = document.getElementById("txtFiltroIncompletosLabel");
    if (txtIncompletos) {
      txtIncompletos.textContent = `Pendientes (${territoriosIncompletosCount})`;
    }

    window.todosLosTerritorios.forEach(grupo => {
      const tId = grupo._id;
      const setMatch = cuadrasCoincidentes[tId] || new Set();

      let totalPredicables = 0;
      let hechas = 0;
      grupo.eachLayer(pol => {
        if (pol._esPredicable !== false) {
          totalPredicables++;
          if (setMatch.has(pol._id)) hechas++;
        }
      });
      const esIncompleto = (totalPredicables > 0 && hechas > 0 && hechas < totalPredicables);

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

    // Refrescar tarjeta informativa de territorio si hay uno enfocado
    if (window.territorioActivo && typeof window.mostrarTarjetaInfoCapitan === "function") {
      window.mostrarTarjetaInfoCapitan(window.territorioActivo);
    }
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
            mostrarToastDiscreto("Territorios incompletos destacados en el mapa");
          }
        };
      }

      if (btnLimpiar) {
        btnLimpiar.onclick = () => {
          window.reproducirSonidoClick("tap");
          mesesFiltroActivos.clear();
          localStorage.setItem("terrosa_filtro_meses", JSON.stringify([]));
          filtroIncompletosActivo = false;
          const btnIncomp = document.getElementById("btnFiltroIncompletos");
          if (btnIncomp) btnIncomp.classList.remove("incompletos-activo");
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
      if (mostrarFeedback) mostrarToastDiscreto("Sincronizando con Google Sheets...");

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

        // Deduplicación y sanitización garantizada
        reportesNormalizados = deduplicarListaReportes(reportesNormalizados);
        reportesNormalizados = sanitizarReportesAcumulados(reportesNormalizados);

        localStorage.setItem("terrosa_reportes_pendientes", JSON.stringify(reportesNormalizados));

        actualizarContadorPendientes();

        if (typeof window.actualizarColoresCuadrasCapitan === "function") {
          window.actualizarColoresCuadrasCapitan();
        }

        if (mostrarFeedback) mostrarToastDiscreto("Sincronizado con éxito");
      }
    } catch (err) {
      console.warn("Modo offline o error al sincronizar con Google Sheets:", err);
      if (mostrarFeedback) mostrarToastDiscreto("Sin conexión a la nube");
    }
  };

  // ==========================================================================
  // 17. GENERADOR VECTORIAL SVG Y MODAL DE TARJETA DE TERRITORIO OFICIAL S-12
  // ==========================================================================

  function obtenerPoligonosTerritorio(tId) {
    const s = String(tId || "").trim().toLowerCase();
    const esNeg = s.includes("negocios");
    const m = s.match(/\d+/);
    const numClean = esNeg ? "negocios" : (m ? m[0] : "1");
    const normId = esNeg ? "territorionegocios" : `territorio${numClean}`;

    let poligonos = [];

    // 1. Intentar desde Leaflet FeatureGroup si ya está instanciado en el mapa
    const grupo = (window.todosLosTerritorios || []).find(g => {
      const gId = String(g._id || "").toLowerCase();
      return gId === normId || (esNeg && gId.includes("negocios")) || (!esNeg && gId === `territorio${numClean}`);
    });

    if (grupo && typeof grupo.getLayers === "function" && grupo.getLayers().length > 0) {
      grupo.getLayers().forEach(layer => {
        let coords = [];
        if (typeof layer.getLatLngs === "function") {
          const ll = layer.getLatLngs();
          if (Array.isArray(ll) && ll.length > 0) {
            if (Array.isArray(ll[0])) {
              coords = ll[0].map(p => [p.lat, p.lng]);
            } else if (typeof ll[0].lat === "number") {
              coords = ll.map(p => [p.lat, p.lng]);
            }
          }
        }
        if (coords.length >= 3) {
          poligonos.push({
            id: layer._id || "",
            coords: coords,
            label: layer._label || "",
            color: (layer.options && layer.options.color) || "#2563eb",
            esPredicable: layer._esPredicable !== false
          });
        }
      });
    }

    // 2. Si no hay del grupo o faltan datos, buscar directamente en window.TERRITORIOS_DATA
    if (poligonos.length === 0 && window.TERRITORIOS_DATA && Array.isArray(window.TERRITORIOS_DATA)) {
      const itemData = window.TERRITORIOS_DATA.find(it => {
        const dId = String(it.datos && it.datos.id || "").toLowerCase();
        return dId === normId || (esNeg && dId.includes("negocios")) || (!esNeg && dId === `territorio${numClean}`);
      });

      if (itemData && itemData.datos && Array.isArray(itemData.datos.poligonos)) {
        itemData.datos.poligonos.forEach(p => {
          let coords = [];
          if (Array.isArray(p.coords) && p.coords.length > 0) {
            if (typeof p.coords[0][0] === "number") {
              coords = p.coords;
            } else if (Array.isArray(p.coords[0]) && typeof p.coords[0][0][0] === "number") {
              coords = p.coords[0];
            }
          }
          if (coords.length >= 3) {
            const esPred = typeof window.esCuadraPredicable === "function" ? window.esCuadraPredicable(p) : (p.label !== undefined);
            poligonos.push({
              id: p.id || "",
              coords: coords,
              label: p.label || "",
              color: p.color || "#2563eb",
              esPredicable: esPred
            });
          }
        });
      }
    }

    return { numClean, normId, poligonos };
  }

  // Generador de SVG vectorial de alta definición para el croquis de la tarjeta S-12
  window.generarSvgCroquisTerritorio = function (tId, width = 600, height = 260) {
    const { poligonos } = obtenerPoligonosTerritorio(tId);

    if (!poligonos || poligonos.length === 0) {
      return `
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; background:#f8fafc;">
          <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#64748b">Croquis no disponible</text>
        </svg>
      `;
    }

    // 1. Calcular caja envolvente (Bounding Box) en coordenadas lat/lng
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    poligonos.forEach(p => {
      p.coords.forEach(([lat, lng]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
    });

    const midLat = (minLat + maxLat) / 2;
    const cosMid = Math.cos((midLat * Math.PI) / 180);
    const spanX = Math.max((maxLng - minLng) * cosMid, 0.0001);
    const spanY = Math.max(maxLat - minLat, 0.0001);

    const padX = 24;
    const padY = 18;
    const availW = width - padX * 2;
    const availH = height - padY * 2;

    const scale = Math.min(availW / spanX, availH / spanY);
    const offsetX = padX + (availW - spanX * scale) / 2;
    const offsetY = padY + (availH - spanY * scale) / 2;

    const project = (lat, lng) => {
      const x = offsetX + (lng - minLng) * cosMid * scale;
      const y = offsetY + (maxLat - lat) * scale;
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    };

    // 2. Proyectar polígonos y calcular centroides de cuadras
    let svgPaths = "";
    let svgBadges = "";

    poligonos.forEach(pol => {
      const ptsProy = pol.coords.map(([lat, lng]) => project(lat, lng));
      const ptsStr = ptsProy.map(([x, y]) => `${x},${y}`).join(" ");

      if (!pol.esPredicable) {
        // Hitos de referencia (Escuelas, Parques, Plazas)
        svgPaths += `
          <polygon points="${ptsStr}" fill="rgba(203, 213, 225, 0.45)" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" stroke-linejoin="round" />
        `;
      } else {
        // Cuadra predicable oficial
        svgPaths += `
          <polygon points="${ptsStr}" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        `;

        // Calcular centroide para la insignia de número de cuadra
        let sumX = 0, sumY = 0;
        ptsProy.forEach(([x, y]) => { sumX += x; sumY += y; });
        const cx = Math.round((sumX / ptsProy.length) * 10) / 10;
        const cy = Math.round((sumY / ptsProy.length) * 10) / 10;

        let lbl = pol.label;
        if (!lbl) {
          const match = String(pol.id || "").match(/cuadra\s*(\d+[a-z]?)/i);
          if (match) lbl = match[1];
        }

        if (lbl) {
          svgBadges += `
            <g class="s12-quadra-badge">
              <circle cx="${cx}" cy="${cy}" r="11" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
              <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff">${lbl}</text>
            </g>
          `;
        }
      }
    });

    // 3. Barra de escala métrica real (1 grado latitud ~ 110,800m en Chihuahua)
    const metrosPorPixel = 110800 / scale;
    const targetMetros = 75 * metrosPorPixel;
    let escalaMetros = 50;
    if (targetMetros > 350) escalaMetros = 500;
    else if (targetMetros > 175) escalaMetros = 200;
    else if (targetMetros > 75) escalaMetros = 100;
    else if (targetMetros > 35) escalaMetros = 50;
    else escalaMetros = 25;

    const escalaPixeles = Math.round((escalaMetros / 110800) * scale);
    const scaleX = 20;
    const scaleY = height - 16;

    const svgScale = `
      <g transform="translate(${scaleX}, ${scaleY})">
        <line x1="0" y1="0" x2="${escalaPixeles}" y2="0" stroke="#475569" stroke-width="2.5" stroke-linecap="round" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#475569" stroke-width="2" />
        <line x1="${escalaPixeles}" y1="-4" x2="${escalaPixeles}" y2="4" stroke="#475569" stroke-width="2" />
        <text x="${escalaPixeles / 2}" y="-6" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#475569">${escalaMetros} m</text>
      </g>
    `;

    // 4. Rosa de los vientos / Brújula Norte (Elegante y Arquitectónica)
    const compassX = width - 32;
    const compassY = 32;
    const svgCompass = `
      <g transform="translate(${compassX}, ${compassY})">
        <circle r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <polygon points="0,-13 4.5,-2 0,-5" fill="#dc2626" />
        <polygon points="0,-13 -4.5,-2 0,-5" fill="#b91c1c" />
        <polygon points="0,13 4.5,2 0,5" fill="#94a3b8" />
        <polygon points="0,13 -4.5,2 0,5" fill="#64748b" />
        <circle r="2" fill="#0f172a" />
        <text x="0" y="-16" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="900" fill="#dc2626">N</text>
      </g>
    `;

    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
        <defs>
          <pattern id="s12Grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f1f5f9" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="#ffffff" />
        <rect width="${width}" height="${height}" fill="url(#s12Grid)" />
        <g class="s12-polygons">${svgPaths}</g>
        <g class="s12-badges">${svgBadges}</g>
        ${svgScale}
        ${svgCompass}
      </svg>
    `;
  };

  // Modal Principal de la Tarjeta Oficial S-12 con Selector, Historial y Exportación a PDF/Impresión
  window.abrirModalTarjetaS12 = function (preTerritorioId) {
    window.reproducirSonidoClick("tap");

    // Eliminar cualquier modal S-12 previo para evitar duplicados
    document.querySelectorAll(".s12-modal-overlay").forEach(m => m.remove());

    // Determinar territorio inicial
    let tInicial = preTerritorioId;
    if (!tInicial && window.territorioActivo && window.territorioActivo._id) {
      tInicial = window.territorioActivo._id;
    }
    let numInicial = obtenerNumeroTerritorioLimpio(tInicial, tInicial);
    if (!numInicial || numInicial === "desconocido") numInicial = "1";

    const modal = document.createElement("div");
    modal.className = "s12-modal-overlay";
    modal.id = "modalTarjetaS12";

    modal.innerHTML = `
      <div class="s12-modal-container">
        <!-- Barra de herramientas superior (No se imprime) -->
        <div class="s12-modal-toolbar">
          <div class="s12-toolbar-left">
            <!-- Selector desplegable instantáneo (un solo toque sin botón aceptar) -->
            <div class="s12-custom-select-wrap" id="s12CustomSelectWrap">
              <button type="button" class="s12-select-trigger" id="s12SelectTrigger" title="Seleccionar territorio">
                <span id="s12SelectLabel">Territorio ${numInicial === 'negocios' ? 'Negocios' : numInicial}</span>
                <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
              <div class="s12-select-dropdown" id="s12SelectDropdown" style="display:none;">
                <div class="s12-select-search-box">
                  <input type="text" id="s12SelectSearchInput" placeholder="Escribe aquí..." autocomplete="off" />
                </div>
                <div class="s12-select-options-list" id="s12SelectOptionsList"></div>
              </div>
            </div>
            <!-- Select nativo sincronizado para accesibilidad/compatibilidad -->
            <select id="s12SelectTerritorio" style="display:none;" title="Seleccionar territorio">
              ${Array.from({ length: 84 }, (_, i) => `<option value="${i + 1}">Territorio ${i + 1}</option>`).join("")}
              <option value="negocios">Territorio Negocios</option>
            </select>
            <button type="button" id="s12BtnImprimir" class="s12-btn-print" title="Imprimir tarjeta o Guardar como archivo PDF">
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button type="button" id="s12BtnCompartir" class="s12-btn-share" title="Compartir enlace directo a este territorio">
              <span>Compartir</span>
            </button>
          </div>
          <button type="button" id="s12BtnCerrar" class="btn-icon-square" title="Cerrar vista previa">✕</button>
        </div>

        <!-- Contenedor con scroll para la tarjeta en pantalla -->
        <div class="s12-modal-scroll">
          <div class="s12-card" id="tarjetaS12Card">
            <!-- Cabecera de la Tarjeta S-12 -->
            <div class="s12-header">
              <div class="s12-header-top">
                <span class="s12-cong-name">CONGREGACIÓN ROSARIO</span>
                <span class="s12-form-code">FORMULARIO S&#8209;12</span>
              </div>
              <div class="s12-title-row">
                <h2 class="s12-main-title">TARJETA DE TERRITORIO</h2>
                <div class="s12-terr-badge">
                  <span class="s12-badge-lbl">TERRITORIO</span>
                  <span class="s12-badge-num" id="s12BadgeNumero">#</span>
                </div>
              </div>
              <div class="s12-chips-row">
                <span class="s12-chip">Manzanas: <strong id="s12TotalCuadras">0</strong></span>
                <span class="s12-chip" id="s12ChipEstado">Sin trabajar</span>
              </div>
            </div>

            <!-- Primera línea horizontal -->
            <hr class="s12-hr" />

            <!-- Croquis Vectorial SVG -->
            <div class="s12-croquis-box" id="s12CroquisContainer"></div>

            <!-- Fila de QR y Enlace directo "Ir a territorio" -->
            <div class="s12-qr-action-row">
              <img id="s12QrImg" src="" alt="QR" class="s12-qr-mini" />
              <a id="s12BtnIrTerritorio" href="#" target="_blank" rel="noopener noreferrer" class="s12-btn-ir-territorio">
                <span>Ir a territorio</span>
              </a>
            </div>

            <!-- Sección de Historial de Asignaciones (Tabla S-12) -->
            <div class="s12-table-section">
              <div class="s12-table-header-title">
                <span>HISTORIAL DE ASIGNACIONES (S&#8209;12)</span>
              </div>
              <table class="s12-table">
                <thead>
                  <tr>
                    <th style="width: 44%;">Capitán</th>
                    <th style="width: 28%;">Inicio</th>
                    <th style="width: 28%;">Final</th>
                  </tr>
                </thead>
                <tbody id="s12TableBody"></tbody>
              </table>
            </div>

            <!-- Segunda línea horizontal -->
            <hr class="s12-hr" />
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const selectTerr = modal.querySelector("#s12SelectTerritorio");
    const btnImprimir = modal.querySelector("#s12BtnImprimir");
    const btnCompartir = modal.querySelector("#s12BtnCompartir");
    const btnCerrar = modal.querySelector("#s12BtnCerrar");

    const cerrarModal = () => {
      window.reproducirSonidoClick("tap");
      if (document.body.contains(modal)) modal.remove();
    };

    btnCerrar.onclick = cerrarModal;
    modal.onclick = (e) => {
      if (e.target === modal) cerrarModal();
    };

    // Función reactiva para actualizar toda la tarjeta al cambiar de territorio
    const actualizarTarjeta = (targetId) => {
      const numTLimpio = obtenerNumeroTerritorioLimpio(targetId, targetId);
      const esNegocios = String(numTLimpio).toLowerCase().includes("negocios");

      // Actualizar select si es necesario
      if (selectTerr) {
        selectTerr.value = esNegocios ? "negocios" : numTLimpio;
      }
      const selectLabelEl = modal.querySelector("#s12SelectLabel");
      if (selectLabelEl) {
        selectLabelEl.textContent = esNegocios ? "Territorio Negocios" : `Territorio ${numTLimpio}`;
      }

      // 1. Número de territorio
      const badgeNumero = modal.querySelector("#s12BadgeNumero");
      if (badgeNumero) badgeNumero.textContent = esNegocios ? "NEGOCIOS" : numTLimpio;

      // 2. Extraer polígonos y contar cuadras predicables
      const { poligonos } = obtenerPoligonosTerritorio(numTLimpio);
      const totalPred = poligonos.filter(p => p.esPredicable).length;
      const totalCuadrasEl = modal.querySelector("#s12TotalCuadras");
      if (totalCuadrasEl) totalCuadrasEl.textContent = totalPred || poligonos.length || 0;

      // 3. Generar SVG Croquis
      const croquisBox = modal.querySelector("#s12CroquisContainer");
      if (croquisBox) {
        croquisBox.innerHTML = window.generarSvgCroquisTerritorio(numTLimpio, 600, 260);
      }

      // 4. URL de Deep Link y Código QR
      const deepUrl = `https://kokevazquez.github.io/TerriPubli/?t=${numTLimpio}`;
      const btnIr = modal.querySelector("#s12BtnIrTerritorio");
      if (btnIr) {
        btnIr.href = deepUrl;
      }

      const qrImg = modal.querySelector("#s12QrImg");
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&margin=1&data=${encodeURIComponent(deepUrl)}`;
        qrImg.onerror = () => { qrImg.style.display = "none"; };
      }

      // 5. Historial de Asignaciones desde LocalStorage
      const reportes = JSON.parse(localStorage.getItem("terrosa_reportes_pendientes") || "[]");
      const repsT = reportes.filter(r => {
        if (!perteneceAVersionActiva(r)) return false;
        const numR = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
        return String(numR) === String(numTLimpio);
      });

      // Ordenar cronológicamente del más reciente a menor
      repsT.sort((a, b) => {
        const fa = parsearFechaReporte(a.fecha).fechaISO || "";
        const fb = parsearFechaReporte(b.fecha).fechaISO || "";
        return fb.localeCompare(fa);
      });

      // Chip de Estado según el periodo activo (año y mes seleccionado)
      const chipEstado = modal.querySelector("#s12ChipEstado");
      if (chipEstado) {
        const repsFiltrados = repsT.filter(r => reporteCumpleFiltroActivo(r));
        const periodoTexto = obtenerTextoPeriodoFiltro();
        if (repsFiltrados.length === 0) {
          chipEstado.innerHTML = `Sin trabajar en ${periodoTexto}`;
          chipEstado.style.background = "#f1f5f9";
          chipEstado.style.color = "#475569";
        } else {
          // Contar cuadras trabajadas en el periodo
          const cuadrasHechasSet = new Set();
          repsFiltrados.forEach(r => {
            if (Array.isArray(r.cuadras)) {
              const numR = obtenerNumeroTerritorioLimpio(r.territorioId, r.territorioNumero);
              r.cuadras.forEach(cId => {
                obtenerVariantesIdCuadra(cId, numR).forEach(v => cuadrasHechasSet.add(v));
              });
            }
          });
          let trabajadas = 0;
          poligonos.forEach(p => {
            if (p.esPredicable) {
              const vars = obtenerVariantesIdCuadra(p.id, numTLimpio);
              if (p.label) obtenerVariantesIdCuadra(p.label, numTLimpio).forEach(v => vars.push(v));
              if (vars.some(v => cuadrasHechasSet.has(v))) trabajadas++;
            }
          });
          const totRef = totalPred || poligonos.length || 0;
          const completo = totRef > 0 && trabajadas >= totRef;
          if (completo) {
            chipEstado.innerHTML = "Completado";
            chipEstado.style.background = "#dcfce7";
            chipEstado.style.color = "#166534";
          } else {
            chipEstado.innerHTML = `Pendiente (${trabajadas}/${totRef})`;
            chipEstado.style.background = "#fef3c7";
            chipEstado.style.color = "#92400e";
          }
        }
      }

      // Llenar tabla S-12
      const tbody = modal.querySelector("#s12TableBody");
      if (tbody) {
        let rowsHtml = "";
        repsT.forEach(rep => {
          const p = parsearFechaReporte(rep.fecha);
          const fDisp = p.fechaDisplay || rep.fecha;
          const cuadrasTrab = (Array.isArray(rep.cuadras) ? rep.cuadras.length : (rep.cuadrasTotal || 0));
          const totRef = totalPred || rep.totalCuadrasTerritorio || cuadrasTrab;
          const esComp = totRef > 0 && cuadrasTrab >= totRef;

          rowsHtml += `
            <tr>
              <td style="font-weight:700; color:#0f172a;">${escaparTextoSeguro(rep.capitan || "Capitán")}</td>
              <td>${fDisp}</td>
              <td>${esComp ? fDisp : "En progreso"}</td>
            </tr>
          `;
        });

        // Completar con renglones punteados en blanco para escritura manual cuando se imprima
        const filasVacias = Math.max(3, 5 - repsT.length);
        for (let i = 0; i < filasVacias; i++) {
          rowsHtml += `
            <tr class="s12-row-blank">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          `;
        }

        tbody.innerHTML = rowsHtml;
      }
    };

    // Cargar territorio seleccionado inicialmente
    actualizarTarjeta(numInicial);

    // Lógica del Selector Desplegable Instantáneo S-12 (sin requerir botón aceptar)
    const triggerSelect = modal.querySelector("#s12SelectTrigger");
    const dropdownSelect = modal.querySelector("#s12SelectDropdown");
    const searchInputSelect = modal.querySelector("#s12SelectSearchInput");
    const optionsListSelect = modal.querySelector("#s12SelectOptionsList");
    const selectLabel = modal.querySelector("#s12SelectLabel");

    const opcionesTerritorios = [
      ...Array.from({ length: 84 }, (_, i) => ({ val: String(i + 1), label: `Territorio ${i + 1}` })),
      { val: "negocios", label: "Territorio Negocios" }
    ];

    function renderizarOpcionesDropdown(filtro = "") {
      if (!optionsListSelect) return;
      optionsListSelect.innerHTML = "";
      const f = filtro.trim().toLowerCase();
      const filtradas = opcionesTerritorios.filter(op => {
        if (!f) return true;
        return op.label.toLowerCase().includes(f) || op.val.toLowerCase().includes(f);
      });

      if (filtradas.length === 0) {
        const vacio = document.createElement("div");
        vacio.style.cssText = "padding:12px; font-size:12px; color:#94a3b8; text-align:center;";
        vacio.textContent = "No se encontraron territorios";
        optionsListSelect.appendChild(vacio);
        return;
      }

      const valActual = selectTerr ? selectTerr.value : numInicial;

      filtradas.forEach(op => {
        const item = document.createElement("div");
        item.className = `s12-dropdown-item ${String(op.val).toLowerCase() === String(valActual).toLowerCase() ? 'active' : ''}`;
        item.textContent = op.label;
        item.onclick = (e) => {
          e.stopPropagation();
          window.reproducirSonidoClick("tap");
          if (selectLabel) selectLabel.textContent = op.label;
          if (selectTerr) selectTerr.value = op.val;
          dropdownSelect.style.display = "none";
          actualizarTarjeta(op.val);
        };
        optionsListSelect.appendChild(item);
      });
    }

    renderizarOpcionesDropdown();

    if (triggerSelect && dropdownSelect) {
      triggerSelect.onclick = (e) => {
        e.stopPropagation();
        window.reproducirSonidoClick("tap");
        const visible = dropdownSelect.style.display !== "none";
        dropdownSelect.style.display = visible ? "none" : "flex";
        if (!visible && searchInputSelect) {
          searchInputSelect.value = "";
          renderizarOpcionesDropdown();
          setTimeout(() => searchInputSelect.focus(), 60);
        }
      };

      if (searchInputSelect) {
        searchInputSelect.oninput = (e) => {
          renderizarOpcionesDropdown(e.target.value);
        };
        searchInputSelect.onclick = (e) => e.stopPropagation();
      }

      document.addEventListener("click", (e) => {
        if (!modal.contains(e.target)) return;
        if (!triggerSelect.contains(e.target) && !dropdownSelect.contains(e.target)) {
          dropdownSelect.style.display = "none";
        }
      });
    }

    // Evento selector de territorio nativo (compatibilidad)
    if (selectTerr) {
      selectTerr.onchange = (e) => {
        window.reproducirSonidoClick("tap");
        actualizarTarjeta(e.target.value);
      };
    }

    // Botón Imprimir / Guardar como PDF
    if (btnImprimir) {
      btnImprimir.onclick = () => {
        window.reproducirSonidoClick("tap");
        window.print();
      };
    }

    // Botón Compartir
    if (btnCompartir) {
      btnCompartir.onclick = () => {
        window.reproducirSonidoClick("tap");
        const valSel = selectTerr ? selectTerr.value : numInicial;
        const numTLimpio = obtenerNumeroTerritorioLimpio(valSel, valSel);
        const deepUrl = `https://kokevazquez.github.io/TerriPubli/?t=${numTLimpio}`;
        const textoShare = `Tarjeta S-12: Territorio ${numTLimpio} — Congregación Rosario\nVer mapa y croquis: ${deepUrl}`;

        if (navigator.share) {
          navigator.share({
            title: `Tarjeta S-12 • Territorio ${numTLimpio}`,
            text: textoShare,
            url: deepUrl
          }).catch(() => {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(deepUrl).then(() => {
            mostrarToastDiscreto("Enlace copiado al portapapeles");
          }).catch(() => {
            mostrarToastDiscreto("Enlace: " + deepUrl);
          });
        } else {
          try {
            const tmp = document.createElement("textarea");
            tmp.value = deepUrl;
            tmp.style.cssText = "position:fixed;left:-9999px;top:0;";
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand("copy");
            tmp.remove();
            mostrarToastDiscreto("Enlace copiado al portapapeles");
          } catch (e) {
            mostrarToastDiscreto("Enlace: " + deepUrl);
          }
        }
      };
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

