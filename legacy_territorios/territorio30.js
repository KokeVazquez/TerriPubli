// =============================
// === Territorio 30 ===
// =============================

var datosTerritorio30 = {
    id: "territorio30",
    numeroTerritorio: 30, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio30",
            coords: [
                [[28.610254, -106.071328], [28.609857, -106.071621], [28.609299, -106.070633], [28.609699, -106.070342]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/cn7euWisSrpHqdL58"
        },
        {
            id: "Cuadra2_Territorio30",
            coords: [
                [[28.610763, -106.070961], [28.610289, -106.071301], [28.609737, -106.070314], [28.610186, -106.069991]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/kScd7xA43UYYnS4U6"
        },
        {
            id: "Cuadra3_Territorio30",
            coords: [
                [[28.610164, -106.069948], [28.609713, -106.070273], [28.609166, -106.069309], [28.609624, -106.068989]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/W1ungaRS566Ubtz19"
        },
        {
            id: "Cuadra4_Territorio30",
            coords: [
                [[28.609674, -106.070301], [28.609275, -106.070587], [28.609023, -106.070092], [28.608738, -106.069614], [28.609123, -106.069346]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/QdHC4v7qbHDJEcq46"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio30Data = crearTerritorio(datosTerritorio30);
var territorio30 = territorio30Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio30.poligonos.find(p => p.id === "Cuadra2_Territorio30"); // Usamos polígono 2 para centrar
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio30 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio30.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio30._marcadorTerritorio = marcadorTerritorio30;
