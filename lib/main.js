'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* jshint node:true */
/* global Promise */
var loadCoverage = require('./loadCoverage');
var remap = require('./remap');
var writeReport = require('./writeReport');
var MemoryStore = require('istanbul/lib/store/memory');

/**
 * The basic API for utilising remap-istanbul
 * @param  {Array|string} sources The sources that could be consumed and remapped.
 *                                For muliple sources to be combined together, provide
 *                                an array of strings.
 * @param  {Object} reports An object where each key is the report type required and the value
 *                          is the destination for the report.
 * @param  {Object} reportOptions? An object containing the report options.
 * @return {Promise}         A promise that will resolve when all the reports are written.
 */
module.exports = function (sources, reports, reportOptions) {
	var sourceStore = new MemoryStore();
	var collector = remap(loadCoverage(sources), {
		sources: sourceStore
	});

	if (!(0, _keys2.default)(sourceStore.map).length) {
		sourceStore = undefined;
	}

	return _promise2.default.all((0, _keys2.default)(reports).map(function (reportType) {
		return writeReport(collector, reportType, reportOptions || {}, reports[reportType], sourceStore);
	}));
};

module.exports.loadCoverage = loadCoverage;
module.exports.remap = remap;
module.exports.writeReport = writeReport;
//# sourceMappingURL=main.js.map