// To run this, the time limit has to be extended by a lot...
// I changed it from 3600 sec to 36000. (just to be safe :D)

// (time limits of TaskServer. query console time limits no longer matter)

// Batch size = 200

// Variables from xdmp.spawn: 
// streamPosition, remainingCount

'use strict'

var keys = require("../private/keys.sjs");
var util = require("util.sjs");

// Getting all the EA users.

var secretkey = keys.secretkey;
var endpoint = keys.endpoint;
var userID = keys.userID;

if (remainingCount > 0) {
  // grab all users whose accounts were updated after 2/2/2016 
  //  (Note: EA1 was released 2/3/2016)

  var timestamp = fn.currentDateTime(); //.add(xdmp.elapsedTime());
  var message = "" + timestamp + userID;

  var signature = xdmp.hmacSha1(secretkey, message)

  var options = xdmp.quote(
    "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns1=\"http://www.marketo.com/mktows/\">"
    + "<SOAP-ENV:Header><ns1:AuthenticationHeader><mktowsUserId>"
    + userID 
    + "</mktowsUserId><requestSignature>"
    + signature 
    + "</requestSignature><requestTimestamp>"
    + timestamp 
    + "</requestTimestamp></ns1:AuthenticationHeader></SOAP-ENV:Header>"
    //body
    + "<SOAP-ENV:Body>"
    + "<ns1:paramsGetMultipleLeads xmlns:ns1=\"http://www.marketo.com/mktows/\">"
    + "<lastUpdatedAt>2016-02-02T11:51:08.710-08:00</lastUpdatedAt>"
    + "<batchSize>200</batchSize>"
    + "<streamPosition>" + streamPosition + "</streamPosition>"
    + "</ns1:paramsGetMultipleLeads>"
    + "</SOAP-ENV:Body></SOAP-ENV:Envelope>"
  );
  
  xdmp.log("Requesting streamPosition - " + streamPosition);
  xdmp.log("Remaining Count - " + remainingCount);


  var result = xdmp.httpPost(endpoint, 
  {
    "data" : options,
    "timeout" : 1000000
  });
  
  // get remainingCount and newStreamPosition
  remainingCount = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/remainingCount/fn:number()").toArray()[0];
  streamPosition = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/newStreamPosition/fn:string()").toArray()[0];

  // call xdmp.spawn to filter and ingest data from the batch

  xdmp.spawn("insert.sjs", {"result": result.toArray()[1]}, null);

  xdmp.spawn("initData.sjs", {"streamPosition": streamPosition, "remainingCount": remainingCount}, null);

}

else {
  xdmp.log("DONE");
}

