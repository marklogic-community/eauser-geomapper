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

var features = {};
if (input.getMLFeatures === true) {
  features = cts.search(cts.directoryQuery("/config/"));
}

// Need to combine the geoQuery with query for industries and features
searchResults = cts.search(geoQueryJson).toArray();

var industries;
var found = [];

if (input.firstLoad === true) {
  industries = jsearch.facets((jsearch.facet('Industries', 'industry')
              .orderBy('frequency')
              .slice(0, 100)))
              .result();
}

var industryQuery = cts.trueQuery();
if (input.selections && input.selections.industries.length !== 0) {
  // some industries specified, note if none specified the code works as if
  // all industries are specified, ie. finds users from all industries.
  industryQuery = cts.jsonPropertyValueQuery("industry", input.selections.industries);
}

var featureQuery = cts.trueQuery();
if (input.selections && input.selections.features.length !== 0) {
  // if no features are given, then it is as if this query isn't even included
  // in finalQuery
  featureQuery = cts.jsonPropertyValueQuery("features", input.selections.features);
}


var finalQuery = cts.andQuery([industryQuery, featureQuery, geoQueryJson]);
var matchedUsers = cts.search(finalQuery).toArray();


// searchResults is all users in the search regions
// found is all users in the given industries
// if any were given; expand to include users who use
// specified features as well.
// allFeatures is all ML features

var resultsObj = {
  //results: searchResults,
  allIndustries: industries,
  allFeatures: features,
  matchedUsers: matchedUsers
};

resultsObj;
