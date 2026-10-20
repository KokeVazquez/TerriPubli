// =============================
// === Territorio 14 ===
// =============================

var datosTerritorio14 = {
    id: "territorio14",
    numeroTerritorio: 14, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio14",
            coords: [
                [[28.611431, -106.067581], [28.611172, -106.067089], [28.612033, -106.066499], [28.612293, -106.066944]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/P514JYtqgxAc9gQH9"
        },
        {
            id: "Cuadra2_Territorio14",
            coords: [
                [[28.611998, -106.066445], [28.611150, -106.067028], [28.610934, -106.066602], [28.611741, -106.066004]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/Z6hXy4iu7PNkpBAz5"
        },
        {
            id: "Cuadra3_Territorio14",
            coords: [
                [[28.612918, -106.066466], [28.612341, -106.066908], [28.612082, -106.066461], [28.612667, -106.066018]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/nKMeDsG23WKoYveT6"
        },
        {
            id: "Cuadra4_Territorio14",
            coords: [
                [[28.612631, -106.065968], [28.612392, -106.065536], [28.611791, -106.065975], [28.612048, -106.066407]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/pJmZCuHnPou2mGDT9"
        },
        {
            id: "Cuadra5_Territorio14",
            coords: [
                [[28.612967, -106.066432], [28.612714, -106.065990], [28.613523, -106.065383], [28.613791, -106.065842]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/99VyWTXaB5nc3sEL8"
        },
        {
            id: "Cuadra6_Territorio14",
            coords: [
                [[28.613486, -106.065330], [28.613240, -106.064899], [28.612437, -106.065506], [28.612679, -106.065940]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/HBn5rbjp7dSwyFfR7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio14Data = crearTerritorio(datosTerritorio14);
var territorio14 = territorio14Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio14.poligonos.find(p => p.id === "Cuadra5_Territorio14");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio14 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio14.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio14._marcadorTerritorio = marcadorTerritorio14;
