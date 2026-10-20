// =============================
// === Territorio 42 ===
// =============================

var datosTerritorio42 = {
    id: "territorio42",
    numeroTerritorio: 42, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio42",
            coords: [
                [[28.607477, -106.067540], [28.607221, -106.067054], [28.606367, -106.067719], [28.606616, -106.068155]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/qWLWxRETbw6HXn3E9"
        },
        {
            id: "Cuadra2_Territorio42",
            coords: [
                [[28.607198, -106.067011], [28.606923, -106.066539], [28.606045, -106.067174], [28.606342, -106.067671]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/VnWMAcx5Eb4wwHfs9"
        },
        {
            id: "Cuadra3_Territorio42",
            coords: [
                [[28.606900, -106.066494], [28.606633, -106.066025], [28.605752, -106.066675], [28.606018, -106.067132]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/3Ht7muzhHYbC5go59"
        },
        {
            id: "Cuadra4_Territorio42",
            coords: [
                [[28.606596, -106.065981], [28.606320, -106.065588], [28.606295, -106.065582], [28.605483, -106.066164], [28.605729, -106.066612]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/eZWJTtxjtdPMbacAA"
        },
        {
            id: "Cuadra5_Territorio42",
            coords: [
                [[28.606272, -106.065495], [28.605450, -106.066090], [28.605117, -106.065495], [28.605566, -106.065189], [28.605758, -106.065547], [28.606145, -106.065271]]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/xXnof3AHqVqEa9Wa6"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio42Data = crearTerritorio(datosTerritorio42);
var territorio42 = territorio42Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio42.poligonos.find(p => p.id === "Cuadra3_Territorio42");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio42 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio42.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio42._marcadorTerritorio = marcadorTerritorio42;
