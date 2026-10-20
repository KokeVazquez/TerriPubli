// =============================
// === Territorio 37 ===
// =============================

var datosTerritorio37 = {
    id: "territorio37",
    numeroTerritorio: 37, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio37",
            coords: [
                [[28.612810, -106.078098], [28.612459, -106.078355], [28.611904, -106.077428], [28.612276, -106.077154]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/y3M8YpNQ8FfvVgCGA"
        },
        {
            id: "Cuadra2_Territorio37",
            coords: [
                [[28.613292, -106.077742], [28.612868, -106.078058], [28.612319, -106.077109], [28.612746, -106.076790]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/dqSoNrzCYDpiTXYh8"
        },
        {
            id: "Cuadra3_Territorio37",
            coords: [
                [[28.612706, -106.076743], [28.611867, -106.077363], [28.611639, -106.076936], [28.612462, -106.076303]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/zXG2S8cuUz8ewSgR9"
        },
        {
            id: "Cuadra4_Territorio37",
            coords: [
                [[28.612425, -106.076237], [28.611598, -106.076871], [28.611346, -106.076428], [28.612187, -106.075808]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/HRHk2QmstbtKXMu27"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio37Data = crearTerritorio(datosTerritorio37);
var territorio37 = territorio37Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio37.poligonos.find(p => p.id === "Cuadra3_Territorio37");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio37 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio37.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio37._marcadorTerritorio = marcadorTerritorio37;
