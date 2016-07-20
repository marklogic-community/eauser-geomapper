
var keys = require("../private/keys.sjs");

// Google Maps Geocoder 
var geocoderKey = keys.geocoderKey;

// Marketo 
var endpoint = keys.endpoint;
var userID = keys.userID;
var secretkey = keys.secretkey;


// Calls the Google Maps geocoding api, and returns the lat/long associated with a postal code in a certain country
var getCoord = function(postalCode, country) {

  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + postalCode + "%20" + country + "&key=" + geocoderKey;
  
  // need to remove spaces from the url
  var noSpacesArray = url.split(" ");

  var noSpaceUrl = "";
  
  for (var i = 0; i < noSpacesArray.length; i++) {
    if (i == 0) {
      noSpaceUrl = noSpacesArray[0];
      continue;
    }
    noSpaceUrl = noSpaceUrl + "%20" + noSpacesArray[i];
  }
  
  var res = xdmp.httpGet(noSpaceUrl);

  try {
    var point = res.toArray()[1].root.results[0].geometry.location;
    var lat = point.lat;
    var long = point.lng;
    return [lat, long];
  }
  catch (err) {
    return null;
  }
};


// takes a leadRecord from Marketo and transforms it into GeoJSON
var convertToJson = function(record) {
  
  var properties = {};
  
  // preview fields
  properties["firstname"] = record.xpath("./leadAttributeList/attribute[attrName = 'FirstName']/attrValue/fn:string()");
  properties["lastname"] = record.xpath("./leadAttributeList/attribute[attrName = 'LastName']/attrValue/fn:string()");
  properties["email"] = record.xpath("./Email/fn:string()");
  properties["username"] = record.xpath("./leadAttributeList/attribute[attrName = 'EA_ML9username']/attrValue/fn:string()")
  properties["country"] = record.xpath("./leadAttributeList/attribute[attrName = 'Country']/attrValue/fn:string()");
  properties["state"] = record.xpath("./leadAttributeList/attribute[attrName = 'State']/attrValue/fn:string()");
  properties["postalCode"] = record.xpath("./leadAttributeList/attribute[attrName = 'PostalCode']/attrValue/fn:string()");
  properties["industry"] = record.xpath("./leadAttributeList/attribute[attrName = 'Main_Industry__c']/attrValue/fn:string()");

  // full detail fields
  properties["leadScore"] = record.xpath("./leadAttributeList/attribute[attrName = 'LeadScore']/attrValue/fn:string()");
  properties["leadSource"] = record.xpath("./leadAttributeList/attribute[attrName = 'LeadSource']/attrValue/fn:string()");
  properties["markLogicContactEmail"] = record.xpath("./leadAttributeList/attribute[attrName = 'markLogicContactEmail']/attrValue/fn:string()");
  properties["phone"] = record.xpath("./leadAttributeList/attribute[attrName = 'Phone']/attrValue/fn:string()");
  properties["registrationDate"] = record.xpath("./leadAttributeList/attribute[attrName = 'Registration_Date__c']/attrValue/fn:string()");
  
  var doc = {};

  doc["type"] = "Feature";
  doc["properties"] = properties;
  
  var coord = getCoord(properties.postalCode, properties.country);
  
  doc["geometry"] = {
    "type": "Point",
    "coord": coord
  };

  return doc;
};


// Marketo SOAP requests

// getLead -> returns a single lead from Marketo (xml) or null
//  need to search by Email address (for now at least.)
var marketoGetLead = function(email) {

  var timestamp = fn.currentDateTime();
  var message = "" + timestamp + userID;
  var signature = xdmp.hmacSha1(secretkey, message);

  var options = xdmp.quote(
    "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns1=\"http://www.marketo.com/mktows/\"><SOAP-ENV:Header><ns1:AuthenticationHeader><mktowsUserId>"
    + userID 
    + "</mktowsUserId><requestSignature>"
    + signature 
    + "</requestSignature><requestTimestamp>"
    + timestamp 
    + "</requestTimestamp></ns1:AuthenticationHeader></SOAP-ENV:Header><SOAP-ENV:Body><ns1:paramsGetLead><leadKey><keyType>"
    + "EMAIL" 
    + "</keyType><keyValue>"
    + email
    + "</keyValue></leadKey></ns1:paramsGetLead></SOAP-ENV:Body></SOAP-ENV:Envelope>"
  );

  var result = xdmp.httpPost(endpoint, 
    {
     "data" : options
    }
  );

  var test = result.toArray()[1].xpath("/*:Envelope/*:Body/*:successGetLead/result/leadRecordList/leadRecord");

  var leadRecord = test.toArray()[0];
  leadRecord.xpath(".");

  return leadRecord;

};

// getMultipleLeads
//
//..
//..
//.. Still waiting.. :'(
//

module.exports{
  "convertToJson": convertToJson,

  //getCoord might not be necessary..
  "getCoord": getCoord,

  "marketoGetLead": marketoGetLead
}

