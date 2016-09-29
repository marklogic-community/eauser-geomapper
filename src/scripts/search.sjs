/* global require, cts, xdmp */

var geojson = require('/MarkLogic/geospatial/geojson.xqy');
var jsearch = require('/MarkLogic/jsearch.sjs');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

var searchRegions = [];
var geoQueryJson;

var queries = [];

// Check if searchRegions is given, and if no drawn regions, then use map window
if (input.searchRegions.features && input.searchRegions.features.length === 0) {
  searchRegions.push(cts.box.apply(null,input.mapWindow));
}// if length > 0 so something is drawn on the map
else if (input.searchRegions.features && !input.firstLoad) {
  //loop through the user's search regions and populate the searchRegions array.
  for (var i = 0; i < input.searchRegions.features.length; i++) {
    //decode input from GeoJSON format
    var r;
    var geometry = input.searchRegions.features[i].geometry;
    var coordinates = geometry.coordinates[0];
    // Check if the region is a box based off the long and lat of the corners
    if (coordinates.length === 5 && coordinates[0][0] === coordinates[1][0] &&
                                    coordinates[1][1] === coordinates[2][1] &&
                                    coordinates[2][0] === coordinates[3][0] &&
                                    coordinates[3][1] === coordinates[4][1] &&
                                    coordinates[4][0] === coordinates[0][0] &&
                                    coordinates[4][1] === coordinates[0][1] ) {
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

geoQueryJson = cts.andQuery([cts.directoryQuery('/users/'), cts.jsonPropertyGeospatialQuery(
  'coordinates',
  searchRegions,
  'type=long-lat-point'
)]);

queries.push(geoQueryJson);

// Object to return
var users = {};

if (input.selections && input.selections.industries.length !== 0) {
  // some industries specified, note if none specified the code works as if
  // all industries are specified, ie. finds users from all industries.
  queries.push(cts.jsonPropertyValueQuery('industry', input.selections.industries));
}

if (input.selections && input.selections.features.length !== 0) {
  // if no features are given, then it is as if this query isn't even included
  // in finalQuery
  queries.push(cts.jsonPropertyValueQuery('features', input.selections.features));
}

if (input.selections && input.selections.companies.length !== 0) {
  // some companies specified, note if none specified the code works as if
  // all companies are specified, ie. finds users from all companies.
  queries.push(cts.jsonPropertyValueQuery('company', input.selections.companies));
}

if (input.selections && input.selections.eaVersions.length !== 0) {
  queries.push(cts.jsonPropertyValueQuery('ea_version', input.selections.eaVersions));
}

users =
  jsearch.facets([
      jsearch.facet('Industry', cts.jsonPropertyReference('industry')).orderBy('frequency', 'descending').slice(0,300),
      jsearch.facet('Feature', cts.jsonPropertyReference('features')).orderBy('frequency', 'descending').slice(0,50),
      jsearch.facet('Company', cts.jsonPropertyReference('company')).orderBy().slice(0,300),
      jsearch.facet('EAversions', cts.jsonPropertyReference('ea_version')).orderBy('item', 'ascending')
    ],
    jsearch.documents().slice(0,300).map({extract:{select:'all'}})
  )
  .where(
    cts.andQuery(queries),
    cts.directoryQuery('/config/')
  )
  .result();

for (var obj in users.documents) {
  users.documents[obj] = users.documents[obj].extracted[0];
}

// Loads all ML9 features from /config/features/MLFeatures.json
if (input.firstLoad === true) {
  users.features = cts.search(cts.directoryQuery('/config/features/'));
}

users;
