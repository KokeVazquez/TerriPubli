// =============================
// === Territorio 38 ===
// =============================

var datosTerritorio38 = {
    id: "territorio38",
    numeroTerritorio: 38, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio38",
            coords: [
                [[28.611698, -106.076099], [28.611301, -106.076384], [28.610716, -106.075373], [28.611114, -106.075088]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/YExqVtbKLc34thQG6"
        },
        {
            id: "Cuadra2_Territorio38",
            coords: [
                [[28.612165, -106.075747], [28.611737, -106.076072], [28.611149, -106.075060], [28.611577, -106.074755]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/wu4Q2Tu2w6gb27TD7"
        },
        {
            id: "Cuadra3_Territorio38",
            coords: [
                [[28.611550, -106.074711], [28.611125, -106.075016], [28.610604, -106.074039], [28.611011, -106.073734]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/CECXzZRtL3rXhvbM7"
        },
        {
            id: "Cuadra4_Territorio38",
            coords: [
                [[28.611086, -106.075048], [28.610688, -106.075330], [28.610136, -106.074356], [28.610562, -106.074068]]
            ],
            color: "rgba(35, 168, 14, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/uv1jeqetwuxomW1p9"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio38Data = crearTerritorio(datosTerritorio38);
var territorio38 = territorio38Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio38.poligonos.find(p => p.id === "Cuadra3_Territorio38");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio38 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio38.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio38._marcadorTerritorio = marcadorTerritorio38;
