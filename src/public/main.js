/* global require, console */
/* jshint esversion:6 */

import Vue from 'vue';

Vue.component('current-user', require('./User.vue'));
Vue.component('facet', require('./Facet.vue'));
Vue.component('region-facet', require('./RegionFacet.vue'));
Vue.component('group-facet', require('./GroupFacet.vue'));
Vue.component('leaflet', require('./Map.vue'));
Vue.component('feedback', require('./Feedback.vue'));

new Vue({
  el: '#app',
  data: {
    facets: {
      EAversions: {},
      Industry: {},
      Company: {},
      Features: {},
      GroupedFeatures: {}
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
    // respond to Facets emitting a selection event
    selectFacet: function(constraint, selections) {
      'use strict';

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

      var selections = {
        features: this.$refs.features.getSelections(),
        eaVersions: this.$refs.eaVersions.getSelections(),
        industries: this.$refs.industries.getSelections(),
        companies: this.$refs.companies.getSelections(),
      };

      var vm = this;
      var map = this.$refs.map;
      var payload = {
        selections: selections,
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
          if (response.features && response.features.MarkLogicFeatures) {
            vm.facets.GroupedFeatures = response.features.MarkLogicFeatures;
          }
          vm.facets.Features = response.facets.Feature;
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
      this.$refs.eaVersions.reset();
      this.$refs.industries.reset();
      this.$refs.companies.reset();
      this.$refs.region.reset();
      this.$refs.features.reset();

      this.doSearch(false);
    },
    sendFeedback: function(subject, message) {
      'use strict';
      var payload = {
        'subject': subject,
        'message': message
      };

      $.ajax({
        type: 'POST',
        url: '/scripts/emailFeedback.sjs',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        dataType: 'json',
        success: function() {
          console.log('success');
        },
        error: function() {
          console.log('error');
        }
      });
    }
  }
});
