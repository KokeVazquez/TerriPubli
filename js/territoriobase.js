// =============================
// === Territorio Base ===
// =============================

function vincularMenuCuadra(pol, territorioId) {
  pol._territorioId = territorioId || pol._territorioId || "territorio";

  // Limpiar eventos previos para evitar duplicados
  pol.off('contextmenu');
  pol.off('touchstart');
  pol.off('touchmove');
  pol.off('touchend');
  pol.off('touchcancel');

  // 1. Clic derecho en PC
  pol.on('contextmenu', function (e) {
    if (e.originalEvent) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
    }
    mostrarMenu(e, pol, null, pol._territorioId);
  });

  // 2. Dejar presionado en móvil (Pulsación prolongada / Long-press)
  let pressTimer = null;
  let hasMoved = false;

  pol.on('touchstart', function (e) {
    hasMoved = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      if (!hasMoved) {
        mostrarMenu(e, pol, null, pol._territorioId);
      }
    }, 450); // 450 ms
  });

  pol.on('touchmove', function () {
    hasMoved = true;
    clearTimeout(pressTimer);
  });

  pol.on('touchend touchcancel', function () {
    clearTimeout(pressTimer);
  });
}

function crearTerritorio(datosTerritorio) {
  // ------------------------------
  // 1. Crear grupo
  // ------------------------------
  var grupo = L.featureGroup().addTo(map);
  grupo._id = datosTerritorio.id; // id del grupo

  // ------------------------------
  // 2. Estado y notas guardadas
  // ------------------------------
  var estadoGuardado = JSON.parse(localStorage.getItem(datosTerritorio.id + "_estado") || "{}");
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

    // Guardamos estilo original
    pol._originalStyle = {
      color: pol.options.color,
      fillColor: pol.options.fillColor || pol.options.color,
      fillOpacity: pol.options.fillOpacity,
      weight: pol.options.weight
    };

    // Estado guardado
    pol._selected = estadoGuardado[pol._id] || false;
    if (pol._selected) {
      pol.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.9 });
    }

    // Etiqueta
    if (d.label) pol._label = d.label;

    // Vincular menú contextual (clic derecho y dejar presionado en móvil)
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

function mostrarMenu(e, pol, notasPoligonos, territorioId) {
  ocultarMenu();
  const menu = document.getElementById("menuContextual");
  if (!menu) return;

  const tId = territorioId || pol._territorioId || "territorio";
  const link = pol._link || "";
  const pId = pol._id || "";

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (e) {
    if (e.containerPoint) {
      x = e.containerPoint.x;
      y = e.containerPoint.y;
    } else if (e.originalEvent) {
      const oe = e.originalEvent;
      if (oe.clientX !== undefined && oe.clientX !== null && oe.clientX > 0) {
        x = oe.clientX;
        y = oe.clientY;
      } else if (oe.touches && oe.touches.length > 0) {
        x = oe.touches[0].clientX;
        y = oe.touches[0].clientY;
      } else if (oe.changedTouches && oe.changedTouches.length > 0) {
        x = oe.changedTouches[0].clientX;
        y = oe.changedTouches[0].clientY;
      }
    }
  }

  // Prevenir que el menú se salga de los bordes de la pantalla en móviles
  const menuWidth = 170;
  const menuHeight = 150;
  if (x + menuWidth > window.innerWidth - 12) x = window.innerWidth - menuWidth - 12;
  if (x < 12) x = 12;
  if (y + menuHeight > window.innerHeight - 12) y = window.innerHeight - menuHeight - 12;
  if (y < 12) y = 12;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";

  menu.innerHTML = `
    <button onclick="if('${link}') window.open('${link}', '_blank'); else alert('Ubicación no disponible para esta cuadra'); ocultarMenu();">📍 Ubicación</button>
    <button onclick="anadirNotaPopup('${pId}', '${tId}');">➕ Añadir nota</button>
    <button onclick="verNotas('${pId}', '${tId}');">📒 Notas</button>
  `;
}

