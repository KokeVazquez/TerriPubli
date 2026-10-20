// =============================
// === Territorio 41 ===
// =============================

var datosTerritorio41 = {
    id: "territorio41",
    numeroTerritorio: 41, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio41",
            coords: [
                [[28.608649, -106.069565], [28.608387, -106.069136], [28.607511, -106.069757], [28.607779, -106.070196]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/siAoCdiLqgvYsUf46"
        },
        {
            id: "Cuadra2_Territorio41",
            coords: [
                [[28.608362, -106.069088], [28.608091, -106.068615], [28.607219, -106.069227], [28.607483, -106.069714]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/W2LEFAPAKH2xaKHB8"
        },
        {
            id: "Cuadra3_Territorio41",
            coords: [
                [[28.608063, -106.068570], [28.607501, -106.067587], [28.606640, -106.068198], [28.607192, -106.069185]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/T6NEVFtmtx8zEaf96"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio41Data = crearTerritorio(datosTerritorio41);
var territorio41 = territorio41Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio41.poligonos.find(p => p.id === "Cuadra2_Territorio41"); // Usamos el polígono 2 para centrar
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio41 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio41.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio41._marcadorTerritorio = marcadorTerritorio41;
