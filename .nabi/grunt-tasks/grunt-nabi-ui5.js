"use strict";

/* eslint-env es6,node */
module.exports = function (grunt) {

	const fixAbsoluteDataSourceURIsInManifest = function (oManifest) {
		//oManifest["sap.app"].dataSources.forEach(ds => /^(https?:\/\/)/.test(ds.uri) ? ds.uri = ds.uri.replace(/^(?:\/\/|[^/]+)*\//, "/") : ds.uri )
		let aMessages = [];
		Object.entries(oManifest["sap.app"].dataSources || {}).forEach( ([key, value]) => {
			if ( /^(https?:\/\/)/.test(value.uri) ) {
				let sNew = value.uri.replace(/^(?:\/\/|[^/]+)*\//, "/");
				let sOld = value.uri;
				value.uri = sNew;
				aMessages.push(`Changed ${sOld} to ${sNew}`);
			}
		});
		return aMessages;
	};

	grunt.registerMultiTask("nabiUi5Manifest", "Cleansing the UI5 manifest.json file", function () {
		const fs = require("fs");
		let aMessages;

		if (!this.filesSrc.length) {
			grunt.log.write("No manifest files found in task configuration.");
		} else {
			grunt.log.writeln("Fix absolute DataSource URIs in UI5 manifest.json...");
			this.filesSrc.forEach(sPath => {
				const oManifest = JSON.parse(fs.readFileSync(sPath));
				if (!oManifest) {
					grunt.log.write(`${sPath} could not be loaded `).error();
				}
				aMessages = fixAbsoluteDataSourceURIsInManifest(oManifest);
				if (aMessages.length) {
					fs.writeFileSync(sPath, JSON.stringify(oManifest, null, "\t"), "utf-8");
				} else {
					grunt.log.write(`Skipping ${sPath} because does not have any absolute URIs `).ok();
				}
			});
		}

	});

}