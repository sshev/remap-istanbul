#!/usr/bin/env node
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadCoverage = require('./loadCoverage');
var remap = require('./remap');
var writeReport = require('./writeReport');
var MemoryStore = require('istanbul/lib/store/memory');
var Collector = require('istanbul/lib/collector');

/**
 * Helper function that reads from standard in and resolves a Promise with the
 * data or rejects with any errors.
 * @return {Promise} A promsie that is resolved with the data from standard in
 *                   or rejected with any errors.
 */
function readStdIn() {
	/* istanbul ignore next: too challenging to test for reading from stdin */
	return new _promise2.default(function (resolve, reject) {
		var stdin = process.stdin;
		var buffer = '';

		stdin.setEncoding('utf8');

		stdin.on('data', function (data) {
			buffer += data;
		});

		stdin.on('error', function (e) {
			reject(e);
		});

		stdin.on('end', function () {
			resolve(buffer);
		});

		try {
			stdin.resume();
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * The main wrapper to provide a CLI interface to remap-istanbul
 * @param  {Array}   argv An array of arguments passed the process
 * @return {Promise}      A promise that resolves when the remapping is complete
 *                        or rejects if there is an error.
 */
function main(argv) {
	/* jshint maxcomplexity:13 */

	/**
  * Helper function that processes the arguments
  * @return {String} The next valid argument
  */
	function getArg() {
		var arg = argv.shift();
		if (arg && arg.indexOf('--') === 0) {
			arg = arg.split('=');
			if (arg.length > 1) {
				argv.unshift(arg.slice(1).join('='));
			}
			arg = arg[0];
		} else if (arg && arg[0] === '-') {
			/* istanbul ignore if */
			if (arg.length > 2) {
				argv = arg.substring(1).split('').map(function (ch) {
					return '-' + ch;
				}).concat(argv);
				arg = argv.shift();
			}
		}

		return arg;
	}

	var arg = void 0;
	var inputFiles = [];
	var output = void 0;
	var reportType = void 0;
	var basePath = void 0;
	var exclude = void 0;
	for (arg = getArg(); arg; arg = getArg()) {
		switch (arg) {
			case '-i':
			case '--input':
				inputFiles.push(argv.shift());
				break;
			case '-o':
			case '--output':
				output = argv.shift();
				break;
			case '-b':
			case '--basePath':
				basePath = argv.shift();
				break;
			case '-t':
			case '--type':
				reportType = argv.shift();
				break;
			case '-e':
			case '--exclude':
				exclude = argv.shift();
				if (exclude.indexOf(',') !== -1) {
					exclude = new RegExp(exclude.replace(/,/g, '|'));
				}
				break;
			default:
				throw new SyntaxError('Unrecognised argument: "' + arg + '".');
		}
	}

	return new _promise2.default(function (resolve, reject) {
		var coverage = inputFiles.length ? loadCoverage(inputFiles) :
		/* istanbul ignore next */
		readStdIn().then(function (data) {
			try {
				data = JSON.parse(data);
				var collector = new Collector();
				collector.add(data);
				return collector.getFinalCoverage();
			} catch (err) {
				console.error(err.stack);
				throw err;
			}
		}, reject);

		resolve(coverage);
	}).then(function (coverage) {
		var sources = new MemoryStore();
		var collector = remap(coverage, {
			sources: sources,
			basePath: basePath || undefined,
			exclude: exclude || undefined
		});
		if (!(0, _keys2.default)(sources.map).length) {
			sources = undefined;
		}
		var reportOptions = {};
		if (output) {
			return writeReport(collector, reportType || 'json', reportOptions, output, sources);
		}
		if (reportType && (reportType === 'lcovonly' || reportType === 'text-lcov')) {
			return writeReport(collector, 'text-lcov', reportOptions);
		}
		process.stdout.write((0, _stringify2.default)(collector.getFinalCoverage()) + '\n');
		return null;
	});
}

/* istanbul ignore if: we use the module interface in testing */
if (!module.parent) {
	process.title = 'remap-istanbul';
	/* first two arguments are meaningless to the process */
	main(process.argv.slice(2)).then(function (code) {
		return process.exit(code || 0);
	}, function (err) {
		console.log(err.stack);
		process.exit(1);
	});
} else {
	module.exports = main;
}
//# sourceMappingURL=remap-istanbul.js.map