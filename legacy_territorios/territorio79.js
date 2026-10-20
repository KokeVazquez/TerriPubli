// =============================
// === Territorio 79 ===
// =============================

var datosTerritorio79 = {
    id: "territorio79",
    numeroTerritorio: 79, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio79",
            coords: [
                [[28.604991, -106.060974], [28.605007, -106.061183], [28.604649, -106.061224], [28.604460, -106.059666], [28.604818, -106.059619]]

            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: ""
        },
        {
            id: "Cuadra2_Territorio79",
            coords: [
                [[28.604587, -106.061233], [28.604398, -106.059685], [28.604044, -106.059740], [28.604224, -106.061285]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: ""
        },
        {
            id: "Cuadra3_Territorio79",
            coords: [
                [[28.604171, -106.061296], [28.603993, -106.059747], [28.603635, -106.059799], [28.603817, -106.061360]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: ""
        },
        {
            id: "Cuadra4_Territorio79",
            coords: [
                [[28.603580, -106.059812], [28.603328, -106.059840], [28.603493, -106.061416], [28.603757, -106.061375]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: ""
        },
        {
            id: "Cuadra5_Territorio79",
            coords: [
                [[28.604768, -106.059103], [28.604813, -106.059547], [28.604450, -106.059607], [28.604404, -106.059132]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: ""
        },
        {
            id: "Cuadra6_Territorio79",
            coords: [
                [[28.604396, -106.059622], [28.604035, -106.059674], [28.603947, -106.059167], [28.604348, -106.059135]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: ""
        },
        {
            id: "Cuadra7_Territorio79",
            coords: [
                [[28.603983, -106.059678], [28.603630, -106.059735], [28.603545, -106.059242], [28.603898, -106.059186]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: ""
        },
        {
            id: "Cuadra8_Territorio79",
            coords: [
                [[28.603572, -106.059746], [28.603321, -106.059782], [28.603255, -106.059309], [28.603498, -106.059272]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "8",
            link: ""
        },
        {
            id: "Corrales",
            coords: [
                [[28.603626, -106.061466], [28.604454, -106.061312], [28.605095, -106.061239], [28.605343, -106.063286], [28.604779, -106.063322], [28.604643, -106.063307], [28.604259, -106.063183], [28.604093, -106.063161], [28.603785, -106.063236], [28.602839, -106.061572]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Corrales",
            link: ""
        },
        {
            id: "Corrales",
            coords: [
                [[28.603440, -106.061422], [28.603263, -106.059844], [28.602744, -106.059897], [28.602914, -106.061501]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Corrales",
            link: ""
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio79Data = crearTerritorio(datosTerritorio79);
var territorio79 = territorio79Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio79.poligonos.find(p => p.id === "Cuadra3_Territorio79");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio79 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio79.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio79._marcadorTerritorio = marcadorTerritorio79;
