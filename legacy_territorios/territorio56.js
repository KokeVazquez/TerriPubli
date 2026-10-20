// =============================
// === Territorio 56 ===
// =============================

var datosTerritorio56 = {
    id: "territorio56",
    numeroTerritorio: 56, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio56",
            coords: [
                [[28.608014, -106.072974], [28.607116, -106.073605], [28.606863, -106.073152], [28.607735, -106.072493]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/EduLuTMxVN3Yvsqy9"
        },
        {
            id: "Cuadra2_Territorio56",
            coords: [
                [[28.607711, -106.072450], [28.606839, -106.073107], [28.606585, -106.072655], [28.607467, -106.072024]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/J2aCLabXtWxxi82T6"
        },
        {
            id: "Cuadra3_Territorio56",
            coords: [
                [[28.607409, -106.071929], [28.606533, -106.072564], [28.606294, -106.072130], [28.607150, -106.071471]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/QNnosFtcv5sMDtWz5"
        },
        {
            id: "Cuadra4_Territorio56",
            coords: [
                [[28.607130, -106.071429], [28.606269, -106.072083], [28.605993, -106.071597], [28.606867, -106.070945]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/RstTW47ZTGeEyd276"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio56Data = crearTerritorio(datosTerritorio56);
var territorio56 = territorio56Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio56.poligonos.find(p => p.id === "Cuadra3_Territorio56");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio56 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio56.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio56._marcadorTerritorio = marcadorTerritorio56;
