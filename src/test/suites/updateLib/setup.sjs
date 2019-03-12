/* global declareUpdate, require, xdmp */
/* jshint esversion: 6 */

declareUpdate();

var config = require('/test/test-config.xqy');
var users = require('test-data/users.sjs').users;

for (var user of users) {
  xdmp.documentInsert(
    '/users/' + user.fullDetails.email + '.json',
    user,
    [
      xdmp.permission(config.getEditorRole(), 'update'),
      xdmp.permission(config.getGuestRole(), 'read')
    ]
  );
}
