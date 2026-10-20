// =============================
// === Territorio 39 ===
// =============================

var datosTerritorio39 = {
    id: "territorio39",
    numeroTerritorio: 39, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio39",
            coords: [
                [[28.610971, -106.073661], [28.610540, -106.073986], [28.610093, -106.074289], [28.609837, -106.073843], [28.610707, -106.073197]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/1x3R27shFDjgSdct6"
        },
        {
            id: "Cuadra2_Territorio39",
            coords: [
                [[28.610681, -106.073152], [28.609810, -106.073797], [28.609561, -106.073339], [28.610415, -106.072694]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/q9e1rNAJ8kKYawtw5"
        },
        {
            id: "Cuadra3_Territorio39",
            coords: [
                [[28.610377, -106.072627], [28.609520, -106.073274], [28.609266, -106.072824], [28.610126, -106.072186]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/XcbDQ7F3i2wi1CJ37"
        },
        {
            id: "Cuadra4_Territorio39",
            coords: [
                [[28.610100, -106.072141], [28.609843, -106.071695], [28.608983, -106.072342], [28.609238, -106.072779]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/XcbDQ7F3i2wi1CJ37"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio39Data = crearTerritorio(datosTerritorio39);
var territorio39 = territorio39Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio39.poligonos.find(p => p.id === "Cuadra3_Territorio39");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio39 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio39.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio39._marcadorTerritorio = marcadorTerritorio39;
