'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('istanbul'),
    Collector = _require.Collector;

var path = require('path');
var fs = require('fs');

var _require2 = require('source-map'),
    SourceMapConsumer = _require2.SourceMapConsumer;

var sourceMapRegEx = /(?:\/{2}[#@]{1,2}|\/\*)\s+sourceMappingURL\s*=\s*(data:(?:[^;]+;)+base64,)?(\S+)/;

var SparceCoverageCollector = require('./SparceCoverageCollector').SparceCoverageCollector;

var getMapping = require('./getMapping');

var remapFunction = require('./remapFunction');
var remapBranch = require('./remapBranch');

var CoverageTransformer = function () {
	function CoverageTransformer(options) {
		(0, _classCallCheck3.default)(this, CoverageTransformer);

		this.basePath = options.basePath;
		this.warn = options.warn || console.warn;

		this.exclude = function () {
			return false;
		};
		if (options.exclude) {
			if (typeof options.exclude === 'function') {
				this.exclude = options.exclude;
			} else if (typeof options.exclude === 'string') {
				this.exclude = function (fileName) {
					return fileName.indexOf(options.exclude) > -1;
				};
			} else {
				this.exclude = function (fileName) {
					return fileName.match(options.exclude);
				};
			}
		}

		this.useAbsolutePaths = !!options.useAbsolutePaths;

		this.readJSON = options.readJSON || function readJSON(filePath) {
			if (!fs.existsSync(filePath)) {
				this.warn(Error('Could not find file: "' + filePath + '"'));
				return null;
			}
			return JSON.parse(fs.readFileSync(filePath));
		};

		this.readFile = options.readFile || function readFile(filePath) {
			if (!fs.existsSync(filePath)) {
				this.warn(new Error('Could not find file: "' + filePath + '"'));
				return '';
			}
			return fs.readFileSync(filePath);
		};

		this.sourceStore = options.sources;

		this.sparceCoverageCollector = new SparceCoverageCollector();
	}

	(0, _createClass3.default)(CoverageTransformer, [{
		key: 'addFileCoverage',
		value: function addFileCoverage(filePath, fileCoverage) {
			var _this = this;

			if (this.exclude(filePath)) {
				this.warn('Excluding: "' + filePath + '"');
				return;
			}

			/* coverage.json can sometimes include the code inline */
			var codeIsArray = true;
			var codeFromFile = false;
			var jsText = fileCoverage.code;
			if (!jsText) {
				jsText = this.readFile(filePath);
				codeFromFile = true;
			}
			if (Array.isArray(jsText)) {
				/* sometimes the source is an array */
				jsText = jsText.join('\n');
			} else {
				codeIsArray = false;
			}
			var match = sourceMapRegEx.exec(jsText);
			var sourceMapDir = path.dirname(filePath);
			var rawSourceMap = void 0;

			if (fileCoverage.inputSourceMap) {
				rawSourceMap = fileCoverage.inputSourceMap;
			} else if (!match && !codeFromFile) {
				codeIsArray = false;
				jsText = this.readFile(filePath);
				match = sourceMapRegEx.exec(jsText);
			}

			if (match) {
				if (match[1]) {
					rawSourceMap = JSON.parse(new Buffer(match[2], 'base64').toString('utf8'));
				} else {
					var sourceMapPath = path.join(sourceMapDir, match[2]);
					rawSourceMap = this.readJSON(sourceMapPath);
					sourceMapDir = path.dirname(sourceMapPath);
				}
			}

			if (!rawSourceMap) {
				/* We couldn't find a source map, so will copy coverage after warning. */
				this.warn(new Error('Could not find source map for: "' + filePath + '"'));
				try {
					fileCoverage.code = String(fs.readFileSync(filePath)).split('\n');
				} catch (error) {
					this.warn(new Error('Could find source for : "' + filePath + '"'));
				}
				this.sparceCoverageCollector.setCoverage(filePath, fileCoverage);
				return;
			}

			sourceMapDir = this.basePath || sourceMapDir;

			// replace relative paths in source maps with absolute
			rawSourceMap.sources = rawSourceMap.sources.map(function (srcPath) {
				return srcPath.substr(0, 1) === '.' ? path.resolve(sourceMapDir, srcPath) : srcPath;
			});

			var sourceMap = new SourceMapConsumer(rawSourceMap);

			/* if there are inline sources and a store to put them into, we will populate it */
			var inlineSourceMap = {};
			var origSourceFilename = void 0;
			var origFileName = void 0;
			var fileName = void 0;

			if (sourceMap.sourcesContent) {
				origSourceFilename = rawSourceMap.sources[0];

				if (origSourceFilename && path.extname(origSourceFilename) !== '') {
					origFileName = rawSourceMap.file;
					fileName = filePath.replace(path.extname(origFileName), path.extname(origSourceFilename));
					rawSourceMap.file = fileName;
					rawSourceMap.sources = [fileName];
					rawSourceMap.sourceRoot = '';
					sourceMap = new SourceMapConsumer(rawSourceMap);
				}

				sourceMap.sourcesContent.forEach(function (source, idx) {
					inlineSourceMap[sourceMap.sources[idx]] = true;
					_this.sparceCoverageCollector.setSourceCode(sourceMap.sources[idx], codeIsArray ? source.split('\n') : source);
					if (_this.sourceStore) {
						_this.sourceStore.set(sourceMap.sources[idx], source);
					}
				});
			}

			var resolvePath = function resolvePath(source) {
				var resolvedSource = source in inlineSourceMap ? source : path.resolve(sourceMapDir, source);

				if (!_this.useAbsolutePaths && !(source in inlineSourceMap)) {
					resolvedSource = path.relative(process.cwd(), resolvedSource);
				}
				return resolvedSource;
			};

			var getMappingResolved = function getMappingResolved(location) {
				var mapping = getMapping(sourceMap, location);
				if (!mapping) return null;

				return (0, _assign2.default)(mapping, { source: resolvePath(mapping.source) });
			};

			(0, _keys2.default)(fileCoverage.branchMap).forEach(function (index) {
				var genItem = fileCoverage.branchMap[index];
				var hits = fileCoverage.b[index];

				var info = remapBranch(genItem, getMappingResolved);

				if (info) {
					_this.sparceCoverageCollector.updateBranch(info.source, info.srcItem, hits);
				}
			});

			(0, _keys2.default)(fileCoverage.fnMap).forEach(function (index) {
				var genItem = fileCoverage.fnMap[index];
				var hits = fileCoverage.f[index];

				var info = remapFunction(genItem, getMappingResolved);

				if (info) {
					_this.sparceCoverageCollector.updateFunction(info.source, info.srcItem, hits);
				}
			});

			(0, _keys2.default)(fileCoverage.statementMap).forEach(function (index) {
				var genItem = fileCoverage.statementMap[index];
				var hits = fileCoverage.s[index];

				var mapping = getMappingResolved(genItem);

				if (mapping) {
					_this.sparceCoverageCollector.updateStatement(mapping.source, mapping.loc, hits);
				}
			});

			// todo: refactor exposing implementation details
			var srcCoverage = this.sparceCoverageCollector.getFinalCoverage();

			if (sourceMap.sourcesContent && this.basePath) {
				// Convert path to use base path option
				var getPath = function getPath(filePath) {
					var absolutePath = path.resolve(_this.basePath, filePath);
					if (!_this.useAbsolutePaths) {
						return path.relative(process.cwd(), absolutePath);
					}
					return absolutePath;
				};
				var fullSourceMapPath = getPath(origFileName.replace(path.extname(origFileName), path.extname(origSourceFilename)));
				srcCoverage[fullSourceMapPath] = srcCoverage[fileName];
				srcCoverage[fullSourceMapPath].path = fullSourceMapPath;
				delete srcCoverage[fileName];
			}
		}
	}, {
		key: 'addCoverage',
		value: function addCoverage(item) {
			var _this2 = this;

			(0, _keys2.default)(item).forEach(function (filePath) {
				var fileCoverage = item[filePath];
				_this2.addFileCoverage(filePath, fileCoverage);
			});
		}
	}, {
		key: 'getFinalCoverage',
		value: function getFinalCoverage() {
			var _this3 = this;

			var collector = new Collector();

			var srcCoverage = this.sparceCoverageCollector.getFinalCoverage();

			collector.add((0, _keys2.default)(srcCoverage).filter(function (filePath) {
				return !_this3.exclude(filePath);
			}).reduce(function (obj, name) {
				obj[name] = srcCoverage[name];
				return obj;
			}, {}));

			/* refreshes the line counts for reports */
			collector.getFinalCoverage();

			return collector;
		}
	}]);
	return CoverageTransformer;
}();

module.exports.CoverageTransformer = CoverageTransformer;
//# sourceMappingURL=CoverageTransformer.js.map