// =============================
// === Territorio 40 ===
// =============================

var datosTerritorio40 = {
    id: "territorio40",
    numeroTerritorio: 40, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio40",
            coords: [
                [[28.609819, -106.071652], [28.609551, -106.071184], [28.608696, -106.071823], [28.608956, -106.072298]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/QcTPfViuZiD1PSWP7"
        },
        {
            id: "Cuadra2_Territorio40",
            coords: [
                [[28.609528, -106.071139], [28.609260, -106.070659], [28.608406, -106.071318], [28.608672, -106.071785]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/iF2WyGcCAioKbbS1A"
        },
        {
            id: "Cuadra3_Territorio40",
            coords: [
                [[28.609236, -106.070613], [28.608976, -106.070123], [28.608105, -106.070772], [28.608382, -106.071272]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/zHNwpgp3ZCkMtnni8"
        },
        {
            id: "Cuadra4_Territorio40",
            coords: [
                [[28.608951, -106.070081], [28.608689, -106.069633], [28.607826, -106.070257], [28.608080, -106.070731]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/gHmBsz5kjH13DcaZ6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio40Data = crearTerritorio(datosTerritorio40);
var territorio40 = territorio40Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio40.poligonos.find(p => p.id === "Cuadra3_Territorio40");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio40 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio40.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio40._marcadorTerritorio = marcadorTerritorio40;
