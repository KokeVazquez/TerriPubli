// =============================
// === Territorio 10 ===
// =============================

var datosTerritorio10 = {
    id: "territorio10",
    numeroTerritorio: 10, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio10",
            coords: [
                [[28.614186, -106.071287], [28.614032, -106.070998], [28.613980, -106.071044], [28.614139, -106.071326], [28.613757, -106.071615], [28.613439, -106.071053], [28.614293, -106.070416], [28.614607, -106.070989]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/wojX6ojzt3xFTpwu5"
        },
        {
            id: "Cuadra2_Territorio10",
            coords: [
                [[28.613408, -106.070995], [28.613219, -106.070687], [28.614101, -106.070053], [28.614266, -106.070363]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/bAY1adSLM9pzuDdm7"
        },
        {
            id: "Cuadra3_Territorio10",
            coords: [
                [[28.615201, -106.070558], [28.614911, -106.070093], [28.614412, -106.070570], [28.614639, -106.070966]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/mCMnUo6nCLANrfoWA"
        },
        {
            id: "Cuadra4_Territorio10",
            coords: [
                [[28.614879, -106.070039], [28.614400, -106.070509], [28.614151, -106.070018], [28.614653, -106.069639]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/B17dzgunD4BjoavH9"
        },
        {
            id: "Cuadra5_Territorio10",
            coords: [
                [[28.615605, -106.070272], [28.615252, -106.070526], [28.614704, -106.069602], [28.615081, -106.069317]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/w6CNAkB6pqCh4vMX8"
        },
        {
            id: "Cuadra6_Territorio10",
            coords: [
                [[28.615657, -106.070234], [28.615131, -106.069281], [28.615538, -106.068967], [28.616062, -106.069932]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/LWFq4PAzx72sTxvDA"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio10Data = crearTerritorio(datosTerritorio10);
var territorio10 = territorio10Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio10.poligonos.find(p => p.id === "Cuadra3_Territorio10");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio10 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio10.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio10._marcadorTerritorio = marcadorTerritorio10;
