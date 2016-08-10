"use strict";
declareUpdate();

var info = cts.doc("/config/systemInfo.json");
var infoDoc = info.toObject();

var date = fn.formatDateTime(infoDoc.lastUpdated, "[M01]/[D01]/[Y0001] [H01]:[m01]:[s01] ");

date += fn.timezoneFromDateTime(infoDoc.lastUpdated);

var doc = {
  "lastUpdated": date
}

xdmp.log("called lastUpdate.sjs : " + infoDoc.lastUpdated);

doc;
