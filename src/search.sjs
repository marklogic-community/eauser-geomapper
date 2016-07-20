var geojson = require('/MarkLogic/geospatial/geojson.xqy');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//log the input to ErrorLog.txt
//xdmp.log("Input received by Kevin's search.sjs: " + xdmp.quote(rawInput));

//searchRegions is an array of the user's search regions
var searchRegions = [];
//bounds is a box representing the current map window
var bounds = cts.box.apply(null,input.mapWindow);

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

////////////////////////////////////////////////////////////////////////////////

//log searchRegions to ErrorLog.txt
xdmp.log("searchRegions: " + xdmp.quote(searchRegions));

var geoQuery = cts.elementGeospatialQuery(
  xs.QName("coordinates"),
  searchRegions,
  "type=long-lat-point");

var geoQueryJson = cts.jsonPropertyGeospatialQuery(
  "coordinates",
  searchRegions,
  "type=long-lat-point");

//var geoQueries = cts.orQuery([geoQuery, geoQueryJson]);

/*var qry = geoQuery;
if (input.searchString != "") {
  var wordQuery = cts.wordQuery(input.searchString);
  qry = cts.andQuery([wordQuery,geoQueries]);
} */

var results = cts.search(geoQueryJson).toArray();

results;

