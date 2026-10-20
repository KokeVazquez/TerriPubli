// =============================
// === Territorio 15 ===
// =============================

var datosTerritorio15 = {
    id: "territorio15",
    numeroTerritorio: 15, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio15",
            coords: [
                [[28.611705, -106.065929], [28.611423, -106.065438], [28.610588, -106.066061], [28.610852, -106.066551]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/MF4ruK61yMm6QdQY6"
        },
        {
            id: "Cuadra2_Territorio15",
            coords: [
                [[28.611401, -106.065395], [28.611144, -106.064913], [28.610294, -106.065539], [28.610566, -106.066018]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/amyobT5kZY5rTQ2m8"
        },
        {
            id: "Cuadra3_Territorio15",
            coords: [
                [[28.612358, -106.065458], [28.611739, -106.065908], [28.611180, -106.064886], [28.611763, -106.064459]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/9s1BzLeHPe4ByqnU6"
        },
        {
            id: "Cuadra4_Territorio15",
            coords: [
                [[28.613206, -106.064820], [28.612392, -106.065430], [28.611799, -106.064432], [28.612655, -106.063818]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/bPFjSYHGiWDSv7DSA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio15Data = crearTerritorio(datosTerritorio15);
var territorio15 = territorio15Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio15.poligonos.find(p => p.id === "Cuadra3_Territorio15");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio15 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio15.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio15._marcadorTerritorio = marcadorTerritorio15;
