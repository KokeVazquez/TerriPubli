


/*

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: false,
    rectangle: false,
    circle: false,
    marker: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
});

function exportarPoligonos() {
  var data = [];

  drawnItems.eachLayer(function (layer) {
    if (layer instanceof L.Polygon) {
      var coords = layer.getLatLngs()[0].map(c =>
        `[${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}]`
      );
      data.push(`var poligono = L.polygon([${coords.join(", ")}], {
  color: "green", weight: 2, fillOpacity: 0.2
}).addTo(map);
poligonos.push(poligono);`);
    }
  });

  var contenido = data.join("\n\n");
  var blob = new Blob([contenido], { type: "text/javascript" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "nuevo_territorio.js";
  a.click();
  URL.revokeObjectURL(url);
}


*/



