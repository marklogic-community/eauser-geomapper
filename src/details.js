// url will be the form http://host.whatever/details22.html?username={{username}}

// from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var username = getUrlParameter("username");

$(document).ready(function() {
  payload = {"username": username};
  $.ajax({
    type: "POST",
    url: "/scripts/findUser.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: display, 
    error: fail
  });
});

///////////////////////////////////////////////////
// for testing purposes:
var user_test =   {
    "type": "Feature", 
    "fullDetails": {
      "firstname": "Kevin", 
      "lastname": "Costello", 
      "email": "hiKeven@what.com", 
      "city": "San Carlos", 
      "state": "CA", 
      "industry": "Technology - Software", 
      "company": "MarkLogic",
      "phone": "123-456-7890", 
      "accountType": "Customer", 
      "address": "999 Skyway Rd Ste 200", 
      "country": "United States of America", 
      "numEmployees": 130, 
      "username": "kcostel", 
      "region": "AMS_NAM _West_United States of America_CA", 
      "hasAccessToEAML9": true, 
      "postalCode": "94070", 
      "registeredForEAML8": true, 
      "registeredForNoSQLforDummies": true, 
      "registrationDate": "2015-06-23", 
      "revenueRange": "$25M - $50M", 
      "leadSource": "FY16 - Digital Mktg - LP - NoSQL for Dummies Marketo LP", 
      "website": "marklogic.com"
    }, 

 /*   // TODO:
    "features": {
      "here": true,
      "is": false,
      "a": false,
      "list": false,
      "of": true,
      "features": true
    },
*/
    "features": [
      "Geospatial",
      "Ops Director",
      "Redaction",
      "Optic API"
    ],

    "source": "<leadRecord xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:ns1=\"http://www.marketo.com/mktows/\"><Id>2697003</Id><Email>kevin.costello@marklogic.com</Email><ForeignSysPersonId xsi:nil=\"true\"/><ForeignSysType xsi:nil=\"true\"/><leadAttributeList><attribute><attrName>Account_Main_Industry__c</attrName><attrType>string</attrType><attrValue>Technology - Software</attrValue></attribute><attribute><attrName>Account_Type__c_lead</attrName><attrType>string</attrType><attrValue>Customer</attrValue></attribute><attribute><attrName>Account__c</attrName><attrType>string</attrType><attrValue>0014000000L1dRWAAZ</attrValue></attribute><attribute><attrName>Address</attrName><attrType>text</attrType><attrValue>999 Skyway Rd Ste 200</attrValue></attribute><attribute><attrName>agreedtoEAML8TC</attrName><attrType>boolean</attrType><attrValue>1</attrValue></attribute><attribute><attrName>AnnualRevenue</attrName><attrType>currency</attrType><attrValue>28970000</attrValue></attribute><attribute><attrName>cid</attrName><attrType>string</attrType><attrValue>email</attrValue></attribute><attribute><attrName>City</attrName><attrType>string</attrType><attrValue>San Carlos</attrValue></attribute><attribute><attrName>Comm_or_PS__c</attrName><attrType>string</attrType><attrValue>Commercial</attrValue></attribute><attribute><attrName>Company</attrName><attrType>string</attrType><attrValue>MarkLogic</attrValue></attribute><attribute><attrName>Contracts_To_Send__c</attrName><attrType>string</attrType><attrValue>Mutual Non-Disclosure Agreement</attrValue></attribute><attribute><attrName>Country</attrName><attrType>string</attrType><attrValue>United States of America</attrValue></attribute><attribute><attrName>dba_Company_Name__c</attrName><attrType>string</attrType><attrValue>MarkLogic</attrValue></attribute><attribute><attrName>DC_Ann__c</attrName><attrType>currency</attrType><attrValue>28970000</attrValue></attribute><attribute><attrName>DC_Clean_Status__c_lead</attrName><attrType>string</attrType><attrValue>NotFound</attrValue></attribute><attribute><attrName>DC_NoOfEmp__c</attrName><attrType>integer</attrType><attrValue>130</attrValue></attribute><attribute><attrName>DC_Phone__c_lead</attrName><attrType>phone</attrType><attrValue>925-667-7310</attrValue></attribute><attribute><attrName>ddc_prospector__Sourced_from_Data_com__c</attrName><attrType>string</attrType><attrValue>Other</attrValue></attribute><attribute><attrName>demandbase_data_source__c</attrName><attrType>string</attrType><attrValue>company</attrValue></attribute><attribute><attrName>demandbase_ip__c</attrName><attrType>string</attrType><attrValue>12.172.85.113</attrValue></attribute><attribute><attrName>demandbase_sid__c</attrName><attrType>integer</attrType><attrValue>3449731</attrValue></attribute><attribute><attrName>eAML8confirmationlink</attrName><attrType>text</attrType><attrValue>https://ea.marklogic.com/account/confirm/6f6117e0a2218c6442e4f2a71b320ac423464893/</attrValue></attribute><attribute><attrName>EA_ML9username</attrName><attrType>string</attrType><attrValue>kcostel</attrValue></attribute><attribute><attrName>email_domain__c</attrName><attrType>string</attrType><attrValue>@marklogic.com</attrValue></attribute><attribute><attrName>Employee_Range__c</attrName><attrType>string</attrType><attrValue>Mid-Market</attrValue></attribute><attribute><attrName>FirstName</attrName><attrType>string</attrType><attrValue>Kevin</attrValue></attribute><attribute><attrName>FullName__c</attrName><attrType>string</attrType><attrValue>Costello, Kevin</attrValue></attribute><attribute><attrName>GEO_Region_Sub_Region__c</attrName><attrType>string</attrType><attrValue>AMS_NAM _West_United States of America_CA</attrValue></attribute><attribute><attrName>Geo__c_lead</attrName><attrType>string</attrType><attrValue>AMS</attrValue></attribute><attribute><attrName>HasAccessToEAML9</attrName><attrType>boolean</attrType><attrValue>1</attrValue></attribute><attribute><attrName>InferredCompany</attrName><attrType>string</attrType><attrValue>AT&amp;T Services</attrValue></attribute><attribute><attrName>InferredCountry</attrName><attrType>string</attrType><attrValue>United States</attrValue></attribute><attribute><attrName>ISO2__c</attrName><attrType>string</attrType><attrValue>US</attrValue></attribute><attribute><attrName>LastModbyOwner__c</attrName><attrType>integer</attrType><attrValue>0</attrValue></attribute><attribute><attrName>LastName</attrName><attrType>string</attrType><attrValue>Costello</attrValue></attribute><attribute><attrName>LeadScore</attrName><attrType>integer</attrType><attrValue>923</attrValue></attribute><attribute><attrName>LeadSource</attrName><attrType>string</attrType><attrValue>Online</attrValue></attribute><attribute><attrName>LeadStatus</attrName><attrType>string</attrType><attrValue>Open</attrValue></attribute><attribute><attrName>Lead_Age_calc__c</attrName><attrType>integer</attrType><attrValue>395</attrValue></attribute><attribute><attrName>Lead_Score_Behavior__c</attrName><attrType>integer</attrType><attrValue>515</attrValue></attribute><attribute><attrName>Lead_Score_Total__c</attrName><attrType>integer</attrType><attrValue>515</attrValue></attribute><attribute><attrName>Main_Industry__c</attrName><attrType>string</attrType><attrValue>Technology - Software</attrValue></attribute><attribute><attrName>markLogicContactEmail</attrName><attrType>email</attrType><attrValue>Jennifer.Tsau@marklogic.com</attrValue></attribute><attribute><attrName>Newsletter_Sub__c</attrName><attrType>string</attrType><attrValue>none</attrValue></attribute><attribute><attrName>NumberOfEmployees</attrName><attrType>integer</attrType><attrValue>130</attrValue></attribute><attribute><attrName>Owner_is_Queue__c</attrName><attrType>float</attrType><attrValue>1</attrValue></attribute><attribute><attrName>Owner_Queue_Name__c</attrName><attrType>string</attrType><attrValue>Marketing</attrValue></attribute><attribute><attrName>Phone</attrName><attrType>phone</attrType><attrValue>925-667-7310</attrValue></attribute><attribute><attrName>Portal_Link__c</attrName><attrType>string</attrType><attrValue>https://na2.salesforce.com/secur/login_portal.jsp?orgId=00D300000000KMl&amp;portalId=060400000004hLP&amp;startURL=/00Q40000017ojNP</attrValue></attribute><attribute><attrName>PostalCode</attrName><attrType>string</attrType><attrValue>94070</attrValue></attribute><attribute><attrName>Primary_SIC__c</attrName><attrType>string</attrType><attrValue>7371</attrValue></attribute><attribute><attrName>RecordTypeId</attrName><attrType>string</attrType><attrValue>0124000000016AoAAI</attrValue></attribute><attribute><attrName>RegionLink__c_lead</attrName><attrType>string</attrType><attrValue>a1R40000002SR8zEAG</attrValue></attribute><attribute><attrName>Region_formula__c</attrName><attrType>string</attrType><attrValue>NAM</attrValue></attribute><attribute><attrName>Region_Lookup__c_lead</attrName><attrType>string</attrType><attrValue>NAM</attrValue></attribute><attribute><attrName>Region_Name__c_lead</attrName><attrType>string</attrType><attrValue>AMS_NAM</attrValue></attribute><attribute><attrName>registeredforEAML8</attrName><attrType>boolean</attrType><attrValue>1</attrValue></attribute><attribute><attrName>registeredforNoSQLforDummies</attrName><attrType>boolean</attrType><attrValue>1</attrValue></attribute><attribute><attrName>Registration_Date__c</attrName><attrType>date</attrType><attrValue>2015-06-23</attrValue></attribute><attribute><attrName>Registration_Status__c</attrName><attrType>string</attrType><attrValue>Draft</attrValue></attribute><attribute><attrName>Registration__c</attrName><attrType>string</attrType><attrValue>Reg-274092</attrValue></attribute><attribute><attrName>Revenue_Range__c</attrName><attrType>string</attrType><attrValue>$25M - $50M</attrValue></attribute><attribute><attrName>Role__c</attrName><attrType>string</attrType><attrValue>Technical Evaluator</attrValue></attribute><attribute><attrName>Specific_Lead_Source__c</attrName><attrType>string</attrType><attrValue>FY16 - Digital Mktg - LP - NoSQL for Dummies Marketo LP</attrValue></attribute><attribute><attrName>SRL_Counter__c</attrName><attrType>integer</attrType><attrValue>0</attrValue></attribute><attribute><attrName>State</attrName><attrType>string</attrType><attrValue>CA</attrValue></attribute><attribute><attrName>Sub_Industry__c</attrName><attrType>string</attrType><attrValue>Software Applications</attrValue></attribute><attribute><attrName>Sub_Region__c_lead</attrName><attrType>string</attrType><attrValue>West</attrValue></attribute><attribute><attrName>Test123__c</attrName><attrType>text</attrType><attrValue>false</attrValue></attribute><attribute><attrName>traffic__c</attrName><attrType>string</attrType><attrValue>Medium</attrValue></attribute><attribute><attrName>Type__c</attrName><attrType>string</attrType><attrValue>Prospect</attrValue></attribute><attribute><attrName>Website</attrName><attrType>url</attrType><attrValue>marklogic.com</attrValue></attribute></leadAttributeList></leadRecord>", 
    "geometry": {
      "type": "Point", 
      "coord": [
        37.4975165, 
        -122.2710602
      ]
    }
  };
