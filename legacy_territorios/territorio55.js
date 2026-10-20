// =============================
// === Territorio 55 ===
// =============================

var datosTerritorio55 = {
    id: "territorio55",
    numeroTerritorio: 55, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio55",
            coords: [
                [[28.608681, -106.075314], [28.608267, -106.075619], [28.607736, -106.074677], [28.608140, -106.074382]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/Y3x8kLTB98XqEiBK9"
        },
        {
            id: "Cuadra2_Territorio55",
            coords: [
                [[28.609120, -106.074983], [28.608729, -106.075279], [28.608192, -106.074340], [28.608601, -106.074044]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/gBeiTx47C74eE157A"
        },
        {
            id: "Cuadra3_Territorio55",
            coords: [
                [[28.608549, -106.073952], [28.607683, -106.074587], [28.607431, -106.074146], [28.608303, -106.073517]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/4xQ4EvoRGta9eWoYA"
        },
        {
            id: "Cuadra4_Territorio55",
            coords: [
                [[28.608270, -106.073451], [28.607792, -106.073808], [28.607663, -106.073577], [28.607268, -106.073859], [28.607152, -106.073653], [28.608034, -106.073028]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/hhWDMxJDRjEGmyA3A"
        },
        {
            id: "Kinder",
            coords: [
                [[28.607773, -106.073820], [28.607657, -106.073608], [28.607281, -106.073880], [28.607403, -106.074096]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Kinder",
            link: "https://maps.app.goo.gl/BMbaDebhCVoYkWPt6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio55Data = crearTerritorio(datosTerritorio55);
var territorio55 = territorio55Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio55.poligonos.find(p => p.id === "Cuadra3_Territorio55");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio55 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio55.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio55._marcadorTerritorio = marcadorTerritorio55;
