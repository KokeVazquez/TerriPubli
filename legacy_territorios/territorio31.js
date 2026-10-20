// =============================
// === Territorio 31 ===
// =============================

var datosTerritorio31 = {
    id: "territorio31",
    numeroTerritorio: 31, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Parque",
            coords: [
                [[28.611966, -106.073011], [28.612525, -106.074007], [28.612270, -106.074192], [28.611725, -106.073190]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Parque",
            link: "https://maps.app.goo.gl/Zhrny1dnb3fVuKhf9"
        },
        {
            id: "Escuela",
            coords: [
                [[28.612199, -106.074241], [28.611590, -106.074685], [28.611050, -106.073698], [28.611656, -106.073242]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: "Escuela",
            link: "https://maps.app.goo.gl/jVi86ZbvbzcaDYqg8"
        },
        {
            id: "Cuadra1_Territorio31",
            coords: [
                [[28.611864, -106.072990], [28.611625, -106.072531], [28.610750, -106.073168], [28.611009, -106.073626]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/DNjH6xtMx96a1MqW9"
        },
        {
            id: "Cuadra2_Territorio31",
            coords: [
                [[28.611601, -106.072488], [28.611352, -106.072018], [28.611111, -106.072181], [28.610450, -106.072663], [28.610722, -106.073127]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/MpGxPY4BPJ4nJiGz6"
        },
        {
            id: "Cuadra3_Territorio31",
            coords: [
                [[28.611316, -106.071947], [28.611034, -106.072146], [28.610525, -106.071696], [28.610988, -106.071371]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/7RzafDLrENnLJSFs8"
        },
        {
            id: "Cuadra4_Territorio31",
            coords: [
                [[28.610966, -106.071329], [28.610789, -106.071002], [28.610490, -106.071214], [28.610211, -106.071420], [28.610488, -106.071662]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/Y5hGEdG3qRMLnBKp8"
        },
        {
            id: "Cuadra5_Territorio31",
            coords: [
                [[28.610567, -106.071800], [28.610471, -106.071709], [28.610173, -106.071448], [28.609881, -106.071666], [28.610140, -106.072112]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/2D15kPMpAnwkeiK99"
        },
        {
            id: "Cuadra6_Territorio31",
            coords: [
                [[28.610599, -106.071833], [28.610995, -106.072175], [28.610414, -106.072597], [28.610168, -106.072154]]
            ],
            color: "blue",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/fRZRf9maXftXs3fM7"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio31Data = crearTerritorio(datosTerritorio31);
var territorio31 = territorio31Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio31.poligonos.find(p => p.id === "Cuadra1_Territorio31");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio31 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio31.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio31._marcadorTerritorio = marcadorTerritorio31;
