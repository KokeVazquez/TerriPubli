// =============================
// === Territorio 33 ===
// =============================

var datosTerritorio33 = {
    id: "territorio33",
    numeroTerritorio: 33, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio33",
            coords: [
                [[28.615108, -106.078651], [28.615358, -106.079120], [28.614498, -106.079740], [28.614228, -106.079274]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/r2KBsSLVhzwx4EsRA"
        },
        {
            id: "Cuadra2_Territorio33",
            coords: [
                [[28.615054, -106.078557], [28.614839, -106.078145], [28.613949, -106.078802], [28.614182, -106.079190]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/CD6rK9wMYnDfCHEq6"
        },
        {
            id: "Cuadra3_Territorio33",
            coords: [
                [[28.614802, -106.078075], [28.614264, -106.077157], [28.613844, -106.077465], [28.614393, -106.078378]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/hovoqBaBedLQr5KQ9"
        },
        {
            id: "Cuadra4_Territorio33",
            coords: [
                [[28.614354, -106.078410], [28.613911, -106.078732], [28.613389, -106.077794], [28.613799, -106.077495]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/PHzX3LbfMKH2prbK9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio33Data = crearTerritorio(datosTerritorio33);
var territorio33 = territorio33Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio33.poligonos.find(p => p.id === "Cuadra3_Territorio33");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio33 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio33.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio33._marcadorTerritorio = marcadorTerritorio33;
