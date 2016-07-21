var geojson = require('/MarkLogic/geospatial/geojson.xqy');
var jsearch = require('/MarkLogic/jsearch.sjs');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//log the input to ErrorLog.txt
//xdmp.log("Input received by Kevin's search.sjs: " + xdmp.quote(rawInput));

//searchRegions is an array of the user's search regions
var searchRegions = [];
//bounds is a box representing the current map window
var bounds = cts.box.apply(null,input.mapWindow);

var geoQuery;
var geoQueryJson;
var searchResults;

//On initial page load searchRegions is null
if (input.searchRegions) {
  if (input.searchRegions.features.length == 0) {
    //if the user didn't provide a search region, then use the window bounds.
    searchRegions.push(bounds);
  } else {
    //loop through the user's search regions and populate the searchRegions array.
    for (var i = 0; i < input.searchRegions.features.length; i++) {
      //decode input from GeoJSON format
      var r = geojson.parseGeojson(input.searchRegions.features[i].geometry);
      searchRegions.push(r);
    }
  }

  geoQuery = cts.elementGeospatialQuery(
    xs.QName("coordinates"),
    searchRegions,
    "type=long-lat-point");

  geoQueryJson = cts.jsonPropertyGeospatialQuery(
    "coordinates",
    searchRegions,
    "type=long-lat-point");

  var searchResults = cts.search(geoQueryJson).toArray();
}


var industries = {};
var features = {};

if (input.industries === true) {
  industries = jsearch.facets([jsearch.facet('Industries', 'industry').slice(0,100)]).result();
}

if (input.features === true) {
  features = jsearch.facets([jsearch.facet('Features', 'features').slice(0,215)]).result();
}

var results = {
  results: searchResults,
  industries: industries,
  features: features
};

results;

