'use strict'

declareUpdate();

var update = require('/scripts/updateLib.sjs');
var test = require('/test/test-helper.xqy');

// First user is in setup.sjs, but the phone number is changed
var marketoUsers = [
  {
    firstName: 'Features',
    lastName: 'Stuff',
    email: 'features@stuff.com',
    city: 'Philadelphia',
    state: 'PA',
    Main_Industry__c: 'Other',
    company: 'Testers, Inc.',
    id: 1234567,
    phone: '6105551234',
    Account_Type__c: null,
    address: '1 Main Street',
    country: 'United States of America',
    DC_Employees__c: 'null',
    EA_ML9username: 'features',
    GEO_Region_Sub_Region__c: 'AMS_NAM _East_United States of America_CA',
    HasAccessToEAML9: 'true',
    postalCode: '01234',
    registeredforEAML8: 'true',
    registeredforNoSQLforDummies: 'true',
    createdAt: null,
    Revenue_Range__c: '$1M - $5M',
    Specific_Lead_Source__c: 'spelunking',
    website: 'stuff.com',
    updatedAt: '2016-09-30T21:03:10Z'
  },
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
  },
]

function mockGeocoder(json) {
  return {
    "type": "Point",
    "coordinates": [
      1.234567,
      -2.345678
    ]
  }
}

// Run the test in a different transaction so we can check the database updates
xdmp.invokeFunction(
  function() {
    update.updateFromMarketo(marketoUsers, mockGeocoder, 'EAx');
  },
  {
    "isolation" : "different-transaction",
    "transactionMode": "update-auto-commit"
  }
);

// Features for features@stuff.com, as set in setup.sjs
var features =
  [
    'feature X',
    'feature Y',
  ];

var customNote = 'This is a custom note';

var actual = cts.doc('/users/' + marketoUsers[0].email + '.json').toObject();
var assertions = [
  test.assertExists(actual),
  test.assertEqual(marketoUsers[0].phone, actual.fullDetails.phone),
  test.assertExists(actual.fullDetails.features),
  test.assertEqual(features.length, actual.fullDetails.features.length)
];

assertions;
