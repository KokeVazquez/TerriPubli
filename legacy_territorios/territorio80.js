// =============================
// === Territorio 80 ===
// =============================

var datosTerritorio80 = {
    id: "territorio80",
    numeroTerritorio: 80, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio80",
            coords: [
                [[28.605684, -106.058933], [28.605367, -106.058560], [28.605644, -106.058267], [28.605944, -106.058617]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/wK9kScGN7ydcSB6Y9"
        },
        {
            id: "Cuadra2_Territorio80",
            coords: [
                [[28.605973, -106.058585], [28.605675, -106.058236], [28.605932, -106.057954], [28.606225, -106.058275]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/2Q2Cz3BgXzodXACt5"
        },
        {
            id: "Cuadra3_Territorio80",
            coords: [
                [[28.605898, -106.057921], [28.605612, -106.057593], [28.605363, -106.057871], [28.605644, -106.058200]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/GPWQ9Qt8pFM2sbfy9"
        },
        {
            id: "Cuadra4_Territorio80",
            coords: [
                [[28.605586, -106.057559], [28.605287, -106.057221], [28.605034, -106.057502], [28.605334, -106.057842]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/T9efd1hZv7vRi6Dy8"
        },
        {
            id: "Cuadra5_Territorio80",
            coords: [
                [[28.605307, -106.057869], [28.605008, -106.057532], [28.604740, -106.057843], [28.605028, -106.058171]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/dQny1gLBeNzNvsmy7"
        },
        {
            id: "Cuadra6_Territorio80",
            coords: [
                [[28.605000, -106.058204], [28.604712, -106.057876], [28.604455, -106.058175], [28.604747, -106.058503]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/gKB2baHpY17S3TrK8"
        },
        {
            id: "Cuadra7_Territorio80",
            coords: [
                [[28.605294, -106.058562], [28.605026, -106.058258], [28.604915, -106.058404], [28.604894, -106.058469], [28.604902, -106.058644], [28.604952, -106.058762], [28.605021, -106.058828]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/iKi21oztLC7kn7zh6"
        },
        {
            id: "Cuadra8_Territorio80",
            coords: [
                [[28.605601, -106.058232], [28.605333, -106.057913], [28.605070, -106.058204], [28.605342, -106.058509]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "8",
            link: "https://maps.app.goo.gl/m6MeDEmqgqNJi9nSA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio80Data = crearTerritorio(datosTerritorio80);
var territorio80 = territorio80Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio80.poligonos.find(p => p.id === "Cuadra3_Territorio80");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio80 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio80.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio80._marcadorTerritorio = marcadorTerritorio80;
