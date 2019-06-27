/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"test/nabi/seed/flpplugin/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});