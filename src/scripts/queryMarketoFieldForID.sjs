/* global require, xdmp */

// POST request body -> {id: <id>, field: <field>}

var keys = require('/private/keys.sjs');

var endpoint = keys.endpoint_REST;
var clientID = keys.clientID_REST;
var clientSecret = keys.clientSecret_REST;

var rawInput = xdmp.getRequestBody();

var input = rawInput.toObject();

try {
  xdmp.log('retrieving ' + input.field + ' of user #' + input.id);
  
  // get access token
  var auth = xdmp.httpGet(endpoint + '/identity/oauth/token?grant_type=client_credentials&client_id=' + clientID + '&client_secret=' + clientSecret);
  var token = auth.toArray()[1].root.access_token;
  
  var res = xdmp.httpGet(endpoint + '/rest/v1/lead/' + input.id + '.json?access_token=' + token + '&fields=' + input.field);

  var val = {
    'val' : '' + res.toArray()[1].root.result[0][input.field]
  };

}
catch(err) {
  xdmp.log(err);
  var val = {
    'val' : '{failed}'
  };
}

val;
