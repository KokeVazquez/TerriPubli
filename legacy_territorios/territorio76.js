// =============================
// === Territorio 76 ===
// =============================

var datosTerritorio76 = {
    id: "territorio76",
    numeroTerritorio: 76, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio76",
            coords: [
                [[28.605929, -106.060777], [28.605810, -106.060934], [28.605772, -106.061037], [28.605702, -106.061069], [28.605608, -106.061100], [28.605055, -106.061182], [28.605047, -106.061049], [28.605622, -106.060433]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/tSyX7wcNzQPDp4hV6"
        },
        {
            id: "Cuadra2_Territorio76",
            coords: [
                [[28.605955, -106.060749], [28.605651, -106.060400], [28.606275, -106.059674], [28.606583, -106.060038]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/HBoqJ6zmuXmoJoh18"
        },
        {
            id: "Cuadra3_Territorio76",
            coords: [
                [[28.606612, -106.060006], [28.606302, -106.059647], [28.606638, -106.059263], [28.607015, -106.058875], [28.607321, -106.059232]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/EeNdKcgA7BGXEQzN9"
        },
        {
            id: "Cuadra4_Territorio76",
            coords: [
                [[28.607351, -106.059194], [28.607044, -106.058841], [28.607745, -106.058088], [28.608053, -106.058425]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/C5uMjFQNZPZmxqJx7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio76Data = crearTerritorio(datosTerritorio76);
var territorio76 = territorio76Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio76.poligonos.find(p => p.id === "Cuadra3_Territorio76");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio76 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio76.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio76._marcadorTerritorio = marcadorTerritorio76;
