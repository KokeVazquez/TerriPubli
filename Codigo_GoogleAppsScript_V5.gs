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
  ["Jorge Vázquez", "Administrador / Auxiliar", "SÍ", "8318"],
  ["Merari Rosales", "Administrador / Capitán", "SÍ", "8318"],
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

    if (action === "nuevos_reportes" || action === "reportes_lote") {
      var listaReps = data.reportes || [];
      if (Array.isArray(listaReps) && listaReps.length > 0) {
        var nuevasFilas = [];
        var startRow = sheetCuadras.getLastRow() + 1;
        for (var r = 0; r < listaReps.length; r++) {
          var repL = listaReps[r];
          var numTL = normalizarNumeroTerritorio(repL.territorioId, repL.territorioNumero);
          var cCortasL = normalizarListaCuadrasCorto(repL.cuadras, numTL);
          var totCL = Number(repL.totalCuadrasTerritorio || repL.totalCuadras || CUADRAS_MAP[numTL] || cCortasL.length || 0);
          var fechaL = formatearFecha(repL.fecha).replace(/-/g, "").slice(0, 8);
          var repIdL = String(repL.id || "").trim().replace(/^(hist_|rep_)/, "");
          if (!repIdL || repIdL.indexOf("_T") === -1) {
            repIdL = fechaL + "_T" + numTL + "_" + (startRow + r - 1);
          }
          nuevasFilas.push([
            repIdL,
            String(repL.fecha),
            numTL,
            numTL,
            cCortasL.join(","),
            totCL,
            String(repL.capitan || ""),
            repL.visitaSC ? "SÍ" : "NO",
            "APROBADO",
            formatearFechaHora(new Date())
          ]);
        }
        if (nuevasFilas.length > 0) {
          sheetCuadras.getRange(sheetCuadras.getLastRow() + 1, 1, nuevasFilas.length, nuevasFilas[0].length).setValues(nuevasFilas);
          reconstruirHojaS13(ss);
        }
      }
      return respuestaJSON({ exito: true, status: "success", count: listaReps.length });
    }

    if (action === "nuevo_reporte" || action === "registrarCuadras") {
      var rep = data.reporte || {};
      var numTerr = normalizarNumeroTerritorio(rep.territorioId, rep.territorioNumero);
      var cuadrasCortas = normalizarListaCuadrasCorto(rep.cuadras, numTerr);
      var totalCuadras = Number(rep.totalCuadrasTerritorio || rep.totalCuadras || CUADRAS_MAP[numTerr] || cuadrasCortas.length || 0);

      var fechaL = formatearFecha(rep.fecha).replace(/-/g, "").slice(0, 8);
      var repId = String(rep.id || "").trim().replace(/^(hist_|rep_)/, "");
      if (!repId || repId.indexOf("_T") === -1) {
        repId = fechaL + "_T" + numTerr + "_" + sheetCuadras.getLastRow();
      }

      sheetCuadras.appendRow([
        repId,
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

    if (action === "verificar_acceso" || action === "registrar_usuario") {
      var devId = String(data.dispositivoId || data.id || "").trim();
      var nombreU = String(data.nombre || "").trim();
      var resU = procesarVerificacionUsuario(ss, devId, nombreU);
      return respuestaJSON({ exito: true, permitido: resU.permitido, estado: resU.estado, mensaje: resU.mensaje });
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
    var action = (e && e.parameter && e.parameter.accion) ? e.parameter.accion : "";

    if (action === "verificar_acceso") {
      var devId = String((e.parameter && e.parameter.dispositivoId) || "").trim();
      var sheetU = obtenerOCrearHojaUsuarios(ss);
      var filasU = sheetU.getDataRange().getValues();
      for (var u = 1; u < filasU.length; u++) {
        if (String(filasU[u][0]).trim() === devId) {
          var est = String(filasU[u][4] || "Activo").trim();
          if (est.toLowerCase() === "bloqueado") {
            return respuestaJSON({ exito: true, permitido: false, estado: "Bloqueado", mensaje: "Acceso bloqueado por el encargado de territorios." });
          }
          return respuestaJSON({ exito: true, permitido: true, estado: "Activo" });
        }
      }
      return respuestaJSON({ exito: true, permitido: true, estado: "Activo" });
    }

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

    // Si no tiene asignaciones trabajadas en este año de servicio, no poner fecha previa para no confundir
    if (ciclos.length === 0) continue;

    // Columna B (índice 0 de la matriz): Última fecha en que se completó*
    if (ultimaFechaCompletada) {
      matriz[idxSup][0] = formatearFechaCorta(ultimaFechaCompletada);
    }

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
// GESTIÓN DE ACCESOS Y DISPOSITIVOS DE USUARIOS
// =========================================================================================

function obtenerOCrearHojaUsuarios(ss) {
  var sheet = ss.getSheetByName("Usuarios");
  if (!sheet) {
    sheet = ss.insertSheet("Usuarios");
    sheet.appendRow(["ID Dispositivo", "Nombre", "Fecha de Registro", "Último Acceso", "Estado", "Notas"]);
    sheet.getRange("A1:F1").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 190);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 120);
    sheet.setColumnWidth(6, 200);

    // Validación desplegable: "Activo" o "Bloqueado"
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Activo", "Bloqueado"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange("E2:E500").setDataValidation(rule);
  }
  return sheet;
}

function procesarVerificacionUsuario(ss, devId, nombre) {
  var sheet = obtenerOCrearHojaUsuarios(ss);
  var filas = sheet.getDataRange().getValues();
  var idLimpio = String(devId || "").trim();
  var nombreLimpio = String(nombre || "").trim();
  var ahoraStr = formatearFechaHora(new Date());

  for (var i = 1; i < filas.length; i++) {
    var rowId = String(filas[i][0]).trim();
    if (rowId === idLimpio) {
      var estadoActual = String(filas[i][4] || "Activo").trim();
      sheet.getRange(i + 1, 4).setValue(ahoraStr);
      if (nombreLimpio && nombreLimpio !== "Sin registrar") {
        sheet.getRange(i + 1, 2).setValue(nombreLimpio);
      }
      if (estadoActual.toLowerCase() === "bloqueado") {
        return { permitido: false, estado: "Bloqueado", mensaje: "Acceso bloqueado por el encargado de territorios." };
      }
      return { permitido: true, estado: "Activo" };
    }
  }

  // Si no se proporcionó un nombre válido aún, no crear fila fantasma
  if (!nombreLimpio || nombreLimpio.toLowerCase() === "sin registrar") {
    return { permitido: true, estado: "Activo" };
  }

  // Si es un dispositivo nuevo con nombre, agregarlo como Activo
  sheet.appendRow([idLimpio, nombreLimpio, ahoraStr, ahoraStr, "Activo", ""]);
  return { permitido: true, estado: "Activo" };
}
