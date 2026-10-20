// =============================
// === Territorio 5 ===
// =============================

var datosTerritorio5 = {
    id: "territorio5",
    numeroTerritorio: 5, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio5",
            coords: [
                [28.616595, -106.076780], [28.616299, -106.076991], [28.616360, -106.076328]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/bgVVtgHjBFC9g9ri8"
        },
        {
            id: "Cuadra2_Territorio5",
            coords: [
                [[28.617515, -106.076104], [28.616650, -106.076742], [28.616410, -106.076288], [28.617257, -106.075659]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/c4khq8kbvsoNuAgy9"
        },
        {
            id: "Cuadra3_Territorio5",
            coords: [
                [[28.617223, -106.075597], [28.616379, -106.076219], [28.616200, -106.075735], [28.616990, -106.075185]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/n4fWysVB3jmvV6jZA"
        },
        {
            id: "Cuadra4_Territorio5",
            coords: [
                [[28.618085, -106.075691], [28.617565, -106.076064], [28.617040, -106.075144], [28.617570, -106.074757]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/DhnEKwEWf5FCyXaBA"
        },
        {
            id: "Cuadra5_Territorio5",
            coords: [
                [[28.618955, -106.075051], [28.618137, -106.075654], [28.617878, -106.075189], [28.618698, -106.074603]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/ATzYutQTVsZN338C9"
        },
        {
            id: "Cuadra6_Territorio5",
            coords: [
                [[28.618661, -106.074544], [28.617846, -106.075131], [28.617621, -106.074721], [28.618426, -106.074123]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/6pxZxWi8MzrZBvrh9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio5Data = crearTerritorio(datosTerritorio5);
var territorio5 = territorio5Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio5.poligonos.find(p => p.id === "Cuadra4_Territorio5");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio5 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio5.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio5._marcadorTerritorio = marcadorTerritorio5;
