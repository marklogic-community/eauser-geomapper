var geojson = require('/MarkLogic/geospatial/geojson.xqy');
var jsearch = require('/MarkLogic/jsearch.sjs');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//searchRegions is an array of the user's search regions
var searchRegions = [];
//bounds is a box representing the current map window
var bounds;
if (input.mapWindow) {
  bounds = cts.box.apply(null,input.mapWindow);
}

var geoQuery;
var geoQueryJson;
var searchResults;

if (input.searchRegions && input.searchRegions.features.length === 0) {
  //if the user didn't provide a search region, then use the window bounds.
  searchRegions.push(bounds);
}
else if (input.searchRegions) {
  //loop through the user's search regions and populate the searchRegions array.
  for (var i = 0; i < input.searchRegions.features.length; i++) {
    //decode input from GeoJSON format
    var r;
    //xdmp.log(input.searchRegions.features[i]);
    var geometry = input.searchRegions.features[i].geometry;
    var coordinates = geometry.coordinates[0];
    if (coordinates.length === 5 && coordinates[0][0] === coordinates[1][0]
                                 && coordinates[1][1] === coordinates[2][1]
                                 && coordinates[2][0] === coordinates[3][0]
                                 && coordinates[3][1] === coordinates[4][1]
                                 && coordinates[4][0] === coordinates[0][0]
                                 && coordinates[4][1] === coordinates[0][1] ) {
      r = geojson.box( {
        type: 'Feature',
        bbox: [coordinates[0][0], coordinates[3][1], coordinates[2][0], coordinates[1][1]],
        geometry: geometry
      });
    }
    else {
      r = geojson.parseGeojson(geometry);
    }

    searchRegions.push(r);
  }
}

geoQueryJson = cts.jsonPropertyGeospatialQuery(
  "coordinates",
  searchRegions,
  "type=long-lat-point");

searchResults = cts.search(geoQueryJson).toArray();


var industries = {};
var features = {};

if (input.industries === true) {
  industries = jsearch.facets([jsearch.facet('Industries', 'industry').slice(0,100)]).result();
}

if (input.features === true) {
  features = jsearch.facets([jsearch.facet('Features', 'features').slice(0,215)]).result();
}

if (input.getMLFeatures === true) {
  //TODO cts.search to find the MLFeatures
  // Find doc based on uri
  var featuresNode = fn.doc("/MLFeatures.json");
  xdmp.log(featuresNode);
}

var results = {
  results: searchResults,
  industries: industries,
  features: featuresNode

};

results;

