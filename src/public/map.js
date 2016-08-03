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

  // Load all MarkLogic feature and industry options for dropdown menus
  // and Draw all map markers
  doPost('/search.sjs', drawPage, true);

  // mouse-click event for 'clear map' button
  $("#clearButton").click(removeAllFeatures);

  //Selections will hold info on the current state of selected options to query
  selections = {
    features: [],
    industries: [],
    date1: "",
    date2: ""
  };
  addMapEvents();
}

function addMapEvents() {
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

  map.on('draw:created', function (e) {
    drawnShapes.addLayer(e.layer);
    doPost("/search.sjs", displayGeoJSON, false);
  });

  map.on('draw:edited', function (e) {
    doPost("/search.sjs", displayGeoJSON, false);
  });

  map.on('draw:deleted', function (e) {
    // Update db to save latest changes.
    drawnShapes.removeLayer(e.layer);
  });
  map.on('zoomend', function(e) {
    doPost("/search.sjs", displayGeoJSON, false);
  })

}

// function clearResults() {
//   $('#collapse1 ul').empty();
//   $('#collapse2 ul').empty();
//   map.on('draw:deleted', function (e) {
//     // update db to save latest changes
//     drawnShapes.removeLayer(e.layer);
//   });
// }

// Draw markers on map
function drawPage(response) {
  displayGeoJSON(response);
  displayIndustries(response.facets.Industry);
  displayFeatures(response.features.MarkLogicFeatures);
}

/**Copied from Jennifer Tsau and Jake Fowler's geoapp and modified**/
function doPost(url, success, firstLoad) {
  var payload = {
    selections: selections,
    mapWindow: [ //Used for search if no drawn shapes
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

function displayFeatures(features) {

  for (var ndx in features) {
    //var count = features.Features[obj]; // frequency of each feature
    $('#collapse2 ul').append('<li class="list-group-item"><input type="checkbox"class="fChecker"value='+features[ndx]+'>'+features[ndx]+'</li>');
  }
  var $features =  $("#featureUL li");
  for (var i = 0; i < $features.length; i++) {
    $features[i].onclick = function(e) {
      //e.target.value not working for strings with spaces
      if (e.target.value === 0) {}
      else {
        updateSelections("Feature", e.target.offsetParent.innerText);
        doPost("/search.sjs", displayGeoJSON, false);
      }
    }
  }
}

// Industries with spaces are destroying this, only the first word before the space is represented in e.target.value
function displayIndustries(industries) {
  for (var obj in industries) {
    var count = industries[obj]; // frequency of each industry
    // leaving out count for now, messing with checkbox value field  ...  '<i>('+count.toString()+')</i>'+
    $('#collapse1 ul').append('<li class="list-group-item"><input type="checkbox"class="iChecker"value='+obj+'>'+obj+'</li>');
  }

  var $industries =  $("#industryUL li");
  for (var i = 0; i < $industries.length; i++) {
    $industries[i].onclick = function(e) {
      if (e.target.value === 0) {
        // e.target.value is 0 when click is on text in html and not on the check box
      }
      else {
        updateSelections("Industry", e.target.offsetParent.innerText);
        doPost("/search.sjs", displayGeoJSON, false);
      }
    }
  }

}

function updateSelections(which, value) {
  var index;

  if (which === "Industry") {
    // check if value is in the array
    index = selections.industries.indexOf(value);
    if (index > -1) { //unchecked the box
      // Already in the array, aka checked already, so unchecking was done
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
}

// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  removeAllFeatures();
  var geojsonLayer = L.geoJson(geojsonFeatures.documents, {
    pointToLayer: function (feature, latlng) {
      var marker = new L.CircleMarker(latlng, {radius: 6, fillOpacity: 0.85});
      return marker;
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.preview));
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
  drawnShapes.clearLayers();
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

function editFeatures() {
  var dialog;

  dialog = $("#dialogFeatureEdit");
  if (dialog.dialog("instance") === undefined) {
    initDialog();
  }
  dialog.dialog("open");
  document.getElementById("dialogUserEmail").innerHTML = "<b> Email: </b>" + map.currUser.preview.email;
  // Clear the text area before adding new items, this method is slow
  document.getElementById("FeatureText").value = formatFeatures();
  // Get the features of the selected user

  $("#userFeatures").show();
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

  // ***** TODO ****
  // AJAX call to MarkLogic and send the features in the
  // textarea as params to save into ML, use email to find user in database
}

function formatFeatures() {
  //return map.currUser.preview.features.toString();
  return "No feature data (yet)";
}

// firstName, lastname, email, city, state, industry, company
function formatPopup(properties) {
  var str = "";
  if (!properties) return str;

  map.currUser = properties;
  // EA User's name
  if (properties.firstname ) {
    str += "<b>EA User:</b> " + properties.firstname;
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
  } else if (properties.features && properties.features.length === 0) {
    str += "<b>Features:</b> None specified";
    str += "<br>";
  }
  str += "<button id=\"editbutton\"type=\"button\" onclick=\"editFeatures()\">Edit Features</button>";

  // Option 1:
  // Show full detail button (could also look like a link)
  //  manually compile and link a button controlled by ng-click.
  str += "<button id=\"popup-button\" ng-click=\"showDetail=!showDetail\" ng-init=\"showDetail=false\">Show Full Details</button>";

  // Option 2:
  // Show full detai link.
  //  changes the hash to #/detail/username,
  //  use the username to pull the full document from MarkLogic
  //str += "<a href=\"#/detail/" + properties.name + "\">Show Full Detail</a>";

  return str;
}

$(function filterDate() {

  $('input[name="datefilter"]').daterangepicker({
      autoUpdateInput: false,
      locale: {
          cancelLabel: 'Clear'
      }
  });

  $('input[name="datefilter"]').on('apply.daterangepicker', function apply(ev, picker) {
      $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  });

  $('input[name="datefilter"]').on('cancel.daterangepicker', function cancel(ev, picker) {
      $(this).val('');
  });

  // $('span[name="calendar"]').on("click", function apply(ev, picker) {
  //   console.log("wat");
  //     $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
  // });


});
