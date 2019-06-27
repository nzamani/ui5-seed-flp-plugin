/*global QUnit */
sap.ui.require([
	"nabi/seed/flpplugin/Component",
	//do not add to parameter list:
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(Component) {
	"use strict";

	QUnit.module("nabi.seed.flpplugin.Component");

	QUnit.test("Should always be successful - dummy QUnit test", function (assert) {
		assert.strictEqual(true, true);
	});
});
