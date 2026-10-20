// =============================
// === Territorio 1 ===
// =============================

var datosTerritorio1 = {
  id: "territorio1",
  numeroTerritorio: 1, // Número que se mostrará en el marcador principal
  poligonos: [
    {
      id: "Cuadra1_Territorio1",
      coords: [
        [28.613786, -106.087204], [28.613313, -106.086951], [28.61333, -106.086877], [28.613365, -106.086799],
        [28.613509, -106.086534], [28.613746, -106.086185], [28.613808, -106.08611], [28.614037, -106.085906],
        [28.614046, -106.085894], [28.614066, -106.085949], [28.614106, -106.086005], [28.614181, -106.086075],
        [28.614318, -106.086169]
      ],
      color: "fuchsia",
      fillOpacity: 0.8,
      weight: 2,
      label: "1",
      link: "https://maps.app.goo.gl/3jBZofcfzsqaMbSg8"
    },
    {
      id: "Cuadra2_Territorio1",
      coords: [
        [28.614337, -106.086131], [28.614202, -106.08604], [28.614135, -106.085979], [28.614097, -106.085924],
        [28.614066, -106.085837], [28.614537, -106.084814], [28.614719, -106.084545], [28.615256, -106.083837],
        [28.615439, -106.083972], [28.614807, -106.085195]
      ],
      color: "fuchsia",
      fillOpacity: 0.8,
      weight: 2,
      label: "2",
      link: "https://maps.app.goo.gl/BaLzy98ZWXqad7ED8"
    },
    {
      id: "Cuadra3_Territorio1",
      coords: [
        [28.61546, -106.083936], [28.615282, -106.0838], [28.615525, -106.083402], [28.615715, -106.083038],
        [28.615803, -106.082794], [28.615987, -106.082904]
      ],
      color: "fuchsia",
      fillOpacity: 0.8,
      weight: 2,
      label: "3",
      link: "https://maps.app.goo.gl/DMVPi1x3392ot1DR8"
    },
    {
      id: "Escuela_Territorio1",
      coords: [
        [28.615996, -106.082892], [28.615807, -106.082779], [28.615849, -106.08264], [28.615929, -106.082359],
        [28.615988, -106.082099], [28.616042, -106.081834], [28.616094, -106.081477], [28.617107, -106.080707]
      ],
      color: "rgba(70, 44, 11, 1)",
      fillOpacity: 1.0,
      weight: 2,
      label: "Escuela",
      link: "https://maps.app.goo.gl/h5t4FwYLoA2yHxTc8"
    }
  ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio1Data = crearTerritorio(datosTerritorio1);
var territorio1 = territorio1Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio1.poligonos.find(p => p.id === "Cuadra2_Territorio1");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio1 = L.marker(centro, {
  icon: L.divIcon({
    className: "etiquetaTerritorio",
    html: `<b>${datosTerritorio1.numeroTerritorio}</b>`,
    iconSize: [20, 20]
  })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio1._marcadorTerritorio = marcadorTerritorio1;
