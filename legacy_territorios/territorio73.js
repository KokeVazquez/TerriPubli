// =============================
// === Territorio 73 ===
// =============================

var datosTerritorio73 = {
    id: "territorio73",
    numeroTerritorio: 73, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Kinder",
            coords: [
                [[28.607205, -106.062250], [28.606966, -106.062510], [28.606425, -106.061864], [28.606656, -106.061612]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Kinder",
            link: "https://maps.app.goo.gl/UGSG9i96s4rsetKt7"
        },
        {
            id: "Escuela",
            coords: [
                [[28.607235, -106.062220], [28.606696, -106.061576], [28.607322, -106.060872], [28.607859, -106.061491]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Escuela",
            link: "https://maps.app.goo.gl/dwswLAe5vHqr2Wiy5"
        },
        {
            id: "Cuadra1_Territorio73",
            coords: [
                [[28.607897, -106.061446], [28.607646, -106.061157], [28.608323, -106.060406], [28.608577, -106.060695]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/YFezCs9TCoHyxmM67"
        },
        {
            id: "Cuadra2_Territorio73",
            coords: [
                [[28.608283, -106.060362], [28.608044, -106.060071], [28.607362, -106.060822], [28.607604, -106.061113]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/VZU5KNZQ1pscyPxx9"
        },
        {
            id: "Cuadra3_Territorio73",
            coords: [
                [[28.608616, -106.060648], [28.608365, -106.060357], [28.609032, -106.059611], [28.609288, -106.059910]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/TUtLiePmBRHvNk8P8"
        },
        {
            id: "Cuadra4_Territorio73",
            coords: [
                [[28.608989, -106.059563], [28.608752, -106.059277], [28.608068, -106.060028], [28.608325, -106.060327]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/A1rRHPaRnuNkV5hZA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio73Data = crearTerritorio(datosTerritorio73);
var territorio73 = territorio73Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio73.poligonos.find(p => p.id === "Cuadra3_Territorio73");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio73 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio73.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio73._marcadorTerritorio = marcadorTerritorio73;
