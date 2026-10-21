// ==========================================
// GOOGLE APPS SCRIPT - TERROSA V5 (DEFINITIVO)
// Soporta S-13 Oficial (2 filas por territorio),
// conteos exactos sin áreas no predicables (Escuelas, Alsuper, Parques, etc.)
// y separación entre Numeración Anterior (65) y Numeración Nueva (51).
// ==========================================

const CUADRAS_ANTERIOR = {
  "1": 3, "2": 4, "3": 4, "4": 2, "5": 3, "6": 2, "7": 2, "8": 3, "9": 4, "10": 6,
  "11": 4, "12": 3, "13": 5, "14": 4, "15": 4, "16": 2, "17": 2, "18": 3, "19": 3, "20": 4,
  "21": 2, "22": 2, "23": 3, "24": 3, "25": 2, "26": 6, "27": 4, "28": 4, "29": 4, "30": 3,
  "31": 4, "32": 4, "33": 2, "34": 4, "35": 2, "36": 4, "37": 2, "38": 3, "39": 4, "40": 3,
  "41": 2, "42": 4, "43": 5, "44": 6, "45": 4, "46": 4, "47": 2, "48": 3, "49": 3, "50": 5,
  "51": 5, "52": 7, "53": 3, "54": 5, "55": 4, "56": 3, "57": 4, "58": 3, "59": 5, "60": 5,
  "61": 5, "62": 8, "63": 10, "64": 8, "65": 3
};

const CUADRAS_NUEVA = {
  "1": 4, "2": 6, "3": 6, "4": 4, "5": 4, "6": 5, "7": 5, "8": 4, "9": 3, "10": 5,
  "11": 7, "12": 6, "13": 5, "14": 6, "15": 5, "16": 4, "17": 4, "18": 5, "19": 3, "20": 4,
  "21": 4, "22": 4, "23": 3, "24": 6, "25": 4, "26": 4, "27": 4, "28": 3, "29": 4, "30": 4,
  "31": 2, "32": 4, "33": 2, "34": 4, "35": 2, "36": 2, "37": 3, "38": 4, "39": 3, "40": 2,
  "41": 4, "42": 5, "43": 6, "44": 4, "45": 5, "46": 4, "47": 5, "48": 5, "49": 8, "50": 10,
  "51": 11
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetCuadras = obtenerOCrearHojaCuadras(ss);
    var action = data.action;

    if (action === "registrarCuadras") {
      var rep = data.reporte;
      var estadoInicial = rep.estado || "PENDIENTE";
      sheetCuadras.appendRow([
        String(rep.id),
        String(rep.fecha),
        String(rep.territorioId || ""),
        String(rep.territorioNumero || ""),
        Array.isArray(rep.cuadras) ? rep.cuadras.join(",") : String(rep.cuadras || ""),
        Number(rep.totalCuadras || 0),
        String(rep.capitan || ""),
        rep.visitaSC ? "SÍ" : "NO",
        estadoInicial,
        formatearFechaHora(new Date())
      ]);
      reconstruirHojaS13(ss);
      return respuestaJSON({ status: "success", message: "Reporte guardado" });
    }

    if (action === "aprobarReporte") {
      var repId = String(data.reporteId || "").trim();
      var filas = sheetCuadras.getDataRange().getValues();
      var encontrado = false;
      for (var i = 1; i < filas.length; i++) {
        if (String(filas[i][0]).trim() === repId) {
          sheetCuadras.getRange(i + 1, 9).setValue("APROBADO");
          encontrado = true;
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ status: "success", encontrado: encontrado });
    }

    if (action === "eliminarReporte") {
      var delId = String(data.reporteId || "").trim();
      var filasDel = sheetCuadras.getDataRange().getValues();
      for (var j = filasDel.length - 1; j >= 1; j--) {
        if (String(filasDel[j][0]).trim() === delId) {
          sheetCuadras.deleteRow(j + 1);
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ status: "success", message: "Reporte eliminado" });
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
            Number(r.totalCuadras || 0),
            String(r.capitan || ""),
            r.visitaSC ? "SÍ" : "NO",
            est,
            formatearFechaHora(new Date())
          ]);
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ status: "success", message: "Sincronización completa" });
    }

    return respuestaJSON({ status: "error", message: "Acción no reconocida: " + action });
  } catch (err) {
    return respuestaJSON({ status: "error", message: err.toString() });
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
        capitan: String(fila[6] || ""),
        visitaSC: String(fila[7]) === "SÍ",
        estado: String(fila[8] || "APROBADO")
      });
    }

    return respuestaJSON({
      status: "success",
      historial: historial
    });
  } catch (err) {
    return respuestaJSON({ status: "error", message: err.toString() });
  }
}

