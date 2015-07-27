"use strict";

/*global module, require*/

module.exports = function(options) {
    var data = function(id, size, position, visible) {
	var onVisibilityChanged,
	    onSizeChanged,
	    onPositionChanged;
	
	if (visible === undefined) {
	    if (options.initialVisibility === undefined) {
		visible = true;
	    } else {
		visible = options.initialVisibility;
	    }
	}
	
	return {
	    id: id,
	    
	    manuallySized: function() {
		return size !== undefined;
	    },
	    
	    getSize: function() {
		return size;
	    },

	    getWidth: function() {
		if (size !== undefined) {
		    return size[0];
		} else {
		    throw new Error("Cannot get width for auto-sized dialogue " + id);
		}
	    },

	    getHeight: function() {
		if (size !== undefined) {
		    return size[1];
		} else {
		    throw new Error("Cannot get height for auto-sized dialogue " + id);
		}
	    },

	    setSize: function(width, height) {
		if (!size || (width !== size[0] && height !== size[1])) {
		    size = [width, height];

		    if (onSizeChanged) {
			onSizeChanged(id, size);
		    }
		}
	    },

	    onSizeChanged: function(f) {
		onSizeChanged = f;
	    },

	    manuallyPositioned: function() {
		return position !== undefined;
	    },

	    getPosition: function() {
		return position;
	    },

	    getLeft: function() {
		if (position !== undefined) {
		    return position[0];
		} else {
		    throw new Error("Cannot get left position for auto-positioned dialogue " + id);
		}
	    },

	    getTop: function() {
		if (position !== undefined) {
		    return position[1];
		} else {
		    throw new Error("Cannot get top position for auto-positioned dialogue " + id);
		}
	    },

	    setPosition: function(left, top) {
		if (!position || (left !== position[0] && top !== position[1])) {
		    position = [left, top];

		    if (onPositionChanged) {
			onPositionChanged(id, position);
		    }
		}
	    },

	    onPositionChanged: function(f) {
		onPositionChanged = f;
	    },

	    getVisibility: function() {
		return visible;
	    },

	    setVisibility: function(newVisibility) {
		if (visible !== newVisibility) {
		    visible = newVisibility;

		    if (onVisibilityChanged) {
			onVisibilityChanged(id, visible);
		    }
		}
	    },

	    onVisibilityChanged: function(f) {
		onVisibilityChanged = f;
	    },

	    serialize: function() {
		var serialized = {
		    id: id
		};

		if (size !== undefined) {
		    serialized.size = size;
		}

		if (position !== undefined) {
		    serialized.position = position;
		}

		if (visible !== undefined) {
		    serialized.visible = visible;
		}

		return serialized;
	    }
	};
    };

    return {
	load: function(serialized) {
	    return data(
		serialized.id,
		serialized.size,
		serialized.position,
		serialized.visible
	    );
	},

	create: function(id) {
	    return data(id);
	}
    };
};
