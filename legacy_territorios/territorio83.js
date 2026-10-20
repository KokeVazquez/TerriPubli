// =============================
// === Territorio 83 ===
// =============================

var datosTerritorio83 = {
    id: "territorio83",
    numeroTerritorio: 83, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio83",
            coords: [
                [[28.603695, -106.056689], [28.603391, -106.056370], [28.603091, -106.056724], [28.602742, -106.057118], [28.603042, -106.057468]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/jE5e61iiHvp6sqp69"
        },
        {
            id: "Cuadra2_Territorio83",
            coords: [
                [[28.603433, -106.056317], [28.603675, -106.056595], [28.603717, -106.056608], [28.603758, -106.056608], [28.603811, -106.056571], [28.604416, -106.055910], [28.604119, -106.055558]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/hn8rh4WiTFkAbNp79"
        },
        {
            id: "Campo",
            coords: [
                [[28.604460, -106.055867], [28.604155, -106.055515], [28.604834, -106.054762], [28.605144, -106.055117]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Campo",
            link: "https://maps.app.goo.gl/z49ZkiQbekdehB448"
        },
        {
            id: "Kinder",
            coords: [
                [[28.604473, -106.055077], [28.604179, -106.054731], [28.604506, -106.054389], [28.604790, -106.054716]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Kinder",
            link: "https://maps.app.goo.gl/BaSSb2m98i51PJm8A"
        },
        {
            id: "Cuadra3_Territorio83",
            coords: [
                [[28.604422, -106.055128], [28.604139, -106.054783], [28.603831, -106.055120], [28.604121, -106.055467]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/Sw2iZCoW1Bvwnxwf8"
        },
        {
            id: "Cuadra4_Territorio83",
            coords: [
                [[28.603794, -106.055067], [28.603502, -106.054724], [28.604165, -106.053993], [28.604462, -106.054337]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/1EvqruM8Z81SL3Su7"
        },
        {
            id: "Cuadra5_Territorio83",
            coords: [
                [[28.603063, -106.055894], [28.602775, -106.055565], [28.603464, -106.054772], [28.603750, -106.055112]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/m52MPp7MpLfDvAZG7"
        },
        {
            id: "Cuadra6_Territorio83",
            coords: [
                [[28.603022, -106.055943], [28.602734, -106.055609], [28.602301, -106.056097], [28.602577, -106.056435]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/N578bn6mWX2ERTK17"
        },
        {
            id: "Cuadra7_Territorio83",
            coords: [
                [[28.603354, -106.056315], [28.603057, -106.055981], [28.602609, -106.056478], [28.602910, -106.056844], [28.603235, -106.056469]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/pt8Raap4WosETWR99"
        },
        {
            id: "Cuadra8_Territorio83",
            coords: [
                [[28.603393, -106.056274], [28.603106, -106.055942], [28.603790, -106.055157], [28.604076, -106.055513]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "8",
            link: "https://maps.app.goo.gl/cHTkL3bzBi3oFWZLA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio83Data = crearTerritorio(datosTerritorio83);
var territorio83 = territorio83Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio83.poligonos.find(p => p.id === "Cuadra8_Territorio83");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio83 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio83.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio83._marcadorTerritorio = marcadorTerritorio83;
