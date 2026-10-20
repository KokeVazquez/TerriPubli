// =============================
// === Territorio 60 ===
// =============================

var datosTerritorio60 = {
    id: "territorio60",
    numeroTerritorio: 60, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio60",
            coords: [
                [[28.607811, -106.075975], [28.607398, -106.076273], [28.606830, -106.075315], [28.607034, -106.075163], [28.607249, -106.075002]]],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/CNn6yUhn2qUbb8Xf8"
        },
        {
            id: "Cuadra2_Territorio60",
            coords: [
                [[28.608231, -106.075665], [28.607848, -106.075951], [28.607291, -106.074976], [28.607682, -106.074691]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/xrFgVhZT6XQ2g4gQ7"
        },
        {
            id: "Cuadra3_Territorio60",
            coords: [
                [[28.607646, -106.074623], [28.606789, -106.075251], [28.606527, -106.074784], [28.607388, -106.074170]]],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/DLU47FcmVtZqoDLx5"
        },
        {
            id: "Cuadra4_Territorio60",
            coords: [
                [28.607365, -106.074129], [28.606499, -106.074751], [28.606270, -106.074315], [28.607107, -106.073675]],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/s7CBqw9W793LmE2g6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio60Data = crearTerritorio(datosTerritorio60);
var territorio60 = territorio60Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio60.poligonos.find(p => p.id === "Cuadra3_Territorio60");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio60 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio60.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio60._marcadorTerritorio = marcadorTerritorio60;
