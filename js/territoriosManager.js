// ==============================================================================================================================
// === TERRITORIOS MANAGER ===
// === Carga e inicialización unificada de los 84 territorios + Territorio Negocios + Área Grande ===
// ==============================================================================================================================

function inicializarTerritorios() {
  window.todosLosTerritorios = [];

  // 1. Configuración de Área Grande (se añade PRIMERO al mapa, en el fondo, con interactive: false)
  window.coordsAreaGrande = [
    [
      [28.619592, -106.076083], [28.613786, -106.087224], [28.613294, -106.086948],
      [28.603879, -106.070252], [28.604307, -106.069842], [28.606604, -106.068186],
      [28.602797, -106.061517], [28.602907, -106.061502], [28.602729, -106.059883],
      [28.603298, -106.059793], [28.603213, -106.059152], [28.604759, -106.059034],
      [28.604734, -106.058542], [28.604425, -106.058218], [28.604380, -106.058270],
      [28.604022, -106.057840], [28.604358, -106.057487], [28.603787, -106.056669],
      [28.602934, -106.057833], [28.601852, -106.056603], [28.601943, -106.053903],
      [28.603117, -106.052673], [28.610249, -106.060911], [28.610631, -106.060476],
      [28.611093, -106.061061], [28.612098, -106.062688]
    ]
  ];

  window.mundo = [[[-85, -179.9], [-85, 179.9], [85, 179.9], [85, -179.9]], window.coordsAreaGrande];
  L.polygon(window.mundo, { color: "gray", weight: 5, fillOpacity: 0.8, interactive: false }).addTo(map);

  window.areaGrande = L.polygon(window.coordsAreaGrande, {
    color: "black", weight: 4, dashArray: "5,5", fillOpacity: 0.05, interactive: false
  }).addTo(map);

  if (!window.TERRITORIOS_DATA || !Array.isArray(window.TERRITORIOS_DATA)) {
    console.error("No se encontraron los datos de territorios en window.TERRITORIOS_DATA");
    return;
  }

  // 2. Inicializar cada territorio (quedan POR ENCIMA del área grande en el mapa)
  window.TERRITORIOS_DATA.forEach(item => {
    const datos = item.datos;

    // Crear grupo de polígonos usando la función base
    const resultado = crearTerritorio(datos);
    const grupo = resultado.grupo;

    // Guardar referencia en variables globales para máxima compatibilidad
    window[datos.id] = grupo;
    window[item.varName] = datos;

    // Calcular el centro geométrico real de TODO el territorio combinado
    if (grupo.getLayers().length > 0) {
      const centro = grupo.getBounds().getCenter();
      const marcador = L.marker(centro, {
        icon: L.divIcon({
          className: "etiquetaTerritorio",
          html: `<span>${datos.numeroTerritorio !== undefined ? datos.numeroTerritorio : ""}</span>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      }).addTo(map);

      // Guardar referencia del marcador dentro del grupo y en variable global
      grupo._marcadorTerritorio = marcador;
      const capitalId = datos.id.charAt(0).toUpperCase() + datos.id.slice(1);
      window["marcador" + capitalId] = marcador;
    }
  });
}
