/*
	Code that gets executed by triggers
*/

'use strict';

function onOpen(event) {
	if (event.authMode == ScriptApp.AuthMode.NONE) {
		return;
	}
    var ui = <%= kind.service %>.getUi();
    app.onOpen(ui);
}

function onInstall(event) {
	app.createMenus();
}