// ==========================================
// RECONSTRUCCIÓN AUTOMÁTICA DEL S-13 OFICIAL
// ==========================================
function reconstruirHojaS13(ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheetCuadras = obtenerOCrearHojaCuadras(ss);
  var filas = sheetCuadras.getDataRange().getValues();

  // Separamos reportes aprobados por versión (Anterior vs Nueva)
  var aprobadosAnterior = [];
  var aprobadosNueva = [];

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

    var item = {
      fecha: formatearFecha(f[1]),
      numTerr: numTerr,
      cuadras: cuadrasArr,
      totalReportado: Number(f[5] || 0),
      capitan: String(f[6] || "").trim()
    };

    if (terrId.indexOf("nueva_") === 0) {
      aprobadosNueva.push(item);
    } else {
      aprobadosAnterior.push(item);
    }
  }

  // Actualizar hoja principal S-13 Registro (Numeración Anterior 1..65)
  actualizarTablaS13(ss, "S-13 Registro", 65, CUADRAS_ANTERIOR, aprobadosAnterior);

  // Si existen reportes de la Numeración Nueva, actualiza/crea también "S-13 Nueva" (1..51)
  if (aprobadosNueva.length > 0 || ss.getSheetByName("S-13 Nueva")) {
    actualizarTablaS13(ss, "S-13 Nueva", 51, CUADRAS_NUEVA, aprobadosNueva);
  }
}

function actualizarTablaS13(ss, nombreHoja, maxTerritorios, mapaCuadras, listaAprobados) {
  // Ordenar cronológicamente por fecha ascendente
  listaAprobados.sort(function(a, b) {
    return a.fecha.localeCompare(b.fecha);
  });

  // Agrupar ciclos completados por territorio
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

  for (var i = 0; i < listaAprobados.length; i++) {
    var rep = listaAprobados[i];
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

    var totalNecesario = mapaCuadras[num] || rep.totalReportado || 1;
    var cuadrasUnicas = Object.keys(acc.cuadrasSet).length;

    // Solo cuando se completan TODAS las cuadras predicables del territorio:
    if (cuadrasUnicas >= totalNecesario) {
      ciclosPorTerritorio[num].push({
        capitan: acc.ultimoCapitan || "Sin capitán",
        fechaInicio: acc.fechaInicio,
        fechaFin: rep.fecha
      });
      // Reiniciar acumulador para el siguiente ciclo de ese territorio
      acumulador[num] = {
        cuadrasSet: {},
        fechaInicio: null,
        ultimoCapitan: ""
      };
    }
  }

  var sheetS13 = obtenerOCrearPlantillaS13(ss, nombreHoja, maxTerritorios);

  // Limpiar únicamente los valores de datos (filas 5 a 4 + maxTerritorios*2, columnas B a J)
  var totalFilasDatos = maxTerritorios * 2;
  sheetS13.getRange(5, 2, totalFilasDatos, 9).clearContent();

  // Escribir los ciclos completados en la estructura de 2 filas por territorio
  for (var terr = 1; terr <= maxTerritorios; terr++) {
    var terrKey = String(terr);
    var ciclos = ciclosPorTerritorio[terrKey] || [];
    if (ciclos.length === 0) continue;

    var filaSup = 5 + (terr - 1) * 2; // Fila superior (Nombre del Capitán)
    var filaInf = filaSup + 1;        // Fila inferior (Fecha asignó | Fecha completó)

    // Si hay más de 4 ciclos, mostramos los 4 más recientes en las 4 columnas del S-13
    // y ponemos la última fecha completada previa en la Columna B ("Última fecha en que se completó*")
    var inicioIdx = 0;
    if (ciclos.length > 4) {
      inicioIdx = ciclos.length - 4;
      var cicloPrevio = ciclos[inicioIdx - 1];
      sheetS13.getRange(filaSup, 2).setValue(formatearFechaCorta(cicloPrevio.fechaFin));
    } else if (ciclos.length >= 1) {
      // También mostramos en Columna B la fecha más reciente en que se completó
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

// ==========================================
// CREACIÓN DE HOJAS Y UTILIDADES
// ==========================================
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
    // Verificar si la fila 5 y 6 ya tienen el formato de 2 filas por territorio
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

  // Asegurar suficientes filas y columnas
  if (sheet.getMaxRows() < totalFilasNecesarias + 2) {
    sheet.insertRowsAfter(sheet.getMaxRows(), (totalFilasNecesarias + 2) - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < 10) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 10 - sheet.getMaxColumns());
  }

  // Encabezado Principal
  sheet.getRange("A1:J1").merge().setValue("REGISTRO DE ASIGNACIÓN DE TERRITORIO")
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange("A2:J2").merge().setValue("Año de servicio: ________________________")
    .setFontSize(11).setFontWeight("bold");

  // Cabeceras de tabla (Filas 3 y 4)
  sheet.getRange("A3:A4").merge().setValue("Núm. de\nterr.").setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold").setBackground("#e5e7eb");
  sheet.getRange("B3:B4").merge().setValue("Última fecha en\nque se completó*").setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold").setBackground("#e5e7eb");

  for (var b = 0; b < 4; b++) {
    var colI = 3 + b * 2;
    var colD = colI + 1;
    sheet.getRange(3, colI, 1, 2).merge().setValue("Asignado a").setHorizontalAlignment("center").setFontWeight("bold").setBackground("#e5e7eb");
    sheet.getRange(4, colI).setValue("Fecha en que se\nasignó").setHorizontalAlignment("center").setFontSize(8).setBackground("#e5e7eb");
    sheet.getRange(4, colD).setValue("Fecha en que se\ncompletó").setHorizontalAlignment("center").setFontSize(8).setBackground("#e5e7eb");
  }

  // Estructura de 2 filas por cada territorio
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
