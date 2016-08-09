// POST request body -> {username: <username>, features: [<features>]}

declareUpdate();

var sr = require('/MarkLogic/jsearch.sjs');

var rawInput = xdmp.getRequestBody();

var input = rawInput.toObject();

var uri = "/users/" + input.username + ".json";

var res = null;

try {
  var oldDoc = cts.doc(uri);
  var newDoc = oldDoc.toObject();

  newDoc.fullDetails.features = input.features;
  newDoc.fullDetails.lastUpdated = fn.currentDateTime();

  xdmp.nodeReplace(oldDoc, newDoc);

  var output = sr.documents()
    .where(cts.elementWordQuery("username", input.username))
    .result();

  res = output.results[0].document;

  xdmp.log('updated features for ' + input.username);

}
catch(err) {
  xdmp.log(err);
  res = err;
}

res;

