// =============================
// === Territorio 43 ===
// =============================

var datosTerritorio43 = {
    id: "territorio43",
    numeroTerritorio: 43, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Escuela",
            coords: [
                [[28.607739, -106.070230], [28.606869, -106.070854], [28.606593, -106.070402], [28.607468, -106.069787]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Escuela",
            link: "https://maps.app.goo.gl/HwpuFTdjgejUyt2P8"
        },
        {
            id: "Cuadra1_Territorio43",
            coords: [
                [[28.607444, -106.069742], [28.607176, -106.069256], [28.606946, -106.069405], [28.606736, -106.069555], [28.606523, -106.069729], [28.606319, -106.069914], [28.606568, -106.070357]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/M1YEkHttVytaaMCJ7"
        },
        {
            id: "Cuadra2_Territorio43",
            coords: [
                [[28.607152, -106.069211], [28.606717, -106.069504], [28.606180, -106.068529], [28.606602, -106.068227]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/JQH3DBREPJ6zQqCo9"
        },
        {
            id: "Cuadra3_Territorio43",
            coords: [
                [[28.606677, -106.069533], [28.606295, -106.069867], [28.606195, -106.069628], [28.606148, -106.069526], [28.606082, -106.069406], [28.605897, -106.069158], [28.605729, -106.068902], [28.606140, -106.068560]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/i8oqG9WCA9mF4a6o7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio43Data = crearTerritorio(datosTerritorio43);
var territorio43 = territorio43Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio43.poligonos.find(p => p.id === "Cuadra2_Territorio43");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio43 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio43.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio43._marcadorTerritorio = marcadorTerritorio43;
