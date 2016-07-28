var geojson = require('/MarkLogic/geospatial/geojson.xqy');
var jsearch = require('/MarkLogic/jsearch.sjs');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//bounds is a box representing the current map window
var bounds;
var searchRegions = [];
var geoQueryJson;
var searchResults;

// Check if searchRegions is given, and if no drawn regions, then use map window
if (input.searchRegions && input.searchRegions.features.length === 0) {
  searchRegions.push(cts.box.apply(null,input.mapWindow));
}// if length > 0 so something is drawn on the map
else if (input.searchRegions) {
  //loop through the user's search regions and populate the searchRegions array.
  for (var i = 0; i < input.searchRegions.features.length; i++) {
    //decode input from GeoJSON format
    var r;
    var geometry = input.searchRegions.features[i].geometry;
    var coordinates = geometry.coordinates[0];
    // Check if the region is a box based off the long and lat of the corners
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
  "type=long-lat-point"
);

searchResults = cts.search(geoQueryJson).toArray();

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

