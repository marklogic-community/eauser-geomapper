var style = keys.mapboxStyle;
var token = keys.mapboxToken;

//Example GeoJson data, need to automate this with Marketo
var geojsonFeatures = [
  {
    "type": "Feature",
    "properties":
    {
      "name": "Coors Field",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Rockies play!",
      "show_on_map": true, //used for filter, not using a filter currently
      "color": "#ff78f0"
    },
    "geometry":
    {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621] //geojson so coordinates in long, lat
    }
  },
  {
    "type": "Feature",
    "properties":
    {
      "name": "Some Name",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Rockies play!",
      "show_on_map": true, //used for filter, not using a filter, currently
      "color": "#ff7800"
    },
    "geometry":
    {
      "type": "Point",
      "coordinates": [-100.99404, 19.75621] //geojson so coordinates in long, lat
    }
  }
];


var map = L.map('mapid').setView([35.7, -83], 4);

var url = 'https://api.mapbox.com/styles/v1/liangdanica/' + style + '/tiles/256/{z}/{x}/{y}?access_token=' + token;

L.tileLayer("https://api.mapbox.com/styles/v1/liangdanica/ciqcx4m59003pbzm9p53mvq36/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlhbmdkYW5pY2EiLCJhIjoiY2lxY3gzeG95MDJkbmZubmUzYmxicW5kMSJ9.5p2qxjIuC7exMGGm19XFeg",
{
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'Basic',
  accessToken: "pk.eyJ1IjoibGlhbmdkYW5pY2EiLCJhIjoiY2lxY3gzeG95MDJkbmZubmUzYmxicW5kMSJ9.5p2qxjIuC7exMGGm19XFeg"
}).addTo(map);


//Initialize the FeatureGroup to store editable layers (shapes drawn by user)
// ref: http://leafletjs.com/2013/02/20/guest-post-draw.html
var drawnShapes = new L.FeatureGroup();
map.addLayer(drawnShapes);

//Initialize the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
  edit: { //allows editing/deleting of drawn shapes on map
    featureGroup: drawnShapes
  }, //https://github.com/Leaflet/Leaflet.draw/wiki/API-Reference#lcontroldraw
  draw: { //all shapes enabled by default
    polyline: false,
    marker: false,
    circle: false
  }
});
map.addControl(drawControl);

// Reference: https://github.com/Leaflet/Leaflet.draw
map.on('draw:created', function (e) {
  console.log('NEW SHAPE CREATED');
  var type = e.layerType,
    layer = e.layer;

    // Store type of layer to know if it is a circle,
    // type is an unused property, so it will be used for this purpose
    layer.type = type;

  if (type === 'circle') { //Save the radius
    var radius = layer.getRadius();
    layer.radius = radius; //radius is in meters
  }
  else if (type === 'polygon') {
  }
  else if (type === 'rectangle') {
  }

  drawnShapes.addLayer(layer);
});

map.on('draw:edited', function (e) {
  var layers = e.layers;
  layers.eachLayer(function (layer) {
    // loops over each edited layer
    // do whatever you want, most likely save back to db
  });
});

map.on('draw:deleted', function (e) {
  // Update db to save latest changes.
  drawnShapes.removeLayer(e.layer);

  // deleted layer automatically removed from drawnShapes
  doPost("search.sjs", "name", log, drawnShapes);

});

function log() {
  console.log("success");
}

// Copied from Jen and Jake's geoapp
function doPost(url, str, success, drawnLayer) {
  //clearResults();
  var payload = {
    searchString: str,
    //mapWindow is used for search if there are no drawn shapes on map
    mapWindow: [
      map.getBounds().getSouth(),
      map.getBounds().getWest(),
      map.getBounds().getNorth(),
      map.getBounds().getEast()
    ],
    searchRegions: drawnLayer.toGeoJSON()
  };
  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: success
  });
}

// Draw geojson data on map, data will originate from Marketo
geojsonLayer = L.geoJson(geojsonFeatures, {
  style: function (feature) {
    return {color: feature.properties.color};
  },
  pointToLayer: function (feature, latlng) {
    var popupOptions = {maxWidth: 200};
    var popupContent = feature.properties.name;
    return new L.CircleMarker(latlng, {radius: 10, fillOpacity: 0.85})
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.name);
  }
});
map.addLayer(geojsonLayer);
