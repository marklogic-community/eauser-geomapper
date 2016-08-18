// POST request body -> {email: <email>, features: [<features>]}
var util = require("/scripts/util.sjs");

var keys = require("/private/keys.sjs");
var emailRecipient = keys.emailRecipient;

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

// email feature changes
try {
  if (completed) {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");
    var content = "Completed data ingestion at " + timestamp + "\n\n";
    content += "Number of users: " + numUsers;

    var message = {"from":{"name":"eauser-geomapper", "address":"eauser.geomapper@marklogic.com"},
                 "to":{"name":"gyin", "address":"grace.yin@marklogic.com"},
                 "subject":"EA tracker - success - initial data ingestion",
                 "content": content};
    xdmp.email(message);
  }
  else {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");
    var content = "Failed data ingestion at " + timestamp + "\n\n";

    var message = {"from":{"name":"eauser-geomapper", "address":"eauser.geomapper@marklogic.com"},
                 "to":{"name":"gyin", "address":"grace.yin@marklogic.com"},
                 "subject":"EA tracker - fail - initial data ingestion",
                 "content": content};
    xdmp.email(message);
  }
}
catch (err) {
  xdmp.log("email status report failed to send");
}


res;

