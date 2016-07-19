Files in this directory are not to be added to the public repo. Such files
ought to contain private values and nothing else.


Private API keys are stored in the module keys.sjs


```javascript
var keys = require("keys.sjs");

// Google Maps geocoding key
var geocoderKey = keys.geocoderKey;

// Marketo SOAP api
var endpoint = keys.endpoint;
var userID = keys.userID;
var secretkey = keys.secretkey;

// Mapbox api
var mapboxToken = keys.mapboxToken;
var mapboxStyle = keys.mapboxStyle;
```



