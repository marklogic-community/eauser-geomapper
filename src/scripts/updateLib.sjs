/* global require, cts, fn, xdmp, module */
var util = require('/scripts/util.sjs');

function updateFeatures(email, features, customNotes, reporter) {
  'use strict';

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
    var feature;
    var content, subject;

    if (completed) {
      content = 'Completed feature update at ' + timestamp + '\n\n';
      content += 'Old features:\n';
      for (feature in oldFeatures) {
        content += '\t- ' + oldFeatures[feature] + '\n';
      }
      content += '\nNew features:\n';
      for (feature in features) {
        content += '\t- ' + features[feature] + '\n';
      }
      content += util.getEmailSource();

      // because of how we insert feature arrays into MarkLogic,
      // the order features appear in the array is preserved
      if ('' + oldFeatures === '' + features) {
        exit;
      }

      subject = 'EA tracker - success - feature update for ' + email;
      reporter.send(subject, content);
    }
    else {
      content = 'Failed feature update at ' + timestamp + '\n\n';
      content += util.getEmailSource();

      subject = 'EA tracker - fail - feature update for ' + email;
      reporter.send(subject, content);

    }
  }
  catch (err) {
    xdmp.log(err.toString());
    xdmp.log('email status report failed to send');
  }

  return res;

}

function updateFromMarketo(users, geocoder, eaVersion) {
  'use strict';

  var emailsProcessed = {};
  var duplicates = [];
  var newUsers = 0;

  for (var i in users) {

    var json = util.convertToJson_REST(users[i], eaVersion);

    json.geometry = geocoder(json);

    var email = json.fullDetails.email;

    // just in case... ('cause why not? :) )
    email = util.removeSpaces('' + email, '+');

    // if we have reached the end of the list of users
    // and have started to go through things like length, xpath, toString...
    if (email === undefined || email + '' === 'undefined' || email + '' === 'null') {
      break;
    }

    if (emailsProcessed[email]) {
      // we've already updated this user. Marketo must have multiple users
      // with the same email address.
      xdmp.log('Duplicate email: ' + email);
      duplicates.push(email);
    } else {

      // check email for marklogic
      var str = email.toString();
      json.fullDetails.isMarkLogic = str.includes('@marklogic.com');

      // uri template for EA users
      var uri = '/users/' + email + '.json';

      if (util.exists(email)) {
        // find the old dateAdded field
        var oldDoc = cts.doc(uri);

        var dateAdded = oldDoc.root.fullDetails.dateAdded;

        // the new document will preserve the dateAdded field.
        json.fullDetails.dateAdded = dateAdded;
        if (oldDoc.root.fullDetails.features) {
          json.fullDetails.features = oldDoc.root.fullDetails.features;
        }

        // check if this is a new EA version for this user
        if (!(eaVersion in oldDoc.root.fullDetails.ea_version)) {
          json.fullDetails.ea_version.push(oldDoc.root.fullDetails.ea_version[0]);
        }

        xdmp.nodeReplace(oldDoc, json);
        xdmp.log('updateData_REST: updated ' + email);

      } else {
        // else this is a new user

        newUsers++;

        xdmp.documentInsert(uri, json);
      }

      // record that we've updated this user
      emailsProcessed[email] = true;
    }

  }

  return {
    duplicates: duplicates,
    newUsers: newUsers
  };

}

module.exports = {
  updateFeatures: updateFeatures,
  updateFromMarketo: updateFromMarketo
};
