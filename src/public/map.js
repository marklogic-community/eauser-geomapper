'use strict'
var style; //MapBox API
var token; //MapBox API
var map; // Leaflet map
var url; // String
var markers; //FeatureGroup
var drawnShapes; //FeatureGroup
var MLFeatures; // Array
var selections; // Object
var maxBounds; // lat long range of entire map
var oms; // Overlapping Marker Spiderfier
var totalCount;
var currentCount;
var shapes;
var regionKeys;

// Run this function before any other
function start() {
  style = keys.mapboxStyle;
  token = keys.mapboxToken;

  maxBounds = L.latLngBounds(
    L.latLng(-90, -180),
    L.latLng(90, 180)
  );

  // Leaflet's map initialization method
  // 'mapid' is the div's name where the map will be found on the web page.
  map = L.map('mapid', {
    minZoom: 2,
    maxBounds: maxBounds,
  }).setView([0, 0], 2);
  url = 'https://api.mapbox.com/styles/v1/liangdanica/' + style + '/tiles/256/{z}/{x}/{y}?access_token=' + token;

  L.tileLayer(url,
  {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'Basic',
    accessToken: token
  }).addTo(map);

  // Initialize Overlapping Marker Spiderfier
  //   (the thing that spreads out markers that overlap)
  oms = new OverlappingMarkerSpiderfier(map);

  // Initialize the FeatureGroup to store editable layers (shapes drawn by user)
  // ref: http://leafletjs.com/2013/02/20/guest-post-draw.html
  markers = new L.FeatureGroup();
  drawnShapes = new L.FeatureGroup();

  // Add the layers to the map so they are displayed
  map.addLayer(markers);
  map.addLayer(drawnShapes);

  // Reset Button removes all current facets (if any) and reloads the map.
  function resetClickHandler(e) {
    var $allSelectBoxes = $('#select_all_f, #select_all_i, #select_all_c');
    var $allBoxes = $('#featureUL .fChecker , #industryUL .iChecker , #companyUL .cChecker');
    var $regionBoxes = $('#regionUL .rChecker');
    var allOrNone = "all";

    $allSelectBoxes.prop('checked', true);
    $allBoxes.prop('checked', true);
    // Choosing to not show drawn regions on map on reset because:
    // 1. Users may not be found in any of the regions
    // 2. Map looks cleaner and simpler without the drawn regions
    $regionBoxes.prop('checked', false);

    updateSelections("Feature", allOrNone, true);
    updateSelections("Industry", allOrNone, true);
    updateSelections("Company", allOrNone, true);

    // Clear regions
    for (var regionName in regionKeys) {
      map.removeLayer(regionKeys[regionName]);
      regionKeys[regionName] = "undefined";
      selections.regions[regionName] = undefined;
      delete regionKeys[regionName];
    }


    doPost("/search.sjs", displayGeoJSON, false);
  }
  $('#reset').click(resetClickHandler);

  //Selections will hold info on the current state of selected options to query
  selections = {
    features: [],
    industries: [],
    companies: [],
    regions: {},
    date1: "",
    date2: ""
  };

  // Load all MarkLogic feature and industry options for dropdown menus
  doPost('/search.sjs', drawPage, true);

  addMapEvents();

  //add "last updated @"" message
  $.ajax({
    type: "GET",
    url: "/scripts/lastUpdate.sjs",
    dataType: "json",
    success: function(response) {
      $("#lastUpdated").append(response.lastUpdated);
    },
    error: fail
  });

  $.ajax({
    type: "GET",
    url: "/scripts/getTotalCount.sjs",
    dataType:"json",
    success: function(response) {
      totalCount = response.totalCount;
      currentCount = totalCount;
    },
    error: fail
  });


}

// Start! Initialize the map and all things awesome.
// For debugging, check MarkLogic's 8040_ErrorLog.txt
// and your browser's inspection tool
start();


function addMapEvents() {
  //drawControl is the map element that allows drawing and deleting of shapes/layers
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

  // Events for drawControl
  map.on('draw:created', function (e) {
    drawnShapes.addLayer(e.layer);
    doPost("/search.sjs", displayGeoJSON, false);
  });

  map.on('draw:edited', function (e) {
    doPost("/search.sjs", displayGeoJSON, false);
  });

  map.on('draw:deleted', function (e) {
    doPost("/search.sjs", displayGeoJSON, false);
  });

}

