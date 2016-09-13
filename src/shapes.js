/* global displayRegions */
/* exported getShapes */
/* jshint devel:true */

function getShapes() {
  'use strict';


  $.ajax({
    type: 'POST',
    url: '/formatShapes.sjs',
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      //displayRegions is in map.js
      displayRegions(response);
    },
    error: function() {
      console.log('formatShapes.sjs failed');
    }
  });

}
