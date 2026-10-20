// =============================
// === Territorio 26 ===
// =============================

var datosTerritorio26 = {
    id: "territorio26",
    numeroTerritorio: 26, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio26",
            coords: [
                [[28.611176, -106.070653], [28.610802, -106.070936], [28.610226, -106.069962], [28.610606, -106.069690]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/jhvxvBN6y8UfYW7q8"
        },
        {
            id: "Cuadra2_Territorio26",
            coords: [
                [[28.611660, -106.070316], [28.611215, -106.070626], [28.610643, -106.069660], [28.611081, -106.069342]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/qbQQ7mviKrujGfXq8"
        },
        {
            id: "Cuadra3_Territorio26",
            coords: [
                [[28.611057, -106.069301], [28.610773, -106.068838], [28.610336, -106.069139], [28.610620, -106.069615]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/eidVDsj3xhWxRDuf8"
        },
        {
            id: "Cuadra4_Territorio26",
            coords: [
                [[28.610749, -106.068792], [28.610416, -106.069024], [28.610284, -106.068775], [28.610257, -106.068778], [28.610247, -106.068803], [28.610373, -106.069052], [28.609900, -106.069375], [28.609661, -106.068937], [28.610495, -106.068329]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/jfZgV39LTo8ZfDzo9"
        },
        {
            id: "Cuadra5_Territorio26",
            coords: [
                [[28.610581, -106.069643], [28.610200, -106.069924], [28.609924, -106.069415], [28.610299, -106.069162]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/qGGh5fuyC3JKqR6KA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio26Data = crearTerritorio(datosTerritorio26);
var territorio26 = territorio26Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio26.poligonos.find(p => p.id === "Cuadra3_Territorio26");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio26 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio26.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio26._marcadorTerritorio = marcadorTerritorio26;
