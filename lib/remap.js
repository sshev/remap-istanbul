'use strict';

var _require = require('./CoverageTransformer'),
    CoverageTransformer = _require.CoverageTransformer;

/**
 * Remaps coverage data based on the source maps it discovers in the
 * covered files and returns a coverage Collector that contains the remappped
 * data.
 * @param  {Array|Object} coverage The coverage (or array of coverages) that need to be
 *                                 remapped
 * @param  {Object} options A configuration object:
 *                              basePath? - a string containing to utilise as the base path
 *                                          for determining the location of the source file
 *                              exclude?  - a string or Regular Expression that filters out
 *                                          any coverage where the file path matches
 *                              readFile? - a function that can read a file
 *                                          syncronously
 *                              readJSON? - a function that can read and parse a
 *                                          JSON file syncronously
 *                              sources?  - a Istanbul store where inline sources will be
 *                                          added
 *                              warn?     - a function that logs warnings
 * @return {istanbul/lib/_collector}         The remapped collector
 */


function remap(coverage) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var smc = new CoverageTransformer(options);

  if (!Array.isArray(coverage)) {
    coverage = [coverage];
  }

  coverage.forEach(function (item) {
    smc.addCoverage(item);
  });

  return smc.getFinalCoverage();
}

module.exports = remap;
//# sourceMappingURL=remap.js.map