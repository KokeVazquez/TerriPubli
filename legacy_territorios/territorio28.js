// =============================
// === Territorio 28 ===
// =============================

var datosTerritorio28 = {
    id: "territorio28",
    numeroTerritorio: 28, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio28",
            coords: [
                [[28.608374, -106.066888], [28.607522, -106.067500], [28.607275, -106.067028], [28.608105, -106.066409]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/qLnanZaLcrSnzZD89"
        },
        {
            id: "Cuadra2_Territorio28",
            coords: [
                [[28.608069, -106.066347], [28.607790, -106.065905], [28.606962, -106.066508], [28.607238, -106.066980]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/YQfyUw7d9pHNqGHz5"
        },
        {
            id: "Cuadra3_Territorio28",
            coords: [
                [[28.607766, -106.065850], [28.607500, -106.065453], [28.607466, -106.065442], [28.607433, -106.065453], [28.606671, -106.065999], [28.606937, -106.066464]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/26iHCLFpHGx3ptWdA"
        },
        {
            id: "Cuadra4_Territorio28",
            coords: [
                [[28.606644, -106.065955], [28.606361, -106.065537], [28.607078, -106.065053], [28.607449, -106.065380]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/Rs2KuPrGYV72eQGd9"
        },
        {
            id: "Cuadra5_Territorio28",
            coords: [
                [[28.606763, -106.065204], [28.606329, -106.065478], [28.606179, -106.065248]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/HySgvsukXzr8C2NH9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio28Data = crearTerritorio(datosTerritorio28);
var territorio28 = territorio28Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio28.poligonos.find(p => p.id === "Cuadra3_Territorio28");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio28 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio28.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio28._marcadorTerritorio = marcadorTerritorio28;
