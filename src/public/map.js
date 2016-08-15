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

  // mouse-click event for 'clear map' button
  // $("#clearButton").click(removeAllFeatures);
  // $('span[name="trashFeature"]').click(removeAllFeatures);

  //Selections will hold info on the current state of selected options to query
  selections = {
    features: [],
    industries: [],
    companies: [],
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

  // Events
  map.on('draw:created', function (e) {
    drawnShapes.addLayer(e.layer);
    doPost("/search.sjs", displayGeoJSON, false);
  });
  map.on('draw:edited', function (e) {
    doPost("/search.sjs", displayGeoJSON, false);
  });
  map.on('draw:deleted', function (e) {
    // Update db to save latest changes
    doPost("/search.sjs", displayGeoJSON, false);
  });
}

// Draw markers on map
function drawPage(response) {
  displayIndustries(response.facets.Industry);
  displayFeatures(response);
  displayCompanies(response.facets.Company);

    // After all industries and features are known, fetch the
    // users from the database and display markers
  doPost('/search.sjs', displayGeoJSON, false);
}

/**Copied from Jennifer Tsau and Jake Fowler's geoapp and modified**/
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

    html += '<ul id="displayFeaturesList"><lh>'+ category + "</lh>";
    for (var subfield in features[category]) {
      count = 0;
      if (counts[features[category][subfield]] !== undefined) {
        count = counts[features[category][subfield]];
      }
      html += '<li class="list-group-item"><input checked type="checkbox"class="fChecker"value=';
      html += features[category][subfield]+'>&nbsp;'+features[category][subfield]+'<i> ('+count+')</i></li>';
      selections.features.push(features[category][subfield].toString());
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
    selections.industries.push(obj.toString());
  }

  var $industries =  $("#industryUL .iChecker");
  // Conveniently the length property here refers to the number of elements
  // appended to the selector
  // AKA stuff not normally there, in other words, the length is the number
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
    selections.companies.push(obj.toString());
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

function updateSelections(which, value) {
  var index;

  value = value.trim();
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
///////////////////////////////////////////////////
    // maps "marklogic," "Marklogic," "MarkLogic Corporation," etc... to "MarkLogic"
    var officialValue

    index = selections.companies.indexOf(value);
    if (index > -1) { //unchecked the box
      // Already in the array, aka checked already, so unchecking was done
      selections.companies.splice(index, 1);
    }
    else { // checked the box
      selections.companies.push(value);
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
  removeAllFeatures();

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
  else{
    currentCount = 0;
  }
  $("#count").replaceWith("<span id=\"count\">" + currentCount + " out of " + totalCount + "</span>");
}

function removeAllFeatures() {
  //drawnShapes.clearLayers();
  markers.clearLayers();
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
  // Edit features inside of the details.html page
  // str += "<button id=\"editbutton\"type=\"button\" onclick=\"editFeatures()\">Edit Features</button>";

  // str += "<button id=\"popup-button\" ng-click=\"showDetail=!showDetail\" ng-init=\"showDetail=false\">Show Full Details</button>";
  var username = "" + properties.username;
  str += "<form id=\"popup-button\" action=\"details.html\" method=\"GET\" target=\"_blank\"><input type=\"hidden\" name=\"username\" value=\"" + username + "\"/> <input type=\"submit\" value=\"Show Full Details\"/></form>"
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

// Check if markers are contained in bounds.
// Remove all markers from map that are contained in bounds and not contained
// in any drawn shapes on the map (if any);
function removeMarkers(bounds) {
  // loop through all markers on map
  // and find if any are contained in bounds
  // delete markers if they are contained in bounds
  // and no other drawn shapes

  // drawnShapes is an object of the currently drawn layers still on map;
  // does not contain any of the deleted regions (because they were deleted)
  var layers = drawnShapes.getLayers();
  if (layers.length === 0) {
    // If layers.length is 0 then no other drawn regions on map.
    // Redraw markers that match search selections in this event
    doPost("/search.sjs", displayGeoJSON, false);
    return;
  }


  var markersObj;
  for (var obj in markers._layers) {
    // markersObj is an object of all marker objects currently on the map
    // while there is only one object in markers._layers that has all
    // map markers, it an id that changes every run of the map
    // so using a loop to grab the name; ex: 163
    // ** Same object in memory **
    markersObj = markers._layers[obj]._layers;
  }
  // If markers on map, continue
  // store markers here that shouldn't be deleted
  var safeMarkers = [];
  if (markersObj) {
    for (var marker in markersObj) {
      // looping through all map markers

      // LatLng object of marker to check if contained in the bounds of
      // a region still on the map
      // If marker was only found in the deleted region then it won't be
      // added to safeMarkers[].
      var markerLatLng = markersObj[marker].getLatLng();
      for (var layer in layers) {
        if (layers[layer].getBounds().contains(markerLatLng)) {
          // Mark as safe (not to remove) because this region
          // contains the marker
          // This drawn region is still on the map
          // so don't remove marker from map
          safeMarkers.push(marker);
        }
        else {
          // Marker is not contained by a current drawn layer
          // so don't mark as safe
        }
      }

    }
    // Delete all markers that weren't found in other drawn regions
    for (var marker in markersObj) {
      if (safeMarkers.indexOf(marker) === -1) {
        // Marker isn't safe, must have only been found in th deleted
        // region, so delete from map.
        map.removeLayer(markersObj[marker]);
      }
    }
  }
}
