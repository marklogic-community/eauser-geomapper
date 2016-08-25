"use strict";

declareUpdate();

var keys = require("../private/keys.sjs");
var util = require("util.sjs");

var endpoint = keys.endpoint_REST;
var clientID = keys.clientID_REST;
var clientSecret = keys.clientSecret_REST;
var EA1programID = keys.EA1programID;
var EA2programID = keys.EA2programID;
var EA3programID = keys.EA3programID;
var emailRecipient = keys.emailRecipient;

// set to EA2 right now.
// when you want EA3, replace this with the one below
var EA = {
  "programID": EA2programID,
  "version": "EA2"
};

/*
var EA = {
  "programID": EA3programID,
  "version": "EA3"
}
*/

// get access token (valid for 1 hour)
var auth = xdmp.httpGet(endpoint + "/identity/oauth/token?grant_type=client_credentials&client_id=" + clientID + "&client_secret=" + clientSecret);
var token = auth.toArray()[1].root.access_token;

// fields to be displayed (there are ~700 fields to choose from)
var listOfFields = "firstName,lastName,email,city,state,country,postalCode,company,Main_Industry__c,phone,Account_Type__c,address,DC_Employees__c,EA_ML9username,GEO_Region_Sub_Region__c,registeredforEAML8,HasAccessToEAML9,registeredforNoSQLforDummies,Registration_Date__c,Revenue_Range__c,Specific_Lead_Source__c,website,createdAt,updatedAt";

var completed = true;

var emailNewUsers;
var emailOldUsers;
var emailLastUpdated;

try {
  var nextPageToken = "";

  emailNewUsers = 0;

  do {

    // returns a json response
    var res = xdmp.httpGet(endpoint + "/rest/v1/leads/programs/" + EA.programID + ".json?access_token=" + token + "&nextPageToken=" + nextPageToken + "&fields=" + listOfFields);

    nextPageToken = res.toArray()[1].root.nextPageToken;


    // process the data and insert it into MarkLogic
    var users = res.toArray()[1].root.result;

    xdmp.log("updateData_REST: about to insert " + users.length + " documents");

    for (var i in users) {

      var json = util.convertToJson_REST(users[i], EA.version);

      var email = json.fullDetails.email;

      // just in case... ('cause why not? :) )
      email = util.removeSpaces("" + email, "+");

      // if we have reached the end of the list of users
      // and have started to go through things like length, xpath, toString...
      if (email === undefined || email + "" === "undefined" || email + "" === "null") {
        break;
      }

      // uri template for EA users
      var uri = "/users/" + email + ".json";

      if (util.exists(email)) {
        // find the old dateAdded field
        var oldDoc = cts.doc(uri);

        var dateAdded = oldDoc.root.fullDetails.dateAdded;

        // the new document will preserve the dateAdded field.
        json.fullDetails.dateAdded = dateAdded;
        if (oldDoc.root.fullDetails.features) {
          json.fullDetails.features = oldDoc.root.fullDetails.features;
        }

        // check if this is a new EA version for this user
        if (!(EA.version in oldDoc.root.fullDetails.ea_version)) {
          json.fullDetails.ea_version.push(oldDoc.root.fullDetails.ea_version[0]);
        }

        xdmp.nodeReplace(oldDoc, json);
        xdmp.log("updateData_REST: updated " + email);

      } else {
        // else this is a new user

        emailNewUsers++;

        xdmp.log("updateData_REST inserted " + email);
        xdmp.documentInsert(uri, json);
      }

    }

  } while (nextPageToken && nextPageToken !== "")

  // update systemInfo.json

  var oldSystemInfo = cts.doc("/config/systemInfo.json");

  var oldSystemInfoDoc = oldSystemInfo.toObject();

  emailLastUpdated = oldSystemInfoDoc.lastUpdated;
  emailOldUsers = oldSystemInfoDoc.numDocuments;

  oldSystemInfoDoc.lastUpdated = fn.currentDateTime().add(xdmp.elapsedTime());

  oldSystemInfoDoc.numDocuments = emailOldUsers + emailNewUsers;

  xdmp.nodeReplace(oldSystemInfo, oldSystemInfoDoc);

  xdmp.log("updateData_REST updated systemInfo.json");
}
catch(err) {
  xdmp.log("updateData_REST failed to update data");
  xdmp.log(err);
  completed = false;
}

// email status report

try {
  if (completed) {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");
    var content = "Completed data update at " + timestamp + "\n\n";
    content += "Total number of users: " + (emailOldUsers + emailNewUsers) + "\n";
    content += "Number of new users: " + emailNewUsers + "\n\n";
    content += "Previously updated at: " + emailLastUpdated + "\n";

    var message = {"from":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "to":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "subject":"EA tracker - success - data update",
                 "content": content};
    xdmp.email(message);
  }
  else {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");
    var content = "Failed data update at " + timestamp + "\n\n";

    var message = {"from":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "to":{"name":emailRecipient.name, "address":emailRecipient.address},
                 "subject":"EA tracker - fail - initial data ingestion",
                 "content": content};
    xdmp.email(message);
  }
}
catch (err) {
  xdmp.log("updateData_REST email status report failed to send: " + JSON.stringify(err));
}

xdmp.log("updateData_REST DONE");

