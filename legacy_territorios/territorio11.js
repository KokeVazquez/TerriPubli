// =============================
// === Territorio 11 ===
// =============================

var datosTerritorio11 = {
    id: "territorio11",
    numeroTerritorio: 11, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio11",
            coords: [
                [[28.613185, -106.070628], [28.612642, -106.069671], [28.613118, -106.069329], [28.613653, -106.070319]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/UPyPVVc8939wttNz5"
        },
        {
            id: "Cuadra2_Territorio11",
            coords: [
                [[28.613895, -106.070141], [28.613762, -106.070226], [28.613233, -106.069247], [28.613498, -106.069063], [28.613750, -106.069432], [28.614068, -106.069999]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/ktAAniJptUuBrcry8"
        },
        {
            id: "Cuadra3_Territorio11",
            coords: [
                [[28.614627, -106.069581], [28.614334, -106.069051], [28.613822, -106.069440], [28.614121, -106.069959]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/7RHM4NhDJWRhf1mc9"
        },
        {
            id: "Cuadra4_Territorio11",
            coords: [
                [[28.614305, -106.068999], [28.614103, -106.068601], [28.613547, -106.069028], [28.613794, -106.069389]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/BFEB6MSYhXFQ6aNC6"
        },
        {
            id: "Escuela",
            coords: [
                [[28.615053, -106.069264], [28.614510, -106.068326], [28.614160, -106.068570], [28.614397, -106.069044], [28.614666, -106.069546]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Escuela",
            link: "https://maps.app.goo.gl/C15husRCLFDMPZXe8"
        },
        {
            id: "Cuadra5_Territorio11",
            coords: [
                [[28.615508, -106.068905], [28.615263, -106.068460], [28.614835, -106.068766], [28.615101, -106.069227]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/hxuioCE8m2xS9FLX9"
        },
        {
            id: "Cuadra6_Territorio11",
            coords: [
                [[28.615230, -106.068396], [28.614999, -106.067966], [28.614558, -106.068292], [28.614800, -106.068712]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/D5wfwrkrAWK4og7v5"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio11Data = crearTerritorio(datosTerritorio11);
var territorio11 = territorio11Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio11.poligonos.find(p => p.id === "Cuadra3_Territorio11");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio11 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio11.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio11._marcadorTerritorio = marcadorTerritorio11;
