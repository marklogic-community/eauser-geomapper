/* global require, declareUpdate, xdmp */

// POST request body -> {email: <email>, features: [<features>]}

var update = require('/scripts/updateLib.sjs');
var reporter = require('/scripts/emailReporter.sjs');

var util = require('/scripts/util.sjs');

var keys = require('/private/keys.sjs');
var emailRecipient = {
  'name': keys.emailRecipient.name,
  'address': keys.emailRecipient.address
};

var emailer = reporter.makeReporter(emailRecipient);

declareUpdate();

var input = xdmp.getRequestBody().toObject();

var email = util.removeSpaces(input.email, '+');

update.updateFeatures(email, input.features, input.customNotes, emailer);