function ocultarMenu() {
  const menu = document.getElementById("menuContextual");
  if (menu) menu.style.display = "none";
}

// =============================
// === Notas ===
// =============================

function anadirNotaPopup(id, territorioId) {
  ocultarMenu();
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");

  const modalFondo = document.createElement("div");
  modalFondo.id = "modalAñadirNota";
  modalFondo.style.position = "fixed";
  modalFondo.style.top = "0";
  modalFondo.style.left = "0";
  modalFondo.style.width = "100%";
  modalFondo.style.height = "100%";
  modalFondo.style.background = "rgba(0,0,0,0.5)";
  modalFondo.style.display = "flex";
  modalFondo.style.alignItems = "center";
  modalFondo.style.justifyContent = "center";
  modalFondo.style.zIndex = "99999";
  modalFondo.style.backdropFilter = "blur(4px)";

  modalFondo.innerHTML = `
    <div style="
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 20px;
      color: #111;
      font-family: inherit;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      min-width: 300px;
      max-width: 90%;
    ">
      <b style="font-size:16px;">Añadir nota:</b><br>
      <textarea id="inputNota" rows="4" cols="30" placeholder='Escribe tu nota aquí...' style="
        width: 100%;
        padding: 10px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.15);
        background: #f8f8f8;
        color: #111;
        font-family: inherit;
        font-size: 14px;
        margin-top: 8px;
        margin-bottom: 12px;
        resize: none;
        box-sizing: border-box;
      "></textarea><br>
      <div style="display:flex; gap:8px;">
        <button id="guardarNota" style="
          flex:1;
          background: #4caf50;
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          padding: 10px 15px;
          cursor: pointer;
        ">💾 Guardar</button>
        <button id="cancelarNota" style="
          flex:1;
          background: #f44336;
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          padding: 10px 15px;
          cursor: pointer;
        ">❌ Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalFondo);

  document.getElementById("cancelarNota").onclick = () => {
    document.body.removeChild(modalFondo);
  };

  document.getElementById("guardarNota").onclick = () => {
    const texto = document.getElementById("inputNota").value.trim();
    if (!texto) return;
    if (!notasPoligonos[id]) notasPoligonos[id] = [];
    notasPoligonos[id].push(texto);
    localStorage.setItem(territorioId + "_notas", JSON.stringify(notasPoligonos));
    document.body.removeChild(modalFondo);
  };
}

function verNotas(id, territorioId) {
  ocultarMenu();
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");
  mostrarNotasPopup(id, notasPoligonos, territorioId);
}

function mostrarNotasPopup(id, notasPoligonos, territorioId) {
  map.closePopup();
  var notas = notasPoligonos[id] || [];
  notas = notas.filter(n => typeof n === "string" ? !n.startsWith("Trabajado por:") : true);

  var contenido = "<b>Notas:</b><br><br>";
  if (notas.length === 0) contenido += "No hay notas aún.";
  else notas.forEach((nota, i) => {
    const textoNota = typeof nota === "string" ? nota : (nota.texto || JSON.stringify(nota));
    contenido += `${i + 1}. ${textoNota} 
      <button onclick="confirmarEliminarNotaPopup('${id}', ${i}, '${territorioId}')">❌</button><br>`;
  });

  L.popup().setLatLng(map.getCenter()).setContent(contenido).openOn(map);
}

function confirmarEliminarNotaPopup(id, index, territorioId) {
  map.closePopup();
  L.popup().setLatLng(map.getCenter()).setContent(`
    <b>¿Eliminar esta nota?</b><br>
    <button onclick="eliminarNota('${id}', ${index}, '${territorioId}')">✅ Sí</button>
    <button onclick="map.closePopup()">❌ No</button>
  `).openOn(map);
}

function eliminarNota(id, index, territorioId) {
  var notasPoligonos = JSON.parse(localStorage.getItem(territorioId + "_notas") || "{}");
  notasPoligonos[id].splice(index, 1);
  localStorage.setItem(territorioId + "_notas", JSON.stringify(notasPoligonos));
  map.closePopup();
}
