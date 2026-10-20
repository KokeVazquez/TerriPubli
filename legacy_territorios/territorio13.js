// =============================
// === Territorio 13 ===
// =============================

var datosTerritorio13 = {
    id: "territorio13",
    numeroTerritorio: 13, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio13",
            coords: [
                [[28.612523, -106.068224], [28.612021, -106.068598], [28.611741, -106.068138], [28.612148, -106.067866]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/z3qQUvo9EYZUEJt67"
        },
        {
            id: "Cuadra1_Territorio13",
            coords: [
                [[28.612120, -106.067802], [28.611712, -106.068085], [28.611456, -106.067640]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/3nFTWbMxVazLDN189"
        },
        {
            id: "Cuadra1_Territorio13",
            coords: [
                [[28.612617, -106.068155], [28.612885, -106.067961], [28.612326, -106.066996], [28.611662, -106.067491], [28.612223, -106.067714]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/6yPHxxuPfXdfaPVy5"
        },
        {
            id: "Cuadra2_Territorio13",
            coords: [
                [[28.613512, -106.067491], [28.612934, -106.067926], [28.612373, -106.066956], [28.612949, -106.066525]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/gCntUNgbYnLpKMw28"
        },
        {
            id: "Cuadra3_Territorio13",
            coords: [
                [[28.614380, -106.066878], [28.614126, -106.066419], [28.613292, -106.066989], [28.613561, -106.067459]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/wm1RBdfQZ6FaaSwXA"
        },
        {
            id: "Cuadra4_Territorio13",
            coords: [
                [[28.614090, -106.066361], [28.613826, -106.065900], [28.613002, -106.066493], [28.613270, -106.066935]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/fPHXVeBwWDBeBRdd7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio13Data = crearTerritorio(datosTerritorio13);
var territorio13 = territorio13Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio13.poligonos.find(p => p.id === "Cuadra2_Territorio13");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio13 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio13.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio13._marcadorTerritorio = marcadorTerritorio13;
