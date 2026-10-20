// =============================
// === Territorio 19 ===
// =============================

var datosTerritorio19 = {
    id: "territorio19",
    numeroTerritorio: 19, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio19",
            coords: [
                [[28.613212, -106.072012], [28.612828, -106.072292], [28.612280, -106.071323], [28.612669, -106.071047]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/JnKWam1tuFJv51Qd8"
        },
        {
            id: "Cuadra2_Territorio19",
            coords: [
                [[28.613386, -106.071067], [28.613723, -106.071658], [28.613250, -106.071981], [28.612705, -106.071019], [28.613169, -106.070711]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/o1mPheyaFMKHZWjaA"
        },
        {
            id: "Cuadra3_Territorio19",
            coords: [
                [[28.613142, -106.070666], [28.612594, -106.069690], [28.611738, -106.070316], [28.612264, -106.071271]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/knUYM1FBW2GY33Ez5"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio19Data = crearTerritorio(datosTerritorio19);
var territorio19 = territorio19Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio19.poligonos.find(p => p.id === "Cuadra2_Territorio19");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio19 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio19.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio19._marcadorTerritorio = marcadorTerritorio19;
