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
```


Private keys for the browser are stored in `browserKeys.js` :

```javascript
// assuming <script src="browserKeys.js"></script> has been added
//  above the place you want to use these values..

var mapboxToken = keys.mapboxToken;
var mapboxStyle = keys.mapboxStyle;
```


