// =============================
// === Territorio 64 ===
// =============================

var datosTerritorio64 = {
    id: "territorio64",
    numeroTerritorio: 64, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio64",
            coords: [
                [[28.611993, -106.084380], [28.612379, -106.084100], [28.611864, -106.083160], [28.611461, -106.083455]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/YxrzadxY1f1AfwVf9"
        },
        {
            id: "Cuadra2_Territorio64",
            coords: [
                [[28.612833, -106.083773], [28.612431, -106.084066], [28.611913, -106.083121], [28.612318, -106.082826]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/azw9qm3qZErc3jSu7"
        },
        {
            id: "Cuadra3_Territorio64",
            coords: [
                [[28.612281, -106.082772], [28.611885, -106.083061], [28.611417, -106.082220], [28.611807, -106.081930]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/nk3jSbGGXjARcBBX8"
        },
        {
            id: "Cuadra4_Territorio64",
            coords: [
                [[28.611831, -106.083099], [28.611427, -106.083393], [28.610969, -106.082549], [28.611363, -106.082236]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/PnLUyafhZXES2NPq9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio64Data = crearTerritorio(datosTerritorio64);
var territorio64 = territorio64Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio64.poligonos.find(p => p.id === "Cuadra3_Territorio64");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio64 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio64.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio64._marcadorTerritorio = marcadorTerritorio64;
