'use strict'

//decode the user's input
var rawInput = xdmp.getRequestBody();
var regions = rawInput.toObject();

var final = {"type": "FeatureCollection", "features": []};
var currRegion;

// loop through each region in the regions object
for (var region in regions) {

  //Reset currRegion on each iteration, push to final object at the end of the loop
  currRegion = {"type": "Feature", "properties": {}, "geometry": {"type":"MultiPolygon", "coordinates": []}};
  currRegion.properties.name = "" + region;
  var geoFeatures = regions[region];
  var coordsContainer = [];
  var coordsInner;
  var geometry;

  for (var country in geoFeatures) {

    geometry = geoFeatures[country].geometry;
    if (geometry.type === "Polygon") {
      coordsContainer.push(geometry.coordinates);
    }
    else if (geometry.type === "MultiPolygon" ) {
      // type is multipolygon
      for (var ndx in geometry.coordinates) {
        coordsContainer.push(geometry.coordinates[ndx]);
      }
    }

  }
  //gon as in polyGON, put the points in lat-long order because that is how l.polygon and
  // l.multipolygon expects the points to be formatted.
  // Data is in long-lat order in shapes.js because the data is geoJSON,
  // so this is converting from long-lat order to lat-long order
  for (var ndx in coordsContainer) {
    for (var gon in coordsContainer[ndx][0]) {
      var lat = coordsContainer[ndx][0][gon][0];
      var long = coordsContainer[ndx][0][gon][1];
      coordsContainer[ndx][0][gon][0] = long;
      coordsContainer[ndx][0][gon][1] = lat;
    }
  }

  currRegion.geometry.coordinates = coordsContainer;
  final.features.push(currRegion);
}

final
