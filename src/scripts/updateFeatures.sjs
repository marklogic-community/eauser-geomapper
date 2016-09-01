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

var completed = true;

var oldFeatures = null;

try {
  var oldDoc = cts.doc(uri);
  var newDoc = oldDoc.toObject();

  oldFeatures = newDoc.fullDetails.features;

  newDoc.fullDetails.features = input.features;
  newDoc.fullDetails.lastUpdated = fn.currentDateTime();
  newDoc.fullDetails.customNotes = input.customNotes;

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
  completed = false;
}

// email feature changes (only if there's actually a change, of course - no one likes spam :D)
try {
  var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");

  if (completed) {
    var content = "Completed feature update at " + timestamp + "\n\n";
    content += "Old features:\n";
    for (var feature in oldFeatures) {
      content += "\t- " + oldFeatures[feature] + "\n";
    }
    content += "\nNew features:\n";
    for (var feature in input.features) {
      content += "\t- " + input.features[feature] + "\n";
    }

    // because of how we insert feature arrays into MarkLogic,
    // the order features appear in the array is preserved
    if ("" + oldFeatures === "" + input.features) {
      exit;
    }

    var message = {"from":{"name":"eauser-geomapper", "address":"eauser.geomapper@marklogic.com"},
                 "to":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "subject":"EA tracker - success - feature update for " + input.email,
                 "content": content};
    xdmp.email(message);
  }
  else {
    var content = "Failed feature update at " + timestamp + "\n\n";

    var message = {"from":{"name":"eauser-geomapper", "address":"eauser.geomapper@marklogic.com"},
                 "to":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "subject":"EA tracker - fail - feature update for " + input.email,
                 "content": content};
    xdmp.email(message);
  }
}
catch (err) {
  xdmp.log(err);
  xdmp.log("email status report failed to send");
}

res;

