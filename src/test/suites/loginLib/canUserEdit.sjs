
var loginLib = require('/scripts/login/loginLib.sjs');
var test = require('/test/test-helper.xqy');

var assertions = [];

var actual = loginLib.canUserEdit('basic-user');
assertions.push(test.assertFalse(actual));

actual = loginLib.canUserEdit('privileged-user');
assertions.push(test.assertTrue(actual));

assertions;
