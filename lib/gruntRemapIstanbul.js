'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* jshint node: true */
/* global Promise */

var loadCoverage = require('./loadCoverage');
var remap = require('./remap');
var writeReport = require('./writeReport');
var MemoryStore = require('istanbul/lib/store/memory');

module.exports = function (grunt) {
	grunt.registerMultiTask('remapIstanbul', function () {
		var done = this.async();
		var options = this.options();
		var sources = new MemoryStore();
		var p = [];

		function warn(message) {
			if (options.fail) {
				grunt.fail.warn(message);
			} else {
				grunt.log.error(message);
			}
		}

		this.files.forEach(function (file) {
			var coverage = remap(loadCoverage(file.src, {
				readJSON: grunt.readJSON,
				warn: warn
			}), {
				readFile: grunt.readFile,
				readJSON: grunt.readJSON,
				warn: warn,
				sources: sources,
				basePath: file.basePath,
				useAbsolutePaths: options.useAbsolutePaths,
				exclude: options.exclude
			});

			if (!(0, _keys2.default)(sources.map).length) {
				sources = undefined;
			}

			if (file.type && file.dest) {
				p.push(writeReport(coverage, file.type, {}, file.dest, sources));
			} else {
				p = p.concat((0, _keys2.default)(options.reports).map(function (key) {
					return writeReport(coverage, key, options.reportOpts || {}, options.reports[key], sources);
				}));
			}
		});

		_promise2.default.all(p).then(function () {
			done();
		}, grunt.fail.fatal);
	});
};
//# sourceMappingURL=gruntRemapIstanbul.js.map