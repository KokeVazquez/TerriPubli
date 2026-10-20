// =============================
// === Territorio 36 ===
// =============================

var datosTerritorio36 = {
    id: "territorio36",
    numeroTerritorio: 36, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio36",
            coords: [
                [[28.614460, -106.079782], [28.613590, -106.080402], [28.613231, -106.079733], [28.614190, -106.079318]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/Yq8paXGoUcr17ZGBA"
        },
        {
            id: "Cuadra2_Territorio36",
            coords: [
                [[28.614166, -106.079276], [28.613547, -106.079462], [28.613209, -106.079686], [28.613069, -106.079444], [28.613912, -106.078831]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/zMK7rpWmqjaa9gBm9"
        },
        {
            id: "Cuadra3_Territorio36",
            coords: [
                [[28.613853, -106.078754], [28.613029, -106.079345], [28.612531, -106.078459], [28.613346, -106.077854]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/EMrkbmNwdzPhiVeW7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio36Data = crearTerritorio(datosTerritorio36);
var territorio36 = territorio36Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio36.poligonos.find(p => p.id === "Cuadra2_Territorio36"); // Usamos el polígono 2 para centrar
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio36 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio36.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio36._marcadorTerritorio = marcadorTerritorio36;
