var style; //MapBox API
var token; //MapbBx API
var map; // Leaflet map
var url; // String
var markers; //FeatureGroup
var drawnShapes; //FeatureGroup
var MLFeatures; // Array

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
  map = L.map('mapid').setView([0, 0], 2);
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
  doPost('/search.sjs', "", drawPage, true);

  // mouse-click event for 'clear map' button
  $("#clearButton").click(removeAllFeatures);

  loadMLInfo();
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
    doPost("/search.sjs", "name", displayGeoJSON, false);
  });

  map.on('draw:edited', function (e) {
    doPost("/search.sjs", "name", displayGeoJSON, false);
  });

  map.on('draw:deleted', function (e) {
    // Update db to save latest changes.
    drawnShapes.removeLayer(e.layer);
  });
}

// function clearResults() {
//   $('#collapse1 ul').empty();
//   $('#collapse2 ul').empty();
//   map.on('draw:deleted', function (e) {
//     // update db to save latest changes
//     drawnShapes.removeLayer(e.layer);
//   });
// }

function displayFeatures(features) {
  for (var obj in features.Features) {
    var count = features.Features[obj]; // frequency of each feature
    $('#collapse2 ul').append('<li class="list-group-item"><input type="checkbox" value=""> '+ obj.toString() + ' <i>(' + count.toString() + ')</i>' + '</li>');
  }
}

function displayIndustries(industries) {
  for (var obj in industries.Industries) {
    var count = industries.Industries[obj]; // frequency of each industry
    $('#collapse1 ul').append('<li class="list-group-item"><input type="checkbox" value=""> '+ obj.toString() + ' <i>(' + count.toString() + ')</i>' + '</li>');
  }
}

// Draw markers on map
function drawPage(response) {
  displayGeoJSON(response);

  // displaying industries and features
  // console.log(response);
  // console.log(response.allFeatures.facets.Features); does not work -- no facets under allFeatures
  // console.log(response.allIndustries.facets.Industries);
  // displayFeatures(response.facets.Features);
  displayIndustries(response.allIndustries.facets);
}

function loadMLInfo() {
  // post call to find the ML features
  var payload = {
    getMLFeatures: true
  };

  $.ajax({
    type: "POST",
    url: "search.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      // Idea is to only call this function once and save the result
      // so it might be faster. Called every browser refresh.
      MLFeatures = response.allFeatures;
    },
    error: fail
  });
}

// Find all items clicked (selected) in the Industry and Feature menu lists.
// TODO make this work. First need to grab the html element, right?
function getSelectedItems() {
  var items = document.getElementsByClassName("list-group-item");
  var selectedIndustries = [];
  var selectedFeatures = [];

  // hard coded for now till html elements are created and/or real data is gotten
  selectedIndustries.push('Animalia');
  selectedIndustries.push('Qnekt');
  selectedIndustries.push('Filodyne');
  selectedIndustries.push('Singavera');

  selectedFeatures.push('Combogene');
  selectedFeatures.push('Elemantra');
  selectedFeatures.push('Sequitur');
  selectedFeatures.push('Steelfab');

  var selections = {
    industries: selectedIndustries,
    features: selectedFeatures
  }

  return selections;
}

/**Copied from Jennifer Tsau and Jake Fowler's geoapp and modified**/
// industries is an array of strings ex: ['Dyno', 'Earwax', 'Cubix']
function doPost(url, str, success, firstLoad) {
  var payload = {
    searchString: str,
    selections: getSelectedItems(),
    //mapWindow is used for search if there are no drawn shapes on map
    mapWindow: [
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

// Draw geojson data on map, data will originate from Marketo
function displayGeoJSON(geojsonFeatures) {
  var geojsonLayer = L.geoJson(geojsonFeatures.results, {
    pointToLayer: function (feature, latlng) {
      var marker = new L.CircleMarker(latlng, {radius: 6, fillOpacity: 0.85});
      return marker;
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(formatPopup(feature.properties));
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

// The brighter the red, the more ML features the EA user uses.
// 0 features is black circle marker
// 3+ creates a bright red circle marker
// f is a EA user
function getColor(user) {
  var numFeatures = 0;
  if (user.properties.features && user.properties.features.length) {
    numFeatures = user.properties.features.length;
  } // 57 + 66(3) = 255
  var red = 57 + 66 * numFeatures;
  // Color doesn't display correctly if > 255
  red = red > 255 ? 255 : red;
  //toString(16) converts number to base 16 string ex. 10 -> a
  var c = "#"+red.toString(16)+(50).toString(16)+(50).toString(16);

  return c;
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
  // Clear the text area before adding new items, this method is slow
  document.getElementById("FeatureText").value = formatFeatures();
  // Get the features of the selected user

  $("#userFeatures").show();
}

// firstName, lastname, email, city, state, industry, company

function saveFeatureContents() {
  var featStr = $("#FeatureText").val();
  var featArr = featStr.split(",");

  // Identify the user clicked by their email
  // unique emails so cannot reuse emails for signing up for EA
  var userEmail = map.currUser.properties.email;
  trimmedArr = featArr.map(function(s) {
    return String.prototype.trim.apply(s);
  });

  // ***** TODO ****
  // AJAX call to MarkLogic and send the features in the
  // textarea as params to save into ML, use email to find user in database
}

function formatFeatures() {
  return map.currUser.properties.features.toString();
}

function formatPopup(properties) {
  var str = "";
  if (!properties) return str;

  map.currUser = properties;
  // EA User's name
  if (properties.name) {
    str += "<b>EA User:</b> " + properties.name;
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
  } else if (properties.features.length === 0) {
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
    console.log("hm");
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