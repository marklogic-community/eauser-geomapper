

xdmp.eval(`
  declareUpdate();

  var sec = require('/MarkLogic/security.xqy');

  sec.removeUser('basic-user');

  sec.removeUser('privileged-user');`,
  null,
  {
    database: xdmp.database('Security')
  }
);
