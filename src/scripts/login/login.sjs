
var log = require('loginLib.sjs');

var username = xdmp.getRequestField('username');
var password = xdmp.getRequestField('password');

if (xdmp.login(username, password)) {
  xdmp.setResponseCode(200, "OK");
} else {
  xdmp.setResponseCode(401, "Unauthorized");
}

var response = {};
response.isEditor = log.canUserEdit(xdmp.getCurrentUser());;
response.currentUser = xdmp.getCurrentUser();

JSON.stringify(response);
