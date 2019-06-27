sap.ui.define([
	"sap/ui/core/Component",
	//"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
], function (Component, /*UIComponent,*/ jQuery, Log) {
	"use strict";

	var iMillis = 3000;   //ping every 3 seconds

	return Component.extend("nabi.seed.flpplugin.Component", {

		/* actually we don't even need a manifest */
		metadata: {
			manifest: "json"
		},

		init: function () {
			var oLogger = Log.getLogger("nabi.seed.flpplugin.Component");
			this._tid = setInterval(function (){
				jQuery.get("/sap/public/ping?sap-client=001")
					.done(function() {
						oLogger.debug("Ping Success");
					}).fail(function() {
						oLogger.error("Ping Failed");
					});
			}, iMillis);
		},

		/**
		 * Clear the interval if the component is destroyed by the UI5 runtime.
		 * @public
		 * @override
		 */
		destroy : function () {
			Component.prototype.destroy.apply(this, arguments);
			clearInterval(this._tid);
		}

	});

});