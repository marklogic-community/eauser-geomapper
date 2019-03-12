/* global require, cts, xdmp */

// POST request body -> {email: <email>}

var sr = require('/MarkLogic/jsearch.sjs');

var rawInput = xdmp.getRequestBody();

var input = rawInput.toObject();

try {

  var output = sr.documents()
    .where(cts.elementWordQuery('email',input.email))
    .result();

  var doc = output.results[0].document;
  xdmp.log('found document for ' + input.email);

}
catch (err) {
  xdmp.log(err);
}

doc;