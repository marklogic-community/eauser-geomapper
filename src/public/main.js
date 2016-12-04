/* jshint esversion:6 */

import Vue from 'vue';
// import CurrentUser from './User.vue';

Vue.component('current-user', require('./User.vue'));

new Vue({
  el: '#app'
});
