/* global cts */

var res;

try {
  var doc = cts.doc('/config/features/MLFeatures.json');
  res = doc.toObject();
}
catch(error) {
  res = error;
}

res;
