  /* global declareUpdate, require, xdmp, cts, fn */
/* jshint camelcase: false */

declareUpdate();

var keys = require('../private/keys.sjs');
var util = require('util.sjs');
var update = require('updateLib.sjs');

var endpoint = keys.endpoint_REST;
var clientID = keys.clientID_REST;
var clientSecret = keys.clientSecret_REST;
var EA1programID = keys.EA1programID;
var EA2programID = keys.EA2programID;
var EA3programID = keys.EA3programID;
var emailRecipient = keys.emailRecipient;

var EA = {
  'programID': EA3programID,
  'version': 'EA3'
};

// get access token (valid for 1 hour)
var auth = xdmp.httpGet(endpoint + '/identity/oauth/token?grant_type=client_credentials&client_id=' + clientID + '&client_secret=' + clientSecret);
var token = auth.toArray()[1].root.access_token;

// fields to be displayed (there are ~700 fields to choose from)
var listOfFields = 'firstName,lastName,email,city,state,country,postalCode,company,Main_Industry__c,phone,Account_Type__c,address,DC_Employees__c,EA_ML9username,GEO_Region_Sub_Region__c,registeredforEAML8,HasAccessToEAML9,registeredforNoSQLforDummies,Registration_Date__c,Revenue_Range__c,Specific_Lead_Source__c,website,createdAt,updatedAt';

var completed = true;

var emailNewUsers;
var emailOldUsers;
var emailLastUpdated;

var duplicates = [];

try {
  var nextPageToken = '';

  emailNewUsers = 0;

  do {

    // returns a json response
    var res = xdmp.httpGet(endpoint + '/rest/v1/leads/programs/' + EA.programID + '.json?access_token=' + token + '&nextPageToken=' + nextPageToken + '&fields=' + listOfFields);

    var resArray = res.toArray();

    nextPageToken = resArray[1].root.nextPageToken;


    // process the data and insert it into MarkLogic
    var users = resArray[1].root.result;

    xdmp.log('updateData_REST: about to insert ' + users.length + ' documents');

    var updates = update.updateFromMarketo(users, util.addCoordinates, EA.version);

    duplicates.push(updates.duplicates);
    emailNewUsers += updates.newUsers;

  } while (nextPageToken && nextPageToken !== '');

  // update systemInfo.json

  var oldSystemInfo = cts.doc('/config/systemInfo.json');

  var oldSystemInfoDoc = oldSystemInfo.toObject();

  emailLastUpdated = oldSystemInfoDoc.lastUpdated;
  emailOldUsers = oldSystemInfoDoc.numDocuments;

  oldSystemInfoDoc.lastUpdated = fn.currentDateTime().add(xdmp.elapsedTime());

  oldSystemInfoDoc.numDocuments = emailOldUsers + emailNewUsers;

  xdmp.nodeReplace(oldSystemInfo, oldSystemInfoDoc);

  xdmp.log('updateData_REST updated systemInfo.json');
}
catch(err) {
  xdmp.log('updateData_REST failed to update data');
  xdmp.log(err.toString());
  completed = false;
}

// email status report

try {
  if (completed) {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), '[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ');
    var content = 'Completed data update at ' + timestamp + '\n\n';
    content += 'Total number of users: ' + (emailOldUsers + emailNewUsers) + '\n';
    content += 'Number of new users: ' + emailNewUsers + '\n\n';
    if (duplicates.length > 0) {
      content += '\nDuplicate users: ' + fn.stringJoin(duplicates, ', ') + '\n\n';
    }
    content += 'Previously updated at: ' + emailLastUpdated + '\n';
    content += util.getEmailSource();

    var message = {
      'from':{'name':emailRecipient.name, 'address':emailRecipient.address},
      'to':{'name':emailRecipient.name, 'address':emailRecipient.address},
      'subject':'EA tracker - success - data update',
      'content': content
    };
    xdmp.email(message);
  }
  else {
    var timestamp = fn.formatDateTime(fn.currentDateTime().add(xdmp.elapsedTime()), '[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ');
    var content = 'Failed data update at ' + timestamp + '\n\n';
    content += util.getEmailSource();

    var message = {
      'from':{'name':emailRecipient.name, 'address':emailRecipient.address},
      'to':{'name':emailRecipient.name, 'address':emailRecipient.address},
      'subject':'EA tracker - fail - initial data ingestion',
      'content': content
    };
    xdmp.email(message);
  }
}
catch (err) {
  xdmp.log('updateData_REST email status report failed to send: ' + err.toString());
}

xdmp.log('updateData_REST DONE');

