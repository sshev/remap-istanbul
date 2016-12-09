"use strict";

function remapFunction(genItem, getMapping) {
	var mapping = getMapping(genItem.loc);

	if (!mapping) {
		return null;
	}

	var srcItem = {
		name: genItem.name,
		line: mapping.loc.start.line,
		loc: mapping.loc
	};

	if (genItem.skip) {
		srcItem.skip = genItem.skip;
	}

	return { srcItem: srcItem, source: mapping.source };
}

module.exports = remapFunction;
//# sourceMappingURL=remapFunction.js.map