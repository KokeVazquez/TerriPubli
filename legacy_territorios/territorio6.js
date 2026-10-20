// =============================
// === Territorio 6 ===
// =============================

var datosTerritorio6 = {
    id: "territorio6",
    numeroTerritorio: 6, // Número que se mostrará en el marcador principal
    poligonos: [
        {
            id: "Cuadra1_Territorio6",
            coords: [
                [28.616952, -106.075099], [28.616344, -106.075535], [28.616406, -106.074756], [28.616444, -106.074646], [28.616500, -106.074528], [28.616570, -106.074415]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "1",
            link: "https://maps.app.goo.gl/GdtvbxM34zaqyjsf6"
        },
        {
            id: "Cuadra2_Territorio6",
            coords: [
                [28.617535, -106.074673], [28.616987, -106.075075], [28.616590, -106.074371], [28.616611, -106.074247], [28.616650, -106.074117], [28.616673, -106.074055], [28.616698, -106.073996], [28.616764, -106.073912], [28.616967, -106.073758]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "2",
            link: "https://maps.app.goo.gl/bCCy54zQfT6fakyA9"
        },
         {
            id: "Cuadra3_Territorio6",
            coords: [
                [28.617887, -106.074434], [28.617569, -106.074651], [28.616998, -106.073735], [28.617045, -106.073708]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "3",
            link: "https://maps.app.goo.gl/UAhum7kv23nypfkh9"
        },
        {
            id: "Cuadra4_Territorio6",
            coords: [
                [28.618404, -106.074026], [28.617920, -106.074410], [28.617077, -106.073683], [28.617832, -106.073093]
            ],
            color: "rgba(255, 7, 7, 1)",
            fillOpacity: 0.8,
            weight: 2,
            label: "4",
            link: "https://maps.app.goo.gl/R714Y8pMGsxfD7VT8"
        },
        
    ],
};

// ------------------------------
// Crear territorio con base
// ------------------------------
var territorio6Data = crearTerritorio(datosTerritorio6);
var territorio6 = territorio6Data.grupo;

// ------------------------------
// Crear marcador inicial del territorio (número)
// ------------------------------
var polFijo = datosTerritorio6.poligonos.find(p => p.id === "Cuadra2_Territorio6");
var centro = L.polygon(polFijo.coords).getBounds().getCenter();

var marcadorTerritorio6 = L.marker(centro, {
    icon: L.divIcon({
        className: "etiquetaTerritorio",
        html: `<b>${datosTerritorio6.numeroTerritorio}</b>`,
        iconSize: [20, 20]
    })
}).addTo(map);

// Guardamos la referencia en el grupo para poder ocultarla desde index
territorio6._marcadorTerritorio = marcadorTerritorio6;
