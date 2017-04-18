#!/usr/bin/env node

let connect = require('connect');
let http = require('http');
let fs = require('fs-extra');
let ejs = require('ejs');
let path = require('path');
let virtual = require('./virtual.js');
const sourcePath = 'dev';

moduleObject = { 

	create: function () {
		let server = connect();

		/* 
			Connect middleware:
			1) Converts .html to .ejs (via symlinking) upon request
			and deletes the symlinks
			2) Converts the templating from google templating to ejs templating
			in particular includes
		*/
		server.use(function(req, res, next) {
			if (req.url === '/') {
				console.log("Blank path sent in, enter a view");
				next();
			} else {
				// make every .html file an .ejs file (via symlink)
				var localPath = __dirname.split(path.sep);
				localPath.pop();

				localPath = localPath.join(path.sep) + '/dev/';
				fs.readdirSync(localPath, function (err, files) {
					console.log(err);
				}).forEach(function (source) {
					if (source.endsWith('.html')) {
						var target = source.replace(/\.html$/, '.ejs');
						try {
							fs.symlinkSync(localPath+source, localPath+target);
						} catch(err) {
							console.log('File symlink already present', err.dest);
						}
					}
				});

				// Convert the includes

				var basename = req.url + '.html',
					filePath = path.join(sourcePath, basename),
					params = virtual;
					options = {delimiter: "?", filename: filePath};

				// Read in file contents directly, so we can manipulate it
				var data = fs.readFileSync(filePath, 'utf-8');
				//

				// Convert google template for not escaping
				// into compatible form for ejs
				var result = data.replace(/<\?!=/g, '<?-');
				//

				// Take the commented-out include and convert it
				// It's commented out so it doesn't run on production, but does on local
				// TODO: Incorporate whitespace into the regexp
				result = result.replace(/<\?\/\*include\((.*)\);\*\/\?\>/g, '<?- include($1); ?>');
				//	

				// Render the modified result
				var html = ejs.render(result, params, options);
				//

				// Got the html, now send on the modified response to the browser
				res.end(html);

				// Delete the symlinks

				fs.readdirSync(localPath, function (err, files) {
					console.log(err);
				}).forEach(function (file) {
					if (file.endsWith('.ejs')) {
						fs.unlinkSync(localPath+file);
					}
				});

			}
		});

		// launch the server so we can use localhost and play around with it on our browser
		http.createServer(server).listen(8888);
	},
};

module.exports = moduleObject;