////////////////////////////////////

var global_user;

function display(user) {
/*  if (user.fullDetails.username === "kcostel") {
    user = user_test;
  } */

  global_user = user;

  // user details
  $("#firstname").append(user.fullDetails.firstname);
  $("#lastname").append(user.fullDetails.lastname);
  $("#email").append(user.fullDetails.email);
  $("#address").append(user.fullDetails.address);
  $("#city").append(user.fullDetails.city);
  $("#state").append(user.fullDetails.state);
  $("#postalCode").append(user.fullDetails.postalCode);
  $("#country").append(user.fullDetails.country);
  $("#region").append(user.fullDetails.region);
  $("#industry").append(user.fullDetails.industry);

  // features (checkboxes)
  $.ajax({
    type: "GET",
    url: "/scripts/getFeatures.sjs",
    dataType: "json",
    success: displayCheckboxes,
    error: fail
  });

  // company details
  $("#company").append(user.fullDetails.company);
  $("#revenueRange").append(user.fullDetails.revenueRange);
  $("#numEmployees").append(user.fullDetails.numEmployees);
  $("#website").append(user.fullDetails.website);

  // Marketo xml source
  $("#source").append(encodeXml(user.source));

  // Marklogic account info
  $("#accountType").append(user.fullDetails.accountType);
  $("#username").append(user.fullDetails.username);
  $("#registeredForEAML8").append(user.fullDetails.registeredForEAML8);
  $("#hasAccessToEAML9").append(user.fullDetails.hasAccessToEAML9);
  $("#registeredForNoSQLforDummies").append(user.fullDetails.registeredForNoSQLforDummies);
  $("#registrationDate").append(user.fullDetails.registrationDate);
  $("#leadSource").append(user.fullDetails.leadSource);

};

