
var util = require('/scripts/util.sjs');

var test = require('/test/test-helper.xqy');

var str = ' this has spaces ';

var actual = util.removeSpaces(str, '+');

test.assertEqual('+this+has+spaces+', actual);
