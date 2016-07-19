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



////////////////////////////////////////////////////////////////////////////////



var points = [cts.point(-23.112072, -48.234379),
    cts.point(36.710704, -48.234379),
    cts.point(36.710704, 101.53125),
    cts.point(-23.112072, 101.53125),
    cts.point(-23.112072, -48.234379)];


/*var results = cts.search(
  cts.jsonPropertyChildGeospatialQuery("geometry", "coordinates",
    cts.polygon(points))).toArray(); //needs .toArray()
*/
results;







//format the results to be returned to the front-end
//var features = [];

/*for (var result of results) {
  //for school data (KML), convert to GeoJSON and format description for output.
  // if below should never be taken
  var loc = result.xpath("/Placemark/Point/coordinates/data()").toString().trim();
  if (loc!="") {
    var ptJson = geojson.toGeojson(cts.longLatPoint(loc));
    var name = result.xpath("/Placemark/ExtendedData/Data[@name='facility_n']/value/data()");
    var type = result.xpath("/Placemark/ExtendedData/Data[@name='school_typ']/value/data()");
    var dept = result.xpath("/Placemark/ExtendedData/Data[@name='deptname']/value/data()");
    var feature = {
      type:"Feature",
      properties: {
        name: name,
        description: type + ". " + dept + "."
      },
      geometry: ptJson
    };
    features.push(feature);
  } else {
    //the other types of data are already stored as GeoJSON objects.
    var res = result.toObject();
    features.push(res);
  }
}*/


// http://www.json-generator.com/#

/*
var fc = {
  type: "FeatureCollection",
  "features": features
};
var message = features.length + " results found.";
var response = {
  message: message,
  results: fc
};

response;  */


/*var sr = require('/MarkLogic/jsearch.sjs');
var output = sr.documents().where(
  cts.jsonPropertyRangeQuery("age", '<=', 50)
).slice(0,100).result();*/

/*var results = [];

for (var obj in output.results) {
  results.push(output.results[obj].document);
}*/

//searchRegions;
//results;
