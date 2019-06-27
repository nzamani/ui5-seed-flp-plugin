(function () {
	"use strict";

	window["sap-ushell-config"] = {
		bootstrapPlugins : {
			plugin_1: {
				component: "nabi.seed.flpplugin",
				url: "../../../",
				//manifestUrl: "/sap/bc/lrep/content/~20190613234719.022944~/apps/my.manifest.id/app/my/bsp/manifest.appdescr",
				self: {
					name: "nabi.seed.flpplugin",
					url: "../../../",
				},
				asyncHints: {
					libs: [
						{name: "sap.ui.core"}
					],
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: "nabi.seed.flpplugin.Component"
						}
					]
				},
				config: {
					"": ""
				}
			}
		},
		defaultRenderer : "fiori2",
		renderers: {
			fiori2: {
				componentData: {
					config: {
						search: "hidden"
					}
				}
			}
		},
		applications: {
			"SeedApp-display": {
				additionalInformation: "SAPUI5.Component=test.nabi.seed.flpplugin.sampleapp",
				applicationType: "URL",
				url: "../sampleapp/",
				description: "Ping service",
				title: "UI5 Seed FLP Plugin"
			}
		}
	};


})();
