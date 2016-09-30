
declareUpdate();

var config = require('/test/test-config.xqy');

// a user with no features selected
xdmp.documentInsert(
  '/users/testy@mctestface.com.json',
  {
    "type": "Feature",
    "fullDetails":{
      "firstname": "Testy",
      "lastname": "McTestface",
      "email": "testy@mctestface.com",
      "city": "Oakland",
      "state": "CA",
      "industry": "Other",
      "company": "Testers, Inc.",
      "id": 1234567,
      "phone": "1235551234",
      "accountType": null,
      "address": "1 Main Street",
      "country": "United States of America",
      "numEmployees": null,
      "username": "testy",
      "region": "AMS_NAM _West_United States of America_CA",
      "hasAccessToEAML9": true,
      "postalCode": "12345",
      "registeredForEAML8": true,
      "registeredForNoSQLforDummies": true,
      "registrationDate": "2016-09-21T14:32:45Z",
      "revenueRange": "$1M - $5M",
      "leadSource": "spelunking",
      "website": "mctestface.com",
      "marketoLastUpdated": "2016-09-30T21:03:10Z",
      "appLastUpdated": "2016-09-30T10:39:29.776174-04:00",
      "dateAdded": "2016-09-24T10:19:30.678033-07:00",
      "ea_version": ["EA2", "EA2"],
      "isMarkLogic": false
    },
    "geometry":{
      "type": "Point",
      "coordinates": [-122.2682245, 37.8113159]
    }
  },
  [
    xdmp.permission(config.getEditorRole(), "update"),
    xdmp.permission(config.getGuestRole(), "read")
  ]
);

// a user with some features
xdmp.documentInsert(
  '/users/features@stuff.com.json',
  {
    "type": "Feature",
    "fullDetails":{
      "firstname": "Features",
      "lastname": "Stuff",
      "email": "features@stuff.com",
      "city": "Philadelphia",
      "state": "PA",
      "industry": "Other",
      "company": "Testers, Inc.",
      "id": 1234567,
      "phone": "2155551234",
      "accountType": null,
      "address": "1 Main Street",
      "country": "United States of America",
      "numEmployees": null,
      "username": "features",
      "region": "AMS_NAM _East_United States of America_CA",
      "hasAccessToEAML9": true,
      "postalCode": "01234",
      "registeredForEAML8": true,
      "registeredForNoSQLforDummies": true,
      "registrationDate": "2016-09-21T14:32:45Z",
      "revenueRange": "$1M - $5M",
      "leadSource": "spelunking",
      "website": "stuff.com",
      "marketoLastUpdated": "2016-09-30T21:03:10Z",
      "appLastUpdated": "2016-09-30T10:39:29.776174-04:00",
      "dateAdded": "2016-09-24T10:19:30.678033-07:00",
      "ea_version": ["EA2", "EA2"],
      "isMarkLogic": false,
      "features": [
        'feature X',
        'feature Y'
      ],
      "customNote": "This is a custom note"
    },
    "geometry":{
      "type": "Point",
      "coordinates": [-122.2682245, 37.8113159]
    }
  },
  [
    xdmp.permission(config.getEditorRole(), "update"),
    xdmp.permission(config.getGuestRole(), "read")
  ]
);
