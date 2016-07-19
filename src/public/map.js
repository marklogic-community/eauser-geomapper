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

L.tileLayer('https://api.mapbox.com/styles/v1/liangdanica/ciqcx4m59003pbzm9p53mvq36/tiles/256/' +
              '{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlhbmdkYW5pY2EiLCJhIjoiY2lxY3gzeG95MDJkbmZubmUzYmxicW5kMSJ9.5p2qxjIuC7exMGGm19XFeg',
  {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                  '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'Basic',
    accessToken: 'pk.eyJ1IjoibGlhbmdkYW5pY2EiLCJhIjoiY2lxY3gzeG95MDJkbmZubmUzYmxicW5kMSJ9.5p2qxjIuC7exMGGm19XFeg'
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
    polyline: false, //disable polylines
    marker: false, // disable markers
    circle: false // disable circles, additional code required to implement, not supported by geojson
  }
});
map.addControl(drawControl);

// Reference: https://github.com/Leaflet/Leaflet.draw
map.on('draw:created', function (e) {
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
  doPost("/search.sjs", "name", displayGeoJSON, drawnShapes);
});

map.on('draw:edited', function (e) {
  var layers = e.layers;
  layers.eachLayer(function (layer) {
    // loops over each edited layer
    // do whatever you want, most likely save back to db
  });
  doPost("/search.sjs", "name", displayGeoJSON, drawnShapes);
});

map.on('draw:deleted', function (e) {
  // Update db to save latest changes.
  drawnShapes.removeLayer(e.layer);
});

// ****** Copied from Jen and Jake's geoapp ********
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
    success: success,
    error: fail
  });
}

function fail(jqXHR, status, errorThrown) {
  console.log("fail");
}

// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  console.log("geojson success");
  console.log(geojsonFeatures);
  var geojsonLayer = L.geoJson(geojsonFeatures, {
    pointToLayer: function (feature, latlng) {
      var popupOptions = {maxWidth: 250};
      var popupContent = feature.properties.name;
      var MLFeatures = feature.properties.features;
      return new L.CircleMarker(latlng, {radius: 6, fillOpacity: 0.85})
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.properties));
    },
    style: function(feature) {
      return {color: getColor(feature)};
    }
  });
  map.addLayer(geojsonLayer);
}

// The brighter the red, the more ML features the EA user uses.
// 0 features is black circle marker
// 3+ creates a bright red circle marker
var getColor = function(f) {
  var numFeatures = 0;
  if (f.properties.features && f.properties.features.length) {
    numFeatures = f.properties.features.length;
  } // 57 + 66(3) = 255
  var red = 57 + 66 * numFeatures;
  // Color doesn't display correctly if > 255
  red = red > 255 ? 255 : red;
  //toString(16) converts number to base 16 string ex. 10 -> a
  var c = "#"+red.toString(16)+(50).toString(16)+(50).toString(16);

  return c;
}

function formatPopup(properties) {
  var str = "";
  if (!properties) return str;

  // EA User's name
  if (properties.name) {
    str += "<b>EA User:</b> " + properties.name;
    str += "<br>";
  }
  // EA User's company
  if (properties.company && properties.company !== "") {
    str += "<b>Company:</b> " + properties.company;
    str += "<br>";
  }
  // EA User's postal code
  if (properties.postalCode && properties.postalCode !== "") {
    str += "<b>Postal Code:</b> " + properties.postalCode;
    str += "<br>";
  }

  // Refer below for lists in HTML help
  // http://www.htmlgoodies.com/tutorials/getting_started/article.php/3479461
  // Features of ML9 the EA user listed they use when signing up for EA
  if (properties.features && properties.features.length >= 1) {
    // Features used in ML9
    // ** Assuming properties.features will be string array of ML9 Features **
    str += "<b>Features:</b><UL>";
    for (var feature in properties.features) {
      str += "<LI>" + feature;
    }
    str += "</UL>";
    str += "<br>";
  } else if (properties.features.length === 0) {
    str += "<b>Features:</b> None specified";
    str += "<br>";
  }

  return str;
}
