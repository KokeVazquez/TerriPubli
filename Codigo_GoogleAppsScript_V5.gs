// =========================================================================================
// GOOGLE APPS SCRIPT - TERROSA (V6 - AÑOS DE SERVICIO S-13 2025 Y S-13 2026)
// - Soporta los 84 territorios tradicionales con su conteo exacto de cuadras predicables
// - Separa automáticamente en "S-13 2025" (hasta 31/08/2026) y "S-13 2026" (desde 01/09/2026)
// - Corrige automáticamente la columna "Última fecha en que se completó*"
// - Formato limpio en Cuadras_Trabajadas: ID Territorio = "42", Cuadras = "T42C1,T42C2"
// - Crea hoja "Capitanes" con la base de datos de capitanes y administradores
// - Sin paso de aprobación: todo reporte entra directo como APROBADO
// =========================================================================================

const MAX_TERRITORIOS = 84;

const CUADRAS_MAP = {
  "1": 3, "2": 3, "3": 5, "4": 7, "5": 6, "6": 4, "7": 4, "8": 4, "9": 6, "10": 4,
  "11": 4, "12": 4, "13": 4, "14": 3, "15": 6, "16": 4, "17": 4, "18": 4, "19": 4, "20": 4,
  "21": 4, "22": 4, "23": 4, "24": 3, "25": 4, "26": 4, "27": 4, "28": 4, "29": 3, "30": 4,
  "31": 3, "32": 4, "33": 4, "34": 4, "35": 4, "36": 3, "37": 5, "38": 3, "39": 4, "40": 7,
  "41": 6, "42": 4, "43": 4, "44": 5, "45": 5, "46": 4, "47": 3, "48": 5, "49": 5, "50": 7,
  "51": 4, "52": 4, "53": 3, "54": 3, "55": 3, "56": 5, "57": 6, "58": 8, "59": 6, "60": 6,
  "61": 5, "62": 6, "63": 6, "64": 4, "65": 4, "66": 5, "67": 4, "68": 4, "69": 4, "70": 4,
  "71": 4, "72": 6, "73": 4, "74": 4, "75": 4, "76": 4, "77": 6, "78": 6, "79": 8, "80": 8,
  "81": 6, "82": 7, "83": 8, "84": 8
};

const CAPITANES_DB = [
  ["Koke", "Administrador / Auxiliar", "SÍ", "1234"],
  ["Merari Rosales", "Administrador / Capitán", "SÍ", "1234"],
  ["Alex García", "Capitán", "NO", ""],
  ["Alfredo Dávila", "Capitán", "NO", ""],
  ["César Pineda", "Capitán", "NO", ""],
  ["Daniel López", "Capitán", "NO", ""],
  ["Diego Cerecedo", "Capitán", "NO", ""],
  ["Edgar Rodríguez", "Capitán", "NO", ""],
  ["Elijah Rodríguez", "Capitán", "NO", ""],
  ["Félix Acuña", "Capitán", "NO", ""],
  ["Fernando García", "Capitán", "NO", ""],
  ["Heber Ramos", "Capitán", "NO", ""],
  ["Jaciel Barrios", "Capitán", "NO", ""],
  ["Jair Barraza", "Capitán", "NO", ""],
  ["Jesús Alba", "Capitán", "NO", ""],
  ["Josué Ramos", "Capitán", "NO", ""],
  ["Luis Gardea", "Capitán", "NO", ""],
  ["Moisés García", "Capitán", "NO", ""],
  ["Oscar Hernández", "Capitán", "NO", ""],
  ["René Molina", "Capitán", "NO", ""],
  ["Ricardo Salinas", "Capitán", "NO", ""],
  ["Rinat Reséndiz", "Capitán", "NO", ""]
];

// Convierte "Cuadra1_Territorio42" -> "T42C1" y extrae solo el número de territorio "42"
function normalizarNumeroTerritorio(terrId, terrNum) {
  var num = String(terrNum || "").trim();
  if (/^\d+$/.test(num)) return String(parseInt(num, 10));
  var m = String(terrId || "").match(/(\d+)/);
  if (m) return String(parseInt(m[1], 10));
  return num || String(terrId || "").trim();
}

