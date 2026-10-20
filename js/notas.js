// ==============================================================================================================================
// === GESTIÓN DE NOTAS ===
// === Indicadores en mapa, visor de notas globales y edición/eliminación ===
// ==============================================================================================================================

let notasMostradas = false;

// Crear modal general para ver todas las notas
const modalNotas = document.createElement("div");
modalNotas.id = "modalNotas";
Object.assign(modalNotas.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "9999"
});

const modalContent = document.createElement("div");
Object.assign(modalContent.style, {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  maxHeight: "80%",
  overflowY: "auto",
  width: "80%",
  maxWidth: "700px",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)"
});
modalNotas.appendChild(modalContent);
document.body.appendChild(modalNotas);

modalNotas.addEventListener("click", (e) => {
  if (e.target === modalNotas) modalNotas.style.display = "none";
});

// Mini pop-up para editar/eliminar notas
const miniPopup = document.createElement("div");
Object.assign(miniPopup.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 15px rgba(0,0,0,0.3)",
  zIndex: "10000",
  display: "none"
});
document.body.appendChild(miniPopup);

function mostrarPopup(contentHtml) {
  miniPopup.innerHTML = contentHtml;
  miniPopup.style.display = "block";
}

function cerrarPopup() {
  miniPopup.style.display = "none";
}

// --------------------------------------------------------------------------------------
// Alternar visualización de iconos de notas (📒) en el mapa
// --------------------------------------------------------------------------------------
function toggleIconosNotas() {
  if (!notasMostradas) {
    window.indicadoresNotas = [];
    window.todosLosTerritorios.forEach(territorio => {
      const notasTerritorio = JSON.parse(localStorage.getItem(territorio._id + "_notas") || "{}");
      territorio.eachLayer(function (pol) {
        if (notasTerritorio[pol._id] && notasTerritorio[pol._id].length > 0) {
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
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(map);
          window.indicadoresNotas.push(marker);
        }
      });
    });
    notasMostradas = true;
  } else {
    window.indicadoresNotas.forEach(m => map.removeLayer(m));
    window.indicadoresNotas = [];
    notasMostradas = false;
  }
}

