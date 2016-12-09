/* global require */
/* jshint esversion:6 */

import Vue from 'vue';

Vue.component('current-user', require('./User.vue'));
Vue.component('facet', require('./Facet.vue'));
Vue.component('region-facet', require('./RegionFacet.vue'));
Vue.component('leaflet', require('./Map.vue'));

new Vue({
  el: '#app',
  data: {
    selections: {
      features: [],
      industries: [],
      companies: [],
      regions: {},
      eaVersions: [],
      date1: '',
      date2: ''
    },
    facets: {
      EAversions: {},
      Industry: {},
      Company: {}
    },
    featureCollection: {},
    documents: [],
    lastUpdated: '',
    counts: {
      total: 0,
      current: 0
    }
  },
  mounted: function() {
    'use strict';
    var vm = this;
    vm.doSearch(true);
    vm.getShapes();

    //add 'last updated @' message
    $.ajax({
      type: 'GET',
      url: '/scripts/lastUpdate.sjs',
      dataType: 'json',
      success: function(response) {
        vm.lastUpdated = response.lastUpdated;
      },
      error: function() {
        console.log('failed to get lastUpdated date');
      }
    });
  },
  methods: {
    // method for Facet components to call
    selectFacet: function(constraint, selections) {
      'use strict';
      this.selections[constraint] = Object.keys(selections);
      this.doSearch(false);
    },
    selectRegion: function(regionName, selected) {
      'use strict';
      this.$refs.map.setSelectedFeature(regionName, selected);
      this.doSearch(false);
    },
    drawOnMap: function() {
      'use strict';
      // the user has drawn, erased, or edited a shape on the map. Update the
      // current search.
      this.doSearch(false);
    },
    // execute a search and update the data
    doSearch: function(firstLoad) {
      'use strict';
      var vm = this;
      var map = this.$refs.map;
      var payload = {
        selections: this.selections,
        mapWindow: [
          map.getSouthBound(),
          map.getWestBound(),
          map.getNorthBound(),
          map.getEastBound()
        ],
        firstLoad: firstLoad,
        searchRegions: map.getAllGeoJson()
      };

      $.ajax({
        type: 'POST',
        url: '/scripts/search.sjs',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
          vm.facets.EAversions = response.facets.EAversions;
          vm.facets.Industry = response.facets.Industry;
          vm.facets.Company = response.facets.Company;
          vm.documents = response.documents;
          vm.counts.current = response.documents.length;
          if (firstLoad) {
            vm.counts.total = response.documents.length;
          }
        },
        error: function() {

        }
      });
    },
    // Retrieve the geoJSON shapes used for the regions
    getShapes: function() {
      'use strict';
      var vm = this;

      $.ajax({
        type: 'POST',
        url: '/scripts/formatShapes.sjs',
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
          //displayRegions is in map.js
          // displayRegions(response);
          vm.featureCollection = response;
        },
        error: function() {
          // console.log('formatShapes.sjs failed');
        }
      });

    },
    reset: function() {
      'use strict';
      this.$refs.map.resetMap();
      this.doSearch(false);
    }
  }
});
