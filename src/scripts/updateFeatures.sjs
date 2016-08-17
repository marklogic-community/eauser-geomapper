// POST request body -> {email: <email>, features: [<features>]}
var util = require("/scripts/util.sjs");
declareUpdate();

var sr = require('/MarkLogic/jsearch.sjs');

var rawInput = xdmp.getRequestBody();

var input = rawInput.toObject();

var email = util.removeSpaces(input.email, "+");

var uri = "/users/" + email + ".json";

var res = null;

try {
  var oldDoc = cts.doc(uri);
  var newDoc = oldDoc.toObject();

  newDoc.fullDetails.features = input.features;
  newDoc.fullDetails.lastUpdated = fn.currentDateTime();

  xdmp.nodeReplace(oldDoc, newDoc);

  var output = sr.documents()
    .where(cts.elementWordQuery("email", input.email))
    .result();

  res = output.results[0].document;

  xdmp.log('updated features for ' + input.email);

}
catch(err) {
  xdmp.log(err);
  res = err;
}

res;

