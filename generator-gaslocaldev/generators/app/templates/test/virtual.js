/*
	Interfaces with gas-local in order to bring what is normally server-side code
	into the local node.js stack, i.e. "virtualizing" it

	Creates an object virtual that contains all code in source folders
	Also has method .virtual which creates one as well, which is used to pass on
	virtualized code into templating files
*/

'use strict';

let moment = require('moment');  // Moment is just too good not to use
let gas = require('gas-local');
let ejs = require('ejs');
let Document = require('./Document.js');
let Spreadsheet = require('./Spreadsheet.js');

const sourcePath = 'dev';

let hooksForMocks = {

	production: false,

	FormApp: {
		getActiveForm: function () {
			/* return new Form(); */
		},
	},

	DocumentApp: {
		getActiveDocument: function () {
			/* return new Document(); */
		},
	},

	SpreadsheetApp: {
		active: null,

		/*
			Have to hold the same one otherwise we create a new one 
			with every test iteration
		*/
		getActiveSpreadsheet: function () {
			if (this.active == null) {
				this.active = new Spreadsheet();
			}
			return this.active;
		},

		/*
			Have to hold the same one otherwise we create a new one 
			with every test iteration
		*/
		openById: function (id) {
			if (this.active == null) {
				this.active = new Spreadsheet();
			}
			return this.active;
		},
	},

	Moment: moment,

	__proto__: gas.globalMockDefault,

};

hooksForMocks.Moment.load = function () {};  // load is part of GAS ecosystem
var virtual = gas.require('./' + sourcePath, hooksForMocks);

// Passed into include in order to ensure templates have virtual source too
virtual.virtual = function () { 
	return gas.require('./' + sourcePath, hooksForMocks);
};

module.exports = virtual;