// =============================
// === Territorio 45 ===
// =============================

var datosTerritorio45 = {
    id: "territorio45",
    numeroTerritorio: 45, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio45",
            coords: [
                [[28.610033, -106.074333], [28.609170, -106.074961], [28.608922, -106.074515], [28.609776, -106.073891]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/MHDGRXoPsGRaQQTy5"
        },
        {
            id: "Cuadra2_Territorio45",
            coords: [
                [[28.609748, -106.073842], [28.608894, -106.074465], [28.608641, -106.073997], [28.609497, -106.073390]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/2ceJ7D3XLvXpdpbx8"
        },
        {
            id: "Cuadra3_Territorio45",
            coords: [
                [[28.609445, -106.073315], [28.608601, -106.073925], [28.608352, -106.073472], [28.609196, -106.072882]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/xPKPCKfrJzsqnYcc9"
        },
        {
            id: "Cuadra4_Territorio45",
            coords: [
                [[28.609159, -106.072822], [28.608323, -106.073414], [28.608092, -106.072992], [28.608912, -106.072406]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/96hYEyJtjHgG5ugz8"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio45Data = crearTerritorio(datosTerritorio45);
var territorio45 = territorio45Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio45.poligonos.find(p => p.id === "Cuadra3_Territorio45");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio45 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio45.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio45._marcadorTerritorio = marcadorTerritorio45;
