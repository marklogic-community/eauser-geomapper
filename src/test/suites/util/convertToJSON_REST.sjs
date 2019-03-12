
var util = require('/scripts/util.sjs');

var test = require('/test/test-helper.xqy');

var marketoUser = {
  firstName: 'Amy',
  lastName: 'Pond',
  email: 'apond@tardis.org',
  city: 'London',
  state: 'none',
  Main_Industry__c: 'time traveler',
  company: 'BBC',
  id: 1234567,
  phone: '4845551212',
  Account_Type__c: null,
  address: '1 Tardis Way',
  country: 'England',
  DC_Employees__c: 3,
  EA_ML9username: 'apond',
  GEO_Region_Sub_Region__c: 'EMEA',
  HasAccessToEAML9: true,
  postalCode: 'W11 2BQ',
  registeredforEAML8: true,
  registeredforNoSQLforDummies: false,
  createdAt: '2014-03-28T10:52:55Z', // or Registration_Date__c , but this is nearly always null...
  Revenue_Range__c: null,
  Specific_Lead_Source__c: 'The Doctor',
  website: 'tardis.org', // taken from email address
  updatedAt: '2016-08-31T03:28:22Z' // when the document was last updated in Marketo
};

var actual = util.convertToJson_REST(marketoUser, 'EA-foo');

[
  test.assertExists(actual.fullDetails),

  test.assertEqual(marketoUser.firstname, actual.fullDetails.firstName),
  test.assertEqual(marketoUser.lastname, actual.fullDetails.lastName),
  test.assertEqual(marketoUser.email, actual.fullDetails.email),
  test.assertEqual(marketoUser.city, actual.fullDetails.city),
  test.assertEqual(marketoUser.state, actual.fullDetails.state),
  test.assertEqual(marketoUser.industry, actual.fullDetails.Main_Industry__c),
  test.assertEqual(marketoUser.company, actual.fullDetails.company),
  test.assertEqual(marketoUser.id, actual.fullDetails.id),

  test.assertEqual(marketoUser.phone, actual.fullDetails.phone),
  test.assertEqual(marketoUser.accountType, actual.fullDetails.Account_Type__c),
  test.assertEqual(marketoUser.address, actual.fullDetails.address),
  test.assertEqual(marketoUser.country, actual.fullDetails.country),
  test.assertEqual(marketoUser.numEmployees, actual.fullDetails.DC_Employees__c),
  test.assertEqual(marketoUser.username, actual.fullDetails.EA_ML9username),
  test.assertEqual(marketoUser.region, actual.fullDetails.GEO_Region_Sub_Region__c),
  test.assertEqual(marketoUser.hasAccessToEAML9, actual.fullDetails.HasAccessToEAML9),
  test.assertEqual(marketoUser.postalCode, actual.fullDetails.postalCode),
  test.assertEqual(marketoUser.registeredForEAML8, actual.fullDetails.registeredforEAML8),
  test.assertEqual(marketoUser.registeredForNoSQLforDummies, actual.fullDetails.registeredforNoSQLforDummies),
  test.assertEqual(marketoUser.registrationDate, actual.fullDetails.createdAt),
  test.assertEqual(marketoUser.revenueRange, actual.fullDetails.Revenue_Range__c),
  test.assertEqual(marketoUser.leadSource, actual.fullDetails.Specific_Lead_Source__c),
  test.assertEqual(marketoUser.website, actual.fullDetails.website),
  test.assertEqual(marketoUser.marketoLastUpdated, actual.fullDetails.updatedAt),

  test.assertTrue(
    xdmp.castableAs(
      'http://www.w3.org/2001/XMLSchema',
      'dateTime',
      actual.fullDetails.appLastUpdated)
  ),

  test.assertTrue(
    xdmp.castableAs(
      'http://www.w3.org/2001/XMLSchema',
      'dateTime',
      actual.fullDetails.dateAdded)
  )
]
