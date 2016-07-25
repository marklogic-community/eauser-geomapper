// result = SOAP response from Marketo
// batch size = [TBD]

var util = require("util.sjs");
declareUpdate();


// iterate through all the leadRecords in this batch.
var records = result.xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/leadRecordList/leadRecord");

records = records.toArray();

xdmp.log("About to insert records " + records.length);

for (var r of records) {
  var rec = r;

  try {
    if (fn.boolean(rec.xpath("leadAttributeList/attribute[attrName='EA_ML9username']"))){
      var json = util.convertToJson(rec);
        
      var username = json.fullDetails.username;

      username = util.removeSpaces(username, "+");

      var uri = "/users/" + username + ".json";

      //TODO: 
      //var changed = util.compare(uri);

      xdmp.log(" inserted " + username);
      xdmp.documentInsert(uri, json);
    }
    // else they're not an eauser.
  }
  catch (error) {
    // Heh. What error? (insert devilish grin)
    //  but in all seriousness, we should probably record this person 
    //  in order to manually check what's going on..
    try {
      // this will error if rec is undefined... which is why there's another try-catch in a try-catch
      xdmp.log("Error: " + error, "warning");
      xdmp.log("Failed: " + rec.xpath("Email/fn:string()"), "warning");
    }
    catch (error) {
      xdmp.log("ERROR: " + error);
    }
  }
}


