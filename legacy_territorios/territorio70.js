// =============================
// === Territorio 70 ===
// =============================

var datosTerritorio70 = {
    id: "territorio70",
    numeroTerritorio: 70, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio70",
            coords: [
                [[28.607401, -106.063331], [28.607788, -106.062894], [28.607536, -106.062618], [28.606716, -106.063571], [28.606899, -106.063645], [28.607085, -106.063716]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/8zNpvEV5kUJJFAja8"
        },
        {
            id: "Cuadra2_Territorio70",
            coords: [
                [[28.607833, -106.062842], [28.607577, -106.062565], [28.608180, -106.061872], [28.608436, -106.062179]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/FGDrAes4QVAoqGpk6"
        },
        {
            id: "Cuadra3_Territorio70",
            coords: [
                [[28.608477, -106.062128], [28.608224, -106.061827], [28.608923, -106.061068], [28.609157, -106.061354]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/pL78ZSh4PMLsyPNW9"
        },
        {
            id: "Cuadra4_Territorio70",
            coords: [
                [[28.609202, -106.061315], [28.608958, -106.061023], [28.609629, -106.060285], [28.609870, -106.060565]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/ToZk3GSM7nPUgrRM9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio70Data = crearTerritorio(datosTerritorio70);
var territorio70 = territorio70Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio70.poligonos.find(p => p.id === "Cuadra2_Territorio70");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio70 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio70.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio70._marcadorTerritorio = marcadorTerritorio70;
