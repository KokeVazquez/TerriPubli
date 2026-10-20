// =============================
// === Territorio 2 ===
// =============================

var datosTerritorio2 = {
    id: "territorio2",
    numeroTerritorio: 2, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio2",
            coords: [
                [28.616495, -106.081099], [28.616107, -106.081399], [28.616140, -106.080485]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/BrCT8TNgddYyZkGt9"
        },
        {
            id: "Cuadra2_Territorio2",
            coords: [
                [28.617289, -106.080300], [28.617128, -106.080628], [28.616541, -106.081065], [28.616141, -106.080370], [28.616123, -106.080055], [28.616855, -106.079526]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/8jHjSeqigLpfc6Bd6"
        },
        {
            id: "Cuadra3_Territorio2",
            coords: [
                [28.616821, -106.079470], [28.616185, -106.079931], [28.616117, -106.079718], [28.616062, -106.079479], [28.616041, -106.079312], [28.616055, -106.078851], [28.616355, -106.078630]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/FbEGNWZKJyeYuCD88"
        },
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio2Data = crearTerritorio(datosTerritorio2);
var territorio2 = territorio2Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio2.poligonos.find(p => p.id === "Cuadra2_Territorio2");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio2 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio2.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio2._marcadorTerritorio = marcadorTerritorio2;
