// =============================
// === Territorio 67 ===
// =============================

var datosTerritorio67 = {
    id: "territorio67",
    numeroTerritorio: 67, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio67",
            coords: [
                [[28.608664, -106.063919], [28.608402, -106.063618], [28.608032, -106.064041], [28.607871, -106.064253], [28.608151, -106.064482]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/Nrgpi7yVeQy4A6k19"
        },
        {
            id: "Cuadra2_Territorio67",
            coords: [
                [[28.608700, -106.063871], [28.608441, -106.063575], [28.609056, -106.062885], [28.609316, -106.063177]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/FYGCNA1p7oGoFKYj9"
        },
        {
            id: "Cuadra3_Territorio67",
            coords: [
                [[28.609356, -106.063132], [28.609097, -106.062835], [28.609777, -106.062079], [28.610023, -106.062363]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/kbvBgLfviBqMLTZM7"
        },
        {
            id: "Cuadra4_Territorio67",
            coords: [
                [[28.610241, -106.062139], [28.610065, -106.062321], [28.609820, -106.062034], [28.609983, -106.061846]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/p4XsNzCHtxjKPC7SA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio67Data = crearTerritorio(datosTerritorio67);
var territorio67 = territorio67Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio67.poligonos.find(p => p.id === "Cuadra3_Territorio67");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio67 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio67.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio67._marcadorTerritorio = marcadorTerritorio67;
