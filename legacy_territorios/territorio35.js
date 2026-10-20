// =============================
// === Territorio 35 ===
// =============================

var datosTerritorio35 = {
    id: "territorio35",
    numeroTerritorio: 35, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio35",
            coords: [
                [[28.615098, -106.082139], [28.614707, -106.082423], [28.614201, -106.081466], [28.614587, -106.081203]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/MQNb3WWf666ZF9uYA"
        },
        {
            id: "Cuadra2_Territorio35",
            coords: [
                [[28.615135, -106.082109], [28.614673, -106.081287], [28.614627, -106.081175], [28.615062, -106.080869], [28.615533, -106.081654], [28.615511, -106.081849]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/fXKSFxNyjWEkgSTy7"
        },
        {
            id: "Cuadra3_Territorio35",
            coords: [
                [[28.615024, -106.080801], [28.614603, -106.081103], [28.614594, -106.081068], [28.614553, -106.080984], [28.614122, -106.080223], [28.614540, -106.079920]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/99BTGCmxS5XvyntE9"
        },
        {
            id: "Cuadra4_Territorio35",
            coords: [
                [[28.614563, -106.081128], [28.614162, -106.081401], [28.613665, -106.080549], [28.614082, -106.080257], [28.614552, -106.081088]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/pFUxPb2rb96AJcv18"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio35Data = crearTerritorio(datosTerritorio35);
var territorio35 = territorio35Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio35.poligonos.find(p => p.id === "Cuadra3_Territorio35");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio35 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio35.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio35._marcadorTerritorio = marcadorTerritorio35;
