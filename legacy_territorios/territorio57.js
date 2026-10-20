// =============================
// === Territorio 57 ===
// =============================

var datosTerritorio57 = {
    id: "territorio57",
    numeroTerritorio: 57, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio57",
            coords: [
                [[28.606367, -106.071194], [28.605955, -106.071513], [28.605415, -106.070589], [28.605848, -106.070285]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/DC7giDYL5TbpnVgU8"
        },
        {
            id: "Cuadra2_Territorio57",
            coords: [
                [[28.606813, -106.070874], [28.606413, -106.071155], [28.605894, -106.070246], [28.606278, -106.069955]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/cqdU6nAqBw79qYsS7"
        },
        {
            id: "Cuadra3_Territorio57",
            coords: [
                [[28.606249, -106.069891], [28.605857, -106.070195], [28.605317, -106.069217], [28.605688, -106.068940]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/QXcj4KpKmpqm4r4M6"
        },
        {
            id: "Cuadra4_Territorio57",
            coords: [
                [[28.605810, -106.070227], [28.605377, -106.070537], [28.604846, -106.069538], [28.605265, -106.069251]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/aaqpKQi1636EDNuj7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio57Data = crearTerritorio(datosTerritorio57);
var territorio57 = territorio57Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio57.poligonos.find(p => p.id === "Cuadra3_Territorio57");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio57 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio57.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio57._marcadorTerritorio = marcadorTerritorio57;
