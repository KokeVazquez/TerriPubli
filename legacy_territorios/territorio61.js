// =============================
// === Territorio 61 ===
// =============================

var datosTerritorio61 = {
    id: "territorio61",
    numeroTerritorio: 61, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio61",
            coords: [
                [28.609449, -106.077743], [28.608590, -106.078375], [28.608323, -106.077873], [28.609166, -106.077245]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/dMfSGzL2AV2DTPsk7"
        },
        {
            id: "Cuadra2_Territorio61",
            coords: [
                [28.609140, -106.077204], [28.608294, -106.077820], [28.608026, -106.077336], [28.608852, -106.076711]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/9Rpwso96CcmNaruGA"
        },
        {
            id: "Cuadra3_Territorio61",
            coords: [
                [28.608824, -106.076669], [28.608427, -106.076967], [28.607885, -106.076014], [28.608076, -106.075872], [28.608268, -106.075728]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/8rX8cdWLjvtFLDyt9"
        },
        {
            id: "Cuadra4_Territorio61",
            coords: [
                [28.608389, -106.076997], [28.607983, -106.077295], [28.607437, -106.076337], [28.607847, -106.076041]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/VHttspBfmHrao28Z9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio61Data = crearTerritorio(datosTerritorio61);
var territorio61 = territorio61Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio61.poligonos.find(p => p.id === "Cuadra3_Territorio61");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio61 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio61.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio61._marcadorTerritorio = marcadorTerritorio61;
