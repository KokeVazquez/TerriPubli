// =============================
// === Territorio 51 ===
// =============================

var datosTerritorio51 = {
    id: "territorio51",
    numeroTerritorio: 51, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio51",
            coords: [
                [[28.614078, -106.084758], [28.613760, -106.085270], [28.613505, -106.084802], [28.613930, -106.084494]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/a3G49hXDi8rSEB3Q7"
        },
        {
            id: "Cuadra2_Territorio51",
            coords: [
                [[28.614110, -106.084702], [28.614399, -106.084245], [28.614354, -106.084173], [28.613974, -106.084455]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/8vTB2vWBrfRdbMjH7"
        },
        {
            id: "Cuadra3_Territorio51",
            coords: [
                [[28.614319, -106.084121], [28.613953, -106.084395], [28.613399, -106.083445], [28.613777, -106.083173]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/nPihTkWFqmhQLigi9"
        },
        {
            id: "Cuadra4_Territorio51",
            coords: [
                [[28.613740, -106.083101], [28.612886, -106.083734], [28.612644, -106.083300], [28.613497, -106.082677]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/YTHwjeNiNoKizXYS8"
        },
        {
            id: "Cuadra5_Territorio51",
            coords: [
                [[28.613458, -106.082610], [28.612604, -106.083244], [28.612368, -106.082793], [28.613213, -106.082183]]],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/PtzrfCvrhnqqJk8CA"
        },
        {
            id: "Cuadra6_Territorio51",
            coords: [
                [[28.613899, -106.084440], [28.613471, -106.084750], [28.612923, -106.083793], [28.613343, -106.083494]]],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/BKjf9pT3CEumEgZi9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio51Data = crearTerritorio(datosTerritorio51);
var territorio51 = territorio51Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio51.poligonos.find(p => p.id === "Cuadra3_Territorio51");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio51 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio51.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio51._marcadorTerritorio = marcadorTerritorio51;
