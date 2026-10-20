// =============================
// === Territorio 25 ===
// =============================

var datosTerritorio25 = {
    id: "territorio25",
    numeroTerritorio: 25, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio25",
            coords: [
                [[28.612742, -106.072350], [28.612036, -106.072157], [28.611638, -106.072456], [28.611904, -106.072957]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/VpmmAQakaw4fmsg19"
        },
        {
            id: "Cuadra2_Territorio25",
            coords: [
                [[28.612750, -106.072297], [28.612048, -106.072104], [28.611812, -106.071682], [28.612231, -106.071379]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/2ArasjsN2Cf4SQVK9"
        },
        {
            id: "Cuadra3_Territorio25",
            coords: [
                [[28.612194, -106.071313], [28.611772, -106.071611], [28.611240, -106.070665], [28.611683, -106.070359]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/mpUvTe8kKm2Z8dNo8"
        },
        {
            id: "Cuadra4_Territorio25",
            coords: [
                [[28.611732, -106.071641], [28.611355, -106.071919], [28.610828, -106.070974], [28.611200, -106.070697]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/o7d2sge15vyLBnw47"
        },
        {
            id: "Cuadra5_Territorio25",
            coords: [
                [[28.611772, -106.071732], [28.611390, -106.071986], [28.611614, -106.072394], [28.611987, -106.072119]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/GZHf8oso5DKhQTTEA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio25Data = crearTerritorio(datosTerritorio25);
var territorio25 = territorio25Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio25.poligonos.find(p => p.id === "Cuadra3_Territorio25");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio25 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio25.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio25._marcadorTerritorio = marcadorTerritorio25;
