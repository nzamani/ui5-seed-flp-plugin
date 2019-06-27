/* eslint-env es6,node */
"use strict";

const fs = require("fs-extra");
const nabiProject = require("../lib/nabiProject");
const { Console } = require("console");
const console = new Console({ stdout: process.stdout, stderr: process.stderr });

const rootDir = nabiProject.getRootDir();
const CONFIG = nabiProject.readConfig();

//const NABI_TEST_RESOURCES = CONFIG.nabi.app.testresources.symlinkParent;
//const NABI_TEST_RESOURCES_PATH = rootDir + "/" + NABI_TEST_RESOURCES;
const NABI_TEST_RESOURCES_PATH = `${rootDir}/${CONFIG.nabi.app.testresources.symlinkParent}`;
//const NABI_APP_RESOURCES = CONFIG.nabi.app.appresources.symlinkParent;
//const NABI_APP_RESOURCES_PATH = rootDir + "/" + NABI_APP_RESOURCES;
const NABI_APP_RESOURCES_PATH = `${rootDir}/${CONFIG.nabi.app.appresources.symlinkParent}`;

// 1. create folders that will contain UI5 dependencies

//testresources
if (fs.existsSync(NABI_TEST_RESOURCES_PATH)){
	console.log("Delete folder: " + NABI_TEST_RESOURCES_PATH);
	try {
		fs.removeSync(NABI_TEST_RESOURCES_PATH);
	  } catch (e) {
		throw e;
	  }
}
console.log("Create Dir: " + NABI_TEST_RESOURCES_PATH);
fs.mkdirSync(NABI_TEST_RESOURCES_PATH);

//appresources
if (fs.existsSync(NABI_APP_RESOURCES_PATH)){
	console.log("Delete folder: " + NABI_APP_RESOURCES_PATH);
	try {
		fs.removeSync(NABI_APP_RESOURCES_PATH);
	  } catch (e) {
		throw e;
	  }
}
console.log("Create Dir: " + NABI_APP_RESOURCES_PATH);
fs.mkdirSync(NABI_APP_RESOURCES_PATH);

// 2. now we want to use symlinks/shortcuts for the relevant dependencies
// first the testresources
CONFIG.nabi.app.testresources.symlinks.forEach( elem => {
	//let dirPath = `${NABI_TEST_RESOURCES_PATH}/${elem.name}`;

	let dirPath;
	if (elem.target){
		let sTargetDir = `${NABI_TEST_RESOURCES_PATH}/${elem.target}`;
		if (!fs.existsSync(sTargetDir)){
			console.log("Create Dir: " + sTargetDir);
			fs.mkdirSync(sTargetDir, { recursive: true });
		}
		dirPath = `${sTargetDir}/${elem.name}`;

	} else {
		dirPath = `${NABI_TEST_RESOURCES_PATH}/${elem.name}`;
	}

	try {
		console.log(`Symlink: ${dirPath} ==> ${rootDir}/${elem.path}`);
		fs.symlinkSync(`${rootDir}/${elem.path}`, dirPath, "junction");

	} catch (e){
		throw e;
	}
});

// now the resources (will be bundled with the app during build)
CONFIG.nabi.app.appresources.symlinks.forEach(elem => {
	//let dirPath = elem.target ? `${NABI_APP_RESOURCES_PATH}/${elem.target}/${elem.name}` : `${NABI_APP_RESOURCES_PATH}/${elem.name}`;

	let dirPath;
	if (elem.target){
		let sTargetDir = `${NABI_APP_RESOURCES_PATH}/${elem.target}`;
		if (!fs.existsSync(sTargetDir)){
			console.log("Create Dir: " + sTargetDir);
			fs.mkdirSync(sTargetDir, { recursive: true });
		}
		dirPath = `${sTargetDir}/${elem.name}`;

	} else {
		dirPath = `${NABI_APP_RESOURCES_PATH}/${elem.name}`;
	}

	try {
		console.log(`Symlink: ${dirPath} ==> ${rootDir}/${elem.path}`);
		fs.symlinkSync(`${rootDir}/${elem.path}`, dirPath, "junction");
	} catch (e){
		throw e;
	}
});
