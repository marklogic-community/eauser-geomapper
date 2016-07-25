var style = keys.mapboxStyle;
var token = keys.mapboxToken;

var map = L.map('mapid').setView([0, 0], 2);

var url = 'https://api.mapbox.com/styles/v1/liangdanica/' + style + '/tiles/256/{z}/{x}/{y}?access_token=' + token;

// Initialize the FeatureGroup to store editable layers (shapes drawn by user)
// ref: http://leafletjs.com/2013/02/20/guest-post-draw.html
var drawnShapes = new L.FeatureGroup();
var markers = new L.FeatureGroup();
// Load initial features and industries options for dropdown menus
// And draw all map markers
doPost('/search.sjs', "", initPage, drawnShapes, true);

L.tileLayer(url,
{
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'Basic',
  accessToken: token
}).addTo(map);


$("#clearButton").click(removeAllFeatures);

// Zoomed out on world, start with all points, filter
map.addLayer(drawnShapes);
map.addLayer(markers);

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
    layer.radius = layer.getRadius(); //radius is in meters
  }
  else if (type === 'polygon') { }
  else if (type === 'rectangle') {

  }

  drawnShapes.addLayer(layer);
  doPost("/search.sjs", "name", displayGeoJSON, drawnShapes, false);
});

map.on('draw:edited', function (e) {
  var layers = e.layers;
  layers.eachLayer(function (layer) {
    // loops over each edited layer
    // do whatever you want, most likely save back to db
  });
  doPost("/search.sjs", "name", displayGeoJSON, drawnShapes, false);
});

map.on('draw:deleted', function (e) {
  // Update db to save latest changes.
  drawnShapes.removeLayer(e.layer);
});

function initPage(response) {
  displayGeoJSON(response);
  populateMenus(response);
}

function populateMenus(response) {
  clearResults();
  displayFeatures(response.features.facets);
  displayIndustries(response.industries.facets);
}

function clearResults() {
  $("#collapse1 ul").empty();
  $("#collapse2 ul").empty();
}

function displayFeatures(features) {
  for (var obj in features.Features) {
    $("#collapse2 ul").append('<li class="list-group-item"><input type="checkbox" value=""> '+ obj.toString() + '</li>');
  }
}

function displayIndustries(industries) {
  for (var obj in industries.Industries) {
    $("#collapse1 ul").append('<li class="list-group-item"><input type="checkbox" value=""> '+ obj.toString() + '</li>');
  }
}
function clickedItems() {
  var items = document.getElementsByClassName("list-group-item");
  console.log(items);
}

// ****** Copied from Jen and Jake's geoapp and modified********
function doPost(url, str, success, drawnLayer, firstLoad) {
  //console.log(drawnShapes.toGeoJSON());
  var payload = {
    searchString: str,
    //mapWindow is used for search if there are no drawn shapes on map
    mapWindow: [
      map.getBounds().getSouth(),
      map.getBounds().getWest(),
      map.getBounds().getNorth(),
      map.getBounds().getEast()
    ],
    industries: firstLoad,
    features: firstLoad,
    searchRegions: drawnShapes.toGeoJSON()
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
  console.log(errorThrown);
}

// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  var geojsonLayer = L.geoJson(geojsonFeatures.results, {
    pointToLayer: function (feature, latlng) {
      return new L.CircleMarker(latlng, {radius: 6, fillOpacity: 0.85});
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.properties));
    },
    style: function(feature) {
      return {color: getColor(feature)};
    }
  });
  markers.addLayer(geojsonLayer);

}

function removeAllFeatures() {
  drawnShapes.clearLayers();
  markers.clearLayers();
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
    for (var ndx in properties.features) {
      str += "<LI>" + properties.features[ndx];
    }
    str += "</UL>";
    str += "<br>";
  } else if (properties.features.length === 0) {
    str += "<b>Features:</b> None specified";
    str += "<br>";
  }

  return str;
}