// Draw markers on map
function drawPage(response) {
  displayIndustries(response.facets.Industry);
  displayFeatures(response);
  displayCompanies(response.facets.Company);
  displayRegions();
  // After all industries and features are known, fetch the
  // users from the database and display markers
  doPost('/search.sjs', displayGeoJSON, false);
}

function getAllGeoJson() {
  var geoObjs = [];

  for (var ndx in map._layers) {
    // check if has a togeoJSON function and has original points to be sure
    // the thing is some type of drawn shape on the map, not just a marker
    // or something else
    if (map._layers[ndx].toGeoJSON && map._layers[ndx]._originalPoints) {
      geoObjs.push(map._layers[ndx].toGeoJSON());
    }
  }

  var obj = {
    type: "FeatureCollection",
    features: geoObjs
  }

  return obj;
}

/** Copied from Jennifer Tsau and Jake Fowler's geoapp and modified **/
function doPost(url, success, firstLoad) {

  var payload = {
    selections: selections,
    mapWindow: [ //Used for search if no drawn shapes
      // TODO change to be entire map range, not just current view
      maxBounds.getSouth(),
      maxBounds.getWest(),
      maxBounds.getNorth(),
      maxBounds.getEast()
    ],
    firstLoad: firstLoad,
    searchRegions: getAllGeoJson()
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
  console.log("ERROR");
  console.log(jqXHR);
  console.log(status);
  console.log(errorThrown);
}

// Populates the feature side menu
function displayFeatures(response) {
  var features = response.features.MarkLogicFeatures;
  var counts = response.facets.Feature;
  var html;
  var count;

  for (var category in features) {
    html = '';

    html += '<ul id=\'displayFeaturesList\'><lh><b>'+ category + '</b></lh>';
    for (var subfield in features[category]) {
      count = 0;

      if (counts && counts[features[category][subfield]] !== undefined) {
        count = counts[features[category][subfield]];
      }
      html += '<li class="list-group-item"><input checked type="checkbox"class="fChecker"value=';
      html += features[category][subfield]+'>&nbsp;'+features[category][subfield]+'<i> ('+count+')</i></li>';
      updateSelections("Feature", features[category][subfield].toString());
    }
    html += '</ul>';
    $('#featureUL').append(html);
  }

  var $features =  $("#featureUL .fChecker");
  var $selectF = $('#select_all_f');

  function featureClickHandler(e) { // for when a feature is clicked
    if (this.checked === false) {
      $('#select_all_f').prop('checked', false);
    }
    var status = $('#select_all_f').prop('checked');
    updateSelections("Feature", e.target.nextSibling.data, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  function selectFClickHandler(e) { // for when select all is clicked
    var status = this.checked;
    var allOrNone;

    for (var i = 0; i < $features.length; i++) {
      $features[i].checked = status;
    }

    if (status === true) { // select all
      allOrNone = "all";
    }
    else { // deselect all
      allOrNone = "none";
    }
    updateSelections("Feature", allOrNone, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  $selectF[0].onclick = selectFClickHandler;
  for (var i = 0; i < $features.length; i++) {
   $features[i].onclick = featureClickHandler;
  }
}

// industries is an object
function displayIndustries(industries) {
  for (var obj in industries) {
    var count = industries[obj]; // frequency of each industry
    $('#collapse1 ul').append('<li class="list-group-item"><input checked type="checkbox"class="iChecker"value='+obj+'>&nbsp;'+obj+'<i> ('+count+')</i></li>');

    //Add value to the selections so code works with what is being displayed in menu
    updateSelections("Industry", obj.toString(), "default");
  }

  var $industries =  $("#industryUL .iChecker");
  var $selectI = $('#select_all_i');

  function industryClickHandler(e) { // for when an industry is clicked
    if (this.checked === false) {
      $('#select_all_i').prop('checked', false);
    }
    var status = $('#select_all_i').prop('checked');
    updateSelections("Industry", e.target.nextSibling.data, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  function selectIClickHandler(e) { // for when select all is clicked
    var status = this.checked;
    var allOrNone;

    for (var i = 0; i < $industries.length; i++) {
      $industries[i].checked = status;
    }

    if (status === true) { // select all
      allOrNone = "all";
    }
    else { // deselect all
      allOrNone = "none";
    }
    updateSelections("Industry", allOrNone, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  $selectI[0].onclick = selectIClickHandler;
  for (var i = 0; i < $industries.length; i++) {
    $industries[i].onclick = industryClickHandler;
  }
}

// companies is an object {}
function displayCompanies(companies) {

  for (var obj in companies) {
    // does not include the count -- assuming that there is only one user for most companies
    $('#collapse3 ul').append('<li class="list-group-item"><input checked type="checkbox" class="cChecker" value='+ obj+ '>&nbsp;' + obj + '</li>');
    updateSelections("Company", obj.toString());
  }

  var $companies = $("#companyUL .cChecker");
  var $selectC = $('#select_all_c');

  function companyClickHandler(e) { // for when a company is clicked
    if (this.checked === false) {
      $('#select_all_c').prop('checked', false);
    }
    var status = $('#select_all_c').prop('checked');
    updateSelections("Company", e.target.nextSibling.data, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  function selectCClickHandler(e) { // for when select all is clicked
    var status = this.checked;
    var allOrNone;
    for (var i = 0; i < $companies.length; i++) {
      $companies[i].checked = status;
    }

    if (status === true) { // select all
      allOrNone = "all";
    }
    else { // deselect all
      allOrNone = "none";
    }
    updateSelections("Company", allOrNone, status);
    doPost("/search.sjs", displayGeoJSON, false);
  }

  $selectC[0].onclick = selectCClickHandler;
  for (var i = 0; i < $companies.length; i++) {
    $companies[i].onclick = companyClickHandler;
  }
}

function displayRegions() {
  regionKeys = {};
  shapes = getShapes();

  for (var region in shapes) {
    var geojsonLayer = L.geoJson(shapes[region], {
      onEachFeature: function (feature, layer) {
        var name = region;
        // Add country name to drop down
        var stuff = $('#collapse4 ul').append('<li class="list-group-item"><input type="checkbox" class="rChecker" value='+ name+'>&nbsp;' + name + '</li>');
        var $regions =  $(".rChecker");
        var length = $regions.length;
        var lastNdx = length - 1;

        $regions[lastNdx].onclick = function(e) {
          updateSelections("Region", feature);
          doPost("/search.sjs", displayGeoJSON, false);
        }
      }
    });
  }

}

function updateSelections(which, value, select) {
  var index;

  if (which !== "Region") {
    value = value.trim();
  }

  if (which === "Industry") {
    index = selections.industries.indexOf(value);
    var $industries =  $("#industryUL .iChecker");

    if (select === "default") { // default settings
      selections.industries.push(value);
    }

    else if (select === true) { // select === true (select all is checked)
      if (value === "all") {
        selections.industries = [];
        pushAll("Industry", $industries);
      }
    }

    else { // select === false
      if (value === "none") {
        selections.industries = [];
      }
      else {
        if (index > -1) {
          selections.industries.splice(index, 1);
        }
        else {
          selections.industries.push(value);
        }
      }
    }
  }

  else if (which === "Feature") {
    index = selections.features.indexOf(value);
    var $features =  $("#featureUL .fChecker");

    if (select === "default") { // default settings
      selections.features.push(value);
    }

    else if (select === true) { // select === true (select all is checked)
      if (value === "all") {
        selections.features = [];
        pushAll("Feature", $features);
      }
    }

    else { // select === false
      if (value === "none") {
        selections.features = [];
      }
      else {
        if (index > -1) {
          selections.features.splice(index, 1);
        }
        else {
          selections.features.push(value);
        }
      }
    }
  }

  else if (which === "Company") {

    index = selections.companies.indexOf(value);
    var $companies = $("#companyUL .cChecker");

    if (select === "default") { // default settings
      selections.companies.push(value);
    }

    else if (select === true) { // select === true (select all is checked)
      if (value === "all") {
        selections.companies = [];
        pushAll("Company", $companies);
      }
    }

    else { // select === false
      if (value === "none") {
        selections.companies = [];
      }
      else {
        if (index > -1) {
          selections.companies.splice(index, 1);
        }
        else {
          selections.companies.push(value);
        }
      }
    }
  }

  else if (which === "Region") {

    var regionName = value.properties.continent;

    if (selections.regions[regionName] != undefined) { //unchecked the box
      // If value is in array then unchecking was done
      map.removeLayer(regionKeys[regionName]);

      selections.regions[regionName] = undefined;
      delete regionKeys[regionName];
    }
    else { // checked the box
      // Indicates the value is present on map
      selections.regions[regionName] = 'defined';
      // Was getting cyclic value error from JSON.parse when using selections.regions[value]
      // to store the result from L.polygon(...);
      // Need to store result of L.polygon so the value can
      // be used to delete off map
      var coords = value.geometry.coordinates;
      var type = value.geometry.type;
      if (type === "MultiPolygon") {
        regionKeys[regionName] = L.multiPolygon(coords);
      }
      else if (type === "Polygon") {
        regionKeys[regionName] = L.polygon(coords);
      }

      map.addLayer(regionKeys[regionName]);
    }
  }

}

// Pushes all checkbox values into the corresponding selections array
function pushAll(which, checkboxes) {
  for (var i = 0; i < checkboxes.length; i++) {
    var values = checkboxes[i].nextSibling.data;
    var selection;
    if (which === "Industry") {
      selection = selections.industries;
    }
    if (which === "Feature") {
      selection = selections.features;
    }
    if (which === "Company") {
      selection = selections.companies;
    }
    selection.push(values);
  }
}

// Icons
// (add more colors if needed)
var red_dot = L.icon({
  "iconUrl": "images/red-dot.png",
  "iconSize": [8, 8]
})


// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  // Every doPost call redraws all markers on the map
  // removeAllFeatures() removes all markers from the map
  markers.clearLayers();

  var geojsonLayer = L.geoJson(geojsonFeatures.documents, {
    pointToLayer: function (feature, latlng) {
      var marker = new L.marker(latlng, {
        "title": feature.fullDetails.firstname + " " + feature.fullDetails.lastname
        // if you want to use red dots...
        // ,"icon": red_dot
      });

      oms.addMarker(marker);
      return marker;
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.fullDetails));
    }
  });

  markers.addLayer(geojsonLayer);

  updateCount(geojsonFeatures.documents);
}

// update the number of users being displayed
function updateCount(points) {
  if (points) {
    currentCount = points.length;
  }
  else {
    currentCount = 0;
  }
  $("#count").replaceWith("<span id=\"count\">" + currentCount + " out of " + totalCount + "</span>");
}

// event when reset map button is clicked
// How should all check boxes in each menu be handled?
// Should they all be reset to as they were on page load?
function removeAllFeatures() {
  markers.clearLayers();
  map.setView([0, 0], 2);
}

// firstName, lastname, email, city, state, industry, company
function formatPopup(properties) {
  var str = "";
  if (!properties) return str;

  map.currUser = properties;
  // EA User's name
  if (properties.firstname ) {
    str += "<b>EA User Name:</b> " + properties.firstname;
    if (properties.lastname)
      str += " " + properties.lastname;
    str += "<br>";
  }
  // EA User's company
  if (properties.company) {
    str += "<b>Company:</b> " + properties.company;
    str += "<br>";
  }
  // EA User's postal code
  if (properties.postalCode) {
    str += "<b>Postal Code:</b> " + properties.postalCode;
    str += "<br>";
  }
  //EA User's industry
  if (properties.industry) {
    str += "<b>Industry:</b> " + properties.industry;
    str += "<br>";
  }

  // Refer below for lists in HTML help
  // http://www.htmlgoodies.com/tutorials/getting_started/article.php/3479461
  // Features of ML9 the EA user listed they use when signing up for EA
  if (properties.features && properties.features.length > 0) {
    // Features used in ML9
    // ** Assuming properties.features will be string array of ML9 Features **
    str += "<b>Features:</b><UL>";
    for (var ndx in properties.features) {
      str += "<LI>" + properties.features[ndx];
    }
    str += "</UL>";
    str += "<br>";
    }
  else if (properties.features && properties.features.length === 0) {
    str += "<b>Features:</b> None specified";
    str += "<br>";
  }

  // str += "<button id=\"popup-button\" ng-click=\"showDetail=!showDetail\" ng-init=\"showDetail=false\">Show Full Details</button>";
  var email = "" + properties.email;
  str += "<form id=\"popup-button\" action=\"details.html\" method=\"GET\" target=\"_blank\"><input type=\"hidden\" name=\"email\" value=\"" + email + "\"/> <input type=\"submit\" value=\"Show Full Details\"/></form>";
  return str;
}
