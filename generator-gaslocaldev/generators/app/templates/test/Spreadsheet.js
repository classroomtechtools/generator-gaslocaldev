function transpose(a) {
	if (a.length == 0) {
		return [];
	}
    return Object.keys(a[0]).map(
        function (c) { return a.map(function (r) { return r[c]; }); }
    );
}

let defaultMdArr = [];

function Range(raw, sheet) {
	this.raw = raw || defaultMdArr;
	this.sheet = sheet;
	return {
		raw: this.raw,

		/* 
			Converts internal implementation to identical with google sheets
		*/
		getValues: function () {
			return transpose(this.raw);
		}.bind(this),

		getSheet: function () {
			return this.sheet;
		}.bind(this),

		getColumn: function () {
			return 1;
		},

		getRow: function () {
			return 1;
		},

		getLastRow: function () {
			return this.raw.length+1;
		},

		getLastColumn: function () {
			return this.raw.slice(-1).length+1;
		},

	};
}

function Sheet(title, mdarr) {
	this.title = title;
	this.mdarr = mdarr || [];  // multi-dimentional array

	return {
		title: this.title,
		mdarr: this.mdarr,

		makeRange: function(raw) {
			return Range(raw, this);
		}.bind(this),

		/**
		 * Return values in mdarr based on indexes
		 *
		 * @param {String}    mdarr    The multi-dimensional array
		 *
		 * @return {Array}    Copy of sub-section of mdarray
		 * @param {Array}    indexes    Specifies from where and to where to slice
		 *
		 * @throws                     Error if invalid parameters
		 */
		mdArrIndexesToValues: function (mdarr, indexes) {
			var verbose = false;

			if (indexes.length === 1)
				// only elements specifies one element in multi dimensional array
				return [mdarr.slice(indexes[0][0], indexes[0][0]+1)[0].slice(indexes[0][1], indexes[0][1]+1)];

			else if (indexes.length === 2) {
				verbose && console.log('mdarr', mdarr);
				verbose && console.log('indexes', indexes);

				if (indexes[1][1] < indexes[0][1])
					throw Error("Illegal parameters");
				if (indexes[1][0] < indexes[0][0])
					throw Error("Error parameters");
				if (indexes[1][1] > mdarr[0].length) {
					// Google defines overflow as being okay
					verbose && console.log('Adjust!');
					indexes[1][1] = mdarr[0].length;
					verbose && console.log(indexes);
				}
				if (indexes[0][0] < 0 || indexes[0][1] < 0)
					throw Error("Invalid parameters")

				var result = [];
				for (var i = indexes[0][0]; i <= indexes[1][0]; i++) {
					verbose && console.log('i', i);
					if (i < mdarr.length) {
						var save = mdarr.slice(i)[0].slice(indexes[0][1], indexes[1][1]+1);  // , indexes[0][1]);  // [0].slice(indexes[0][1], indexes[1][1]+1);
						verbose && console.log(save);
						result.push(save);
					}
				}
				return result;
			} else {
				throw Error("Indexes can only have at most two elements");
			}
		},

		getRange: function(first, second, third, fourth) {
			var verbose = false; 
			verbose && console.log('getRange args: ', arguments);

			if (arguments.length == 4)
				return this.getRangeByFourNumbers(first, second, third, fourth);
			if (arguments.length == 3)
				return this.getRangeByThreeNumbers(first, second, third);
			if (arguments.length == 2)
				return this.getRangeByTwoNumbers(first, second);

			var a1Notation = first;
			var split = a1Notation.split(':');
			var stepArray = split.length == 1 ? [0] : [0, 1];
			var indexes = split.length == 1 ? [ [] ] : [ [], [] ];
			stepArray.forEach(function (i) {
				var str = split[i];
				if (!str)
					str = 'A1';
				var columnLabel = str.match(/[A-Z]+/);
				if (columnLabel==undefined)
					columnLabel = ['A'];
				var columnLabel = columnLabel[0];
				var columnIndex = this.colA1ToIndex(columnLabel);
				indexes[i].push(columnIndex);
				var rowLabel = str.match(/[0-9]+/);
				if (rowLabel == null)
					rowLabel = [Number.MAX_SAFE_INTEGER];  // Arrays with values > length will end up filling out
				var rowLabel = rowLabel[0];
				indexes[i].push(parseInt(rowLabel) - 1);
			}.bind(this));

			var result = this.mdArrIndexesToValues(this.mdarr, indexes)
			return Range(result, this);
		},

		getRangeByTwoNumbers: function(row, column) {
			return Range(this.mdArrIndexesToValues(this.mdarr, [ [column-1, row-1], [column-1, row-1] ]), this);	
		},

		getRangeByThreeNumbers: function(row, column, numRows) {
			return Range(this.mdArrIndexesToValues(this.mdarr, [ [column-1, row-1], [column-1, row-1+numRows] ]), this);
		},

		getRangeByFourNumbers: function(row, column, numRows, numColumns) {
			return Range(this.mdArrIndexesToValues(this.mdarr, [ [column-1, row-1], [column-1+numColumns, row-1+numRows] ]), this);
		},

		clear: function() {
			this.mdarr = defaultMdArr;

		},

		getFrozenRows: function () { return 2 },

		/**
		 * Return a 0-based array index corresponding to a spreadsheet column
		 * label, as in A1 notation.
		 *
		 * @param {String}    colA1    Column label to be converted.
		 *
		 * @return {Number}            0-based array index.
		 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
		 *
		 * @throws                     Error if invalid parameter
		 */
		colA1ToIndex: function( colA1, index ) {
			if (typeof colA1 !== 'string' || colA1.length > 2) 
			throw new Error( "Expected column label." );
			// Ensure index is (default) 0 or 1, no other values accepted.
			  index = index || 0;
			  index = (index == 0) ? 0 : 1;
			var A = "A".charCodeAt(0);
			var number = colA1.charCodeAt(colA1.length-1) - A;
			if (colA1.length == 2) {
			    number += 26 * (colA1.charCodeAt(0) - A + 1);
			  }
			return number + index;
		},

		/**
		 * Return a 0-based array index corresponding to a spreadsheet row
		 * number, as in A1 notation. Almost pointless, really, but maintains
		 * symmetry with colA1ToIndex().
		 *
		 * @param {Number}    rowA1    Row number to be converted.
		 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
		 *
		 * @return {Number}            0-based array index.
		 */
		rowA1ToIndex: function( rowA1, index ) {
			// Ensure index is (default) 0 or 1, no other values accepted.
			  index = index || 0;
			  index = (index == 0) ? 0 : 1;
			return rowA1 - 1 + index;
		},

		getLastColumn: function () {
			return this.mdarr.length + 1;
		},

		getLastRow: function () {
			var maxLength = 0;
			this.mdarr.forEach(function (column) {
				if (column.length + 1 > maxLength) {
					maxLength = column.length + 1;
				}
			});
			return maxLength;
		},

		appendRow: function (row) {
			var temp = transpose(this.mdarr);
			temp.push(row);
			this.mdarr = transpose(temp);
		},

		getDataRange: function () {
			let maxRows = this.getLastRow(),
				maxCols = this.getLastColumn();
			return Range(this.mdarr, this);
		},
	}
}

function Spreadsheet(sheets) {
	this.sheets = sheets || [Sheet('Test')];

	return {
		sheets: this.sheets,

		getBody: function () {
			return this.documentBody;
		}.bind(this),

		getRange: function (a1Notation) {
			var split = a1Notation.split('!');
			var sheetName = split[0];
			return this.getSheetByTitle(sheetName).getRange(split[1]);
		},

		getSheetByName: function(title) {
			for (var i = 0; i < this.sheets.length; i++) {
				var sheet = this.sheets[i];
				if (sheet.title === title) {
					return sheet;
				}
			}
			// Could not find, so make one
			this.sheets.push(new Sheet(title));
			return this.sheets[-1];
		}
	}
}

/*
	Convenience to constructors
*/
Spreadsheet.makeSheet = function(title, mdarr) {
	return Sheet(title, mdarr);
};
Spreadsheet.makeRange = function(raw, sheet) {
	return Range(raw, sheet);
};

module.exports = Spreadsheet;
