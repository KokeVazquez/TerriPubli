// =============================
// === Territorio 4 ===
// =============================

var datosTerritorio4 = {
    id: "territorio4",
    numeroTerritorio: 4, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio4",
            coords: [
                [28.617191, -106.077782], [28.616763, -106.078088], [28.616450, -106.077525], [28.616848, -106.077211]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/cogKYLGuzEv1vBY4A"
        },
        {
            id: "Cuadra2_Territorio4",
            coords: [
                [28.616817, -106.077155], [28.616422, -106.077475], [28.616230, -106.077110], [28.616633, -106.076837]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/zkoH5U2o6iLe5yYh8"
        },
        {
            id: "Cancha",
            coords: [
                [28.616742, -106.078103], [28.616520, -106.078262], [28.616402, -106.078258], [28.616341, -106.078242], [28.616192, -106.078164], [28.616027, -106.077882], [28.616435, -106.077548]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Cancha de futbol",
            link: "https://maps.app.goo.gl/XbgbdJxgHwsUHuK4A"
        },
        {
            id: "Cuadra3_Territorio4",
            coords: [
                [28.618097, -106.077117], [28.617237, -106.077752], [28.616969, -106.077305], [28.617852, -106.076688]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/RVxtU3N4715CN7z9A"
        },
        {
            id: "Cuadra4_Territorio4",
            coords: [
                [28.617824, -106.076632], [28.616937, -106.077251], [28.616681, -106.076802], [28.617549, -106.076158]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/mx2fi7i9jkAQwxXL9"
        },
        {
            id: "Cuadra5_Territorio4",
            coords: [
                [28.618661, -106.076687], [28.618147, -106.077078], [28.617584, -106.076116], [28.617850, -106.075926], [28.618121, -106.075732]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/s5V1LwLnL8MrHZdi8"
        },
        {
            id: "Cuadra6_Territorio4",
            coords: [
                [28.619113, -106.076384], [28.618708, -106.076657], [28.618162, -106.075706], [28.618565, -106.075411]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/NMfXWYbfFq5UExkt6"
        },
        {
            id: "Cuadra7_Territorio4",
            coords: [
                [28.619551, -106.076072], [28.619160, -106.076360], [28.618608, -106.075382], [28.618990, -106.075107]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/zeyVS5a7U2VAu61K7"
        }


    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio4Data = crearTerritorio(datosTerritorio4);
var territorio4 = territorio4Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio4.poligonos.find(p => p.id === "Cuadra5_Territorio4");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio4 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio4.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio4._marcadorTerritorio = marcadorTerritorio4;
