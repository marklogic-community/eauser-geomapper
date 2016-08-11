//batch size = 200

var util = require("util.sjs");
declareUpdate();


// iterate through all the leadRecords in this batch.
var records = result.xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/leadRecordList/leadRecord");

records = records.toArray();

xdmp.log("About to insert " + records.length + " records");

for (var r of records) {
  var rec = r;

  try {
    // filter out EA users (They will have the EA_ML9username attribute).
    if (fn.boolean(rec.xpath("leadAttributeList/attribute[attrName='EA_ML9username']"))){
      var json = util.convertToJson(rec);
        
      var username = json.fullDetails.username;

      // picked "+" over "-" because some users have already used "-" in their username.
      username = util.removeSpaces("" + username, "+");

      // check if the user exists already in the database

      var exists = util.exists(username);

      // uri template for EA users
      var uri = "/users/" + username + ".json";

      // if the user already exists, update the different fields, and update "lastUpdated"
      if (exists) {
        // find the old dateAdded field
        var oldDoc = cts.doc(uri);
        var dateAdded = oldDoc.root.fullDetails.dateAdded;

        // the new document will preserve the dateAdded field.
        json.fullDetails.dateAdded = dateAdded;
        if (oldDoc.root.fullDetails.features) {
          json.fullDetails.features = oldDoc.root.fullDetails.features;
        }

        xdmp.nodeReplace(oldDoc, json);
        xdmp.log(" updated " + username);
      }
      // if not, insert it normally.
      else {
        xdmp.log(" inserted " + username);
        xdmp.documentInsert(uri, json);
      }
    }
    // else they're not an eauser. So we will ignore them.
  }
  catch (error) {
    try {
      xdmp.log("Error: " + error, "warning");
      xdmp.log("Failed: " + rec.xpath("Email/fn:string()"), "warning");
    }
    catch (error) {
      xdmp.log("ERROR: " + error);
    }
  }
}

