'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* jshint node: true */
/* jshint -W079 */
var remap = require('./remap');
var writeReport = require('./writeReport');
var MemoryStore = require('istanbul/lib/store/memory');

var _require = require('gulp-util'),
    PluginError = _require.PluginError;

var through = require('through2');

/* global Promise */

module.exports = function () {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return through.obj(function (file, enc, cb) {
		if (!opts.warn) {
			opts.warn = function (message) {
				if (opts.fail) {
					cb(new PluginError('remap-istanbul', message));
				} else {
					console.error(message);
				}
			};
		}

		opts.sources = new MemoryStore();

		if (file.isNull()) {
			cb(null, file);
		}

		if (file.isStream()) {
			cb(new PluginError('remap-istanbul', 'Streaming not supported'));
		}

		var collector = remap(JSON.parse(file.contents.toString('utf8')), opts);

		var sources = void 0;
		if ((0, _keys2.default)(opts.sources.map).length) {
			sources = opts.sources;
		}

		var p = [];
		if (opts.reports) {
			(0, _keys2.default)(opts.reports).forEach(function (key) {
				p.push(writeReport(collector, key, opts.reportOpts || {}, opts.reports[key], sources));
			});
		}

		file.contents = new Buffer((0, _stringify2.default)(collector.getFinalCoverage()));

		_promise2.default.all(p).then(function () {
			cb(null, file);
		});
	});
};
//# sourceMappingURL=gulpRemapIstanbul.js.map