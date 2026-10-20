// =============================
// === Territorio 27 ===
// =============================

var datosTerritorio27 = {
    id: "territorio27",
    numeroTerritorio: 27, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio27",
            coords: [
                [[28.610462, -106.068270], [28.609621, -106.068876], [28.609356, -106.068421], [28.610202, -106.067813], [28.610278, -106.067938], [28.610080, -106.068224], [28.610089, -106.068247], [28.610103, -106.068245], [28.610291, -106.067973]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/uDdTjcAFyEZjUyS77"
        },
        {
            id: "Cuadra2_Territorio27",
            coords: [
                [[28.610179, -106.067769], [28.609907, -106.067306], [28.609051, -106.067896], [28.609329, -106.068378]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/t7GSQHcvsBxsa94u6"
        },
        {
            id: "Cuadra3_Territorio27",
            coords: [
                [[28.609884, -106.067264], [28.609709, -106.066938], [28.609590, -106.066767], [28.608742, -106.067391], [28.609024, -106.067856]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/NDFFbZULAV1TncPQ9"
        },
        {
            id: "Cuadra4_Territorio27",
            coords: [
                [[28.609565, -106.066724], [28.609295, -106.066285], [28.608452, -106.066909], [28.608716, -106.067350]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/M8UWPma3ikXdi1AF8"
        },
        {
            id: "Cuadra5_Territorio27",
            coords: [
                [[28.609272, -106.066243], [28.608979, -106.065753], [28.608159, -106.066369], [28.608428, -106.066852]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/HDrAUJ9QK4u6ZwAH9"
        },
        {
            id: "Cuadra6_Territorio27",
            coords: [
                [[28.608956, -106.065717], [28.608764, -106.065423], [28.608628, -106.065242], [28.607829, -106.065859], [28.608123, -106.066323]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/35YUWUNXWtWkamaK9"
        },
        {
            id: "Cuadra7_Territorio27",
            coords: [
                [[28.607802, -106.065821], [28.608318, -106.065419], [28.607542, -106.065424]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/mjWo4YyYDSq31yXW7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio27Data = crearTerritorio(datosTerritorio27);
var territorio27 = territorio27Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio27.poligonos.find(p => p.id === "Cuadra4_Territorio27");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio27 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio27.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio27._marcadorTerritorio = marcadorTerritorio27;