// --------------------------------------------------------------------------------------
// Abrir modal con todas las notas registradas para editar / eliminar
// --------------------------------------------------------------------------------------
function abrirModalTodasNotas() {
  let todasLasNotas = [];

  window.todosLosTerritorios.forEach(territorio => {
    const notasTerritorio = JSON.parse(localStorage.getItem(territorio._id + "_notas") || "{}");

    territorio.eachLayer(function (pol) {
      const notasPol = notasTerritorio[pol._id];
      if (notasPol && notasPol.length > 0) {
        notasPol.forEach((nota, index) => {
          todasLasNotas.push({
            territorioId: territorio._id,
            territorio: territorio.options?.name || territorio._id,
            cuadra: pol._id,
            contenido: typeof nota === "string" ? nota : nota.texto || JSON.stringify(nota),
            index: index
          });
        });
      }
    });
  });

  if (todasLasNotas.length === 0) {
    alert("No hay notas registradas.");
    return;
  }

  modalContent.innerHTML = "<h2 style='margin-top:0;'>Todas las Notas Registradas</h2><hr>";

  todasLasNotas.forEach(n => {
    const notaDiv = document.createElement("div");
    Object.assign(notaDiv.style, {
      marginBottom: "10px",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });

    const territorioNum = n.territorio.replace(/\D/g, '');
    const cuadraNum = n.cuadra.replace(/\D/g, '');

    const textoNota = document.createElement("div");
    textoNota.innerHTML = `<b>Territorio:</b> ${territorioNum} <br>
                       <b>Cuadra:</b> ${cuadraNum} <br>
                       <b>Nota:</b> <span style="color:red; font-weight:bold;" class="nota-texto">${n.contenido}</span>`;

    const botonesDiv = document.createElement("div");
    Object.assign(botonesDiv.style, { display: "flex", gap: "5px" });

    // EDITAR
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    Object.assign(btnEditar.style, {
      backgroundColor: "#4CAF50",
      color: "#fff",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    });
    btnEditar.addEventListener("click", () => {
      mostrarPopup(`
        <h3 style="margin-top:0;">Editar Nota</h3>
        <textarea id="editarNotaTextarea" style="width:100%; height:80px; box-sizing:border-box;">${n.contenido}</textarea><br><br>
        <button id="guardarNotaBtn" style="background-color:#4CAF50;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Guardar</button>
        <button id="cancelarNotaBtn" style="background-color:#f44336;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-left:5px;">Cancelar</button>
      `);

      document.getElementById("guardarNotaBtn").addEventListener("click", () => {
        const nuevoTexto = document.getElementById("editarNotaTextarea").value;
        const notasTerritorio = JSON.parse(localStorage.getItem(n.territorioId + "_notas") || "{}");
        notasTerritorio[n.cuadra][n.index] = nuevoTexto;
        localStorage.setItem(n.territorioId + "_notas", JSON.stringify(notasTerritorio));
        textoNota.querySelector(".nota-texto").textContent = nuevoTexto;
        cerrarPopup();
      });

      document.getElementById("cancelarNotaBtn").addEventListener("click", cerrarPopup);
    });

    // ELIMINAR
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    Object.assign(btnEliminar.style, {
      backgroundColor: "#f44336",
      color: "#fff",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    });
    btnEliminar.addEventListener("click", () => {
      mostrarPopup(`
        <h3 style="margin-top:0;">Confirmar Eliminación</h3>
        <p>¿Seguro que quieres eliminar esta nota?</p>
        <button id="confirmarEliminarBtn" style="background-color:#f44336;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Sí</button>
        <button id="cancelarEliminarBtn" style="background-color:#ccc;color:#000;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-left:5px;">No</button>
      `);

      document.getElementById("confirmarEliminarBtn").addEventListener("click", () => {
        const notasTerritorio = JSON.parse(localStorage.getItem(n.territorioId + "_notas") || "{}");
        notasTerritorio[n.cuadra].splice(n.index, 1);
        localStorage.setItem(n.territorioId + "_notas", JSON.stringify(notasTerritorio));
        notaDiv.remove();
        cerrarPopup();
      });

      document.getElementById("cancelarEliminarBtn").addEventListener("click", cerrarPopup);
    });

    botonesDiv.appendChild(btnEditar);
    botonesDiv.appendChild(btnEliminar);
    notaDiv.appendChild(textoNota);
    notaDiv.appendChild(botonesDiv);
    modalContent.appendChild(notaDiv);
  });

  modalNotas.style.display = "flex";
}

// --------------------------------------------------------------------------------------
// Vinculación de eventos al botón de Notas
// --------------------------------------------------------------------------------------
function inicializarEventosNotas() {
  const btnNotas = document.getElementById("btnMostrarTodasNotas");
  if (!btnNotas) return;

  // Click normal: alternar iconos
  btnNotas.addEventListener("click", toggleIconosNotas);

  // Click derecho (PC): abrir modal de gestión
  btnNotas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    abrirModalTodasNotas();
  });

  // Mantener presionado (móvil y táctil)
  let pressTimer;
  function iniciarPresion() {
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      btnNotas.dispatchEvent(new Event('contextmenu'));
    }, 800);
  }

  function cancelarPresion() {
    clearTimeout(pressTimer);
  }

  btnNotas.addEventListener("mousedown", iniciarPresion);
  btnNotas.addEventListener("mouseup", cancelarPresion);
  btnNotas.addEventListener("mouseleave", cancelarPresion);
  btnNotas.addEventListener("touchstart", iniciarPresion);
  btnNotas.addEventListener("touchend", cancelarPresion);
  btnNotas.addEventListener("touchcancel", cancelarPresion);
}

