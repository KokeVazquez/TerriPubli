// =============================
// === Territorio 34 ===
// =============================

var datosTerritorio34 = {
    id: "territorio34",
    numeroTerritorio: 34, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio34",
            coords: [
                [[28.615542, -106.081578], [28.615101, -106.080836], [28.615602, -106.080438]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/6CrxffphpJdLiosP9"
        },
        {
            id: "Cuadra2_Territorio34",
            coords: [
                [[28.615608, -106.080342], [28.615062, -106.080772], [28.614580, -106.079888], [28.615016, -106.079579], [28.615271, -106.079992], [28.615291, -106.079989], [28.615307, -106.079971], [28.615303, -106.079948], [28.615191, -106.079767], [28.615580, -106.079476], [28.615650, -106.079537]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/DoZ7m2PGW2AGMgYb9"
        },
        {
            id: "Cuadra3_Territorio34",
            coords: [
                [[28.615548, -106.079433], [28.615443, -106.079269], [28.615052, -106.079550], [28.615161, -106.079721]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/PziGppJedBdTQjx97"
        },
        {
            id: "Vacio",
            coords: [
                [[28.615653, -106.079474], [28.615597, -106.079425], [28.615479, -106.079241], [28.615663, -106.079109]]
            ],
            color: "rgba(70, 44, 11, 1)",
            fillOpacity: 1.0,
            weight: 2,
            label: null,
            link: "https://maps.app.goo.gl/VZ4hoW6iWuveGpJM6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio34Data = crearTerritorio(datosTerritorio34);
var territorio34 = territorio34Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio34.poligonos.find(p => p.id === "Cuadra3_Territorio34"); // Usamos polígono 2 para centrar
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio34 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio34.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio34._marcadorTerritorio = marcadorTerritorio34;
