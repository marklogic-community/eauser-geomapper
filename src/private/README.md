Files in this directory are not to be added to the public repo. Such files
ought to contain private values and nothing else.


Private keys for MarkLogic scripts are stored in the module `keys.sjs` :


```javascript
var keys = require("keys.sjs");

// Google Maps geocoding key
var geocoderKey = keys.geocoderKey;

// Marketo SOAP api
var endpoint = keys.endpoint;
var userID = keys.userID;
var secretkey = keys.secretkey;

// Marketo REST api
var endpoint_REST = keys.endpoint_REST;
var clientID_REST = keys.clientID_REST;
var clientSecret_REST = keys.clientSecret_REST;
var EA1programID = keys.EA1programID;
var EA2programID = keys.EA2programID;
var EA3programID = keys.EA3programID;
var EA4programID = keys.EA4programID;

// Email list that will receive status updates and user feedback
var emailRecipient = keys.emailRecipient;
var name = emailRecipient.name;
var address = emailRecipient.address;

```


Private keys for the browser are stored in `browserKeys.js` :

```javascript
// assuming <script src="browserKeys.js"></script> has been added
//  above the place you want to use these values..

var mapboxToken = keys.mapboxToken;
var mapboxStyle = keys.mapboxStyle;
```


