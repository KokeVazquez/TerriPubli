// =============================
// === Territorio 66 ===
// =============================

var datosTerritorio66 = {
    id: "territorio66",
    numeroTerritorio: 66, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio66",
            coords: [
                [[28.608671, -106.063989], [28.608699, -106.063961], [28.608961, -106.064257], [28.609117, -106.064427], [28.609179, -106.064497], [28.609253, -106.064573], [28.609312, -106.064597], [28.609259, -106.064691], [28.609207, -106.064762], [28.609174, -106.064791], [28.608663, -106.065173], [28.608393, -106.064770], [28.608327, -106.064688], [28.608181, -106.064532], [28.608289, -106.064396], [28.608404, -106.064267], [28.608642, -106.064023]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/jiznrdvHPqwCQDnA6"
        },
        {
            id: "Cuadra2_Territorio66",
            coords: [
                [[28.609332, -106.064561], [28.609270, -106.064532], [28.608727, -106.063918], [28.609021, -106.063576], [28.609554, -106.064173]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/X57kJNF2YjSvGhyaA"
        },
        {
            id: "Cuadra3_Territorio66",
            coords: [
                [[28.609578, -106.064138], [28.609822, -106.063761], [28.609353, -106.063206], [28.609048, -106.063542]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/9wVL2Rc6SNisxhkK6"
        },
        {
            id: "Cuadra4_Territorio66",
            coords: [
                [[28.610090, -106.063336], [28.609843, -106.063725], [28.609383, -106.063172], [28.609661, -106.062857]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/ShLi5V2rSEy6mx3T6"
        },
        {
            id: "Cuadra5_Territorio66",
            coords: [
                [[28.610113, -106.063296], [28.610447, -106.062752], [28.610605, -106.062546], [28.610288, -106.062168], [28.610146, -106.062313], [28.609996, -106.062473], [28.609691, -106.062826]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/kaXC4p4hGWY1EYFv9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio66Data = crearTerritorio(datosTerritorio66);
var territorio66 = territorio66Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio66.poligonos.find(p => p.id === "Cuadra2_Territorio66");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio66 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio66.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio66._marcadorTerritorio = marcadorTerritorio66;
