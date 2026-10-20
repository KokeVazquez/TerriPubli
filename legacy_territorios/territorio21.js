// =============================
// === Territorio 21 ===
// =============================

var datosTerritorio21 = {
    id: "territorio21",
    numeroTerritorio: 21, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio21",
            coords: [
                [[28.615826, -106.075403], [28.615780, -106.075326], [28.614909, -106.075928], [28.615169, -106.076401], [28.615803, -106.075942]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/YbVHYGfLS7JY5RHz7"
        },
        {
            id: "Cuadra2_Territorio21",
            coords: [
                [[28.615758, -106.075279], [28.615501, -106.074809], [28.615060, -106.075117], [28.614628, -106.075436], [28.614888, -106.075887]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/MTybsw8kmsGngqVUA"
        },
        {
            id: "Cuadra3_Territorio21",
            coords: [
                [[28.615473, -106.074765], [28.615047, -106.075062], [28.614506, -106.074119], [28.614939, -106.073805]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/64hTLdZVThKKHBX27"
        },
        {
            id: "Cuadra4_Territorio21",
            coords: [
                [[28.615010, -106.075089], [28.614602, -106.075392], [28.614056, -106.074442], [28.614467, -106.074149]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/d9aaXW5VW14UvbWRA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio21Data = crearTerritorio(datosTerritorio21);
var territorio21 = territorio21Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio21.poligonos.find(p => p.id === "Cuadra2_Territorio21");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio21 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio21.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio21._marcadorTerritorio = marcadorTerritorio21;