function displayCheckboxes(MLFeatures) {

  if (MLFeatures) {
    // if the user has features (in an array), check them off as you display them.

    var str = "<div class=\"row\"><div class=\"col-sm-6\">";

    for (category in MLFeatures.MarkLogicFeatures) {
      str += "<h5>" + category + "</h5>";

      for (item in MLFeatures.MarkLogicFeatures[category]) {
        var feature = MLFeatures.MarkLogicFeatures[category][item];
        var checked = "checked";

        try {
          if ($.inArray(feature, global_user.features) === -1) {
            checked = "";
          }
        }
        catch (err) {
          // error occurs when global_user.features doesn't exist (we can create it on this page)
          checked = "";
        }
        str += "<input type=\"checkbox\" value=\"" + feature + "\" " + checked + " >&nbsp;&nbsp;&nbsp;  " + feature + "<br/>";
      }
      str += "<br/>";

      //specify where you want a column break

      if (category === "Security") {
        str += "</div><div class=\"col-sm-6\">";
      }
    }

    str += "</div>"; //closes the second col-sm-6
    str += "</div>"; //closes .row

    str += "<br/><button onclick=\"save()\">Save Changes</button>";

    $("#features").append(str);
  }
  else {
    $("#features").append("<h5>No features to list</h5");
  }

}

// saves any changes made to the features list.
function save() {
  var n = $("input:checked").length;

  var features = [];

  for (var i = 0; i < n; i++) {
    features.push($("input:checked")[i].value);
  }

  var payload = {
    "username": global_user.fullDetails.username,
    "features": features
  }

  $.ajax({
    type: "POST",
    url: "/scripts/updateFeatures.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: function(res) {
      $("#features").append("<div class=\"alert alert-success\" role=\"alert\">" 
                            + "<a href=\"#\" class=\"close\" data-dismiss=\"alert\" title=\"close\">×</a>"
                            + "Successfully updated " 
                            + global_user.fullDetails.username 
                            + "'s features</div>");
    },
    error: function(a,b,c) {
      $("#features").append("<div class=\"alert alert-danger\" role=\"alert\">Something went wrong... :(</div>");
      fail(a,b,c);
    }
  });

}


// from http://stackoverflow.com/questions/2959642/how-to-make-a-valid-string-for-xml-in-javascript
function encodeXml(s) {
  return (s
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;')
  );
}

function fail(jqXHR, status, errorThrown) 
{
  console.log("Failed to receive data: ");
  console.log(jqXHR);
  console.log(status);
  console.log(errorThrown)
};

