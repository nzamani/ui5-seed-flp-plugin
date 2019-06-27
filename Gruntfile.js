"use strict";

/* eslint-env es6,node */
module.exports = function (grunt) {

	// Log time how long tasks take
	require("grunt-timer").init(grunt, { deferLogs: true, friendlyTime: true, color: "cyan"});

	const nabiProject = require("./.nabi/lib/nabiProject");

	const CONFIG = nabiProject.readConfig();
	//grunt.log.writeln("\n### nabi config sapdeploy ###\n" + JSON.stringify(CONFIG.sapDeploy, null, 2));
	//grunt.log.writeln("\n### nabi config ###\n" + JSON.stringify(CONFIG, null, 2));

	// read ui5 app descriptor (manifest.json) => this file must exist!!!
	const ui5Descriptor = grunt.file.readJSON("./src/main/webapp/manifest.json");

	// get the app namespace from ui5 app descriptor
	const appNamespaceDot = ui5Descriptor["sap.app"].id;

	//const process = require("process");
	// npm i -D puppeteer
	//process.env.CHROME_BIN = require("puppeteer").executablePath();

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON("package.json"),

		dir: {
			src: "src",
			test: "src/test",
			dist: "dist",
			build: "build",
			jsdoc: "jsdoc",
			buildReportsCoverage: "build/reports/coverage",
			buildBabel: "build/babel",
			nodeModules: "node_modules",
			srcWebapp: "src/main/webapp",
			testWebapp: "src/test/sampleapp",
			distWebapp: "dist/webapp",
			webAppResources : "src/main/resources/webAppResources",
			sapui5RepoUploadResources : "src/main/resources/sap-ui5-repo-upload"
		},

		// i.e. converts "nabi.seed.flpplugin" from ui5 app descriptor to "nabi/seed/flpplugin"
		appNamespaceSlash : appNamespaceDot.replace(new RegExp('\\.', 'g'), "/"),

		nabiUi5Manifest : {
			dist : {
				src: "<%= dir.distWebapp %>/manifest.json"
			}
		},

		karma: {
			options: {
				browsers: ["Chrome"], //or use ChromeHeadless
				basePath: ".",
				files: [
					{ pattern: "src/main/webapp/**", 					included: false, served: true, watched: true },
					//{ pattern: "src/main/webapp/test/unit/**", 			included: false, served: true, watched: true },
					//{ pattern: "src/main/webapp/test/integration/**",	included: false, served: true, watched: true }
					//{ pattern: "src/main/webapp/test/samplecomp/**/*",	included: false, served: true, watched: true }
				],
				proxies : {
					"/base/src/main/webapp/thirdparty/" : "http://localhost:8080/thirdparty/",
					//these two are needed for OPA + StartMyAppInFrame
					"/resources/" : "http://localhost:8080/resources/",
					"/sapui5/resources/" : "http://localhost:8080/sapui5/resources/"
				},
				frameworks: ["qunit", "openui5"],
				openui5: {
					path: !CONFIG.nabi.sapui5.required ? "http://localhost:8080/resources/sap-ui-core.js" : "http://localhost:8080/sapui5/resources/sap-ui-core.js",
					useMockServer: false
				},
				//clearContext: true,
				//useIframe: false,
				//captureConsole: true,
				//captureTimeout: 210000,
				//browserDisconnectTolerance: 3,
				//browserDisconnectTimeout : 40000,
				//browserNoActivityTimeout : 210000,
				client: {
					openui5: {
						config: {
							theme: "sap_belize",
							//libs: "nabi.m",
							//bindingSyntax: "complex",
							compatVersion: "edge",
							animation: "false",
							//frameOptions: "deny",	// this would make the QUnit results in browser "not clickable" etc.
							preload: "async",
							resourceRoots: {
								"nabi.seed.flpplugin": "./base/src/main/webapp",
								"test.nabi.seed.flpplugin": "http://localhost:8080/test-resources/nabi.seed.flpplugin/"
								//DEPENDENCIES, i.e.
								//"my.required.comp": "http://localhost:8080/test-resources/my.required.comp/src/main/webapp",
								// NEVER DO THIS because it would lead to "non-instrumentalized" sources (i.e. coverage not detected):
								//"nabi.seed.flpplugin": "http://localhost:8080/..."
							}
						},
						tests: [
							"test/nabi/seed/flpplugin/unit/allTests",
							"test/nabi/seed/flpplugin/integration/AllJourneys"		// remove this in case it takes too long, i.e. tdd/dev time
						]
					}
				},
				reporters: ["progress"],
				port: 9876,
				logLevel: "INFO",
				browserConsoleLogOptions: {
					level: "info" // "warn"
				}
			},
			ci: {
				singleRun: true,
				browsers: ["ChromeHeadless"],
				preprocessors: {
					// src files for which we want to get coverage.
					// Exclude thirdparty libs, irrelevant folders (i.e. themes, test), and maybe also library.js and UI5 Renderers (your decision).
					"{src/main/webapp,src/main/webapp/!(thirdparty|themes|test)}/!(library|*Renderer)*.js": ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					dir: "<%= dir.buildReportsCoverage %>",
					reporters: [
						{ type: "html", subdir: "report-html"},
						{ type: "cobertura", subdir: "." },	//jenkins
						{ type: "text"}
					],
					check: {
						each: {
							statements: 30,
							branches: 30,
							functions: 30,
							lines: 30
						}
					}
				},
				reporters: ["progress", "coverage"]
			},
			watch: {
				client: {
					clearContext: false,
					qunit: {
						showUI: true
					}
				}
			},
			coverage: {		//same as ci, but  without the checks
				singleRun: true,
				//captureTimeout: 210000,
				//browserDisconnectTolerance: 3,
				//browserDisconnectTimeout : 210000,
				//browserNoActivityTimeout : 210000,
				browsers: ["ChromeHeadless"],
				/*
				browsers: ["MyChromeHeadless"],
				customLaunchers: {
					MyChromeHeadless: {
						base: "ChromeHeadless",
						flags: [
							"--no-sandbox",
							"--disable-web-security",
							"--no-default-browser-check",
							"--disable-translate",
							"--disable-background-timer-throttling",
							//"--disable-device-discovery-notifications",
							//"--disable-renderer-backgrounding",
							//"--remote-debugging-port=1234",
							//"--enable-logging",
							//"--disable-popup-blocking",
							//"--disable-gpu",
							//"--no-first-run",
						]
					}
				},*/
				preprocessors: {
					// src files for which we want to get coverage.
					// Exclude thirdparty libs, irrelevant folders (i.e. themes, test), and maybe also library.js and UI5 Renderers (your decision).
					"{src/main/webapp,src/main/webapp/!(thirdparty|themes|test)}/!(library|*Renderer)*.js": ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					dir: "<%= dir.buildReportsCoverage %>",
					reporters: [
						{ type: "html", subdir: "report-html"},
						{ type: "cobertura", subdir: "." },	//jenkins
						{ type: "text"}
					],
				},
				reporters: ["progress", "coverage"]
			}
		},

		babel : {
			options : {
				// see .babelrc
			},
			dist : {
				files : [{
					expand: true,
					cwd: "<%= dir.distWebapp %>",
					src: [
						"**/*.js",
						"!themes/**",
						"!thirdparty/**",
						"!**/*-dbg.js",
						"!**/*-dbg.controller.js"
					],
					dest: "<%= dir.distWebapp %>/"		//trailing slash is important
				}]
			},
			srcToBuildBabel : {
				files : [{
					expand: true,
					cwd: "<%= dir.srcWebapp %>",
					src: [
						"**/*.js",
						"!themes/**",
						"!thirdparty/**"
					],
					dest: "<%= dir.buildBabel %>/"		//trailing slash is important
				}]
			}
		},

		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			serveSrcBabel: {
				tasks: ["watch:babel", "serve:srcWithBabel"]
			},
			serveSrcEdge : {
				tasks: ["watch:babel", "serve:srcWithBabel", "karma:watch"]
			}
		},

		watch: {
			babel: {
				//cwd: "<%= dir.srcWebapp %>",	//this seems not to work with the next LoC as expected
				//files: ["**/*.js", "!themes/**", "!thirdparty/**"],
				files: ["<%= dir.srcWebapp %>/**/*.js", "!<%= dir.srcWebapp %>/themes/**", "!<%= dir.srcWebapp %>/thirdparty/**"],
				tasks: ["clean:buildBabel", "babel:srcToBuildBabel"],
				options: {
					interrupt: true
				}
			}
		},

		connect: {
			options: {
				port: 8080,
				hostname: "*",
				middleware: function(connect, options, middlewares) {
                    middlewares.unshift(
                        // mock ping service: always return "HTTP 200 Ok"
                        connect().use("/sap/public/ping", function(req, res, next) {
                            res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                            res.end("Server reached. (Mocked response from localhost)");
                            return undefined;
                        })
                    );
                    return middlewares;
                }
			},
			src: {},
			srcWithBabel: {},
			dist: {}
		},

		//openui5: { },

		openui5_connect: {
			options: {
				cors: {
					origin: "http://localhost:<%= karma.options.port %>"
				},
				resources: CONFIG.nabi.app.resources,
				testresources : [
					"<%= dir.test %>",
					"<%= dir.webAppResources %>",
					CONFIG.nabi.app.testresources.symlinkParent
				].concat( CONFIG.nabi.app.testresources.dirs )	//append non-symlink items
			},
			src: {
				options: {
					appresources: [
						"<%= dir.srcWebapp %>",
						"<%= dir.webAppResources %>",
						CONFIG.nabi.app.appresources.symlinkParent,
						CONFIG.nabi.sapui5.sdk
					].concat( CONFIG.nabi.app.appresources.dirs )	//append non-symlink items
				}
			},
			srcWithBabel: {
				options: {
					appresources: [
						// the order of these two is important because contents from buildBabel shall be preferred over src
						"<%= dir.buildBabel %>",
						"<%= dir.srcWebapp %>",
						"<%= dir.webAppResources %>",
						CONFIG.nabi.app.appresources.symlinkParent,
						CONFIG.nabi.sapui5.sdk
					].concat( CONFIG.nabi.app.appresources.dirs )	//append non-symlink items
				}
			},
			dist: {
				options: {
					appresources: [
						"<%= dir.distWebapp %>",
						"<%= dir.webAppResources %>",
						//CONFIG.nabi.app.appresources.symlinkParent,
						CONFIG.nabi.sapui5.sdk
					]//.concat( CONFIG.nabi.app.appresources.dirs )	//append non-symlink items
				}
			}
		},

		openui5_preload: {
			dist: {
				options: {
					resources: {
						cwd: "<%= dir.distWebapp %>",
						prefix: "<%= appNamespaceSlash %>",
						src : [
							"**/*.js",
							"**/*.fragment.html",
							"**/*.fragment.json",
							"**/*.fragment.xml",
							"**/*.view.html",
							"**/*.view.json",
							"**/*.view.xml",
							"**/*.properties",
							"**/manifest.json",
							"!**/*-dbg.js",
							"!**/*-dbg.controller.js",
							"!thirdparty/**",
							"!lib/**",
							"!test/**",
							"!themes/**",
							"!localService/**",
						]
					},
					compress: true,
					dest: "<%= dir.distWebapp %>"
				},
				components: true
			},
			distdev: {
				options: {
					resources: {
						cwd: "<%= dir.srcWebapp %>",
						prefix: "<%= appNamespaceSlash %>",
						src : [
							"**/*.js",
							"**/*.fragment.html",
							"**/*.fragment.json",
							"**/*.fragment.xml",
							"**/*.view.html",
							"**/*.view.json",
							"**/*.view.xml",
							"**/*.properties",
							"**/manifest.json",
							"!**/*-dbg.js",
							"!**/*-dbg.controller.js",
							"!thirdparty/**",
							"!lib/**"
						]
					},
					compress: true,
					dest: "<%= dir.distWebapp %>"
				},
				components: true
			}
		},

		clean : {
			dist: ["<%= dir.dist %>/"],
			build: ["<%= dir.build %>/"],
			buildBabel: ["<%= dir.buildBabel %>/"],
			coverage: "<%= dir.buildReportsCoverage %>",
			jsdoc: ["<%= dir.jsdoc %>"]
		},

		copy: {
			appResourcesToDist: { //from .nabi.json / .user.nabi.json
				files: CONFIG.nabi.app.appresources.symlinks.reduce((a,v) => {
					var sTarget = v.name;
					if (v.target){
						sTarget = `${v.target}/${sTarget}`;
					}
					a.push({
						expand: true,
						src: ["**"],
						cwd: `${v.path}`,
						dest: "<%= dir.distWebapp %>/" + sTarget + "/",
					});
					return a;

				}, [] ).concat( CONFIG.nabi.app.appresources.dirs.map(v => {
					return {
						expand: true,
						src: ["**"],
						cwd: `${v}`,
						dest: "<%= dir.distWebapp %>/"
					};
				}) )
			},

			srcToDist: {
				files: [
					{	// first all resources (incl. lib and thirdparty) except content that shall never be deployed
						expand: true,
						src: [ "**", "!themes/**", "!test/**", "!localService/**", "!test.html", "!index.html" ],
						cwd: "<%= dir.srcWebapp %>",
						dest: "<%= dir.distWebapp %>/",
					}, {
						// can be helpful for nw abap upload
						expand: true,
						src: [".Ui5RepositoryBinaryFiles", ".Ui5RepositoryIgnore", ".Ui5RepositoryTextFiles", ".Ui5RepositoryUploadParameters"],
						cwd: "<%= dir.sapui5RepoUploadResources %>",
						dest: "./<%= dir.distWebapp %>/"
					}
				]
			},
			srcToDistDbg : {
				files : [
					{	// rename ui5 js files to *-dbg.js / *-dbg.controller.js
						expand: true,
						src: ["**/*.js", "!themes/**", "!thirdparty/**", "!lib/**", "!localService/**", "!test/**"],
						cwd: "<%= dir.srcWebapp %>",
						dest: "<%= dir.distWebapp %>/",
						rename: nabiProject.fileRename
					}
				]
			},
			distToDistDbg : {
				files : [
					{	// rename ui5 js files to *-dbg.js / *-dbg.controller.js
						expand: true,
						cwd: "<%= dir.distWebapp %>/",
						src: ["**/*.js", "!themes/**", "!thirdparty/**", "!lib/**", "!test/**"],
						dest: "<%= dir.distWebapp %>/",
						rename: nabiProject.fileRename
					}
				]
			}

		},

		jsdoc : {
			dist : {
				src : [
					"<%= dir.srcWebapp %>/**/*.js", "README.md",
					"!<%= dir.srcWebapp %>/themes/**", "!<%= dir.srcWebapp %>/lib/**",
					"!<%= dir.srcWebapp %>/thirdparty/**", "!<%= dir.srcWebapp %>/test/**"
				],
				options : {
					destination : "<%= dir.jsdoc %>",
					template : "node_modules/ink-docstrap/template",
					configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
				}
			}
		},

		eslint: {
			options : {										// see http://eslint.org/docs/developer-guide/nodejs-api#cliengine
				useEslintrc: true, 							// default ==> use .eslintrc file, rulse: http://eslint.org/docs/rules/
				ignore : true,								// default ==> use .eslintignore file
				quiet : true								// only report errors
				//outputFile : "log/eslint.log"				// save result to file
				//format: require("eslint-tap")
			},
			//cwd: "<%= dir.srcWebapp %>",
			src: ["<%= dir.srcWebapp %>/**/*.js", "!<%= dir.srcWebapp %>/lib/**", "!<%= dir.srcWebapp %>/thirdparty/**"],
			test: ["<%= dir.test %>"],
			gruntfile: ["Gruntfile.js"]
		},

		compress: {
			dist : {
				options: {
					archive: "<%= dir.dist %>/webapp.zip"
				},
				expand: true,
				cwd: "<%= dir.distWebapp %>/",
				src: ["**/*"],
				dot : true,
				dest: "/"
			}
		},

		nwabap_ui5uploader: CONFIG.sapDeploy

	});	//END grunt.initConfig

	//grunt.log.writeln("\n### grunt.config() ###\n" + JSON.stringify(grunt.config(), null, "\t"));

	// plugins
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-openui5");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-concurrent");
	grunt.loadNpmTasks("grunt-karma");
	grunt.loadNpmTasks("grunt-nwabap-ui5uploader");
	grunt.task.loadTasks(".nabi/grunt-tasks");

	// Server task
	grunt.registerTask("serve", function(target) {
		grunt.task.run("openui5_connect:" + (target || "src") + ":keepalive");
	});
	grunt.registerTask("serve:tdd", ["clean:coverage", "openui5_connect:src", "karma:watch"]);
	grunt.registerTask("serve:babel", ["clean:buildBabel", "babel:srcToBuildBabel", "concurrent:serveSrcBabel"]);
	grunt.registerTask("serve:edge", ["clean:coverage", "clean:buildBabel", "babel:srcToBuildBabel", "concurrent:serveSrcEdge"]);
	grunt.registerTask("serve:srcBabel", ["clean:buildBabel", "babel:srcToBuildBabel", "serve:srcWithBabel"]);
	grunt.registerTask("serve:distBabel", ["build:babel","serve:dist"]);

	// Default: linting + run directly without build
	grunt.registerTask("default", ["eslint:src", "serve:src"]);

	// Test tasks
	grunt.registerTask("test", ["clean:coverage", "openui5_connect:src", "karma:coverage"]);
	grunt.registerTask("test:ci",["clean:coverage", "openui5_connect:src", "karma:ci"]);

	// Linting tasks
	grunt.registerTask("lint", ["eslint"]);

	// Build tasks - create distribution ready for abap upload (includes webapp.zip, no index.html...)
	grunt.registerTask("build", ["clean:dist" , "copy:srcToDist", "nabiUi5Manifest:dist", "copy:srcToDistDbg", "openui5_preload:dist", "copy:appResourcesToDist", "compress:dist"]);
	grunt.registerTask("build:babel", ["clean:dist", "copy:srcToDist", "nabiUi5Manifest:dist", "babel:dist", "copy:distToDistDbg", "openui5_preload:dist", "copy:appResourcesToDist", "compress:dist"]);

	// SAP deployments
	grunt.registerTask("sapdeploy", ["lint", "build", "nwabap_ui5uploader"]);
	grunt.registerTask("sapdeploy:babel", ["lint", "build:babel", "nwabap_ui5uploader"]);

	// Disabled because usually not needed - also, need to check if this still works after years of change...
	// build a distribution for dev purposes (includes index.html)
	//grunt.registerTask("build-dev", ["clean:dist", "eslint:src", "openui5_preload:distdev", "copy:distdev", "copy:appResourcesToDist"]);

};