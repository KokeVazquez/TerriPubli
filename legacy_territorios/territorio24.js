// =============================
// === Territorio 24 ===
// =============================

var datosTerritorio24 = {
    id: "territorio24",
    numeroTerritorio: 24, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio24",
            coords: [
                [[28.613976, -106.074442], [28.613676, -106.073921], [28.612850, -106.074550], [28.613137, -106.075059]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/txh9cjQq4dJVvtNR8"
        },
        {
            id: "Cuadra2_Territorio24",
            coords: [
                [[28.613651, -106.073883], [28.613406, -106.073431], [28.612558, -106.074046], [28.612826, -106.074511]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/v8piEFbpomUfBXXF7"
        },
        {
            id: "Cuadra3_Territorio24",
            coords: [
                [[28.613385, -106.073391], [28.613006, -106.073669], [28.612751, -106.073209], [28.612728, -106.073209], [28.612714, -106.073221], [28.612715, -106.073237], [28.612724, -106.073268], [28.612968, -106.073691], [28.612550, -106.073987], [28.611991, -106.072989], [28.612376, -106.072707], [28.612572, -106.073046], [28.612996, -106.072713]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/Bi6WBz7VNAepjCrMA"
        },
        {
            id: "Escuela",
            coords: [
                [[28.612962, -106.072681], [28.612804, -106.072402], [28.612416, -106.072689], [28.612585, -106.072979]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Escuela",
            link: "https://maps.app.goo.gl/WnGVaDDDmagZ5czJ8"
        },
        {
            id: "Asilo",
            coords: [
                [[28.612665, -106.073895], [28.612553, -106.073978], [28.612366, -106.073636], [28.612245, -106.073556]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Asilo",
            link: "https://maps.app.goo.gl/uyAAWqkFzFRWbbLN6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio24Data = crearTerritorio(datosTerritorio24);
var territorio24 = territorio24Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio24.poligonos.find(p => p.id === "Cuadra2_Territorio24");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio24 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio24.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio24._marcadorTerritorio = marcadorTerritorio24;
