"use strict";

function remapBranch(genItem, getMapping) {
	var locations = [];
	var source = void 0;

	for (var i = 0; i < genItem.locations.length; i += 1) {
		var mapping = getMapping(genItem.locations[i]);
		if (!mapping) {
			return null;
		}
		/* istanbul ignore else: edge case too hard to test for */
		if (!source) {
			source = mapping.source;
		} else if (source !== mapping.source) {
			return null;
		}
		locations.push(mapping.loc);
	}

	var srcItem = {
		line: locations[0].start.line,
		type: genItem.type,
		locations: locations
	};

	return { source: source, srcItem: srcItem };
}

module.exports = remapBranch;
//# sourceMappingURL=remapBranch.js.map