function normalizarListaCuadrasCorto(cuadrasInput, numTerr) {
  var rawArr = Array.isArray(cuadrasInput)
    ? cuadrasInput
    : String(cuadrasInput || "").split(",");
  var tNum = normalizarNumeroTerritorio("", numTerr);
  var resultado = [];

  for (var i = 0; i < rawArr.length; i++) {
    var item = String(rawArr[i] || "").trim();
    if (!item) continue;

    // Si ya viene como T42C1
    var mCorto = item.match(/^T(\d+)C(\d+)$/i);
    if (mCorto) {
      resultado.push("T" + mCorto[1] + "C" + mCorto[2]);
      continue;
    }

    // Si viene como Cuadra1_Territorio42
    var mLargo = item.match(/^Cuadra(\d+)_Territorio(\d+)$/i);
    if (mLargo) {
      resultado.push("T" + mLargo[2] + "C" + mLargo[1]);
      continue;
    }

    // Si viene solo el número "1"
    if (/^\d+$/.test(item) && tNum) {
      resultado.push("T" + tNum + "C" + item);
      continue;
    }

    resultado.push(item);
  }
  return resultado;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(25000);
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetCuadras = obtenerOCrearHojaCuadras(ss);
    obtenerOCrearHojaCapitanes(ss);
    var action = data.accion || data.action || "";

    if (action === "nuevo_reporte" || action === "registrarCuadras") {
      var rep = data.reporte || {};
      var numTerr = normalizarNumeroTerritorio(rep.territorioId, rep.territorioNumero);
      var cuadrasCortas = normalizarListaCuadrasCorto(rep.cuadras, numTerr);
      var totalCuadras = Number(rep.totalCuadrasTerritorio || rep.totalCuadras || CUADRAS_MAP[numTerr] || cuadrasCortas.length || 0);

      sheetCuadras.appendRow([
        String(rep.id),
        String(rep.fecha),
        numTerr,
        numTerr,
        cuadrasCortas.join(","),
        totalCuadras,
        String(rep.capitan || ""),
        rep.visitaSC ? "SÍ" : "NO",
        "APROBADO",
        formatearFechaHora(new Date())
      ]);
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Reporte guardado y S-13 actualizado" });
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
          if (repEdit.cuadras) {
            var nT = normalizarNumeroTerritorio(repEdit.territorioId, repEdit.territorioNumero || filasE[eIdx][3]);
            var cNorm = normalizarListaCuadrasCorto(repEdit.cuadras, nT);
            sheetCuadras.getRange(eIdx + 1, 5).setValue(cNorm.join(","));
          }
          if (repEdit.capitan) sheetCuadras.getRange(eIdx + 1, 7).setValue(repEdit.capitan);
          sheetCuadras.getRange(eIdx + 1, 9).setValue("APROBADO");
        }
      }
      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", message: "Reporte actualizado" });
    }

    if (action === "reemplazar_historial_limpio") {
      var historial = data.historial || [];
      var ultFila = sheetCuadras.getLastRow();
      if (ultFila > 1) {
        sheetCuadras.deleteRows(2, ultFila - 1);
      }
      var nuevasFilas = [];
      var ahoraStr = formatearFechaHora(new Date());

      for (var m = 0; m < historial.length; m++) {
        var r = historial[m];
        var rId = String(r.id || ("rep_" + (1000 + m))).trim();
        var nTerr = normalizarNumeroTerritorio(r.territorioId, r.territorioNumero);
        var cCortas = normalizarListaCuadrasCorto(r.cuadras, nTerr);
        var totC = Number(r.totalCuadrasTerritorio || r.totalCuadras || CUADRAS_MAP[nTerr] || cCortas.length || 0);

        nuevasFilas.push([
          rId,
          String(r.fecha),
          nTerr,
          nTerr,
          cCortas.join(","),
          totC,
          String(r.capitan || ""),
          r.visitaSC ? "SÍ" : "NO",
          "APROBADO",
          ahoraStr
        ]);
      }

      if (nuevasFilas.length > 0) {
        sheetCuadras.getRange(2, 1, nuevasFilas.length, 10).setValues(nuevasFilas);
      }

      reconstruirHojaS13(ss);
      return respuestaJSON({ exito: true, status: "success", count: nuevasFilas.length });
    }

    if (action === "sincronizarTodo") {
      var historial = data.historial || [];
      var existentes = sheetCuadras.getDataRange().getValues();
      var idsExistentes = {};
      for (var k = 1; k < existentes.length; k++) {
        idsExistentes[String(existentes[k][0]).trim()] = k + 1;
      }
      var nuevasFilas = [];
      var ahoraStr = formatearFechaHora(new Date());

      for (var m = 0; m < historial.length; m++) {
        var r = historial[m];
        var rId = String(r.id).trim();
        var nTerr = normalizarNumeroTerritorio(r.territorioId, r.territorioNumero);
        var cCortas = normalizarListaCuadrasCorto(r.cuadras, nTerr);
        var totC = Number(r.totalCuadrasTerritorio || r.totalCuadras || CUADRAS_MAP[nTerr] || cCortas.length || 0);

        if (idsExistentes[rId]) {
          var rowIdx = idsExistentes[rId];
          sheetCuadras.getRange(rowIdx, 3, 1, 3).setValues([[nTerr, nTerr, cCortas.join(",")]]);
          sheetCuadras.getRange(rowIdx, 9).setValue("APROBADO");
        } else {
          nuevasFilas.push([
            rId,
            String(r.fecha),
            nTerr,
            nTerr,
            cCortas.join(","),
            totC,
            String(r.capitan || ""),
            r.visitaSC ? "SÍ" : "NO",
            "APROBADO",
            ahoraStr
          ]);
        }
      }

      if (nuevasFilas.length > 0) {
        var startRow = sheetCuadras.getLastRow() + 1;
        sheetCuadras.getRange(startRow, 1, nuevasFilas.length, 10).setValues(nuevasFilas);
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
      var numTerr = normalizarNumeroTerritorio(fila[2], fila[3]);
      var cuadrasArr = normalizarListaCuadrasCorto(fila[4], numTerr);
      var fechaStr = formatearFecha(fila[1]);

      historial.push({
        id: String(fila[0]),
        fecha: fechaStr,
        territorioId: numTerr,
        territorioNumero: numTerr,
        cuadras: cuadrasArr,
        totalCuadras: Number(fila[5] || CUADRAS_MAP[numTerr] || 0),
        totalCuadrasTerritorio: Number(fila[5] || CUADRAS_MAP[numTerr] || 0),
        capitan: String(fila[6] || ""),
        visitaSC: String(fila[7]) === "SÍ",
        estado: "APROBADO"
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
// RECONSTRUCCIÓN AUTOMÁTICA DE "S-13 2025" Y "S-13 2026" POR AÑO DE SERVICIO
// - Año de Servicio 2025: Todo hasta el 31 de agosto de 2026 (fecha <= "2026-08-31")
// - Año de Servicio 2026: Todo desde el 1 de septiembre de 2026 (fecha >= "2026-09-01")
// =========================================================================================
function reconstruirHojaS13(ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheetCuadras = obtenerOCrearHojaCuadras(ss);
  obtenerOCrearHojaCapitanes(ss);
  var filas = sheetCuadras.getDataRange().getValues();

  var registros2025 = [];
  var registros2026 = [];

  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (!f[0]) continue;

    var numTerr = normalizarNumeroTerritorio(f[2], f[3]);
    if (!numTerr || !/^\d+$/.test(numTerr)) continue;

    var cuadrasArr = normalizarListaCuadrasCorto(f[4], numTerr);
    if (cuadrasArr.length === 0) continue;

    var fechaISO = formatearFecha(f[1]);
    if (!fechaISO) continue;

    var item = {
      fecha: fechaISO,
      numTerr: numTerr,
      cuadras: cuadrasArr,
      totalReportado: Number(f[5] || CUADRAS_MAP[numTerr] || 1),
      capitan: String(f[6] || "").trim()
    };

    if (fechaISO <= "2026-08-31") {
      registros2025.push(item);
    } else {
      registros2026.push(item);
    }
  }

  // Calcular y llenar S-13 2025
  var resultado2025 = calcularCiclosS13(registros2025, {});
  llenarHojaS13PorBloque(ss, "S-13 2025", "2025", resultado2025);

  // Calcular y llenar S-13 2026 (usando como referencia de última fecha completada previa el cierre de 2025)
  var resultado2026 = calcularCiclosS13(registros2026, resultado2025.ultimasFechasCompletadas);
  llenarHojaS13PorBloque(ss, "S-13 2026", "2026", resultado2026);

  // Si existía la hoja vieja "S-13 Registro", eliminarla para no confundir
  var hojaVieja = ss.getSheetByName("S-13 Registro");
  if (hojaVieja) {
    try { ss.deleteSheet(hojaVieja); } catch (e) {}
  }
}

function calcularCiclosS13(listaRegistros, ultimasFechasPrevias) {
  listaRegistros.sort(function(a, b) {
    return a.fecha.localeCompare(b.fecha);
  });

  var ciclosPorTerritorio = {};
  var acumulador = {};
  var ultimasFechasCompletadas = {};

  for (var t = 1; t <= MAX_TERRITORIOS; t++) {
    var tStr = String(t);
    ciclosPorTerritorio[tStr] = [];
    acumulador[tStr] = {
      cuadrasSet: {},
      fechaInicio: null,
      ultimoCapitan: "",
      totalNecesario: CUADRAS_MAP[tStr] || 1
    };
    if (ultimasFechasPrevias && ultimasFechasPrevias[tStr]) {
      ultimasFechasCompletadas[tStr] = ultimasFechasPrevias[tStr];
    }
  }

  for (var k = 0; k < listaRegistros.length; k++) {
    var rep = listaRegistros[k];
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

    var totalNecesario = CUADRAS_MAP[num] || rep.totalReportado || 1;
    acc.totalNecesario = totalNecesario;
    var cuadrasUnicas = Object.keys(acc.cuadrasSet).length;

    if (cuadrasUnicas >= totalNecesario) {
      ciclosPorTerritorio[num].push({
        capitan: acc.ultimoCapitan || "Sin capitán",
        fechaInicio: acc.fechaInicio,
        fechaFin: rep.fecha,
        completo: true
      });
      ultimasFechasCompletadas[num] = rep.fecha;
      acumulador[num] = {
        cuadrasSet: {},
        fechaInicio: null,
        ultimoCapitan: "",
        totalNecesario: totalNecesario
      };
    }
  }

  // Si un territorio tiene cuadras trabajadas en progreso (ej. T42 con 2 de 4 cuadras), mostrarlo en curso
  for (var terr = 1; terr <= MAX_TERRITORIOS; terr++) {
    var key = String(terr);
    var accPend = acumulador[key];
    var trabajadasCount = Object.keys(accPend.cuadrasSet).length;
    if (trabajadasCount > 0 && accPend.fechaInicio) {
      ciclosPorTerritorio[key].push({
        capitan: accPend.ultimoCapitan || "Sin capitán",
        fechaInicio: accPend.fechaInicio,
        fechaFin: "", // Aún en progreso
        completo: false
      });
    }
  }

  return {
    ciclosPorTerritorio: ciclosPorTerritorio,
    ultimasFechasCompletadas: ultimasFechasCompletadas
  };
}

function llenarHojaS13PorBloque(ss, nombreHoja, anioServicioTxt, datosS13) {
  var sheetS13 = obtenerOCrearPlantillaS13(ss, nombreHoja, anioServicioTxt, MAX_TERRITORIOS);
  var totalFilasDatos = MAX_TERRITORIOS * 2;

  // Construir matriz en memoria (168 filas x 9 columnas: Columna B a Columna J) para escritura instantánea
  var matriz = [];
  for (var r = 0; r < totalFilasDatos; r++) {
    matriz.push(["", "", "", "", "", "", "", "", ""]);
  }

  for (var terr = 1; terr <= MAX_TERRITORIOS; terr++) {
    var terrKey = String(terr);
    var ciclos = datosS13.ciclosPorTerritorio[terrKey] || [];
    var ultimaFechaCompletada = datosS13.ultimasFechasCompletadas[terrKey] || "";

    var idxSup = (terr - 1) * 2;
    var idxInf = idxSup + 1;

    // Columna B (índice 0 de la matriz): Última fecha en que se completó*
    if (ultimaFechaCompletada) {
      matriz[idxSup][0] = formatearFechaCorta(ultimaFechaCompletada);
    }

    if (ciclos.length === 0) continue;

    var inicioIdx = 0;
    if (ciclos.length > 4) {
      inicioIdx = ciclos.length - 4;
    }

    var ciclosVisibles = ciclos.slice(inicioIdx, inicioIdx + 4);
    for (var idx = 0; idx < ciclosVisibles.length; idx++) {
      var colIzqMat = 1 + idx * 2; // 1=Col C, 3=Col E, 5=Col G, 7=Col I
      var colDerMat = colIzqMat + 1; // 2=Col D, 4=Col F, 6=Col H, 8=Col J
      var cData = ciclosVisibles[idx];

      matriz[idxSup][colIzqMat] = cData.capitan;
      matriz[idxInf][colIzqMat] = formatearFechaCorta(cData.fechaInicio);
      matriz[idxInf][colDerMat] = cData.fechaFin ? formatearFechaCorta(cData.fechaFin) : "";
    }
  }

  sheetS13.getRange(5, 2, totalFilasDatos, 9).setValues(matriz);
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
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function obtenerOCrearHojaCapitanes(ss) {
  var sheet = ss.getSheetByName("Capitanes");
  if (!sheet) {
    sheet = ss.insertSheet("Capitanes");
    sheet.appendRow(["Nombre del Capitán", "Rol", "Acceso Modo Capitán", "PIN"]);
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheet.getRange(2, 1, CAPITANES_DB.length, 4).setValues(CAPITANES_DB);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 4);
  }
  return sheet;
}

function obtenerOCrearPlantillaS13(ss, nombreHoja, anioServicioTxt, maxTerritorios) {
  var sheet = ss.getSheetByName(nombreHoja);
  var totalFilasNecesarias = 4 + (maxTerritorios * 2);

  if (sheet && sheet.getMaxRows() >= totalFilasNecesarias) {
    var valTerr1 = String(sheet.getRange(5, 1).getValue()).trim();
    var valTerr84 = String(sheet.getRange(5 + (maxTerritorios - 1) * 2, 1).getValue()).trim();
    if (valTerr1 === "1" && valTerr84 === String(maxTerritorios)) {
      sheet.getRange("A2").setValue("Año de servicio: " + anioServicioTxt);
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
  sheet.getRange("A2:J2").merge().setValue("Año de servicio: " + anioServicioTxt)
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

  var numVals = [];
  for (var t = 1; t <= maxTerritorios; t++) {
    numVals.push([t]);
    numVals.push([""]);
  }
  sheet.getRange(5, 1, maxTerritorios * 2, 1).setValues(numVals)
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setFontWeight("bold");
  sheet.getRange(5, 2, maxTerritorios * 2, 9)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  for (var t2 = 1; t2 <= maxTerritorios; t2++) {
    var rSup = 5 + (t2 - 1) * 2;
    var rInf = rSup + 1;
    sheet.getRange(rSup, 1, 2, 1).merge();
    sheet.getRange(rSup, 2, 2, 1).merge();
    for (var k = 0; k < 4; k++) {
      var cIzq = 3 + k * 2;
      sheet.getRange(rSup, cIzq, 1, 2).merge().setFontWeight("bold");
      sheet.getRange(rInf, cIzq, 1, 2).setFontSize(9);
    }
  }

  sheet.getRange(5, 1, maxTerritorios * 2, 10).setBorder(true, true, true, true, true, true, "#9ca3af", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A3:J4").setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.setFrozenRows(4);
  return sheet;
}

// Función para ejecutar manualmente en el editor de Apps Script si se desea reconstruir todo al instante
function actualizarHojasS13Manualmente() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  reconstruirHojaS13(ss);
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


// =========================================================================================
// FUNCIÓN DE MIGRACIÓN HISTÓRICA COMPLETA DESDE EL ARCHIVO WORD (Territorios_2026.docx)
// - Incluye los 84 territorios con sus 221 salidas históricas exactas
// - Divide correctamente los territorios que tomaron más de un día en fecha de asignación y fecha de conclusión
// - Preserva los reportes reales de hoy (T42 y T44)
// - Para ejecutar: En el menú superior de Apps Script, selecciona 'ejecutarCargaHistorialWordCompleto' y haz clic en 'Ejecutar'.
// =========================================================================================
function ejecutarCargaHistorialWordCompleto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCuadras = obtenerOCrearHojaCuadras(ss);
  obtenerOCrearHojaCapitanes(ss);

  var ultFila = sheetCuadras.getLastRow();
  if (ultFila > 1) {
    sheetCuadras.deleteRows(2, ultFila - 1);
  }

  var datosCompletos = [
  [
    "hist_20250530_T1_1",
    "2025-05-30",
    "1",
    "1",
    "T1C1,T1C2,T1C3",
    3,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250530_T2_2",
    "2025-05-30",
    "2",
    "2",
    "T2C1,T2C2,T2C3",
    3,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250530_T3_3",
    "2025-05-30",
    "3",
    "3",
    "T3C1,T3C2",
    5,
    "Alfredo Dávila",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250531_T3_4",
    "2025-05-31",
    "3",
    "3",
    "T3C3,T3C4,T3C5",
    5,
    "Alfredo Dávila",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250531_T4_5",
    "2025-05-31",
    "4",
    "4",
    "T4C1,T4C2,T4C3,T4C4,T4C5,T4C6,T4C7",
    7,
    "Fernando García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250603_T5_6",
    "2025-06-03",
    "5",
    "5",
    "T5C1,T5C2,T5C3,T5C4,T5C5,T5C6",
    6,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250603_T6_7",
    "2025-06-03",
    "6",
    "6",
    "T6C1,T6C2,T6C3,T6C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250604_T7_8",
    "2025-06-04",
    "7",
    "7",
    "T7C1,T7C2,T7C3,T7C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250604_T8_9",
    "2025-06-04",
    "8",
    "8",
    "T8C1,T8C2,T8C3,T8C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250604_T9_10",
    "2025-06-04",
    "9",
    "9",
    "T9C1,T9C2,T9C3,T9C4,T9C5,T9C6",
    6,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250605_T10_11",
    "2025-06-05",
    "10",
    "10",
    "T10C1,T10C2,T10C3,T10C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250605_T11_12",
    "2025-06-05",
    "11",
    "11",
    "T11C1,T11C2,T11C3,T11C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250605_T12_13",
    "2025-06-05",
    "12",
    "12",
    "T12C1,T12C2,T12C3,T12C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250607_T13_14",
    "2025-06-07",
    "13",
    "13",
    "T13C1,T13C2,T13C3,T13C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250607_T20_15",
    "2025-06-07",
    "20",
    "20",
    "T20C1,T20C2,T20C3,T20C4",
    4,
    "Moisés García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250607_T21_16",
    "2025-06-07",
    "21",
    "21",
    "T21C1,T21C2",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250608_T14_17",
    "2025-06-08",
    "14",
    "14",
    "T14C1,T14C2,T14C3",
    3,
    "Ricardo Salinas",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250610_T15_18",
    "2025-06-10",
    "15",
    "15",
    "T15C1,T15C2,T15C3,T15C4,T15C5,T15C6",
    6,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250610_T16_19",
    "2025-06-10",
    "16",
    "16",
    "T16C1,T16C2",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250612_T16_20",
    "2025-06-12",
    "16",
    "16",
    "T16C3,T16C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250612_T17_21",
    "2025-06-12",
    "17",
    "17",
    "T17C1,T17C2",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250612_T24_22",
    "2025-06-12",
    "24",
    "24",
    "T24C1,T24C2,T24C3",
    3,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250614_T17_23",
    "2025-06-14",
    "17",
    "17",
    "T17C3,T17C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250614_T18_24",
    "2025-06-14",
    "18",
    "18",
    "T18C1,T18C2,T18C3,T18C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250614_T19_25",
    "2025-06-14",
    "19",
    "19",
    "T19C1,T19C2,T19C3,T19C4",
    4,
    "César Pineda",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250614_T21_26",
    "2025-06-14",
    "21",
    "21",
    "T21C3,T21C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250615_T28_27",
    "2025-06-15",
    "28",
    "28",
    "T28C1,T28C2",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250615_T29_28",
    "2025-06-15",
    "29",
    "29",
    "T29C1,T29C2,T29C3",
    3,
    "Koke",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250615_T36_29",
    "2025-06-15",
    "36",
    "36",
    "T36C1",
    3,
    "Koke",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250617_T22_30",
    "2025-06-17",
    "22",
    "22",
    "T22C1,T22C2,T22C3,T22C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250617_T23_31",
    "2025-06-17",
    "23",
    "23",
    "T23C1,T23C2,T23C3,T23C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250619_T25_32",
    "2025-06-19",
    "25",
    "25",
    "T25C1,T25C2,T25C3,T25C4",
    4,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250619_T26_33",
    "2025-06-19",
    "26",
    "26",
    "T26C1,T26C2,T26C3,T26C4",
    4,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250620_T27_34",
    "2025-06-20",
    "27",
    "27",
    "T27C1,T27C2,T27C3,T27C4",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250620_T28_35",
    "2025-06-20",
    "28",
    "28",
    "T28C3,T28C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250620_T35_36",
    "2025-06-20",
    "35",
    "35",
    "T35C1,T35C2",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250620_T42_37",
    "2025-06-20",
    "42",
    "42",
    "T42C1,T42C2",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250621_T30_38",
    "2025-06-21",
    "30",
    "30",
    "T30C1,T30C2,T30C3,T30C4",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250621_T31_39",
    "2025-06-21",
    "31",
    "31",
    "T31C1,T31C2,T31C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250621_T32_40",
    "2025-06-21",
    "32",
    "32",
    "T32C1,T32C2,T32C3,T32C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250621_T39_41",
    "2025-06-21",
    "39",
    "39",
    "T39C1,T39C2,T39C3,T39C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250622_T33_42",
    "2025-06-22",
    "33",
    "33",
    "T33C1,T33C2",
    4,
    "Fernando García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250624_T33_43",
    "2025-06-24",
    "33",
    "33",
    "T33C3,T33C4",
    4,
    "Fernando García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250624_T34_44",
    "2025-06-24",
    "34",
    "34",
    "T34C1,T34C2,T34C3,T34C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250624_T36_45",
    "2025-06-24",
    "36",
    "36",
    "T36C2,T36C3",
    3,
    "Koke",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250624_T41_46",
    "2025-06-24",
    "41",
    "41",
    "T41C1,T41C2,T41C3,T41C4,T41C5,T41C6",
    6,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250625_T35_47",
    "2025-06-25",
    "35",
    "35",
    "T35C3,T35C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250625_T37_48",
    "2025-06-25",
    "37",
    "37",
    "T37C1,T37C2",
    5,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250625_T40_49",
    "2025-06-25",
    "40",
    "40",
    "T40C1,T40C2,T40C3",
    7,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250625_T42_50",
    "2025-06-25",
    "42",
    "42",
    "T42C3,T42C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250625_T43_51",
    "2025-06-25",
    "43",
    "43",
    "T43C1,T43C2",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250626_T40_52",
    "2025-06-26",
    "40",
    "40",
    "T40C4,T40C5,T40C6,T40C7",
    7,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250704_T43_53",
    "2025-07-04",
    "43",
    "43",
    "T43C3,T43C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250704_T44_54",
    "2025-07-04",
    "44",
    "44",
    "T44C1,T44C2,T44C3,T44C4,T44C5",
    5,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250705_T45_55",
    "2025-07-05",
    "45",
    "45",
    "T45C1,T45C2,T45C3,T45C4,T45C5",
    5,
    "Ricardo Salinas",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250705_T46_56",
    "2025-07-05",
    "46",
    "46",
    "T46C1,T46C2,T46C3,T46C4",
    4,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250705_T47_57",
    "2025-07-05",
    "47",
    "47",
    "T47C1,T47C2,T47C3",
    3,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250708_T37_58",
    "2025-07-08",
    "37",
    "37",
    "T37C3,T37C4,T37C5",
    5,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250708_T38_59",
    "2025-07-08",
    "38",
    "38",
    "T38C1,T38C2,T38C3",
    3,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250709_T48_60",
    "2025-07-09",
    "48",
    "48",
    "T48C1,T48C2,T48C3,T48C4,T48C5",
    5,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250710_T49_61",
    "2025-07-10",
    "49",
    "49",
    "T49C1,T49C2,T49C3,T49C4,T49C5",
    5,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250711_T50_62",
    "2025-07-11",
    "50",
    "50",
    "T50C1,T50C2,T50C3,T50C4,T50C5,T50C6,T50C7",
    7,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250712_T51_63",
    "2025-07-12",
    "51",
    "51",
    "T51C1,T51C2,T51C3,T51C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250712_T52_64",
    "2025-07-12",
    "52",
    "52",
    "T52C1,T52C2,T52C3,T52C4",
    4,
    "Ricardo Salinas",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250712_T53_65",
    "2025-07-12",
    "53",
    "53",
    "T53C1,T53C2,T53C3",
    3,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250713_T54_66",
    "2025-07-13",
    "54",
    "54",
    "T54C1,T54C2,T54C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250717_T56_67",
    "2025-07-17",
    "56",
    "56",
    "T56C1,T56C2,T56C3,T56C4,T56C5",
    5,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250717_T57_68",
    "2025-07-17",
    "57",
    "57",
    "T57C1,T57C2,T57C3,T57C4,T57C5,T57C6",
    6,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250718_T58_69",
    "2025-07-18",
    "58",
    "58",
    "T58C1,T58C2,T58C3,T58C4",
    8,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250719_T58_70",
    "2025-07-19",
    "58",
    "58",
    "T58C5,T58C6,T58C7,T58C8",
    8,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250719_T59_71",
    "2025-07-19",
    "59",
    "59",
    "T59C1,T59C2,T59C3,T59C4,T59C5,T59C6",
    6,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250719_T60_72",
    "2025-07-19",
    "60",
    "60",
    "T60C1,T60C2,T60C3,T60C4,T60C5,T60C6",
    6,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250719_T61_73",
    "2025-07-19",
    "61",
    "61",
    "T61C1,T61C2,T61C3,T61C4,T61C5",
    5,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250720_T20_74",
    "2025-07-20",
    "20",
    "20",
    "T20C1,T20C2,T20C3,T20C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250720_T21_75",
    "2025-07-20",
    "21",
    "21",
    "T21C1,T21C2,T21C3,T21C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250720_T62_76",
    "2025-07-20",
    "62",
    "62",
    "T62C1,T62C2,T62C3,T62C4,T62C5,T62C6",
    6,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250722_T55_77",
    "2025-07-22",
    "55",
    "55",
    "T55C1,T55C2,T55C3",
    3,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250722_T64_78",
    "2025-07-22",
    "64",
    "64",
    "T64C1,T64C2",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250724_T63_79",
    "2025-07-24",
    "63",
    "63",
    "T63C1,T63C2,T63C3,T63C4,T63C5,T63C6",
    6,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250725_T64_80",
    "2025-07-25",
    "64",
    "64",
    "T64C3,T64C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250725_T65_81",
    "2025-07-25",
    "65",
    "65",
    "T65C1,T65C2,T65C3,T65C4",
    4,
    "Alfredo Dávila",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250726_T66_82",
    "2025-07-26",
    "66",
    "66",
    "T66C1,T66C2,T66C3,T66C4,T66C5",
    5,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250726_T67_83",
    "2025-07-26",
    "67",
    "67",
    "T67C1,T67C2,T67C3,T67C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250726_T68_84",
    "2025-07-26",
    "68",
    "68",
    "T68C1,T68C2,T68C3,T68C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250726_T69_85",
    "2025-07-26",
    "69",
    "69",
    "T69C1,T69C2,T69C3,T69C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250727_T10_86",
    "2025-07-27",
    "10",
    "10",
    "T10C1,T10C2,T10C3,T10C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250727_T11_87",
    "2025-07-27",
    "11",
    "11",
    "T11C1,T11C2,T11C3,T11C4",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250729_T70_88",
    "2025-07-29",
    "70",
    "70",
    "T70C1,T70C2,T70C3,T70C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250729_T71_89",
    "2025-07-29",
    "71",
    "71",
    "T71C1,T71C2,T71C3,T71C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250731_T72_90",
    "2025-07-31",
    "72",
    "72",
    "T72C1,T72C2,T72C3,T72C4,T72C5,T72C6",
    6,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250731_T73_91",
    "2025-07-31",
    "73",
    "73",
    "T73C1,T73C2,T73C3,T73C4",
    4,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250801_T74_92",
    "2025-08-01",
    "74",
    "74",
    "T74C1,T74C2,T74C3,T74C4",
    4,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250801_T75_93",
    "2025-08-01",
    "75",
    "75",
    "T75C1,T75C2,T75C3,T75C4",
    4,
    "Alfredo Dávila",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250802_T76_94",
    "2025-08-02",
    "76",
    "76",
    "T76C1,T76C2,T76C3,T76C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250802_T77_95",
    "2025-08-02",
    "77",
    "77",
    "T77C1,T77C2,T77C3,T77C4,T77C5,T77C6",
    6,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250802_T78_96",
    "2025-08-02",
    "78",
    "78",
    "T78C1,T78C2,T78C3,T78C4,T78C5,T78C6",
    6,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250802_T80_97",
    "2025-08-02",
    "80",
    "80",
    "T80C1,T80C2,T80C3,T80C4,T80C5,T80C6,T80C7,T80C8",
    8,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250803_T18_98",
    "2025-08-03",
    "18",
    "18",
    "T18C1,T18C2,T18C3,T18C4",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250805_T79_99",
    "2025-08-05",
    "79",
    "79",
    "T79C1,T79C2,T79C3,T79C4",
    8,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250807_T79_100",
    "2025-08-07",
    "79",
    "79",
    "T79C5,T79C6,T79C7,T79C8",
    8,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250807_T81_101",
    "2025-08-07",
    "81",
    "81",
    "T81C1,T81C2,T81C3,T81C4,T81C5,T81C6",
    6,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250808_T82_102",
    "2025-08-08",
    "82",
    "82",
    "T82C1,T82C2,T82C3,T82C4,T82C5,T82C6,T82C7",
    7,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250809_T1_103",
    "2025-08-09",
    "1",
    "1",
    "T1C1,T1C2,T1C3",
    3,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250809_T83_104",
    "2025-08-09",
    "83",
    "83",
    "T83C1,T83C2,T83C3,T83C4,T83C5,T83C6,T83C7,T83C8",
    8,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250809_T84_105",
    "2025-08-09",
    "84",
    "84",
    "T84C1,T84C2,T84C3,T84C4,T84C5,T84C6,T84C7,T84C8",
    8,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250810_T29_106",
    "2025-08-10",
    "29",
    "29",
    "T29C1,T29C2,T29C3",
    3,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250812_T2_107",
    "2025-08-12",
    "2",
    "2",
    "T2C1,T2C2,T2C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250812_T3_108",
    "2025-08-12",
    "3",
    "3",
    "T3C1,T3C2,T3C3,T3C4,T3C5",
    5,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250814_T4_109",
    "2025-08-14",
    "4",
    "4",
    "T4C1,T4C2,T4C3,T4C4,T4C5,T4C6,T4C7",
    7,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250815_T5_110",
    "2025-08-15",
    "5",
    "5",
    "T5C1,T5C2,T5C3,T5C4,T5C5,T5C6",
    6,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250815_T6_111",
    "2025-08-15",
    "6",
    "6",
    "T6C1,T6C2,T6C3,T6C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250816_T7_112",
    "2025-08-16",
    "7",
    "7",
    "T7C1,T7C2,T7C3,T7C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250816_T8_113",
    "2025-08-16",
    "8",
    "8",
    "T8C1,T8C2,T8C3,T8C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250816_T9_114",
    "2025-08-16",
    "9",
    "9",
    "T9C1,T9C2,T9C3,T9C4,T9C5,T9C6",
    6,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250819_T12_115",
    "2025-08-19",
    "12",
    "12",
    "T12C1,T12C2,T12C3,T12C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250819_T13_116",
    "2025-08-19",
    "13",
    "13",
    "T13C1,T13C2,T13C3,T13C4",
    4,
    "César Pineda",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250819_T14_117",
    "2025-08-19",
    "14",
    "14",
    "T14C1,T14C2,T14C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250820_T15_118",
    "2025-08-20",
    "15",
    "15",
    "T15C1,T15C2,T15C3,T15C4,T15C5,T15C6",
    6,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250822_T16_119",
    "2025-08-22",
    "16",
    "16",
    "T16C1,T16C2,T16C3,T16C4",
    4,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250822_T17_120",
    "2025-08-22",
    "17",
    "17",
    "T17C1,T17C2,T17C3,T17C4",
    4,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250823_T19_121",
    "2025-08-23",
    "19",
    "19",
    "T19C1,T19C2,T19C3,T19C4",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250823_T28_122",
    "2025-08-23",
    "28",
    "28",
    "T28C1,T28C2",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250827_T30_123",
    "2025-08-27",
    "30",
    "30",
    "T30C1,T30C2,T30C3,T30C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250827_T31_124",
    "2025-08-27",
    "31",
    "31",
    "T31C1",
    3,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250827_T38_125",
    "2025-08-27",
    "38",
    "38",
    "T38C1,T38C2,T38C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250828_T31_126",
    "2025-08-28",
    "31",
    "31",
    "T31C2,T31C3",
    3,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250828_T32_127",
    "2025-08-28",
    "32",
    "32",
    "T32C1,T32C2,T32C3,T32C4",
    4,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250828_T33_128",
    "2025-08-28",
    "33",
    "33",
    "T33C1,T33C2",
    4,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250829_T35_129",
    "2025-08-29",
    "35",
    "35",
    "T35C1,T35C2",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250830_T28_130",
    "2025-08-30",
    "28",
    "28",
    "T28C3,T28C4",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250830_T33_131",
    "2025-08-30",
    "33",
    "33",
    "T33C3,T33C4",
    4,
    "Oscar Hernández",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250830_T34_132",
    "2025-08-30",
    "34",
    "34",
    "T34C1,T34C2,T34C3,T34C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250830_T35_133",
    "2025-08-30",
    "35",
    "35",
    "T35C3,T35C4",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20250831_T36_134",
    "2025-08-31",
    "36",
    "36",
    "T36C1,T36C2,T36C3",
    3,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260708_T2_135",
    "2026-07-08",
    "2",
    "2",
    "T2C1",
    3,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260710_T1_136",
    "2026-07-10",
    "1",
    "1",
    "T1C1,T1C2,T1C3",
    3,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260710_T2_137",
    "2026-07-10",
    "2",
    "2",
    "T2C2,T2C3",
    3,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260711_T3_138",
    "2026-07-11",
    "3",
    "3",
    "T3C1,T3C2,T3C3,T3C4,T3C5",
    5,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260712_T4_139",
    "2026-07-12",
    "4",
    "4",
    "T4C1,T4C2,T4C3,T4C4,T4C5,T4C6,T4C7",
    7,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260712_T5_140",
    "2026-07-12",
    "5",
    "5",
    "T5C1,T5C2,T5C3,T5C4,T5C5,T5C6",
    6,
    "Ricardo Salinas",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260712_T6_141",
    "2026-07-12",
    "6",
    "6",
    "T6C1,T6C2,T6C3,T6C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260714_T7_142",
    "2026-07-14",
    "7",
    "7",
    "T7C1,T7C2,T7C3,T7C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260714_T8_143",
    "2026-07-14",
    "8",
    "8",
    "T8C1,T8C2",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260716_T8_144",
    "2026-07-16",
    "8",
    "8",
    "T8C3,T8C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260716_T9_145",
    "2026-07-16",
    "9",
    "9",
    "T9C1,T9C2,T9C3,T9C4,T9C5,T9C6",
    6,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260716_T10_146",
    "2026-07-16",
    "10",
    "10",
    "T10C1,T10C2",
    4,
    "Jaciel Barrios",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260717_T10_147",
    "2026-07-17",
    "10",
    "10",
    "T10C3,T10C4",
    4,
    "Jaciel Barrios",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260718_T11_148",
    "2026-07-18",
    "11",
    "11",
    "T11C1,T11C2,T11C3,T11C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260718_T12_149",
    "2026-07-18",
    "12",
    "12",
    "T12C1,T12C2,T12C3,T12C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260719_T13_150",
    "2026-07-19",
    "13",
    "13",
    "T13C1,T13C2,T13C3,T13C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260721_T14_151",
    "2026-07-21",
    "14",
    "14",
    "T14C1,T14C2,T14C3",
    3,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260721_T15_152",
    "2026-07-21",
    "15",
    "15",
    "T15C1,T15C2,T15C3,T15C4,T15C5,T15C6",
    6,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260721_T16_153",
    "2026-07-21",
    "16",
    "16",
    "T16C1,T16C2",
    4,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260723_T16_154",
    "2026-07-23",
    "16",
    "16",
    "T16C3,T16C4",
    4,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260723_T17_155",
    "2026-07-23",
    "17",
    "17",
    "T17C1,T17C2",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260724_T17_156",
    "2026-07-24",
    "17",
    "17",
    "T17C3,T17C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260724_T18_157",
    "2026-07-24",
    "18",
    "18",
    "T18C1,T18C2",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260725_T18_158",
    "2026-07-25",
    "18",
    "18",
    "T18C3,T18C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260725_T19_159",
    "2026-07-25",
    "19",
    "19",
    "T19C1,T19C2,T19C3,T19C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260726_T20_160",
    "2026-07-26",
    "20",
    "20",
    "T20C1,T20C2,T20C3,T20C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260726_T21_161",
    "2026-07-26",
    "21",
    "21",
    "T21C1,T21C2,T21C3,T21C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260730_T22_162",
    "2026-07-30",
    "22",
    "22",
    "T22C1,T22C2,T22C3,T22C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260730_T23_163",
    "2026-07-30",
    "23",
    "23",
    "T23C1,T23C2,T23C3,T23C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260730_T24_164",
    "2026-07-30",
    "24",
    "24",
    "T24C1,T24C2,T24C3",
    3,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260731_T25_165",
    "2026-07-31",
    "25",
    "25",
    "T25C1,T25C2,T25C3,T25C4",
    4,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260801_T26_166",
    "2026-08-01",
    "26",
    "26",
    "T26C1,T26C2,T26C3,T26C4",
    4,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260801_T27_167",
    "2026-08-01",
    "27",
    "27",
    "T27C1,T27C2,T27C3,T27C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260802_T29_168",
    "2026-08-02",
    "29",
    "29",
    "T29C1,T29C2,T29C3",
    3,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260804_T28_169",
    "2026-08-04",
    "28",
    "28",
    "T28C1,T28C2,T28C3,T28C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260806_T30_170",
    "2026-08-06",
    "30",
    "30",
    "T30C1,T30C2,T30C3,T30C4",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260807_T31_171",
    "2026-08-07",
    "31",
    "31",
    "T31C1,T31C2,T31C3",
    3,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260807_T32_172",
    "2026-08-07",
    "32",
    "32",
    "T32C1,T32C2,T32C3,T32C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260808_T33_173",
    "2026-08-08",
    "33",
    "33",
    "T33C1,T33C2,T33C3,T33C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260809_T34_174",
    "2026-08-09",
    "34",
    "34",
    "T34C1,T34C2,T34C3,T34C4",
    4,
    "Heber Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260809_T35_175",
    "2026-08-09",
    "35",
    "35",
    "T35C1,T35C2,T35C3,T35C4",
    4,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260809_T36_176",
    "2026-08-09",
    "36",
    "36",
    "T36C1,T36C2,T36C3",
    3,
    "Félix Acuña",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260811_T37_177",
    "2026-08-11",
    "37",
    "37",
    "T37C1,T37C2,T37C3,T37C4,T37C5",
    5,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260813_T38_178",
    "2026-08-13",
    "38",
    "38",
    "T38C1,T38C2,T38C3",
    3,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260813_T39_179",
    "2026-08-13",
    "39",
    "39",
    "T39C1,T39C2,T39C3,T39C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260814_T40_180",
    "2026-08-14",
    "40",
    "40",
    "T40C1,T40C2,T40C3,T40C4,T40C5,T40C6,T40C7",
    7,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260815_T41_181",
    "2026-08-15",
    "41",
    "41",
    "T41C1,T41C2,T41C3,T41C4,T41C5,T41C6",
    6,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260815_T42_182",
    "2026-08-15",
    "42",
    "42",
    "T42C1,T42C2,T42C3,T42C4",
    4,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260816_T43_183",
    "2026-08-16",
    "43",
    "43",
    "T43C1,T43C2,T43C3,T43C4",
    4,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260816_T44_184",
    "2026-08-16",
    "44",
    "44",
    "T44C1,T44C2,T44C3,T44C4,T44C5",
    5,
    "Ricardo Salinas",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260816_T45_185",
    "2026-08-16",
    "45",
    "45",
    "T45C1,T45C2,T45C3,T45C4,T45C5",
    5,
    "Alfredo Dávila",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260818_T46_186",
    "2026-08-18",
    "46",
    "46",
    "T46C1,T46C2,T46C3,T46C4",
    4,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260818_T47_187",
    "2026-08-18",
    "47",
    "47",
    "T47C1,T47C2,T47C3",
    3,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260818_T48_188",
    "2026-08-18",
    "48",
    "48",
    "T48C1,T48C2,T48C3,T48C4,T48C5",
    5,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260818_T49_189",
    "2026-08-18",
    "49",
    "49",
    "T49C1,T49C2,T49C3,T49C4,T49C5",
    5,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260820_T51_190",
    "2026-08-20",
    "51",
    "51",
    "T51C1,T51C2,T51C3,T51C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260820_T52_191",
    "2026-08-20",
    "52",
    "52",
    "T52C1,T52C2,T52C3,T52C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260821_T53_192",
    "2026-08-21",
    "53",
    "53",
    "T53C1,T53C2,T53C3",
    3,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260821_T54_193",
    "2026-08-21",
    "54",
    "54",
    "T54C1,T54C2,T54C3",
    3,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260822_T56_194",
    "2026-08-22",
    "56",
    "56",
    "T56C1,T56C2,T56C3,T56C4,T56C5",
    5,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260823_T55_195",
    "2026-08-23",
    "55",
    "55",
    "T55C1,T55C2,T55C3",
    3,
    "Fernando García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260823_T57_196",
    "2026-08-23",
    "57",
    "57",
    "T57C1,T57C2,T57C3,T57C4,T57C5,T57C6",
    6,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260827_T58_197",
    "2026-08-27",
    "58",
    "58",
    "T58C1,T58C2,T58C3,T58C4,T58C5,T58C6,T58C7,T58C8",
    8,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260828_T59_198",
    "2026-08-28",
    "59",
    "59",
    "T59C1,T59C2,T59C3,T59C4,T59C5,T59C6",
    6,
    "Moisés García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260829_T60_199",
    "2026-08-29",
    "60",
    "60",
    "T60C1,T60C2,T60C3,T60C4,T60C5,T60C6",
    6,
    "Edgar Rodríguez",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260829_T61_200",
    "2026-08-29",
    "61",
    "61",
    "T61C1,T61C2,T61C3,T61C4,T61C5",
    5,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260830_T62_201",
    "2026-08-30",
    "62",
    "62",
    "T62C1,T62C2,T62C3,T62C4,T62C5,T62C6",
    6,
    "Josué Ramos",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260830_T63_202",
    "2026-08-30",
    "63",
    "63",
    "T63C1,T63C2,T63C3,T63C4,T63C5,T63C6",
    6,
    "René Molina",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260901_T66_203",
    "2026-09-01",
    "66",
    "66",
    "T66C1,T66C2,T66C3,T66C4,T66C5",
    5,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260901_T67_204",
    "2026-09-01",
    "67",
    "67",
    "T67C1,T67C2,T67C3,T67C4",
    4,
    "Merari Rosales",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260903_T68_205",
    "2026-09-03",
    "68",
    "68",
    "T68C1,T68C2,T68C3,T68C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260903_T69_206",
    "2026-09-03",
    "69",
    "69",
    "T69C1,T69C2,T69C3,T69C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260903_T70_207",
    "2026-09-03",
    "70",
    "70",
    "T70C1,T70C2,T70C3,T70C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260904_T71_208",
    "2026-09-04",
    "71",
    "71",
    "T71C1,T71C2,T71C3,T71C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260905_T72_209",
    "2026-09-05",
    "72",
    "72",
    "T72C1,T72C2,T72C3,T72C4,T72C5,T72C6",
    6,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260906_T73_210",
    "2026-09-06",
    "73",
    "73",
    "T73C1,T73C2,T73C3,T73C4",
    4,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260906_T74_211",
    "2026-09-06",
    "74",
    "74",
    "T74C1,T74C2,T74C3,T74C4",
    4,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260908_T75_212",
    "2026-09-08",
    "75",
    "75",
    "T75C1,T75C2,T75C3,T75C4",
    4,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260908_T77_213",
    "2026-09-08",
    "77",
    "77",
    "T77C1,T77C2,T77C3,T77C4,T77C5,T77C6",
    6,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260908_T78_214",
    "2026-09-08",
    "78",
    "78",
    "T78C1,T78C2,T78C3,T78C4,T78C5,T78C6",
    6,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260910_T76_215",
    "2026-09-10",
    "76",
    "76",
    "T76C1,T76C2,T76C3,T76C4",
    4,
    "Alex García",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260910_T79_216",
    "2026-09-10",
    "79",
    "79",
    "T79C1,T79C2,T79C3,T79C4,T79C5,T79C6,T79C7,T79C8",
    8,
    "Rinat Reséndiz",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260911_T80_217",
    "2026-09-11",
    "80",
    "80",
    "T80C1,T80C2,T80C3,T80C4,T80C5,T80C6,T80C7,T80C8",
    8,
    "Diego Cerecedo",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260912_T81_218",
    "2026-09-12",
    "81",
    "81",
    "T81C1,T81C2,T81C3,T81C4,T81C5,T81C6",
    6,
    "Rinat Reséndiz",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260912_T83_219",
    "2026-09-12",
    "83",
    "83",
    "T83C1,T83C2,T83C3,T83C4,T83C5,T83C6,T83C7,T83C8",
    8,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260912_T84_220",
    "2026-09-12",
    "84",
    "84",
    "T84C1,T84C2,T84C3,T84C4,T84C5,T84C6,T84C7,T84C8",
    8,
    "Luis Gardea",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "hist_20260916_T82_221",
    "2026-09-16",
    "82",
    "82",
    "T82C1,T82C2,T82C3,T82C4,T82C5,T82C6,T82C7",
    7,
    "Daniel López",
    "NO",
    "APROBADO",
    "27/10/2026 18:00:00"
  ],
  [
    "rep_1793139542557",
    "2026-10-25",
    "42",
    "42",
    "T42C1,T42C2",
    4,
    "Jesús Alba",
    "NO",
    "APROBADO",
    "27/10/2026 16:19:03"
  ],
  [
    "rep_1793139576404",
    "2026-10-27",
    "44",
    "44",
    "T44C1,T44C2,T44C3,T44C4,T44C5",
    5,
    "Jair Barraza",
    "NO",
    "APROBADO",
    "27/10/2026 16:19:37"
  ]
];

  sheetCuadras.getRange(2, 1, datosCompletos.length, 10).setValues(datosCompletos);
  reconstruirHojaS13(ss);
  Logger.log("Migración completada con éxito: " + datosCompletos.length + " filas cargadas y S-13 reconstruido.");
}
