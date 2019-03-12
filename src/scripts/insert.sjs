/* global require, declareUpdate, xdmp, fn, result */
/* jshint esversion: 6 */

//batch size = 200

// External var: result

var util = require('util.sjs');
declareUpdate();


// iterate through all the leadRecords in this batch.
var records = result.xpath('/*:Envelope/*:Body/*:successGetMultipleLeads/result/leadRecordList/leadRecord');

records = records.toArray();

xdmp.log('About to insert ' + records.length + ' records');

for (var r of records) {
  var rec = r;

  try {
    // filter out EA users (They will have the EA_ML9username attribute).
    if (fn.boolean(rec.xpath('leadAttributeList/attribute[attrName="EA_ML9username"]'))) {
      var json = util.convertToJson(rec);

      var username = json.fullDetails.username;

      // picked '+' over '-' because some users have already used '-' in their username.
      username = util.removeSpaces('' + username, '+');

      // uri template for EA users
      var uri = '/users/' + username + '.json';

      xdmp.log(' inserted ' + username);
      xdmp.documentInsert(uri, json);
    }

    // else they're not an eauser. So we will ignore them.
  }
  catch (error) {
    // Heh. What error? (insert devilish grin)
    //  but in all seriousness, we should probably record this person
    //  in order to manually check what's going on..
    try {
      // this will error if rec is undefined... which is why there's a try-catch in a try-catch :p
      xdmp.log('Error: ' + error, 'warning');
      xdmp.log('Failed: ' + rec.xpath('Email/fn:string()'), 'warning');
    }
    catch (error) {
      xdmp.log('ERROR: ' + error);
    }
  }
}

