sap.ui.define([
	"sap/ui/test/Opa5",
	"test/nabi/seed/flpplugin/integration/arrangements/Arrangement",
	"test/nabi/seed/flpplugin/integration/HomeJourney"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "test.nabi.seed.flpplugin.sampleapp.view",	// every waitFor will append this namespace in front of your viewName
		autoWait: true
	});
});
