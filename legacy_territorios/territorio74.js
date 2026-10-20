// =============================
// === Territorio 74 ===
// =============================

var datosTerritorio74 = {
    id: "territorio74",
    numeroTerritorio: 74, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio74",
            coords: [
                [[28.606625, -106.061579], [28.606345, -106.061245], [28.605997, -106.061664], [28.606063, -106.062181]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/xJutBDCtw3jUfg1K6"
        },
        {
            id: "Cuadra2_Territorio74",
            coords: [
                [[28.606652, -106.061536], [28.606379, -106.061215], [28.607006, -106.060526], [28.607287, -106.060819]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/vGsLZUdriZnCjakX8"
        },
        {
            id: "Cuadra3_Territorio74",
            coords: [
                [[28.607315, -106.060787], [28.607035, -106.060490], [28.607744, -106.059724], [28.607998, -106.060026]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/R6iktq118LgjW4SAA"
        },
        {
            id: "Cuadra4_Territorio74",
            coords: [
                [[28.608040, -106.059980], [28.607785, -106.059670], [28.608469, -106.058924], [28.608714, -106.059230]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/JAyfYDqLDyMjcpcUA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio74Data = crearTerritorio(datosTerritorio74);
var territorio74 = territorio74Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio74.poligonos.find(p => p.id === "Cuadra3_Territorio74");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio74 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio74.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio74._marcadorTerritorio = marcadorTerritorio74;
