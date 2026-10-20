// ==============================================================================================================================
// === TERRITORIOS TERMINADOS ===
// === Visor de territorios trabajados, exportación a Excel y limpieza mensual ===
// ==============================================================================================================================

function abrirModalTerritoriosTerminados() {
  const filtroMesElem = document.getElementById('filtroMes');
  const mes = filtroMesElem ? filtroMesElem.value : "";

  if (!mes) {
    alert("Selecciona primero un mes o 'Todos los meses' para mostrar los territorios terminados.");
    return;
  }

  const mostrarTodos = (mes === "todos");
  const mesNombre = mostrarTodos
    ? "Todos los meses"
    : new Date(2025, parseInt(mes) - 1).toLocaleString('es-MX', { month: 'long' });

  const mesesCortos = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  let registrosFiltrados = [];
  let hayRegistros = false;
  let territoriosHtml = "";

  window.todosLosTerritorios.forEach((territorio, tIndex) => {
    let territorioHtml = "";
    territorio.eachLayer(pol => {
      if (!pol._selected && !mostrarTodos) return;
      const registros = JSON.parse(localStorage.getItem(territorio._id + "_capitanes") || "{}");
      (registros[pol._id] || []).forEach(reg => {
        const partes = reg.split('| Fecha:');
        const capitan = partes[0].replace("Capitán:", "").replace("Trabajado por:", "").trim();
        const fecha = partes[1]?.trim();
        if (!fecha) return;

        let mesRegistro = '';
        if (fecha.includes('-')) mesRegistro = fecha.split('-')[1];
        else if (fecha.includes('/')) mesRegistro = fecha.split('/')[1];
        else if (fecha.length >= 5) mesRegistro = fecha.slice(3, 5);

        if (mostrarTodos || mesRegistro === mes.padStart(2, '0')) {
          if (!territorioHtml) {
            territorioHtml += `<h3 style="margin-top:15px; color:#444;">📍 Territorio ${tIndex + 1}</h3>`;
          }
          const cuadraLimpia = pol._id.replace(/^.*?Cuadra(\d+).*$/i, "$1").trim();
          let partesFecha = fecha.includes('-') ? fecha.split("-") : fecha.split("/");
          let dia = partesFecha[0].padStart(2, "0");
          let mesNum = parseInt(partesFecha[1], 10);
          let anio = partesFecha[2];
          let fechaFormateada = `${dia}-${mesesCortos[mesNum - 1] || "???"}-${anio}`;

          territorioHtml += `<p class="registroItem" style="background:#f8f8f8; padding:8px 10px; border-radius:6px; margin:5px 0; position:relative; color:#000;">
            <strong>Cuadra ${cuadraLimpia}</strong> | Trabajado por: <strong style="color:red;">${capitan}</strong> | Fecha: <strong style="color:red;">${fechaFormateada}</strong>
          </p>`;

          registrosFiltrados.push([`Territorio ${tIndex + 1} / Cuadra ${cuadraLimpia}`, capitan, fecha]);
        }
      });
    });

    if (territorioHtml) {
      territoriosHtml += territorioHtml;
      hayRegistros = true;
    }
  });

  let contenidoBody = `<h2 style="text-align:center; color:#333; margin-top:0;">🗺️ Territorios terminados - ${mesNombre}</h2><hr style="margin-bottom:15px;">`;
  if (hayRegistros) {
    contenidoBody += territoriosHtml;
  } else {
    contenidoBody += "<p style='text-align:center;'>No se encontraron registros para este mes.</p>";
  }

  contenidoBody += `
    <div style="margin-top:20px; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
      <button id="borrarRegistros" style="padding:12px 18px; background:#e53935; color:white; border:none; border-radius:8px; font-size:16px; cursor:pointer; transition:transform 0.1s;">🗑️ Borrar registros del mes</button>
      <button id="btnExportarExcelPopup" style="padding:12px 18px; background:#43a047; color:white; border:none; border-radius:8px; font-size:16px; cursor:pointer; transition:transform 0.1s;">📤 Exportar a Excel</button>
    </div>
  `;

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.6)";
  modal.style.zIndex = "9999";
  modal.style.overflowY = "auto";
  modal.style.backdropFilter = "blur(3px)";

  modal.innerHTML = `
    <div id="contenidoModal" style="background:#fff; padding:25px; margin:60px auto; width:85%; max-width:750px; border-radius:12px; position:relative; box-shadow:0 5px 20px rgba(0,0,0,0.3); transition:all 0.3s ease;">
      <button id="cerrarModal" style="position:absolute; top:10px; right:10px; font-size:20px; background:none; border:none; cursor:pointer;">✖</button>
      ${contenidoBody}
    </div>
  `;
  document.body.appendChild(modal);

  // Cerrar modal
  document.getElementById("cerrarModal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Exportar a Excel
  document.getElementById("btnExportarExcelPopup").addEventListener("click", () => {
    if (registrosFiltrados.length === 0) {
      alert("No hay registros para exportar 😅");
      return;
    }
    const encabezados = ["Territorio / Cuadra", "Capitán", "Fecha"];
    const wsData = [encabezados, ...registrosFiltrados];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Territorios terminados");
    XLSX.writeFile(wb, `Territorios_${mesNombre}.xlsx`);
  });

  // Borrar registros del mes
  document.getElementById("borrarRegistros").addEventListener("click", () => {
    const confirmar = confirm(mostrarTodos ?
      "⚠️ Esto borrará TODOS los registros guardados. ¿Seguro que quieres continuar?" :
      "¿Estás seguro de que quieres borrar los registros de este mes?");

    if (!confirmar) return;

    window.todosLosTerritorios.forEach(territorio => {
      const registros = JSON.parse(localStorage.getItem(territorio._id + "_capitanes") || "{}");
      Object.keys(registros).forEach(polId => {
        registros[polId] = registros[polId].filter(reg => {
          const fecha = reg.split('| Fecha:')[1]?.trim() || '';
          let mesRegistro = '';
          if (fecha.includes('-')) mesRegistro = fecha.split('-')[1];
          else if (fecha.includes('/')) mesRegistro = fecha.split('/')[1];
          else if (fecha.length >= 5) mesRegistro = fecha.slice(3, 5);
          return mostrarTodos ? false : mesRegistro !== mes.padStart(2, '0');
        });
      });
      localStorage.setItem(territorio._id + "_capitanes", JSON.stringify(registros));
    });

    window.todosLosTerritorios.forEach(territorio => {
      territorio.eachLayer(pol => {
        if (pol._selected) {
          pol._selected = false;
          pol.setStyle(pol._originalStyle);
        }
      });
    });

    filtrarPorMes();

    const registrosItems = document.getElementById("contenidoModal").querySelectorAll(".registroItem");
    registrosItems.forEach(item => {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:absolute;top:0;left:-100%;width:100%;height:100%;background:white;transition:left 0.5s ease;z-index:5;";
      item.appendChild(overlay);
      void overlay.offsetHeight;
      setTimeout(() => overlay.style.left = "0%", 10);
    });

    setTimeout(() => {
      const contenidoModal = document.getElementById("contenidoModal");
      contenidoModal.innerHTML = `
        <button id="cerrarModal" style="position:absolute; top:10px; right:10px; font-size:20px; background:none; border:none; cursor:pointer;">✖</button>
        <h2 style="text-align:center;">✅ Registros del mes eliminados</h2>
      `;
      document.getElementById("cerrarModal").addEventListener("click", () => {
        document.body.removeChild(modal);
      });
    }, 700);
  });
}

function inicializarEventosTerminados() {
  const btnTerminados = document.getElementById("btnTerritoriosTerminados");
  if (btnTerminados) {
    btnTerminados.addEventListener("click", abrirModalTerritoriosTerminados);
  }
}

