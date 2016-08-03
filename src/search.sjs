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

geoQueryJson = cts.andQuery([cts.directoryQuery("/users/"), cts.jsonPropertyGeospatialQuery(
  "coordinates",
  searchRegions,
  "type=long-lat-point"
)]);

var features = {};
if (input.getMLFeatures === true) {
  features = cts.search(cts.directoryQuery("/config/"));
}

searchResults = cts.search(geoQueryJson).toArray();

var industries = {};
var found = [];

if (input.firstLoad === true) {
  industries = jsearch.facets((jsearch.facet('Industries', 'industry')
              .orderBy('frequency')
              .slice(0, 100)))
              .result();
}
//don't want to run this on firstLoad becuase input.industries is undefined
if (input.selections && input.selections.industries.length !== 0) { // some industries specified
  // function to find all users in a given industry
  // 'ind' as a string parameter represents the industry
  // outputs array of GeoJSON objects

  // separate the array input
  var allIndustries = [];
  for (i = 0 ; i < input.selections.industries.length; i++) {
    allIndustries.push({'industry': input.selections.industries[i]});
  }

  // extracted returns the facets (# of users in industry ind) and documents
  var extracted =
    jsearch.facets(
    jsearch.facet('Industries', 'industry'),
    jsearch.documents().map({snippet: false, extract:{select: 'all'}}))
  .where(jsearch.byExample({'$or': allIndustries}))
  .result('iterator');

  // extracting only the documents part of the GeoJSON files
  // push includes the score, fitness, uri, and extracted (main info is here)
  for (var i of extracted.documents) {
    found.push(i);
  }
}

// searchResults is all users in the search regions
// found is all users in the given industries
// if any were given; expand to include users who use
// specified features as well.
// allFeatures is all ML features

var resultsObj = {
  results: searchResults,
  allIndustries: industries,
  allFeatures: features,
  foundUsers: found
};

resultsObj;
