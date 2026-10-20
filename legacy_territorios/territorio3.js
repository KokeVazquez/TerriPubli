// =============================
// === Territorio 3 ===
// =============================

var datosTerritorio3 = {
    id: "territorio3",
    numeroTerritorio: 3, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Alsuper",
            coords: [
                [28.617346, -106.080198], [28.617927, -106.079081], [28.617795, -106.078857], [28.616931, -106.079468]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Alsuper",
            link: "https://maps.app.goo.gl/K8c8Bq9NfT25AYuy8"
        },
        {
            id: "Vacio",
            coords: [
                [28.617956, -106.079010], [28.617842, -106.078821], [28.618190, -106.078549]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: null,
            link: "https://maps.app.goo.gl/D3u9uBvAmSCX1bNXA"
        },
        {
            id: "Cuadra1_Territorio3",
            coords: [
                [28.617762, -106.078804], [28.616901, -106.079415], [28.616680, -106.079017], [28.617539, -106.078396]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/Q71gy1fULtNKi59M7"
        },
        {
            id: "Cuadra2_Territorio3",
            coords: [
                [28.617508, -106.078340], [28.616655, -106.078969], [28.616433, -106.078574], [28.617274, -106.077931]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/MD6GDCxyerxhhQGt7"
        },
        {
            id: "Cuadra3_Territorio3",
            coords: [
                [28.618252, -106.078424], [28.617811, -106.078767], [28.617589, -106.078362], [28.618435, -106.077728], [28.618521, -106.077870]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/MPMyXGz2fYYMT2mZ6"
        },
        {
            id: "Cuadra4_Territorio3",
            coords: [
                [28.618405, -106.077669], [28.617556, -106.078307], [28.617322, -106.077894], [28.618189, -106.077271]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/K9ZqmbykynF8TdUq7"
        },
        {
            id: "Cuadra5_Territorio3",
            coords: [
                [28.618911, -106.077127], [28.618554, -106.077809], [28.618239, -106.077231], [28.618754, -106.076860]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/vRhTD11pNb5xtomAA"
        },
        {
            id: "Vacio",
            coords: [
                [28.619220, -106.076523], [28.618945, -106.077066], [28.618802, -106.076819]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: null,
            link: "https://maps.app.goo.gl/MBdJkA1qkfCs35c39"
        }



    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio3Data = crearTerritorio(datosTerritorio3);
var territorio3 = territorio3Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio3.poligonos.find(p => p.id === "Cuadra3_Territorio3");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio3 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio3.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio3._marcadorTerritorio = marcadorTerritorio3;
