// =============================
// === Territorio 82 ===
// =============================

var datosTerritorio82 = {
    id: "territorio82",
    numeroTerritorio: 82, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio82",
            coords: [
                [[28.604672, -106.057841], [28.604402, -106.057518], [28.604081, -106.057856], [28.604357, -106.058188]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/Twdnb7VPY45EPbdz8"
        },
        {
            id: "Cuadra2_Territorio82",
            coords: [
                [[28.604716, -106.057795], [28.604449, -106.057471], [28.605105, -106.056744], [28.605385, -106.057030]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/ojDNXGc5eunZ1Noy6"
        },
        {
            id: "Cuadra3_Territorio82",
            coords: [
                [[28.605422, -106.056983], [28.605150, -106.056697], [28.605824, -106.055908], [28.606093, -106.056213]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/aNXGgG4vndTCuZnv5"
        },
        {
            id: "Cuadra4_Territorio82",
            coords: [
                [[28.605106, -106.056646], [28.604821, -106.056304], [28.605493, -106.055517], [28.605782, -106.055863]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/XXiokDPCkkcGhwRJ9"
        },
        {
            id: "Cuadra5_Territorio82",
            coords: [
                [[28.604780, -106.056258], [28.604495, -106.055911], [28.605179, -106.055160], [28.605451, -106.055483]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/oEi6rarbra5VDh2J6"
        },
        {
            id: "Cuadra6_Territorio82",
            coords: [
                [[28.604635, -106.056433], [28.604740, -106.056304], [28.604455, -106.055962], [28.604177, -106.056258], [28.604454, -106.056604]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/81YEEMVYAD1WxURJ8"
        },
        {
            id: "Cuadra7_Territorio82",
            coords: [
                [[28.605066, -106.056696], [28.604781, -106.056348], [28.604654, -106.056493], [28.604131, -106.057007], [28.604131, -106.057078], [28.604408, -106.057429]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/KbdeSTVE11y9rLMcA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio82Data = crearTerritorio(datosTerritorio82);
var territorio82 = territorio82Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio82.poligonos.find(p => p.id === "Cuadra7_Territorio82");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio82 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio82.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio82._marcadorTerritorio = marcadorTerritorio82;
