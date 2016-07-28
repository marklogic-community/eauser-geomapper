var geojson = require('/MarkLogic/geospatial/geojson.xqy');
var jsearch = require('/MarkLogic/jsearch.sjs');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//bounds is a box representing the current map window
var bounds;
var geoQueryJson;
var searchResults;

// Check if mapWindow is given, if so search for users
// If not, then searching for users is not needed
if (input.mapWindow) {
  bounds = cts.box.apply(null,input.mapWindow);
  geoQueryJson = cts.jsonPropertyGeospatialQuery(
    "coordinates",
     bounds,
    "type=long-lat-point");
  searchResults = cts.search(geoQueryJson).toArray();
}

var industries = {};
if (input.industries === true) {
  industries = jsearch.facets([jsearch.facet('Industries', 'industry').slice(0,100)]).result();
}

var features = {};
if (input.features === true) {
  features = jsearch.facets([jsearch.facet('Features', 'features').slice(0,215)]).result();
}

var featuresNode;
if (input.getMLFeatures === true) {
  featuresNode = fn.doc("/MLFeatures.json");
}

var results = {
  results: searchResults,
  industries: industries,
  features: featuresNode
};

results;

