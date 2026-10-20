// =============================
// === Territorio 48 ===
// =============================

var datosTerritorio48 = {
    id: "territorio48",
    numeroTerritorio: 48, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio48",
            coords: [
                [[28.613507, -106.080440], [28.612683, -106.081069], [28.612380, -106.080561], [28.612815, -106.080288], [28.612819, -106.080262], [28.612813, -106.080240], [28.612799, -106.080228], [28.612778, -106.080225], [28.612760, -106.080234], [28.612350, -106.080510], [28.612132, -106.080109], [28.613003, -106.079505]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/kZrRQs27byhHW4WN9"
        },
        {
            id: "Cuadra2_Territorio48",
            coords: [
                [[28.612958, -106.079419], [28.612085, -106.080038], [28.611849, -106.079608], [28.612712, -106.078982]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/7vL9uck72zMGUrKZ9"
        },
        {
            id: "Cuadra3_Territorio48",
            coords: [
                [[28.612685, -106.078936], [28.611820, -106.079559], [28.611569, -106.079113], [28.612435, -106.078499]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/gaDwcyoGEpUSNgQt9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio48Data = crearTerritorio(datosTerritorio48);
var territorio48 = territorio48Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio48.poligonos.find(p => p.id === "Cuadra2_Territorio48");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio48 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio48.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio48._marcadorTerritorio = marcadorTerritorio48;
