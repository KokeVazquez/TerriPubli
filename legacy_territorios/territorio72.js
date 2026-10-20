// =============================
// === Territorio 72 ===
// =============================

var datosTerritorio72 = {
    id: "territorio72",
    numeroTerritorio: 72, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio72",
            coords: [
                [[28.606926, -106.062539], [28.606684, -106.062261], [28.606150, -106.062823], [28.606157, -106.062979], [28.606323, -106.063185]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/k93uE38P5cTGe8aw9"
        },
        {
            id: "Cuadra2_Territorio72",
            coords: [
                [[28.606639, -106.062208], [28.606388, -106.061907], [28.606083, -106.062241], [28.606145, -106.062744]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/WQ3vGTBhqY5DCNgT7"
        },
        {
            id: "Cuadra3_Territorio72",
            coords: [
                [[28.605913, -106.061389], [28.606040, -106.062403], [28.605702, -106.062403], [28.605549, -106.061168], [28.605705, -106.061131], [28.605800, -106.061090], [28.605865, -106.061072]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/5JrxbExV3EJcgb34A"
        },
        {
            id: "Cuadra4_Territorio72",
            coords: [
                [[28.605637, -106.062409], [28.605485, -106.061179], [28.605151, -106.061226], [28.605299, -106.062418]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/4tqczUoKpcy9qyo49"
        },
        {
            id: "Cuadra5_Territorio72",
            coords: [
                [[28.605648, -106.062478], [28.605294, -106.062474], [28.605340, -106.063023], [28.605718, -106.062987]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "5",
            link: "https://maps.app.goo.gl/oqTPD3KJKAjEuecd7"
        },
        {
            id: "Cuadra6_Territorio72",
            coords: [
                [[28.605745, -106.062731], [28.605710, -106.062468], [28.606053, -106.062473], [28.606089, -106.062771], [28.606102, -106.062984], [28.605772, -106.062995]]
            ],
            color: "rgba(221, 210, 0, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "6",
            link: "https://maps.app.goo.gl/KdjFrSxdb5s7sEme8"
        }
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio72Data = crearTerritorio(datosTerritorio72);
var territorio72 = territorio72Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio72.poligonos.find(p => p.id === "Cuadra3_Territorio72");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio72 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio72.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio72._marcadorTerritorio = marcadorTerritorio72;
