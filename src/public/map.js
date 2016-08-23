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
var companies_pretty; // data from /config/companies.json

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

  // Reset Button - Removes all current facets (if any) and reloads the map.
  $("#reset").click(function () {
    removeAllFeatures();
    doPost("/search.sjs", displayGeoJSON, false);
  });

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

      if (counts[features[category][subfield]] !== undefined) {
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

  for (var i = 0; i < $features.length; i++) {
    $features[i].onclick = function(e) {
      if (e.target.value === 0) {
        // e.target.value is 0 when click is on text in html and not on the check box
      }
      else {
        updateSelections("Feature", e.target.nextSibling.data);
        doPost("/search.sjs", displayGeoJSON, false);
      }
    }
  }
}

// industries is an object
function displayIndustries(industries) {

  for (var obj in industries) {
    var count = industries[obj]; // frequency of each industry
    $('#collapse1 ul').append('<li class="list-group-item"><input checked type="checkbox"class="iChecker"value='+obj+'>&nbsp;'+obj+'<i> ('+count+')</i></li>');

    //Add value to the selections so code works with what is being displayed in menu
    updateSelections("Industry", obj.toString());
  }

  var $industries =  $("#industryUL .iChecker");
  // The 'length' property refers to the number of elements
  // appended to the selector
  // This stuff not normally there, in other words, the length is the number
  // of industries in the UL.
  // and they occur at properties 0 -> $industries.length
  for (var i = 0; i < $industries.length; i++) {
    $industries[i].onclick = function(e) {
      if (e.target.value === 0) {
        // e.target.value is 0 when click is on text in html and not on the check box
      }
      else {
        updateSelections("Industry", e.target.nextSibling.data);
        doPost("/search.sjs", displayGeoJSON, false);
      }
    }
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

  for (var i = 0; i < $companies.length; i++) {
    $companies[i].onclick = function(e) {
      if (e.target.value == 0) {
        // e.target.value is 0 when click is on text in html and not on the check box
      }
      else {
        updateSelections("Company", e.target.nextSibling.data);
        doPost("/search.sjs", displayGeoJSON, false);
      }
    }
  }
}

function displayRegions() {
  regionKeys = {};
  shapes = getShapes();

  var geojsonLayer = L.geoJson(shapes, {
    onEachFeature: function (feature, layer) {
      var name = feature.properties;
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

function updateSelections(which, value) {
  var index;

  if (which !== "Region") {
    value = value.trim();
  }

  if (which === "Industry") {
    // Check if 'value' is in the array
    // If index = -1 then value is not in array,
    // user must have just checked the box so add to array
    // If index > -1 then value is in array,
    // so user must have just unchecked the box
    // so remove from array
    index = selections.industries.indexOf(value);

    if (index > -1) { //unchecked the box
      // Already in the array, aka box was checked, so unchecking was just done
      selections.industries.splice(index, 1);
    }
    else { //checked the box
      selections.industries.push(value);
    }
  }


  else if (which === "Feature") {
    index = selections.features.indexOf(value);

    if (index > -1) { //unchecked the box
      // Already in the array, aka checked already, so unchecking was done
      selections.features.splice(index, 1);
    }
    else { //checked the box
      selections.features.push(value);
    }
  }

  else if (which === "Company") {

    index = selections.companies.indexOf(value);
    if (index > -1) { //unchecked the box
      // Already in the array, aka checked already, so unchecking was done
      selections.companies.splice(index, 1);
    }
    else { // checked the box
      selections.companies.push(value);
    }
  }

  else if (which === "Region") {
    var regionName = value.properties;
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

//event when reset map button is clicked
// How should all check boxes in each menu be handled?
// Should they all be reset to as they were on page load?
function removeAllFeatures() {
  markers.clearLayers();
  //drawnShapes.clearLayers();

  // Remove the shapes from the regions menu
  for (var region in regionKeys) {
    // updateSelections will uncheck the region and remove it from map
    updateSelections("Region", region.toString());
  }
  var $regions =  $("#regionUL .rChecker");
  for (var i = 0; i < $regions.length; i++) {
    $regions[i].checked = false; // Unchecks box
  }

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

// Date Range Picker
$(function filterDate() {

  $('input[name="datefilter"]').daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  });

  $('span[name="calendar"]').daterangepicker({
      autoUpdateInput: false,
      locale: {
        cancelLabel: 'Clear'
      }
  });

  $('input[name="datefilter"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  });

  $('input[name="datefilter"]').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('');
  });

  $('span[name="calendar"]').on('apply.daterangepicker', function (ev, picker) {
    $('input[name="datefilter"]').val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  });

  $('span[name="calendar"]').on('cancel.daterangepicker', function (ev, picker) {
    $('input[name="datefilter"]').val('');
  });

});
