// uses the "old" initData.sjs strategy 
// (uses a while loop instead of a million xdmp.spawns)
// works fine for daily updates (which shouldn't take more than an hour)

'use strict'

declareUpdate();

var keys = require("../private/keys.sjs");
var util = require("util.sjs");

var secretkey = keys.secretkey;
var endpoint = keys.endpoint;
var userID = keys.userID;

var streamPosition = "";
var remainingCount = 1;

var oneDayAgo = util.oneDayAgo(fn.currentDateTime());

// for finding out how many users there are in the database
var sr = require("/MarkLogic/jsearch.sjs");

while (remainingCount > 0) {
  // grab all users whose accounts were updated in the previous day.

  var timestamp = fn.currentDateTime().add(xdmp.elapsedTime());
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
    + "<lastUpdatedAt>"+ oneDayAgo + "</lastUpdatedAt>"
    + "<batchSize>200</batchSize>"
    + "<streamPosition>" + streamPosition + "</streamPosition>"
    + "</ns1:paramsGetMultipleLeads>"
    + "</SOAP-ENV:Body></SOAP-ENV:Envelope>"
  );
  
  xdmp.log("requesting StreamPosition " + streamPosition);

  var result = xdmp.httpPost(endpoint, 
  {
    "data" : options,
    "timeout" : 1000000
  });
  
  // get remainingCount and newStreamPosition
  remainingCount = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/remainingCount/fn:number()");
  streamPosition = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/newStreamPosition/fn:string()");

  // call xdmp.spawn to filter and ingest data from the batch

  xdmp.spawn("update.sjs", {"result": result.toArray()[1]}, null);

}

// update the system info document

var oldSystemInfo = cts.doc("/config/systemInfo.json");

var oldSystemInfoDoc = oldSystemInfo.toObject();
oldSystemInfoDoc.lastUpdated = fn.currentDateTime().add(xdmp.elapsedTime());

var output =
  sr.documents()
  .result();

// subtract two from output.estimate, because of the two /config/ files.
var newNumDocuments = output.estimate - 2;

oldSystemInfoDoc.numDocuments = newNumDocuments;

xdmp.nodeReplace(oldSystemInfo, oldSystemInfoDoc);

"done";

