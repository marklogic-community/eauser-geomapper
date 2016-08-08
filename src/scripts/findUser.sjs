// POST request body -> {username: <username>}

var sr = require('/MarkLogic/jsearch.sjs');

var rawInput = xdmp.getRequestBody();

var input = rawInput.toObject();

try {

  var output = sr.documents()
    .where(cts.elementWordQuery("username",input.username))
    .result();

  var doc = output.results[0].document;
  xdmp.log("found document for " + input.username);

}
catch (err) {
  xdmp.log(err);
}

doc;