// =============================
// === Territorio 17 ===
// =============================

var datosTerritorio17 = {
    id: "territorio17",
    numeroTerritorio: 17, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio17",
            coords: [
                [[28.611374, -106.067627], [28.610524, -106.068234], [28.610265, -106.067767], [28.611095, -106.067133]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/ZGgtvFyb71EVrTuF9"
        },
        {
            id: "Cuadra2_Territorio17",
            coords: [
                [[28.611067, -106.067095], [28.610237, -106.067722], [28.609972, -106.067277], [28.610826, -106.066656]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/jpaofyRJUGWtnzHD9"
        },
        {
            id: "Cuadra3_Territorio17",
            coords: [
                [[28.610537, -106.066067], [28.610808, -106.066578], [28.609933, -106.067211], [28.609775, -106.066902], [28.609727, -106.066714], [28.609711, -106.066618], [28.609705, -106.066470], [28.609743, -106.066204], [28.609786, -106.066061], [28.609899, -106.065848], [28.610260, -106.065573]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/JeyXT7JvvKmNwGdi6"
        },
        {
            id: "Vacio",
            coords: [
                [[28.610238, -106.065527], [28.610166, -106.065403], [28.609955, -106.065749]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "Vacio",
            link: "https://maps.app.goo.gl/gbbA46G5FLTQ8Zf28"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio17Data = crearTerritorio(datosTerritorio17);
var territorio17 = territorio17Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio17.poligonos.find(p => p.id === "Cuadra2_Territorio17");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio17 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio17.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio17._marcadorTerritorio = marcadorTerritorio17;
