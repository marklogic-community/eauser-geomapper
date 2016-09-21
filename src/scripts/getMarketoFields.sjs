/* global cts */

var res;

try {
  var doc = cts.doc('/config/MarketoFields.json');
  res = doc.toObject().fields;
}
catch(error) {
  res = error;
}

res;
