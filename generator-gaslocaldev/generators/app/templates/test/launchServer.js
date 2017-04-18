(function() {
	// Only do this if called directly with "node ..."
	if (require.main === module) {
		let server = require('./server.js');
		server.create();
	}
})();