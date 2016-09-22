
var util = require('/scripts/util.sjs');

function updateFeatures(email, features, customNotes, reporter) {
  var sr = require('/MarkLogic/jsearch.sjs');

  var uri = '/users/' + email + '.json';

  var res = null;

  var completed = true;

  var oldFeatures = null;

  try {
    var oldDoc = cts.doc(uri);
    var newDoc = oldDoc.toObject();

    oldFeatures = newDoc.fullDetails.features;

    newDoc.fullDetails.features = features;
    newDoc.fullDetails.lastUpdated = fn.currentDateTime();
    newDoc.fullDetails.customNotes = customNotes;

    xdmp.nodeReplace(oldDoc, newDoc);

    var output = sr.documents()
      .where(cts.elementWordQuery('email', email))
      .result();

    res = output.results[0].document;

    xdmp.log('updated features for ' + email);

  }
  catch(err) {
    xdmp.log(err.toString());
    res = err;
    completed = false;

    if (res.name === 'SEC-PERMDENIED') {
      xdmp.setResponseCode(403, 'Forbidden');
    } else {
      xdmp.setResponseCode(500, 'Server Error');
    }
  }

  // email feature changes (only if there's actually a change, of course - no one likes spam :D)
  try {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), '[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ');

    if (completed) {
      var content = 'Completed feature update at ' + timestamp + '\n\n';
      content += 'Old features:\n';
      for (var feature in oldFeatures) {
        content += '\t- ' + oldFeatures[feature] + '\n';
      }
      content += '\nNew features:\n';
      for (var feature in features) {
        content += '\t- ' + features[feature] + '\n';
      }
      content += util.getEmailSource();

      // because of how we insert feature arrays into MarkLogic,
      // the order features appear in the array is preserved
      if ('' + oldFeatures === '' + features) {
        exit;
      }

      var subject = 'EA tracker - success - feature update for ' + email;
      reporter.send(subject, content);
    }
    else {
      var content = 'Failed feature update at ' + timestamp + '\n\n';
      content += util.getEmailSource();

      var subject = 'EA tracker - fail - feature update for ' + email;
      reporter.send(subject, content);

    }
  }
  catch (err) {
    xdmp.log(err.toString());
    xdmp.log('email status report failed to send');
  }

  return res;

}

module.exports = {
  updateFeatures: updateFeatures
};
