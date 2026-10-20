// =============================
// === Territorio 18 ===
// =============================

var datosTerritorio18 = {
    id: "territorio18",
    numeroTerritorio: 18, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio18",
            coords: [
                [[28.612560, -106.069647], [28.612005, -106.068675], [28.611157, -106.069301], [28.611728, -106.070261]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/2sWnrVSAyitk9Umg9"
        },
        {
            id: "Cuadra2_Territorio18",
            coords: [
                [[28.611970, -106.068631], [28.611694, -106.068174], [28.610848, -106.068792], [28.611121, -106.069242]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/YbwpYfRzFnseRZq99"
        },
        {
            id: "Cuadra3_Territorio18",
            coords: [
                [[28.611658, -106.068119], [28.611405, -106.067677], [28.610563, -106.068286], [28.610815, -106.068734]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/zGFvXokM3zGXE9zE7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio18Data = crearTerritorio(datosTerritorio18);
var territorio18 = territorio18Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio18.poligonos.find(p => p.id === "Cuadra2_Territorio18");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio18 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio18.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio18._marcadorTerritorio = marcadorTerritorio18;
