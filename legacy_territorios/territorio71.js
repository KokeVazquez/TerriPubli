// =============================
// === Territorio 71 ===
// =============================

var datosTerritorio71 = {
    id: "territorio71",
    numeroTerritorio: 71, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio71",
            coords: [
                [[28.607490, -106.062568], [28.607234, -106.062298], [28.606252, -106.063370], [28.606676, -106.063545]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/8Df3RTZJXPs1VcnD8"
        },
        {
            id: "Cuadra2_Territorio71",
            coords: [
                [[28.608144, -106.061829], [28.607892, -106.061538], [28.607275, -106.062250], [28.607536, -106.062521]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/sJK9mLDKSFscZhn58"
        },
        {
            id: "Cuadra3_Territorio71",
            coords: [
                [[28.608182, -106.061787], [28.607932, -106.061496], [28.608617, -106.060732], [28.608890, -106.061021]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/rfG9ccsYZa75Bbrw6"
        },
        {
            id: "Cuadra4_Territorio71",
            coords: [
                [[28.608924, -106.060975], [28.608657, -106.060693], [28.609332, -106.059957], [28.609591, -106.060245]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/1MEm623D6behkLfb6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio71Data = crearTerritorio(datosTerritorio71);
var territorio71 = territorio71Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio71.poligonos.find(p => p.id === "Cuadra3_Territorio71");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio71 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio71.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio71._marcadorTerritorio = marcadorTerritorio71;
