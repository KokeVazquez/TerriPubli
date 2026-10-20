// =============================
// === Territorio 65 ===
// =============================

var datosTerritorio65 = {
    id: "territorio65",
    numeroTerritorio: 65, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio65",
            coords: [
                [28.613577, -106.085604], [28.613114, -106.086416], [28.612568, -106.085469], [28.612999, -106.085158], [28.613114, -106.085320], [28.613195, -106.085419], [28.613229, -106.085445], [28.613299, -106.085485]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/yBYbVBiKe2HgV8Lg7"
        },
        {
            id: "Cuadra2_Territorio65",
            coords: [
                [28.613731, -106.085329], [28.613600, -106.085565], [28.613306, -106.085441], [28.613245, -106.085406], [28.613205, -106.085370], [28.613030, -106.085131], [28.613458, -106.084824]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/VxybetE6qLHYPZ2E6"
        },
        {
            id: "Cuadra3_Territorio65",
            coords: [
                [28.613436, -106.084788], [28.613006, -106.085099], [28.612452, -106.084124], [28.612870, -106.083815]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/77unnRjpunTAFYgv9"
        },
        {
            id: "Cuadra4_Territorio65",
            coords: [
                [28.612972, -106.085119], [28.612548, -106.085431], [28.612004, -106.084440], [28.612417, -106.084146]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/uGd4bwj6XjgXBgvj9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio65Data = crearTerritorio(datosTerritorio65);
var territorio65 = territorio65Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio65.poligonos.find(p => p.id === "Cuadra3_Territorio65");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio65 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio65.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio65._marcadorTerritorio = marcadorTerritorio65;
