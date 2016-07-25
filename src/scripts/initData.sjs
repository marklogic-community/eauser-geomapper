'use strict'

var keys = require("../private/keys.sjs");
var util = require("util.sjs");

// Getting all the EA users.


var endpoint = keys.endpoint;
var timestamp = fn.currentDateTime();
var userID = keys.userID;

var secretkey = keys.secretkey;
var message = "" + timestamp + userID;

var signature = xdmp.hmacSha1(secretkey, message)

var streamPosition = ""
var remainingCount = 1; // completely random.

var eausers = [];
var errors = [];

while (remainingCount > 0) {
  // grab all users whose accounts were updated after TODO: << PICK A DATE >>
  
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
    + "<lastUpdatedAt>2016-07-19T11:51:08.710-08:00</lastUpdatedAt>"
    + "<batchSize>100</batchSize>"
    + "<streamPosition>" + streamPosition + "</streamPosition>"
    + "</ns1:paramsGetMultipleLeads>"
    + "</SOAP-ENV:Body></SOAP-ENV:Envelope>"
  );
  
  var result = xdmp.httpPost(endpoint, 
  {
    "data" : options,
    "timeout" : 100000
  });
  
  // get remainingCount and newStreamPosition
  remainingCount = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/remainingCount/fn:number()");
  streamPosition = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/newStreamPosition/fn:string()");
  
  xdmp.log("ERRORS:", "warning");

  // call xdmp.spawn

  xdmp.spawn("insert.sjs", {"result": result}, null);

  
}

"done";



