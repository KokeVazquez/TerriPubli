// =============================
// === Territorio 78 ===
// =============================

var datosTerritorio78 = {
    id: "territorio78",
    numeroTerritorio: 78, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio78",
            coords: [
                [[28.605046, -106.060973], [28.604982, -106.060475], [28.605342, -106.060117], [28.605582, -106.060399]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/9qH2K7phzPpqC1HR6"
        },
        {
            id: "Cuadra2_Territorio78",
            coords: [[[28.605297, -106.060070], [28.604971, -106.060404], [28.604875, -106.059601], [28.604906, -106.059600]]

            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/KK59ANzexRoLYsfj6"
        },
        {
            id: "Cuadra3_Territorio78",
            coords: [
                [[28.604965, -106.059579], [28.605299, -106.059423], [28.605369, -106.059374], [28.605917, -106.060014], [28.605623, -106.060356]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/QApTQPcsALb4oXJG8"
        },
        {
            id: "Cuadra4_Territorio78",
            coords: [
                [[28.605953, -106.059969], [28.605415, -106.059331], [28.605686, -106.059014], [28.606234, -106.059644]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/wkno24Ni46bwPUcv7"
        },
        {
            id: "Cuadra5_Territorio78",
            coords: [
                [[28.605645, -106.058970], [28.605338, -106.058603], [28.605065, -106.058866], [28.605376, -106.059281]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/oxTzzdjqtDzjiXja6"
        },
        {
            id: "Cuadra6_Territorio78",
            coords: [
                [[28.605330, -106.059323], [28.605018, -106.058906], [28.604854, -106.059035], [28.604830, -106.059069], [28.604820, -106.059115], [28.604868, -106.059538], [28.604909, -106.059535], [28.605272, -106.059368]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/ws1SyVtu3vXxguP99"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio78Data = crearTerritorio(datosTerritorio78);
var territorio78 = territorio78Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio78.poligonos.find(p => p.id === "Cuadra3_Territorio78");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio78 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio78.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio78._marcadorTerritorio = marcadorTerritorio78;
