"use strict";
declareUpdate();

var info = cts.doc("/config/systemInfo.json");
var infoDoc = info.toObject();

var totalCount = infoDoc.numDocuments;

var doc = {
  "text": totalCount + " out of " + totalCount,
  "totalCount": totalCount
}

xdmp.log("called getTotalCount.sjs : " + infoDoc.numDocuments);

doc;
