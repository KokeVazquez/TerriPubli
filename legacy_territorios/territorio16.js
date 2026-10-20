// =============================
// === Territorio 16 ===
// =============================

var datosTerritorio16 = {
    id: "territorio16",
    numeroTerritorio: 16, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio16",
            coords: [
                [[28.611115, -106.064872], [28.610829, -106.064379], [28.610191, -106.065363], [28.610273, -106.065501]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/VTUNYKgvzJ9pn6hf9"
        },
        {
            id: "Cuadra2_Territorio16",
            coords: [
                [[28.611158, -106.064847], [28.610855, -106.064341], [28.611305, -106.063621], [28.611729, -106.064420]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/TGofCLY69XREuacC6"
        },
        {
            id: "Cuadra3_Territorio16",
            coords: [
                [[28.612186, -106.064101], [28.611775, -106.064397], [28.611330, -106.063583], [28.611602, -106.063184], [28.611649, -106.063130]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/ASaJUFGACM8hkZWf6"
        },
        {
            id: "Cuadra4_Territorio16",
            coords: [
                [[28.612634, -106.063786], [28.612220, -106.064078], [28.611677, -106.063098], [28.611755, -106.063017], [28.612083, -106.062784]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/3vRDS2otgNTGqTo98"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio16Data = crearTerritorio(datosTerritorio16);
var territorio16 = territorio16Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio16.poligonos.find(p => p.id === "Cuadra4_Territorio16");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio16 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio16.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio16._marcadorTerritorio = marcadorTerritorio16;
