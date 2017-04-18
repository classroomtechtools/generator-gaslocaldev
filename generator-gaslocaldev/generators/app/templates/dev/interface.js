/*
    Functions that interface between the client-side frontend and the google backend
    On local run these are not directly called, but mimicked with placeholder behaviour
    On production is called by google.run.script on the client-side browser
*/

'use strict';

/*
    Called when user clicks on Start button
    Updates the document to have a horizontal rule and command text
*/
function load() {
  return app.load();
}

function doGet() {
  return app.doGet();
}

function saveButton(tab, title, link) {
	app.saveButton(tab, title, link)
}
