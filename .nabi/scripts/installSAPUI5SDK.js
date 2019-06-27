/* eslint-env es6,node */
"use strict";

const nabiProject = require("../lib/nabiProject");
const { Console } = require("console");
const console = new Console({ stdout: process.stdout, stderr: process.stderr });

const CONFIG = nabiProject.readConfig();

nabiProject.installSapui5Sdk(CONFIG.nabi).catch((error) => {
	console.error("Installing SAPUI5 Failed: ", error.message);
	process.exit(1);
})