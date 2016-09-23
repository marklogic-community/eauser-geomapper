'use strict'

declareUpdate();

var update = require('/scripts/updateLib.sjs');
var test = require('/test/test-helper.xqy');

var assertions = [];

var email = 'testy@mctestface.com';

var features = [
  'feature1',
  'feature 2'
];

var customNotes = `This is a custom note.
  Check with multi-line notes.`;

// Mock out the email functionality
var reporter =
{
  send: function(subject, content) {
    assertions.push(test.assertExists(subject));
    assertions.push(test.assertExists(content));
  }
};

xdmp.invokeFunction(
  function() {
    update.updateFeatures(email, features, customNotes, reporter);
  },
  {
    "isolation" : "different-transaction",
    "transactionMode": "update-auto-commit"
  }
);

var actual = cts.doc('/users/' + email + '.json').toObject();

assertions.push(test.assertEqual(features.length, actual.fullDetails.features.length));

for (let i in features) {
  assertions.push(test.assertEqual(features[i], actual.fullDetails.features[i]));
}

assertions.push(test.assertEqual(customNotes, actual.fullDetails.customNotes));

assertions;
