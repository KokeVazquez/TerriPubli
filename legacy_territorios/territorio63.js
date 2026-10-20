// =============================
// === Territorio 63 ===
// =============================

var datosTerritorio63 = {
    id: "territorio63",
    numeroTerritorio: 63, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio63",
            coords: [
                [28.611267, -106.082085], [28.610876, -106.082390], [28.610325, -106.081450], [28.610717, -106.081155]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/cSDhdA8ytE1apoUr6"
        },
        {
            id: "Cuadra2_Territorio63",
            coords: [
                [[28.611556, -106.081880], [28.611015, -106.080928], [28.610764, -106.081120], [28.611316, -106.082048]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/RfrLgqVgVSpXU1j1A"
        },
        {
            id: "Plaza_Territorio63",
            coords: [
                [28.611716, -106.081767], [28.611571, -106.081870], [28.611292, -106.081376], [28.611427, -106.081277]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "Plaza",
            link: "https://maps.app.goo.gl/LggasbxLpMKWSHyG7"
        },
        {
            id: "Kinder_Territorio63",
            coords: [
                [28.611419, -106.081263], [28.611283, -106.081362], [28.611035, -106.080913], [28.611167, -106.080818]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Kinder",
            link: "https://maps.app.goo.gl/R176do9EHrSnABJs8"
        },
        {
            id: "Cuadra3_Territorio63",
            coords: [
                [28.611136, -106.080762], [28.610727, -106.081061], [28.610477, -106.080605], [28.610880, -106.080311]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/5V1KRbTZw3YqesXW9"
        },
        {
            id: "Cuadra4_Territorio63",
            coords: [
                [[28.610849, -106.080259], [28.610447, -106.080550], [28.610210, -106.080122], [28.610608, -106.079834]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/x6ruXzV4s8JhqCAAA"
        },
        {
            id: "Cuadra5_Territorio63",
            coords: [
                [28.610002, -106.080872], [28.609777, -106.080442], [28.610163, -106.080158], [28.610399, -106.080583]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: " 5",
            link: "https://maps.app.goo.gl/34ftBBAS366GQnRs8"
        },
        {
            id: "Cuadra6_Territorio63",
            coords: [
                [28.610682, -106.081099], [28.610290, -106.081390], [28.610034, -106.080927], [28.610430, -106.080641]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/57Eve11CFZCVNcAL9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio63Data = crearTerritorio(datosTerritorio63);
var territorio63 = territorio63Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio63.poligonos.find(p => p.id === "Cuadra3_Territorio63");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio63 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio63.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio63._marcadorTerritorio = marcadorTerritorio63;
