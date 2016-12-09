'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('istanbul/index');

var istanbulReportTypes = {
	clover: 'file',
	cobertura: 'file',
	html: 'directory',
	'json-summary': 'file',
	json: 'file',
	lcovonly: 'file',
	teamcity: 'file',
	'text-lcov': 'console',
	'text-summary': 'file',
	text: 'file'
};

/**
 * Generates an Instanbul Coverage report based on the information passed.
 * @param  {istanbul/lib/_collector} collector  An instance of an coverage
 *                                             collector
 * @param  {string}          reportType    The name of the report type to
 *                                         generate
 * @param  {object}       reportOptions The options to pass to the reporter
 * @param  {string|function} dest          The filename or outputting
 *                                         function to use for generating
 *                                         the report
 * @param  {istanbul/lib/store} sources?   A store of sources to be passed
 *                                         the reporter
 * @return {Promise}                       A promise that resolves when the
 *                                         report is complete.
 */
module.exports = function writeReport(collector, reportType, reportOptions, dest, sources) {
	return new _promise2.default(function (resolve, reject) {
		if (!(reportType in istanbulReportTypes)) {
			reject(new SyntaxError('Unrecognized report type of "' + reportType + '".'));
			return;
		}
		var Reporter = require('istanbul/lib/report/' + reportType);
		var options = (0, _assign2.default)({}, reportOptions);
		switch (istanbulReportTypes[reportType]) {
			case 'file':
				options.file = dest;
				break;
			case 'directory':
				options.dir = dest;
				break;
			case 'console':
				options.log = dest || console.log;
				break;
			default:
				throw new Error('Unknown reporter type');
		}
		if (sources) {
			options.sourceStore = sources;
		}
		var reporter = new Reporter(options);
		resolve(reporter.writeReport(collector, true));
	});
};
//# sourceMappingURL=writeReport.js.map