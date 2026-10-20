// =============================
// === Territorio 32 ===
// =============================

var datosTerritorio32 = {
    id: "territorio32",
    numeroTerritorio: 32, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio32",
            coords: [
                [[28.613544, -106.077098], [28.613755, -106.077425], [28.613550, -106.077577], [28.613349, -106.077719], [28.612782, -106.076763], [28.613205, -106.076475]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/FfsLngofmtwfG3kd9"
        },
        {
            id: "Cuadra2_Territorio32",
            coords: [
                [[28.614224, -106.077086], [28.614031, -106.076752], [28.613590, -106.077075], [28.613800, -106.077399]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/WpXtA25BYJgREfqZ8"
        },
        {
            id: "Cuadra3_Territorio32",
            coords: [
                [[28.613955, -106.076602], [28.614017, -106.076723], [28.613572, -106.077046], [28.613243, -106.076447], [28.613675, -106.076144]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/zttFaAcDYmfyhyhg6"
        },
        {
            id: "Cuadra4_Territorio32",
            coords: [
                [[28.613648, -106.076100], [28.613220, -106.076404], [28.612699, -106.075434], [28.613123, -106.075131]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/k2PMGpMMmkfQ7Hrn6"
        },
        {
            id: "Cuadra5_Territorio32",
            coords: [
                [[28.613180, -106.076433], [28.612761, -106.076717], [28.612230, -106.075765], [28.612660, -106.075465]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/W9ufeFkZqiJqHtre8"
        },
        {
            id: "Cuadra6_Territorio32",
            coords: [
                [[28.613097, -106.075082], [28.612203, -106.075716], [28.611932, -106.075236], [28.612815, -106.074581]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/vqXdqEjQ235MERnR7"
        },
        {
            id: "Cuadra7_Territorio32",
            coords: [
                [[28.612787, -106.074538], [28.612519, -106.074071], [28.611614, -106.074725], [28.611905, -106.075191]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/WgRrs5eoZkzHCtLZ8"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio32Data = crearTerritorio(datosTerritorio32);
var territorio32 = territorio32Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio32.poligonos.find(p => p.id === "Cuadra4_Territorio32");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio32 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio32.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio32._marcadorTerritorio = marcadorTerritorio32;
