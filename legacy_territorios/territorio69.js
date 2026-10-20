// =============================
// === Territorio 69 ===
// =============================

var datosTerritorio69 = {
    id: "territorio69",
    numeroTerritorio: 69, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio69",
            coords: [
                [[28.607794, -106.063565], [28.608080, -106.063240], [28.607830, -106.062936], [28.607134, -106.063736], [28.607304, -106.063818], [28.607483, -106.063947]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/oGscAxQdQB2qgSsz5"
        },
        {
            id: "Cuadra2_Territorio69",
            coords: [
                [[28.608737, -106.062502], [28.608478, -106.062222], [28.607873, -106.062892], [28.608123, -106.063191]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/K96mJ7nW8MEoaPbm7"
        },
        {
            id: "Cuadra3_Territorio69",
            coords: [
                [[28.608778, -106.062456], [28.608518, -106.062175], [28.609200, -106.061402], [28.609451, -106.061701]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/zhzPPN5omcbJhQV48"
        },
        {
            id: "Cuadra4_Territorio69",
            coords: [
                [[28.609936, -106.061188], [28.609714, -106.061419], [28.609701, -106.061463], [28.609494, -106.061657], [28.609241, -106.061355], [28.609913, -106.060611], [28.610173, -106.060915]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/FdW5GU3EZfxm5ELw7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio69Data = crearTerritorio(datosTerritorio69);
var territorio69 = territorio69Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio69.poligonos.find(p => p.id === "Cuadra3_Territorio69");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio69 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio69.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio69._marcadorTerritorio = marcadorTerritorio69;
