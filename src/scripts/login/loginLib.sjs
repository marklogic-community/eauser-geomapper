

function canUserEdit(user) {
  var roles = xdmp.eval(`
    var sec= require("/MarkLogic/security.xqy");
    sec.getRoleNames(roles)`,
    {
      roles: xdmp.userRoles(user)
    },
    {
      database: xdmp.database('Security')
    }
  )
  var roleArray = roles.toArray();
  var matchEditor = false;
  for (var i in roleArray) {
    if (roleArray[i].toString().match('-editor-role') !== null) {
      matchEditor = true;
    }
  }

  return matchEditor;
}

module.exports = {
  canUserEdit: canUserEdit
};
