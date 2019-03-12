var log = require('loginLib.sjs');

xdmp.setResponseContentType('application/json');

var response = {};

response.isEditor = log.canUserEdit(xdmp.getCurrentUser());
response.currentUser = xdmp.getCurrentUser();

JSON.stringify(response);
