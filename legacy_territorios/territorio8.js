// =============================
// === Territorio 8 ===
// =============================

var datosTerritorio8 = {
    id: "territorio8",
    numeroTerritorio: 8, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio8",
            coords: [
                [[28.615825, -106.073098], [28.615543, -106.072603], [28.614672, -106.073222], [28.614957, -106.073720]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/16HnDR3ihLodYkKx5"
        },
        {
            id: "Cuadra2_Territorio8",
            coords: [
                [[28.615509, -106.072546], [28.615250, -106.072116], [28.614389, -106.072718], [28.614638, -106.073162]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/j64oUH9amxTmYBGo6"
        },
        {
            id: "Cuadra3_Territorio8",
            coords: [
                [[28.616048, -106.072153], [28.616384, -106.072673], [28.615875, -106.073062], [28.615303, -106.072082], [28.615796, -106.071739]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/6jxZvfAFeLLQnKbN9"
        },
        {
            id: "Cuadra4_Territorio8",
            coords: [
                [[28.616433, -106.072632], [28.616122, -106.072158], [28.616126, -106.072086], [28.616154, -106.072039], [28.616187, -106.072016], [28.616814, -106.072316]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/h6BiU4efBWvzSZFJ8"
        },
        {
            id: "Cuadra5_Territorio8",
            coords: [
                [[28.616856, -106.072262], [28.617256, -106.071963], [28.616954, -106.071437], [28.616241, -106.071972]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/Bwf38TQerWPrNcyv5"
        },
        {
            id: "Cuadra6_Territorio8",
            coords: [
                [[28.616922, -106.071390], [28.616703, -106.071035], [28.615876, -106.071668], [28.616179, -106.071936]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/3nc14nTFYK5SEEpq8"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio8Data = crearTerritorio(datosTerritorio8);
var territorio8 = territorio8Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio8.poligonos.find(p => p.id === "Cuadra3_Territorio8");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio8 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio8.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio8._marcadorTerritorio = marcadorTerritorio8;
