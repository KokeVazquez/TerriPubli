// =========================================================================================
// GOOGLE APPS SCRIPT - TERROSA (NUMERACIÓN TRADICIONAL / ORIGINAL)
// Soporta Hoja S-13 Oficial (2 filas por territorio, 4 columnas de asignación),
// conteo exacto de cuadras predicables (sin escuelas ni baldíos) y sincronización con la app.
// =========================================================================================

const CUADRAS_MAP = {
  "1": 3, "2": 3, "3": 5, "4": 6, "5": 6, "6": 4, "7": 4, "8": 4, "9": 5, "10": 4,
  "11": 4, "12": 4, "13": 4, "14": 2, "15": 6, "16": 4, "17": 4, "18": 4, "19": 4, "20": 4,
  "21": 4, "22": 4, "23": 4, "24": 3, "25": 4, "26": 4, "27": 4, "28": 4, "29": 2, "30": 4,
  "31": 3, "32": 4, "33": 4, "34": 4, "35": 4, "36": 3, "37": 5, "38": 3, "39": 4, "40": 7,
  "41": 5, "42": 4, "43": 4, "44": 5, "45": 5, "46": 4, "47": 3, "48": 5, "49": 5, "50": 7,
  "51": 4, "52": 4, "53": 3, "54": 3, "55": 3, "56": 5, "57": 6, "58": 8, "59": 6, "60": 5,
  "61": 5, "62": 6, "63": 6, "64": 4, "65": 4
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetCuadras = obtenerOCrearHojaCuadras(ss);
    var action = data.accion || data.action || "";

    if (action === "nuevo_reporte" || action === "registrarCuadras") {
      var rep = data.reporte || {};
      var estadoInicial = rep.estado || "PENDIENTE";
      var cuadrasArr = Array.isArray(rep.cuadras) ? rep.cuadras.join(",") : String(rep.cuadras || "");
      var totalCuadras = Number(rep.totalCuadrasTerritorio || rep.totalCuadras || rep.cuadrasTotal || 0);

      sheetCuadras.appendRow([
        String(rep.id),
        String(rep.fecha),
        String(rep.territorioId || ""),
        String(rep.territorioNumero || ""),
        cuadrasArr,
        totalCuadras,
        String(rep.capitan || ""),
        rep.visitaSC ? "SÍ" : "NO",
        estadoInicial,
        formatearFechaHora(new Date())
      ]);
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Reporte guardado" });
    }

    if (action === "aprobar_reporte" || action === "aprobarReporte") {
      var repId = String(data.id || data.reporteId || "").trim();
      var filas = sheetCuadras.getDataRange().getValues();
      var encontrado = false;
      for (var i = 1; i < filas.length; i++) {
        if (String(filas[i][0]).trim() === repId) {
          sheetCuadras.getRange(i + 1, 9).setValue("APROBADO");
          encontrado = true;
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", encontrado: encontrado });
    }

    if (action === "descartar_reporte" || action === "eliminarReporte" || action === "eliminar_reporte") {
      var delId = String(data.id || data.reporteId || "").trim();
      var filasDel = sheetCuadras.getDataRange().getValues();
      for (var j = filasDel.length - 1; j >= 1; j--) {
        if (String(filasDel[j][0]).trim() === delId) {
          sheetCuadras.deleteRow(j + 1);
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Reporte eliminado" });
    }

    if (action === "editar_reporte") {
      var repEdit = data.reporte || {};
      var editId = String(repEdit.id || data.id || data.reporteId || "").trim();
      var filasE = sheetCuadras.getDataRange().getValues();
      for (var eIdx = 1; eIdx < filasE.length; eIdx++) {
        if (String(filasE[eIdx][0]).trim() === editId) {
          if (repEdit.fecha) sheetCuadras.getRange(eIdx + 1, 2).setValue(repEdit.fecha);
          if (repEdit.capitan) sheetCuadras.getRange(eIdx + 1, 7).setValue(repEdit.capitan);
          if (repEdit.estado) sheetCuadras.getRange(eIdx + 1, 9).setValue(repEdit.estado);
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Reporte actualizado" });
    }

    if (action === "sincronizarTodo") {
      var historial = data.historial || [];
      var existentes = sheetCuadras.getDataRange().getValues();
      var idsExistentes = {};
      for (var k = 1; k < existentes.length; k++) {
        idsExistentes[String(existentes[k][0]).trim()] = k + 1;
      }
      for (var m = 0; m < historial.length; m++) {
        var r = historial[m];
        var rId = String(r.id).trim();
        var est = r.estado || "APROBADO";
        if (idsExistentes[rId]) {
          sheetCuadras.getRange(idsExistentes[rId], 9).setValue(est);
        } else {
          sheetCuadras.appendRow([
            rId,
            String(r.fecha),
            String(r.territorioId || ""),
            String(r.territorioNumero || ""),
            Array.isArray(r.cuadras) ? r.cuadras.join(",") : String(r.cuadras || ""),
            Number(r.totalCuadrasTerritorio || r.totalCuadras || 0),
            String(r.capitan || ""),
            r.visitaSC ? "SÍ" : "NO",
            est,
            formatearFechaHora(new Date())
          ]);
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Sincronización completa" });
    }

    return respuestaJSON({ exito: false, status: "error", message: "Acción no reconocida: " + action });
  } catch (err) {
    return respuestaJSON({ exito: false, status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetCuadras = obtenerOCrearHojaCuadras(ss);
    var filas = sheetCuadras.getDataRange().getValues();
    var historial = [];

    for (var i = 1; i < filas.length; i++) {
      var fila = filas[i];
      if (!fila[0]) continue;
      var cuadrasStr = String(fila[4] || "");
      var cuadrasArr = cuadrasStr ? cuadrasStr.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
      var fechaStr = formatearFecha(fila[1]);

      historial.push({
        id: String(fila[0]),
        fecha: fechaStr,
        territorioId: String(fila[2]),
        territorioNumero: String(fila[3]),
        cuadras: cuadrasArr,
        totalCuadras: Number(fila[5] || 0),
        totalCuadrasTerritorio: Number(fila[5] || 0),
        capitan: String(fila[6] || ""),
        visitaSC: String(fila[7]) === "SÍ",
        estado: String(fila[8] || "APROBADO")
      });
    }

    return respuestaJSON({
      exito: true,
      status: "success",
      reportes: historial,
      historial: historial
    });
  } catch (err) {
    return respuestaJSON({ exito: false, status: "error", message: err.toString() });
  }
}

// =========================================================================================
// RECONSTRUCCIÓN AUTOMÁTICA DEL S-13 OFICIAL
// =========================================================================================
function reconstruirHojaS13(ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheetCuadras = obtenerOCrearHojaCuadras(ss);
  var filas = sheetCuadras.getDataRange().getValues();

  var listaAprobados = [];

  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f[0]) continue;
    var estado = String(f[8] || "APROBADO").trim().toUpperCase();
    if (estado !== "APROBADO") continue;

    var terrId = String(f[2] || "").trim();
    var numTerr = String(f[3] || "").trim();
    if (!numTerr) {
      var m = terrId.match(/territorio(\d+)/i);
      if (m) numTerr = m[1];
    }
    if (!numTerr) continue;

    var cuadrasStr = String(f[4] || "");
    var cuadrasArr = cuadrasStr ? cuadrasStr.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
    if (cuadrasArr.length === 0) continue;

    listaAprobados.push({
      fecha: formatearFecha(f[1]),
      numTerr: String(parseInt(numTerr, 10)),
      cuadras: cuadrasArr,
      totalReportado: Number(f[5] || 0),
      capitan: String(f[6] || "").trim()
    });
  }

  // Ordenar cronológicamente por fecha ascendente
  listaAprobados.sort(function(a, b) {
    return a.fecha.localeCompare(b.fecha);
  });

  var maxTerritorios = 65;
  var ciclosPorTerritorio = {};
  var acumulador = {};

  for (var t = 1; t <= maxTerritorios; t++) {
    var tStr = String(t);
    ciclosPorTerritorio[tStr] = [];
    acumulador[tStr] = {
      cuadrasSet: {},
      fechaInicio: null,
      ultimoCapitan: ""
    };
  }

  for (var k = 0; k < listaAprobados.length; k++) {
    var rep = listaAprobados[k];
    var num = rep.numTerr;
    if (!acumulador[num]) continue;

    var acc = acumulador[num];
    if (!acc.fechaInicio) {
      acc.fechaInicio = rep.fecha;
    }
    if (rep.capitan) {
      acc.ultimoCapitan = rep.capitan;
    }

    for (var c = 0; c < rep.cuadras.length; c++) {
      acc.cuadrasSet[rep.cuadras[c]] = true;
    }

    // Usar la cantidad exacta de cuadras reportadas o el mapa oficial
    var totalNecesario = (rep.totalReportado && rep.totalReportado > 0)
      ? rep.totalReportado
      : (CUADRAS_MAP[num] || 1);

    var cuadrasUnicas = Object.keys(acc.cuadrasSet).length;

    // Cuando se cubren todas las cuadras reales del territorio, se cierra el ciclo
    if (cuadrasUnicas >= totalNecesario) {
      ciclosPorTerritorio[num].push({
        capitan: acc.ultimoCapitan || "Sin capitán",
        fechaInicio: acc.fechaInicio,
        fechaFin: rep.fecha
      });
      // Reiniciar acumulador para el siguiente ciclo
      acumulador[num] = {
        cuadrasSet: {},
        fechaInicio: null,
        ultimoCapitan: ""
      };
    }
  }

  var sheetS13 = obtenerOCrearPlantillaS13(ss, "S-13 Registro", maxTerritorios);

  // Limpiar solo las celdas de datos (Columnas B a J)
  var totalFilasDatos = maxTerritorios * 2;
  sheetS13.getRange(5, 2, totalFilasDatos, 9).clearContent();

  // Escribir los ciclos en el formato S-13 oficial (2 filas por cada territorio)
  for (var terr = 1; terr <= maxTerritorios; terr++) {
    var terrKey = String(terr);
    var ciclos = ciclosPorTerritorio[terrKey] || [];
    if (ciclos.length === 0) continue;

    var filaSup = 5 + (terr - 1) * 2; // Fila superior (Nombre del Capitán)
    var filaInf = filaSup + 1;        // Fila inferior (Fecha asignó | Fecha completó)

    // Si hay más de 4 ciclos, dejamos los 4 más recientes en las 4 columnas
    var inicioIdx = 0;
    if (ciclos.length > 4) {
      inicioIdx = ciclos.length - 4;
      var cicloPrevio = ciclos[inicioIdx - 1];
      sheetS13.getRange(filaSup, 2).setValue(formatearFechaCorta(cicloPrevio.fechaFin));
    } else if (ciclos.length >= 1) {
      var ultimoCiclo = ciclos[ciclos.length - 1];
      sheetS13.getRange(filaSup, 2).setValue(formatearFechaCorta(ultimoCiclo.fechaFin));
    }

    var ciclosVisibles = ciclos.slice(inicioIdx, inicioIdx + 4);
    for (var idx = 0; idx < ciclosVisibles.length; idx++) {
      var colIzq = 3 + idx * 2; // C=3, E=5, G=7, I=9
      var colDer = colIzq + 1;  // D=4, F=6, H=8, J=10
      var cData = ciclosVisibles[idx];

      sheetS13.getRange(filaSup, colIzq).setValue(cData.capitan);
      sheetS13.getRange(filaInf, colIzq).setValue(formatearFechaCorta(cData.fechaInicio));
      sheetS13.getRange(filaInf, colDer).setValue(formatearFechaCorta(cData.fechaFin));
    }
  }
}

function obtenerOCrearHojaCuadras(ss) {
  var sheet = ss.getSheetByName("Cuadras_Trabajadas");
  if (!sheet) {
    sheet = ss.insertSheet("Cuadras_Trabajadas");
    sheet.appendRow([
      "ID Reporte", "Fecha", "ID Territorio", "Número Territorio",
      "Cuadras", "Total Cuadras", "Capitán", "Visita S.C.", "Estado", "Fecha Registro Nube"
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#115e59").setFontColor("#ffffff");
  }
  return sheet;
}

function obtenerOCrearPlantillaS13(ss, nombreHoja, maxTerritorios) {
  var sheet = ss.getSheetByName(nombreHoja);
  var totalFilasNecesarias = 4 + (maxTerritorios * 2);

  if (sheet && sheet.getMaxRows() >= totalFilasNecesarias) {
    var valTerr1 = String(sheet.getRange(5, 1).getValue()).trim();
    var valTerr2 = String(sheet.getRange(7, 1).getValue()).trim();
    if (valTerr1 === "1" && valTerr2 === "2") {
      return sheet;
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(nombreHoja);
  } else {
    sheet.clear();
  }

  if (sheet.getMaxRows() < totalFilasNecesarias + 2) {
    sheet.insertRowsAfter(sheet.getMaxRows(), (totalFilasNecesarias + 2) - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < 10) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 10 - sheet.getMaxColumns());
  }

  sheet.getRange("A1:J1").merge().setValue("REGISTRO DE ASIGNACIÓN DE TERRITORIO")
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange("A2:J2").merge().setValue("Año de servicio: ________________________")
    .setFontSize(11).setFontWeight("bold");

  sheet.getRange("A3:A4").merge().setValue("Núm. de\nterr.").setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold").setBackground("#e5e7eb");
  sheet.getRange("B3:B4").merge().setValue("Última fecha en\nque se completó*").setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold").setBackground("#e5e7eb");

  for (var b = 0; b < 4; b++) {
    var colI = 3 + b * 2;
    var colD = colI + 1;
    sheet.getRange(3, colI, 1, 2).merge().setValue("Asignado a").setHorizontalAlignment("center").setFontWeight("bold").setBackground("#e5e7eb");
    sheet.getRange(4, colI).setValue("Fecha en que se\nasignó").setHorizontalAlignment("center").setFontSize(8).setBackground("#e5e7eb");
    sheet.getRange(4, colD).setValue("Fecha en que se\ncompletó").setHorizontalAlignment("center").setFontSize(8).setBackground("#e5e7eb");
  }

  for (var t = 1; t <= maxTerritorios; t++) {
    var rSup = 5 + (t - 1) * 2;
    var rInf = rSup + 1;

    sheet.getRange(rSup, 1, 2, 1).merge().setValue(t).setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold");
    sheet.getRange(rSup, 2, 2, 1).merge().setHorizontalAlignment("center").setVerticalAlignment("middle");

    for (var k = 0; k < 4; k++) {
      var cIzq = 3 + k * 2;
      sheet.getRange(rSup, cIzq, 1, 2).merge().setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold");
      sheet.getRange(rInf, cIzq).setHorizontalAlignment("center").setVerticalAlignment("middle").setFontSize(9);
      sheet.getRange(rInf, cIzq + 1).setHorizontalAlignment("center").setVerticalAlignment("middle").setFontSize(9);
    }

    sheet.getRange(rSup, 1, 2, 10).setBorder(true, true, true, true, true, true, "#9ca3af", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(rSup, 1, 2, 10).setBorder(true, true, true, true, null, null, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  sheet.getRange("A3:J4").setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  return sheet;
}

function formatearFecha(valor) {
  if (!valor) return "";
  if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  var str = String(valor).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  return str;
}

function formatearFechaCorta(yyyyMMdd) {
  if (!yyyyMMdd) return "";
  var partes = String(yyyyMMdd).split("-");
  if (partes.length === 3) {
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }
  return String(yyyyMMdd);
}

function formatearFechaHora(fecha) {
  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
}

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
