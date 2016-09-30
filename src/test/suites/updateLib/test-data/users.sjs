/* global module */
/* jshint camelcase: false */

var users = [
  // a user with no features selected
  {
    'type': 'Feature',
    'fullDetails':{
      'firstname': 'Testy',
      'lastname': 'McTestface',
      'email': 'testy@mctestface.com',
      'city': 'Oakland',
      'state': 'CA',
      'industry': 'Other',
      'company': 'Testers, Inc.',
      'id': 1234567,
      'phone': '1235551234',
      'accountType': null,
      'address': '1 Main Street',
      'country': 'United States of America',
      'numEmployees': null,
      'username': 'testy',
      'region': 'AMS_NAM _West_United States of America_CA',
      'hasAccessToEAML9': true,
      'postalCode': '12345',
      'registeredForEAML8': true,
      'registeredForNoSQLforDummies': true,
      'registrationDate': '2016-09-21T14:32:45Z',
      'revenueRange': '$1M - $5M',
      'leadSource': 'spelunking',
      'website': 'mctestface.com',
      'marketoLastUpdated': '2016-09-30T21:03:10Z',
      'appLastUpdated': '2016-09-30T10:39:29.776174-04:00',
      'dateAdded': '2016-09-24T10:19:30.678033-07:00',
      'ea_version': ['EA2', 'EA2'],
      'isMarkLogic': false
    },
    'geometry':{
      'type': 'Point',
      'coordinates': [-122.2682245, 37.8113159]
    }
  },
  // a user with some features and notes
  {
    'type': 'Feature',
    'fullDetails':{
      'firstname': 'Features',
      'lastname': 'Stuff',
      'email': 'features@stuff.com',
      'city': 'Philadelphia',
      'state': 'PA',
      'industry': 'Other',
      'company': 'Testers, Inc.',
      'id': 1234567,
      'phone': '2155551234',
      'accountType': null,
      'address': '1 Main Street',
      'country': 'United States of America',
      'numEmployees': null,
      'username': 'features',
      'region': 'AMS_NAM _East_United States of America_CA',
      'hasAccessToEAML9': true,
      'postalCode': '01234',
      'registeredForEAML8': true,
      'registeredForNoSQLforDummies': true,
      'registrationDate': '2016-09-21T14:32:45Z',
      'revenueRange': '$1M - $5M',
      'leadSource': 'spelunking',
      'website': 'stuff.com',
      'marketoLastUpdated': '2016-09-30T21:03:10Z',
      'appLastUpdated': '2016-09-30T10:39:29.776174-04:00',
      'dateAdded': '2016-09-24T10:19:30.678033-07:00',
      'ea_version': ['EA2', 'EA2'],
      'isMarkLogic': false,
      'features': [
        'feature X',
        'feature Y'
      ],
      'customNotes': 'This is a custom note'
    },
    'geometry':{
      'type': 'Point',
      'coordinates': [-122.2682245, 37.8113159]
    }
  }
];

// These are equivalent to the users above, but represnted as we get the info
// from Marketo
var marketoUsers = [
  {
    firstName: 'Testy',
    lastName: 'McTestface',
    email: 'testy@mctestface.com',
    city: 'Oakland',
    state: 'CA',
    Main_Industry__c: 'Other',
    company: 'Testers, Inc.',
    id: 1234567,
    phone: '1235551234',
    Account_Type__c: null,
    address: '1 Main Street',
    country: 'United States of America',
    DC_Employees__c: 'null',
    EA_ML9username: 'testy',
    GEO_Region_Sub_Region__c: 'AMS_NAM _East_United States of America_CA',
    HasAccessToEAML9: 'true',
    postalCode: '12345',
    registeredforEAML8: 'true',
    registeredforNoSQLforDummies: 'true',
    createdAt: '2016-09-21T14:32:45Z',
    Revenue_Range__c: '$1M - $5M',
    Specific_Lead_Source__c: 'spelunking',
    website: 'mctestface.com',
    updatedAt: '2016-09-30T21:03:10Z'
  },
  {
    firstName: 'Features',
    lastName: 'Stuff',
    email: 'features@stuff.com',
    city: 'Philadelphia',
    state: 'PA',
    Main_Industry__c: 'Other',
    company: 'Testers, Inc.',
    id: 1234567,
    phone: '2155551234',
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
  }
];

module.exports = {
  users: users,
  marketoUsers: marketoUsers
};
