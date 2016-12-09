<template>
  <div id="mapid"></div>
</template>

<script>
  export default {
    props: ['features', 'documents'],
    data: function() {
      return {
        map: {},
        maxBounds: {},
        regionPolygons: {},
        drawnShapes: {},
        markers: {},
        redMarker: L.icon({
          iconUrl: 'images/red-marker.png',
          shadowURL: 'images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      };
    },
    mounted: function() {
      'use strict';
      var vm = this;

      function addMapEvents() {
        //drawControl is the map element that allows drawing and deleting of shapes/layers
        var drawControl = new L.Control.Draw({
          edit: { //allows editing/deleting of drawn shapes on map
            featureGroup: vm.drawnShapes
          }, //https://github.com/Leaflet/Leaflet.draw/wiki/API-Reference#lcontroldraw
          draw: { //all shapes enabled by default
            polyline: false, //disable polylines
            marker: false, // disable markers
            circle: false // disable circles, additional code required to implement, not supported by geojson
          }
        });
        vm.map.addControl(drawControl);

        // Events for drawControl
        vm.map.on('draw:created', function (e) {
          console.log('draw:created');
          vm.drawnShapes.addLayer(e.layer);
          vm.$emit('draw');
        });

        vm.map.on('draw:edited', function (e) {
          console.log('draw:edited');
          vm.$emit('draw');
        });

        vm.map.on('draw:deleted', function (e) {
          console.log('draw:deleted');
          vm.$emit('draw');
        });

      }

      var style = keys.mapboxStyle;
      var token = keys.mapboxToken;

      // Bounds of entire map/world
      vm.maxBounds = L.latLngBounds(
        L.latLng(-90, -180),
        L.latLng(90, 180)
      );

      // Leaflet's map initialization method
      // 'mapid' is the div's name where the map will be found on the web page.
      vm.map = L.map('mapid', {
        minZoom: 2,
        maxBounds: vm.maxBounds,
      }).setView([0, 0], 2);

      var url = 'https://api.mapbox.com/styles/v1/liangdanica/' + style + '/tiles/256/{z}/{x}/{y}?access_token=' + token;

      L.tileLayer(url,
        {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
          maxZoom: 18,
          id: 'Basic',
          accessToken: token
        }).addTo(vm.map);

      // Initialize Overlapping Marker Spiderfier
      //   (the thing that spreads out markers that overlap)
      // var spiderOptions = {
      //   keepSpiderfied: true
      // };
      // var oms = new OverlappingMarkerSpiderfier(map, spiderOptions);

      // Initialize the FeatureGroup to store editable layers (shapes drawn by user)
      // ref: http://leafletjs.com/2013/02/20/guest-post-draw.html
      vm.markers = new L.FeatureGroup();
      vm.drawnShapes = new L.FeatureGroup();

      // Add the layers to the map so they are displayed
      vm.map.addLayer(vm.markers);
      vm.map.addLayer(vm.drawnShapes);

      addMapEvents();
    },
    methods: {
      getNorthBound() {
        return this.maxBounds.getNorth();
      },
      getSouthBound() {
        return this.maxBounds.getSouth();
      },
      getEastBound() {
        return this.maxBounds.getEast();
      },
      getWestBound() {
        return this.maxBounds.getWest();
      },
      getAllGeoJson() {
        var geoObjs = [];

        for (var ndx in this.map._layers) {
          // check if has a togeoJSON function and has original points to be sure
          // the thing is some type of drawn shape on the map, not just a marker
          // or something else

          if (this.map._layers[ndx].toGeoJSON && this.map._layers[ndx]._originalPoints) {
            // This removes LineStrings from the map. LineStrings cannot be drawn by the user. LineStrings
            // are created on the map by the oms.min.js file when 'spiderfy-ing' occurs to spiral overlapping
            // markers. We do not want to treat these LineStrings as search regions for the map to look
            // for users in; they should be removed from the map whenever this function is called.
            // getAllGeoJson() is called anytime the map is going to do a new search for users and
            // redraw the map.
            // ** TL;DR : Don't treat linestrings as search regions to look for users in (Because who
            // cares if you live on a line? Not the developers anyways..)
            if (this.map._layers[ndx].toGeoJSON().geometry.type === 'LineString') {
              this.map.removeLayer(this.map._layers[ndx]);
            }
            else {
              geoObjs.push(this.map._layers[ndx].toGeoJSON());
            }
          }
        }

        var obj = {
          type: 'FeatureCollection',
          features: geoObjs
        };

        return obj;
      },
      resetMap() {
        // Clear regions
        for (var regionName in this.regionPolygons) {
          this.map.removeLayer(this.regionPolygons[regionName]);
          delete this.regionPolygons[regionName];
        }

        this.markers.clearLayers();
        this.drawnShapes.clearLayers();

        this.map.setView([0, 0], 2);
      },
      setSelectedFeature(regionName, selected) {

        if (selected) {
          // Cyclic value error occurs from JSON.parse when using selections.regions[value]
          // to store the result from L.polygon(...);
          // Need to store result of L.polygon so the value can
          // be used to delete off map
          function featureByName(feature) {
            return feature.properties.name === regionName;
          }
          var regionFeature = this.features.filter(featureByName);
          if (regionFeature.length !== 1) {
            console.log('error finding feature by name');
            return;
          } else {
            var coords = regionFeature[0].geometry.coordinates;
            var type = regionFeature[0].geometry.type;
            if (type === 'MultiPolygon') {
              this.regionPolygons[regionName] = L.multiPolygon(coords);
            }
            else if (type === 'Polygon') {
              this.regionPolygons[regionName] = L.polygon(coords);
            }

            this.map.addLayer(this.regionPolygons[regionName]);
          }
        } else {
          this.map.removeLayer(this.regionPolygons[regionName]);
        }
      }
    },
    watch: {
      documents: function(newdocs) {
        var vm = this;

        vm.markers.clearLayers();
        // oms.clearMarkers();

        var geojsonLayer = L.geoJson(vm.documents, {
          pointToLayer: function (feature, latlng) {
            var marker = null;
            var markerOptions = {
              'title': feature.fullDetails.firstname + ' ' + feature.fullDetails.lastname
            };
            if (feature.fullDetails.isMarkLogic) {
              markerOptions.icon = vm.redMarker;
            }

            marker = new L.marker(latlng, markerOptions);

            // oms.addMarker(marker);
            return marker;
          }
          // onEachFeature: function (feature, layer) {
          //   layer.bindPopup(formatPopup(feature.fullDetails));
          // }
        });

        vm.markers.addLayer(geojsonLayer);
        // updateCount(documents);

      }
    }
  }
</script>

<style>
</style>
