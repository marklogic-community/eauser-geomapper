// result = SOAP response from Marketo
// batch size = [TBD]

var util = require("util.sjs");


// iterate through all the leadRecords in this batch.
var records = result.xpath("/*:Envelope/*:Body/*:successGetMultipleLeads/result/leadRecordList/leadRecord");

for (var rec of records) {
  var person = {};

  try {
    if (fn.boolean(rec.xpath("leadAttributeList/attribute[attrName='EA_ML9username']"))){
      var json = util.convertToJson(rec);
      eausers.push(json);
        
      var username = json.fullDetails.username;
      var uri = "/users/" + username + ".json";
      xdmp.documentInsert(uri, json);
    }
    // else they're not an eauser.
  }
  catch (error) {
    // Heh. What error? (insert devilish grin)
    //  but in all seriousness, we should probably record this person in order to manually check what's going on..
    xdmp.log(rec.xpath("Email/fn:string()"), "warning");
  }
}

