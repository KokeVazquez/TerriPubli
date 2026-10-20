// =============================
// === Territorio 77 ===
// =============================

var datosTerritorio77 = {
    id: "territorio77",
    numeroTerritorio: 77, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio77",
            coords: [
                [[28.606273, -106.059597], [28.605727, -106.058967], [28.605973, -106.058667], [28.606528, -106.059305]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/M9BYe3mMsfyvaDAdA"
        },
        {
            id: "Cuadra2_Territorio77",
            coords: [
                [[28.606572, -106.059258], [28.606012, -106.058618], [28.606254, -106.058324], [28.606555, -106.058653], [28.606830, -106.058991]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/TV9WQZXpTooDxq1Y9"
        },
        {
            id: "Cuadra3_Territorio77",
            coords: [
                [[28.606872, -106.058943], [28.606613, -106.058626], [28.606869, -106.058351], [28.607142, -106.058655]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/LWtHs4zYus5VB8Q99"
        },
        {
            id: "Cuadra4_Territorio77",
            coords: [
                [[28.607184, -106.058608], [28.606911, -106.058306], [28.607424, -106.057736], [28.607701, -106.058042]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/kmnUAFpqX5ETGHX29"
        },
        {
            id: "Cuadra5_Territorio77",
            coords: [
                [[28.606868, -106.058258], [28.606584, -106.057939], [28.607100, -106.057365], [28.607383, -106.057687]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/RCEpiZ9vi5tMiTMs7"
        },
        {
            id: "Cuadra6_Territorio77",
            coords: [
                [[28.606574, -106.058579], [28.606296, -106.058274], [28.606545, -106.057988], [28.606826, -106.058303]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/LRk1itRZxKRRtg8x8"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio77Data = crearTerritorio(datosTerritorio77);
var territorio77 = territorio77Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio77.poligonos.find(p => p.id === "Cuadra4_Territorio77");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio77 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio77.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio77._marcadorTerritorio = marcadorTerritorio77;
