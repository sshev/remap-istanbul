'use strict';

var _require = require('istanbul'),
    Collector = _require.Collector;

var Reporter = require('istanbul/lib/report/json');

function JsonCoverageReporter() {
	var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this._collector = new Collector();
	this._reporter = new Reporter({
		file: config.filename,
		watermarks: config.watermarks
	});
}

JsonCoverageReporter.prototype.coverage = function coverage(sessionId, coverageData) {
	this._collector.add(coverageData);
};

JsonCoverageReporter.prototype.runEnd = function runEnd() {
	this._reporter.writeReport(this._collector, true);
};

module.exports = JsonCoverageReporter;
//# sourceMappingURL=JsonCoverage.js.map