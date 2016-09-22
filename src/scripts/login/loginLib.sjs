

function canUserEdit(user) {
  var roles = xdmp.eval(`
    var sec= require("/MarkLogic/security.xqy");
    var roles = xdmp.getCurrentRoles();
    sec.getRoleNames(roles)`,
    null,
    {
      database: xdmp.database('Security'),
      userId: xdmp.user(user)
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
