// =============================
// === Territorio 75 ===
// =============================

var datosTerritorio75 = {
    id: "territorio75",
    numeroTerritorio: 75, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio75",
            coords: [
                [[28.606034, -106.060901], [28.606318, -106.061220], [28.605991, -106.061597], [28.605954, -106.061328], [28.605926, -106.061104], [28.605902, -106.061031]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/iR6fp4jmpHc1aLrB7"
        },
        {
            id: "Cuadra2_Territorio75",
            coords: [
                [[28.606347, -106.061185], [28.606065, -106.060868], [28.606686, -106.060156], [28.606976, -106.060488]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/VVQZFFFgGB6EBawt9"
        },
        {
            id: "Cuadra3_Territorio75",
            coords: [
                [[28.607005, -106.060460], [28.606712, -106.060125], [28.607420, -106.059344], [28.607713, -106.059672]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/99g3ek9seKG13heFA"
        },
        {
            id: "Cuadra4_Territorio75",
            coords: [
                [[28.607745, -106.059634], [28.607454, -106.059315], [28.608165, -106.058525], [28.608447, -106.058869]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/y9mpRbAsHK2Bufos9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio75Data = crearTerritorio(datosTerritorio75);
var territorio75 = territorio75Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio75.poligonos.find(p => p.id === "Cuadra2_Territorio75");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio75 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio75.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio75._marcadorTerritorio = marcadorTerritorio75;
