/* eslint-env es6, node */

"use strict";

const { Console } = require("console");
const objectMerge = require("object-merge");
const multiparty = require("multiparty");
const fs = require("fs");
const download = require("download");
const extract = require("extract-zip");

const console = new Console({ stdout: process.stdout, stderr: process.stderr });

module.exports = {

	readJSONSync : sPath => {
		try {
			let sFile = fs.readFileSync(sPath);
			return JSON.parse(sFile);
		} catch (err){
			return null;
		}
	},

	readConfig : function () {
		// derive correct config from ".user.nabi.json" + ".nabi.json" in folders .nabi and root
		const nabiDefaultConfig = fs.existsSync(".nabi/defaults/.nabi.json") ? this.readJSONSync(".nabi/defaults/.nabi.json") : {};
		const nabiProjectConfig = fs.existsSync(".nabi.json") ? this.readJSONSync(".nabi.json") : {};
		const nabiUserConfig = fs.existsSync(".user.nabi.json") ? this.readJSONSync(".user.nabi.json") : {};
		const nabiFinalCfg = objectMerge(nabiDefaultConfig, nabiProjectConfig, nabiUserConfig);
		// read sap deployment config file (only needed for sap nw abap deployment)
		const SAPDEPLOY_FILE_PATH = nabiFinalCfg.sapdeploy.configFile;
		let sapDeployConfig = fs.existsSync(SAPDEPLOY_FILE_PATH) ? this.readJSONSync(SAPDEPLOY_FILE_PATH) : {};

		// loop over systems and set credentials (user/password).
		// read NPL credentials from env for jenkins deployment (will be overridden by credentials file below)
		if (process.env.SAPDEPLOY_CREDENTIALS_USR && process.env.SAPDEPLOY_CREDENTIALS_PSW){
			/*
			Object.keys(sapDeployConfig).forEach(function(key) {
				sapDeployConfig[key].options.auth = {
					user: process.env.SAPDEPLOY_CREDENTIALS_USR,
					pwd: process.env.SAPDEPLOY_CREDENTIALS_PSW
				};
			});
			for (const [key, value] of Object.entries(sapDeployConfig)) {
				value.options.auth = {
					user: process.env.SAPDEPLOY_CREDENTIALS_USR,
					pwd: process.env.SAPDEPLOY_CREDENTIALS_PSW
				};
			}
			*/
			for (const value of Object.values(sapDeployConfig)) {
				value.options.auth = {
					user: process.env.SAPDEPLOY_CREDENTIALS_USR,
					pwd: process.env.SAPDEPLOY_CREDENTIALS_PSW
				};
			}
		}

		// read + merge credentials file for sap nw abap deployment
		const SAPDEPLOYUSER_FILE_PATH = nabiFinalCfg.sapdeploy.credentialsFile;
		const oCredentials = fs.existsSync(SAPDEPLOYUSER_FILE_PATH) ? this.readJSONSync(SAPDEPLOYUSER_FILE_PATH) : {};
		sapDeployConfig = objectMerge(sapDeployConfig, oCredentials);
		return {sapDeploy: sapDeployConfig, nabi: nabiFinalCfg};
	},

	fixAbsoluteDataSourceURIsInManifest : function (oManifest) {
		oManifest["sap.app"].dataSources.forEach(ds => /^(https?:\/\/)/.test(ds.uri) ? ds.uri = ds.uri.replace(/^(?:\/\/|[^/]+)*\//, "/") : ds.uri )
	},

	handleHttpFileUpload : function(bSave, req, res, next) {
		var bError, count, aFiles, form;

		//var path = require("path");
		//var TMP_UPLOAD_PATH = path.join(__dirname, "tmp/uploads");
		//console.log("TMP_UPLOAD_PATH = " + TMP_UPLOAD_PATH);

		bError = false;
		count = 0;
		aFiles = [];

		// see https://github.com/pillarjs/multiparty for API
		form = new multiparty.Form({
			//uploadDir : TMP_UPLOAD_PATH,
			maxFilesSize : 1024 * 1024 * 15 // 15 MB
		});

		if (bSave) {
			// make sure to manually delete the files afterwards from!!!
			// suggestion: DO NOT USE THIS ON PROD because it exposes internal folder structures
			form.parse(req, function(err, fields, files) {
				if (err) {
					res.writeHead(err.status, {"Content-Type": "application/json;charset=utf-8"});
					res.end(JSON.stringify({errorCode: err.code}));
				} else {
					res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
					res.end(JSON.stringify({fields: fields, files: files}));
				}
			});
		} else {
			//files are not saved to local disk :-)
			form.on("error", function(err) {
				console.error("Error parsing form: " + err.stack);
				bError = true;
			});

			form.on("part", function(part) {
				if (!part.filename) {
					// filename is not defined when this is a field and not a file
					//console.log("got field named " + part.name);
					part.resume();
				} else if (part.filename) {
					// filename is defined when this is a file
					count++;
					aFiles.push({
						headers : part.headers,
						fieldName: part.name,
						filename: part.filename,
						//byteOffset: part.byteOffset,
						byteCount: part.byteCount
					});
					// ignore file"s content here
					part.resume();
				}

				part.on("error", function(err) {
					console.error("Error parsing part: " + err.stack);
					bError = true;
				});
			});

			form.on("close", function() {
				console.log("Upload completed!");
				res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
				res.end(
					JSON.stringify({
						success: bError === false,
						uploadedFiles: count,
						files : aFiles
					})
				);
			});
			// finally do the job for us
			form.parse(req);
		}
	},

	/**
	 * Rename JavaScript files, all others stay as they are. Examples:
	 * App.controller.js ==> App-dbg.controller.js
	 * Component.js ==> Component-dbg.js
	 *
	 * @param {string} dest the destination folder
	 * @param {string} src the filename
	 * @returns {string }the new file name for js files
	 */
	fileRename : function(dest, src) {
		let destFilename = "";
		if (src.endsWith(".controller.js")) {
			destFilename = dest + src.replace(/\.controller\.js$/, "-dbg.controller.js");
		} else if (src.endsWith(".js")) {
			destFilename = dest + src.replace(/\.js$/, "-dbg.js");
		} else {
			destFilename = dest + src;
		}
		console.log(src + " ==>" + destFilename + "(dest = " + dest + ", src = " + src + ")");
		return destFilename;
	},

	installSapui5Sdk : function (oConfig){
		return new Promise(function(resolve, reject) {
			if (oConfig.sapui5.required) {
				const sExtractDir = oConfig.sapui5.sdk;
				const { downloadUrl, downloadTo, deleteDownloadOnDone } = oConfig.sapui5.required;
				const sDownloadFileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
				const sAbsoluteDownloadFilePath = downloadTo + "/" + sDownloadFileName;

				if (fs.existsSync(sExtractDir + "sapui5")) {
					console.log("SAPUI5 SDK already installed: " + sExtractDir + "sapui5/");
					resolve();
					return;
				}

				let pDownloaded, pUnzipped;

				// download SAPUI5 SDK
				if ( !fs.existsSync(sAbsoluteDownloadFilePath) ) {
					console.log("Download SAPUI5 SDK: " + downloadUrl + " ==> " + downloadTo);
					console.log("Download may take a while.");
					console.log("Please wait...");
					pDownloaded = download(downloadUrl, downloadTo, {
						headers : {
							Cookie: "eula_3_1_agreed=tools.hana.ondemand.com/developer-license-3_1.txt; path=/;"
						}
					});
					pDownloaded.then(() => {
						console.log("SAPUI5 SDK downloaded: " + sAbsoluteDownloadFilePath);
					}).catch(function(error) {
						reject(error);
					});
				} else {
					console.log("SAPUI5 SDK already downloaded: " + sAbsoluteDownloadFilePath);
				}

				// unzip SAPUI5 SDK
				pUnzipped = new Promise(function(resolve, reject){
					Promise.all([pDownloaded]).then(function(){
						console.log("Unzip " + sAbsoluteDownloadFilePath + " ==> " + sExtractDir + "sapui5/");
						console.log("Please wait...");
						extract(sAbsoluteDownloadFilePath, {dir: sExtractDir + "sapui5/"}, function (err) {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					}).catch(error => reject(error));
				});

				// delete downloaded SAPUI5 SDK
				Promise.all([pDownloaded, pUnzipped]).then(function(){
					if (deleteDownloadOnDone && fs.existsSync(sAbsoluteDownloadFilePath)){
						console.log("Delete file (cleanup): " + sAbsoluteDownloadFilePath);
						try {
							fs.unlinkSync(sAbsoluteDownloadFilePath);
						  } catch (err) {
							console.error(err)
						  }
					}
					resolve();
				}).catch(function(err){
					reject(err)
				});
			}

		});

	},

	getRootDir(){
		const path = require("path");
		const myDir = path.dirname(require.main.filename);
		return path.resolve(myDir + "/../../");
	}

};
