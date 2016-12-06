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

    this.launch();
  },
  methods: {
    launch: function() {
      'use strict';
      var map = this.$refs.map;
      var facets = {
        ea: this.$refs.eaversion,
        industry: this.$refs.industry,
        company: this.$refs.company
      };
      var payload = {
        selections: this.selections,
        mapWindow: [
          map.getSouthBound(),
          map.getWestBound(),
          map.getNorthBound(),
          map.getEastBound()
        ],
        firstLoad: true,
        searchRegions: map.getAllGeoJson()
      };

      $.ajax({
        type: 'POST',
        url: '/scripts/search.sjs',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
          facets.ea.displayData(response.facets.EAversions);
          facets.industry.displayData(response.facets.Industry);
          facets.company.displayData(response.facets.Company);
        },
        error: function() {

        }
      });
    }
  }
});
