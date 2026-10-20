// =============================
// === Territorio 22 ===
// =============================

var datosTerritorio22 = {
    id: "territorio22",
    numeroTerritorio: 22, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio22",
            coords: [
                [[28.615674, -106.078897], [28.615397, -106.079100], [28.615144, -106.078621], [28.615701, -106.078228]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/rraYgYAPpfvAP29z8"
        },
        {
            id: "Cuadra2_Territorio22",
            coords: [
                [[28.615720, -106.078084], [28.615740, -106.077526], [28.615711, -106.077479], [28.614875, -106.078118], [28.615093, -106.078529]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/fjzAw4egV9G5v7f4A"
        },
        {
            id: "Cuadra3_Territorio22",
            coords: [
                [[28.615676, -106.077418], [28.615423, -106.076974], [28.614579, -106.077599], [28.614840, -106.078052]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/QiU2no8PkUnyjdNN7"
        },
        {
            id: "Cuadra4_Territorio22",
            coords: [
                [[28.615398, -106.076936], [28.615152, -106.076505], [28.614298, -106.077125], [28.614554, -106.077553]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/5cy2xwS5VuVVNtxm6"
        },
        {
            id: "Cuadra5_Territorio22",
            coords: [
                [[28.615746, -106.077411], [28.615206, -106.076464], [28.615803, -106.076035]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/dEqB1kFhyJUsFoxk9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio22Data = crearTerritorio(datosTerritorio22);
var territorio22 = territorio22Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio22.poligonos.find(p => p.id === "Cuadra3_Territorio22");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio22 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio22.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio22._marcadorTerritorio = marcadorTerritorio22;
