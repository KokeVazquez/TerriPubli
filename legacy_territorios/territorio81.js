// =============================
// === Territorio 81 ===
// =============================

var datosTerritorio81 = {
    id: "territorio81",
    numeroTerritorio: 81, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio81",
            coords: [
                [[28.606500, -106.057939], [28.606241, -106.057610], [28.605982, -106.057939], [28.606253, -106.058234]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/wWFGQaJaiR3N416X6"
        },
        {
            id: "Cuadra2_Territorio81",
            coords: [
                [[28.606541, -106.057889], [28.606278, -106.057565], [28.606800, -106.057030], [28.607057, -106.057319]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/XaGJsoap3c8jGrNJ9"
        },
        {
            id: "Cuadra3_Territorio81",
            coords: [
                [[28.606756, -106.056988], [28.606455, -106.056646], [28.605961, -106.057204], [28.606241, -106.057515]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/FACtE9dnkMqBxHEm6"
        },
        {
            id: "Cuadra4_Territorio81",
            coords: [
                [[28.605916, -106.057158], [28.605635, -106.056839], [28.606134, -106.056262], [28.606419, -106.056586]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/6BzmxAG4m87oqRC38"
        },
        {
            id: "Cuadra5_Territorio81",
            coords: [
                [[28.605878, -106.057212], [28.605590, -106.056893], [28.605326, -106.057193], [28.605615, -106.057512]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/V4yNexzsjwXeUn6fA"
        },
        {
            id: "Cuadra6_Territorio81",
            coords: [
                [[28.606203, -106.057563], [28.605915, -106.057255], [28.605656, -106.057565], [28.605940, -106.057889]]
            ],
            color: "fuchsia",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/urqjDNu8NpQn6XtX9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio81Data = crearTerritorio(datosTerritorio81);
var territorio81 = territorio81Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio81.poligonos.find(p => p.id === "Cuadra3_Territorio81");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio81 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio81.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio81._marcadorTerritorio = marcadorTerritorio81;
