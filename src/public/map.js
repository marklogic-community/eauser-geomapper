var style; //MapBox API
var token; //MapBox API
var map; // Leaflet map
var url; // String
var markers; //FeatureGroup
var drawnShapes; //FeatureGroup
var MLFeatures; // Array
var selections; // Object

// Start! Initialize the map and all things awesome.
// For debugging, check MarkLogic's 8040_ErrorLog.txt
// and your browser's inspection tool
start();

// Run this function before any other
function start() {
  style = keys.mapboxStyle;
  token = keys.mapboxToken;

  // Leaflet's map initialization method
  // 'mapid' is the div's name where the map will be found on the web page.
  map = L.map('mapid', {"minZoom": 2}).setView([0, 0], 2);
  url = 'https://api.mapbox.com/styles/v1/liangdanica/' + style + '/tiles/256/{z}/{x}/{y}?access_token=' + token;

  L.tileLayer(url,
  {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'Basic',
    accessToken: token
  }).addTo(map);

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

  // After all industries and features are known, fetch the users from the database and display them
  doPost('/search.sjs', displayGeoJSON, false);

  addMapEvents();

  //add "last updated @"" message
  $.ajax({
    type: "GET",
    url: "/scripts/lastUpdate.sjs",
    dataType: "json",
    success: function(response) {
      console.log("success");
      $("#lastUpdated").append(response.lastUpdated);
    },
    error: function(jqXHR, status, errorThrown) {
      console.log("ERROR");
      console.log(jqXHR);
      console.log(status);
      console.log(errorThrown);
    }
  });
}

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
    // Update db to save latest changes.

    // Loop through each deleted layer
    /// (More than one could have been deleted)
    for (var i in e.layers._layers) {
      // Passing bounds of deleted drawn search regions
      removeMarkers(e.layers._layers[i].getBounds());
    }

  });

}

