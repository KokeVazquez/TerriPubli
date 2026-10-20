// =============================
// === Territorio 68 ===
// =============================

var datosTerritorio68 = {
    id: "territorio68",
    numeroTerritorio: 68, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio68",
            coords: [
                [[28.608085, -106.063889], [28.608362, -106.063576], [28.608122, -106.063286], [28.607802, -106.063652], [28.607533, -106.063983], [28.607808, -106.064202]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/MCtruo8ZV3GaTt9d9"
        },
        {
            id: "Cuadra2_Territorio68",
            coords: [
                [[28.608402, -106.063528], [28.608164, -106.063243], [28.608779, -106.062552], [28.609015, -106.062835]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/sHuZEPnUMrQL3QLt7"
        },
        {
            id: "Cuadra3_Territorio68",
            coords: [
                [[28.609058, -106.062790], [28.608821, -106.062504], [28.609494, -106.061748], [28.609736, -106.062033]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/e8T2XDvAuWJ7QyAQA"
        },
        {
            id: "Cuadra4_Territorio68",
            coords: [
                [[28.609778, -106.061985], [28.609535, -106.061701], [28.609729, -106.061520], [28.609771, -106.061597], [28.609939, -106.061804]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/HEUC3kzDa68E2u428"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio68Data = crearTerritorio(datosTerritorio68);
var territorio68 = territorio68Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio68.poligonos.find(p => p.id === "Cuadra2_Territorio68");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio68 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio68.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio68._marcadorTerritorio = marcadorTerritorio68;
