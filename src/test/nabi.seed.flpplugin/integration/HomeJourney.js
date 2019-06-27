/*global QUnit*/
sap.ui.define([
	"sap/ui/test/opaQunit",
	"test/nabi/seed/flpplugin/integration/pages/Home"
], function (opaTest) {
		"use strict";

		QUnit.module("Home Page");

		opaTest("Implement OPA tests for your FLP Plugin here - TODO", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			// Actions
			//When.onTheHomePage....

			// Assertions
			//Then.onTheHomePage....;

			// Cleanup
			Then.iTeardownMyApp();
		});

	}
);
