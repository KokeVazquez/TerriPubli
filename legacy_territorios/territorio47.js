// =============================
// === Territorio 47 ===
// =============================

var datosTerritorio47 = {
    id: "territorio47",
    numeroTerritorio: 47, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio47",
            coords: [
                [[28.612394, -106.078425], [28.611517, -106.079054], [28.611260, -106.078602], [28.612115, -106.077966]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/cn3qbbQis7rrEuzs6"
        },
        {
            id: "Cuadra2_Territorio47",
            coords: [
                [[28.612090, -106.077922], [28.611233, -106.078552], [28.610969, -106.078090], [28.611825, -106.077479]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/XxEdmaMiXQCzDEu86"
        },
        {
            id: "Cuadra3_Territorio47",
            coords: [
                [[28.611794, -106.077426], [28.610941, -106.078043], [28.610692, -106.077599], [28.611557, -106.076990]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/tUiLb4r6i4Fmar4g6"
        },
        {
            id: "Cuadra4_Territorio47",
            coords: [
                [[28.611528, -106.076934], [28.610660, -106.077558], [28.610423, -106.077114], [28.611268, -106.076478]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/iYgXR8M5xdqbE92B9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio47Data = crearTerritorio(datosTerritorio47);
var territorio47 = territorio47Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio47.poligonos.find(p => p.id === "Cuadra3_Territorio47");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio47 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio47.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio47._marcadorTerritorio = marcadorTerritorio47;
