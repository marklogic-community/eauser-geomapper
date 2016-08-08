"use strict";
declareUpdate();

var info = cts.doc("/config/systemInfo.json");
var infoDoc = info.toObject();

var doc = {
  "lastUpdated": infoDoc.lastUpdated
}

xdmp.log("called lastUpdate.sjs : " + infoDoc.lastUpdated);

doc;
