

xdmp.eval(`
  declareUpdate();

  var sec = require('/MarkLogic/security.xqy');
  var config = require('/test/test-config.xqy');

  sec.createUser(
    'basic-user',
    'a test user with no special privileges',
    'iopasuoawer89@#$',
    config.getGuestRole(),
    null, null, null);

  sec.createUser(
    'privileged-user',
    'a test user with update privileges',
    '#$ew4sek#%',
    config.getEditorRole(),
    null, null, null);`,
  null,
  {
    database: xdmp.database('Security')
  }
);
