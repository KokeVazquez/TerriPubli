// =============================
// === Territorio 9 ===
// =============================

var datosTerritorio9 = {
    id: "territorio9",
    numeroTerritorio: 9, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio9",
            coords: [
                [[28.614725, -106.072405], [28.614489, -106.071967], [28.614112, -106.072240], [28.614356, -106.072661]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/d5aZPAAc4hkowDMH7"
        },
        {
            id: "Cuadra2_Territorio9",
            coords: [
                [[28.614457, -106.071908], [28.614078, -106.072181], [28.613810, -106.071703], [28.614193, -106.071417]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/Ztre3TEQkZAcZGVD8"
        },
        {
            id: "Cuadra3_Territorio9",
            coords: [
                [[28.615218, -106.072061], [28.614778, -106.072373], [28.614540, -106.071931], [28.614963, -106.071599]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/ZJRzeNWdJY7SrCcc8"
        },
        {
            id: "Cuadra4_Territorio9",
            coords: [
                [[28.614930, -106.071541], [28.614508, -106.071871], [28.614243, -106.071381], [28.614661, -106.071081]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/Z6wkagWecCBbYg7U7"
        },
        {
            id: "Cuadra5_Territorio9",
            coords: [
                [[28.615777, -106.071667], [28.615466, -106.071391], [28.615118, -106.071161], [28.614711, -106.071043], [28.615270, -106.072026]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/TRntndeBDMYJDaUR7"
        },
        {
            id: "Cuadra6_Territorio9",
            coords: [
                [[28.615214, -106.070680], [28.615564, -106.071310], [28.615509, -106.071336], [28.615174, -106.071115], [28.614827, -106.070958]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/w3n5JSH7ZQtHsWv97"
        },
        {
            id: "Cuadra7_Territorio9",
            coords: [
                [[28.616206, -106.071334], [28.615909, -106.071563], [28.615720, -106.071323], [28.615305, -106.070614], [28.615663, -106.070365]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/CBJ4CG1cxYSbwi4WA"
        },
        {
            id: "Cuadra8_Territorio9",
            coords: [
                [[28.616675, -106.070984], [28.616258, -106.071298], [28.615987, -106.070828], [28.616185, -106.070689], [28.616184, -106.070662], [28.616165, -106.070645], [28.616148, -106.070639], [28.616136, -106.070646], [28.615953, -106.070776], [28.615707, -106.070328], [28.616114, -106.070028]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "8",
            link: "https://maps.app.goo.gl/TgMjHjbbuqm4u26S6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio9Data = crearTerritorio(datosTerritorio9);
var territorio9 = territorio9Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio9.poligonos.find(p => p.id === "Cuadra5_Territorio9");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio9 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio9.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio9._marcadorTerritorio = marcadorTerritorio9;