// Check if markers are contained in bounds.
// Remove all markers from map that are contained in bounds and not contained
// in any drawn shapes on the map (if any);
function removeMarkers(bounds) {
  // loop through all markers on map
  // and find if any are contained in bounds
  // delete markers if they are contained in bounds
  // and no other drawn shapes
  var layers = drawnShapes.getLayers();
  if (layers.length === 0) {
    //if layers.length = 0 then no other drawn regions on map
    // redraw markers that match search selections in this event
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
      // Check if the deleted drawn region (bounds) contains any markers
      // on the map;

      // LatLng object of marker to check if contained in the bounds of
      // a deleted search region
      var markerLatLng = markersObj[marker].getLatLng();
      if (bounds.contains(markerLatLng)) {
        // Before deleting, check if the marker is contained
        // in other drawn regions. Don't delete marker if in
        // other drawn region.
        for (var layer in layers) {
          if (layers[layer].getBounds().contains(markerLatLng)) {
            // Mark as safe (not to remove) because this region
            // contains the marker
            // This drawn region is still on the map
            // so don't remove marker from map
            safeMarkers.push(marker);
          }
          else {
            // Marker is not contained by current drawn layer
            // so don't mark as safe
          }
        }

      }
      else { // if marker not contained by deleted shape,
        // then don't delete from map

        // Because there was a drawn region on the map
        // before the delete, the only markers on the map should
        // be those contained in a drawn search region on the map
        // so assume this marker is within a different drawn region on map
        // and mark it as safe
        safeMarkers.push(marker);
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

// Draw markers on map
function drawPage(response) {
  displayIndustries(response.facets.Industry);
  displayFeatures(response.features.MarkLogicFeatures);
  displayCompanies(response.facets.Company);
}

/**Copied from Jennifer Tsau and Jake Fowler's geoapp and modified**/
function doPost(url, success, firstLoad) {

  var payload = {
    selections: selections,
    mapWindow: [ //Used for search if no drawn shapes
      // TODO change to be entire map range, not just current view
      map.getBounds().getSouth(),
      map.getBounds().getWest(),
      map.getBounds().getNorth(),
      map.getBounds().getEast()
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
  console.log(errorThrown);
}

//features is an array []
function displayFeatures(features) {

  for (var ndx in features) {
    var count = features[ndx]; // frequency of each feature
    $('#collapse2 ul').append('<li class="list-group-item"><input checked type="checkbox"class="fChecker"value='+features[ndx]+'>'+features[ndx]+'</li>');
    // Commented out because no feature data yet in database
    //selections.features.push(features[ndx].toString());
  }
  var $features =  $("#featureUL .fChecker");
  for (var i = 0; i < $features.length; i++) {
    $features[i].onclick = function(e) {
      if (e.target.value === 0) {
        // e.target.value is 0 when click is on text in html and not on the check box
      }
      else {
        // Commented out for now because no feature data in database.
        //updateSelections("Feature", e.target.nextSibling.data);
        //doPost("/search.sjs", displayGeoJSON, false);
      }
    }
  }
}

// industries is an object {}
function displayIndustries(industries) {

  for (var obj in industries) {
    var count = industries[obj]; // frequency of each industry
    $('#collapse1 ul').append('<li class="list-group-item"><input checked type="checkbox"class="iChecker"value='+obj+'>'+obj+'<i>('+count+')</i></li>');
    //Add value to the selections so code works with what is being displayed
    selections.industries.push(obj.toString());
  }
  // Problem lives with how the UL is selected adnd what it is receiving,
  var $industries =  $("#industryUL .iChecker");

  // Conveniently the length property here refers to the number of elements appended to the selector
  // AKA stuff not normally there, in other words, the length is the number of industries in the UL.
  // and they occur at properties 0 -> $industries.length (y) Thank you, God.
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

    $('#collapse3 ul').append('<li class="list-group-item"><input checked type="checkbox" class="cChecker" value='+ obj+ '>' + obj + '</li>');
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
  if (which === "Industry") {
    // Check if value is in the array
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
}

// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  // Every doPost call redraws all markers on the map
  // removeAllFeatures() removes all markers from the map
  removeAllFeatures();

  var geojsonLayer = L.geoJson(geojsonFeatures.documents, {
    pointToLayer: function (feature, latlng) {
      var marker = new L.CircleMarker(latlng, {radius: 3, fillOpacity: 0.85});
      return marker;
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.fullDetails));
    },
    style: function(feature) {
      return {color: getColor(feature)};
    }
  });
  geojsonLayer.on('click', function(e) {
    // Set map's currUser field so we can know who was clicked
    // Need to know who was clicked for the dialog box to load
    // their features and save back to DB if needed.
    map.currUser = e.layer.feature;
  });
  markers.addLayer(geojsonLayer);
}

function removeAllFeatures() {
  //drawnShapes.clearLayers();
  markers.clearLayers();
}

// Color of map marker corresponds to number of features the user uses
// black: 0 features
// red: 1 feature
// Green: 2 features
// Yellow: 3+ features
function getColor(user) {
  return "#FF0000";

  // Commented out because have no data on number of features for EA Users as of now (8/3/2016)
  // Will tinker with colors when feature data is available

  /*var numFeatures = 0; // 0 features
  var color = "#000000";
  if (user.preview.features && user.preview.features.length) {
    numFeatures = user.preview.features.length;
  }
  if (numFeatures === 1) {
    color = "#FF0000"; //red
  }
  else if (numFeatures === 2) {
    color = "#00FF00"; // green
  }
  else if (numFeatures >= 3) { //blue
    color = "#0000FF";
  }
  return color */
}

// Initialize the dialog window .
// Add modifications to its appearance and functionality as needed.
function initDialog() {
  $('#dialogFeatureEdit').dialog({
    autoOpen: true,
    modal: true,
    width: 400,
    height: 200,
    buttons: {
      Save: function() {
        // TODO save the contents of the FeatureText textarea and save to MarkLogic
        saveFeatureContents();
        $(this).dialog('close');
      },
      Cancel: function() {
        $(this).dialog('close');
      }
    }
  });
}

function saveFeatureContents() {
  var featStr = $("#FeatureText").val();
  var featArr = featStr.split(",");

  // Identify the user clicked by their email
  // unique emails so cannot reuse emails for signing up for EA
  var userEmail = map.currUser.preview.email;
  trimmedArr = featArr.map(function(s) {
    return String.prototype.trim.apply(s);
  });

//   // ***** TODO ****
//   // AJAX call to MarkLogic and send the features in the
//   // textarea as params to save into ML, use email to find user in database
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
