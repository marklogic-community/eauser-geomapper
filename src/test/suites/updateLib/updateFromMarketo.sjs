/* global declareUpdate, require, cts, xdmp */
/* jshint camelcase: false */

declareUpdate();

var update = require('/scripts/updateLib.sjs');
var test = require('/test/test-helper.xqy');
var users = require('test-data/users.sjs');

// This user is in test-data, but change the phone number
users.marketoUsers[1].phone = '6105551234';

var marketoUsers = [];
marketoUsers.push(users.marketoUsers[0]);
marketoUsers.push(users.marketoUsers[1]);
marketoUsers.push(
  {
    firstName: 'Frodo',
    lastName: 'Baggins',
    email: 'fbaggins@bagend.org',
    city: 'Shire',
    state: 'PA',
    Main_Industry__c: 'Adventure',
    company: 'Tooks R Us',
    id: 2345678,
    phone: '4845551234',
    Account_Type__c: null,
    address: '1 Bag End',
    country: 'United States of America',
    DC_Employees__c: 'null',
    EA_ML9username: 'fbaggins',
    GEO_Region_Sub_Region__c: 'AMS_NAM _East_United States of America_CA',
    HasAccessToEAML9: 'true',
    postalCode: '23456',
    registeredforEAML8: 'false',
    registeredforNoSQLforDummies: 'false',
    createdAt: null,
    Revenue_Range__c: '$100K - $1M',
    Specific_Lead_Source__c: 'cold call',
    website: 'bagend.org',
    updatedAt: '2016-10-01T21:03:10Z'
  }
);
// duplicate email:
marketoUsers.push(
  {
    firstName: 'Frodo2',
    lastName: 'Baggins2',
    email: 'fbaggins@bagend.org',
    city: 'Shire',
    state: 'PA',
    Main_Industry__c: 'Adventure',
    company: 'Tooks R Us',
    id: 2345678,
    phone: '4845551234',
    Account_Type__c: null,
    address: '1 Bag End',
    country: 'United States of America',
    DC_Employees__c: 'null',
    EA_ML9username: 'fbaggins',
    GEO_Region_Sub_Region__c: 'AMS_NAM _East_United States of America_CA',
    HasAccessToEAML9: 'true',
    postalCode: '23456',
    registeredforEAML8: 'false',
    registeredforNoSQLforDummies: 'false',
    createdAt: null,
    Revenue_Range__c: '$100K - $1M',
    Specific_Lead_Source__c: 'cold call',
    website: 'bagend.org',
    updatedAt: '2016-10-01T21:03:10Z'
  }
);

var geoInfo = {
  'type': 'Point',
  'coordinates': [
    1.234567,
    -2.345678
  ]
};

function mockGeocoder(json) {
  'use strict';

  return geoInfo;
}

// ============================================================================
// Run the test in a different transaction so we can check the database updates
// ============================================================================
var actual = xdmp.invokeFunction(
  function() {
    'use strict';

    return update.updateFromMarketo(marketoUsers, mockGeocoder, 'EAx');
  },
  {
    'isolation' : 'different-transaction',
    'transactionMode': 'update-auto-commit'
  }
);
var actualObj = actual.toObject()[0];

xdmp.log('actual: ' + actual.toString());
// ============================================================================

var customNotes = 'This is a custom note';

var actual0 = cts.doc('/users/' + marketoUsers[0].email + '.json').toObject();
var actual1 = cts.doc('/users/' + marketoUsers[1].email + '.json').toObject();
var actual2 = cts.doc('/users/' + marketoUsers[2].email + '.json').toObject();

var assertions = [
  test.assertExists(actual0),

  test.assertExists(actual1),
  test.assertEqual(marketoUsers[1].phone, actual1.fullDetails.phone),
  test.assertExists(actual1.fullDetails.features),
  test.assertEqual(users.users[1].fullDetails.features.length, actual1.fullDetails.features.length),
  test.assertExists(actual1.fullDetails.customNotes),
  test.assertEqual(customNotes, actual1.fullDetails.customNotes),
  test.assertEqual(geoInfo.type, actual1.geometry.type),
  test.assertEqual(geoInfo.coordinates[0], actual1.geometry.coordinates[0]),
  test.assertEqual(geoInfo.coordinates[1], actual1.geometry.coordinates[1]),

  test.assertExists(actual2),
  test.assertEqual(marketoUsers[2].Main_Industry__c, actual2.fullDetails.industry),
  test.assertEqual(geoInfo.type, actual2.geometry.type),

  test.assertExists(actualObj.duplicates),
  test.assertEqual(1, actualObj.duplicates.length),
  test.assertEqual(marketoUsers[3].email, actualObj.duplicates[0]),

  test.assertExists(actualObj.newUsers),
  test.assertEqual(1, actualObj.newUsers)
];

assertions;
