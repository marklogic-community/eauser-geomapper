

xdmp.eval(`
  declareUpdate();

  var sec = require('/MarkLogic/security.xqy');

  sec.createUser(
    'basic-user',
    'a test user with no special privileges',
    'iopasuoawer89@#$',
    'eauser-geomapper-role',
    null, null, null);

  sec.createUser(
    'privileged-user',
    'a test user with update privileges',
    '#$ew4sek#%',
    'eauser-geomapper-editor-role',
    null, null, null);`,
  null,
  {
    database: xdmp.database('Security')
  }
);
