// =============================
// === Territorio 84 ===
// =============================

var datosTerritorio84 = {
    id: "territorio84",
    numeroTerritorio: 84, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio84",
            coords: [
                [[28.602689, -106.055561], [28.602364, -106.055167], [28.601960, -106.055619], [28.602288, -106.056030]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/FxWpGsFP1mt331yR7"
        },
        {
            id: "Cuadra2_Territorio84",
            coords: [
                [[28.602731, -106.055513], [28.602401, -106.055118], [28.603106, -106.054373], [28.603419, -106.054735]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/jaJMLQ1fFPxazyv39"
        },
        {
            id: "Cuadra3_Territorio84",
            coords: [
                [[28.603458, -106.054687], [28.603144, -106.054334], [28.603814, -106.053587], [28.604130, -106.053944]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/jhVUmkxcycZJxNe36"
        },
        {
            id: "Cuadra4_Territorio84",
            coords: [
                [[28.603107, -106.054295], [28.602782, -106.053930], [28.603461, -106.053178], [28.603777, -106.053536]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/RZ1CmmBEdD8huJAp7"
        },
        {
            id: "Cuadra5_Territorio84",
            coords: [
                [[28.602739, -106.053883], [28.602454, -106.053540], [28.603149, -106.052802], [28.603425, -106.053127]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/QUeXn8CgBV5wr1818"
        },
        {
            id: "Cuadra6_Territorio84",
            coords: [
                [[28.602699, -106.053936], [28.602412, -106.053588], [28.602079, -106.053926], [28.602021, -106.054052], [28.602005, -106.054653], [28.602021, -106.054691]]
            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/tMCk99TBU5Kzw68F8"
        },
        {
            id: "Cuadra7_Territorio84",
            coords: [
                [[28.601992, -106.054762], [28.602313, -106.055121], [28.601927, -106.055544], [28.601942, -106.054666]]

            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "7",
            link: "https://maps.app.goo.gl/19b1z3pdCCgPA5kx5"
        },
        {
            id: "Cuadra8_Territorio84",
            coords: [
                [[28.602360, -106.055074], [28.602059, -106.054742], [28.602742, -106.053976], [28.603063, -106.054329]]

            ],
            color: "rgb(64,224,208)",
            fillOpacity: 0.8,
            weight: 2,
            label: "8",
            link: "https://maps.app.goo.gl/8vvjCmmHn4sTU5qy5"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio84Data = crearTerritorio(datosTerritorio84);
var territorio84 = territorio84Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio84.poligonos.find(p => p.id === "Cuadra3_Territorio84");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio84 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio84.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio84._marcadorTerritorio = marcadorTerritorio84;
