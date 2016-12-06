/* global require */
/* jshint esversion:6 */

import Vue from 'vue';

Vue.component('current-user', require('./User.vue'));
Vue.component('facet', require('./Facet.vue'));
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
    }
  },
  mounted: function() {
    'use strict';
    this.doSearch(true);
  },
  methods: {
    // method for Facet components to call
    selectFacet: function(constraint, selections) {
      'use strict';
      this.selections[constraint] = Object.keys(selections);
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
          vm.$refs.eaversion.displayData(response.facets.EAversions);
          vm.$refs.industry.displayData(response.facets.Industry);
          vm.$refs.company.displayData(response.facets.Company);
        },
        error: function() {

        }
      });
    }
  }
});
