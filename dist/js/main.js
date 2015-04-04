(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var App = _interopRequire(require("./app"));

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

Router.run(App.routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.querySelector("body"));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });

},{"./app":21,"react":"react","react-router":"react-router"}],2:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericMap = require("./generic-map");
var PropertyChanges = require("./listen/property-changes");

// Burgled from https://github.com/domenic/dict

module.exports = Dict;
function Dict(values, getDefault) {
    if (!(this instanceof Dict)) {
        return new Dict(values, getDefault);
    }
    getDefault = getDefault || Function.noop;
    this.getDefault = getDefault;
    this.store = {};
    this.length = 0;
    this.addEach(values);
}

Dict.Dict = Dict; // hack so require("dict").Dict will work in MontageJS.

function mangle(key) {
    // Use "$" as the mangle prefix so dictionaries of valid identifiers can
    // take advantage of optimizations for objects containing only valid
    // identifiers. I have not verified that this makes a difference.
    return "$" + key;
}

function unmangle(mangled) {
    return mangled.slice(1);
}

Object.addEach(Dict.prototype, GenericCollection.prototype);
Object.addEach(Dict.prototype, GenericMap.prototype);
Object.addEach(Dict.prototype, PropertyChanges.prototype);

Dict.prototype.constructClone = function (values) {
    return new this.constructor(values, this.getDefault);
};

Dict.prototype.assertString = function (key) {
    if (typeof key !== "string") {
        throw new TypeError("key must be a string but Got " + key);
    }
}

Dict.prototype.get = function (key, defaultValue) {
    this.assertString(key);
    var mangled = mangle(key);
    if (mangled in this.store) {
        return this.store[mangled];
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

Dict.prototype.set = function (key, value) {
    this.assertString(key);
    var mangled = mangle(key);
    if (mangled in this.store) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[mangled]);
        }
        this.store[mangled] = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return false;
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        this.length++;
        this.store[mangled] = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
        return true;
    }
};

Dict.prototype.has = function (key) {
    this.assertString(key);
    var mangled = mangle(key);
    return mangled in this.store;
};

Dict.prototype["delete"] = function (key) {
    this.assertString(key);
    var mangled = mangle(key);
    if (mangled in this.store) {
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[mangled]);
        }
        delete this.store[mangle(key)];
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
        return true;
    }
    return false;
};

Dict.prototype.clear = function () {
    var key, mangled;
    for (mangled in this.store) {
        key = unmangle(mangled);
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, this.store[mangled]);
        }
        delete this.store[mangled];
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
    }
    this.length = 0;
};

Dict.prototype.reduce = function (callback, basis, thisp) {
    for (var mangled in this.store) {
        basis = callback.call(thisp, basis, this.store[mangled], unmangle(mangled), this);
    }
    return basis;
};

Dict.prototype.reduceRight = function (callback, basis, thisp) {
    var self = this;
    var store = this.store;
    return Object.keys(this.store).reduceRight(function (basis, mangled) {
        return callback.call(thisp, basis, store[mangled], unmangle(mangled), self);
    }, basis);
};

Dict.prototype.one = function () {
    var key;
    for (key in this.store) {
        return this.store[key];
    }
};

Dict.prototype.toJSON = function () {
    return this.toObject();
};

},{"./generic-collection":4,"./generic-map":5,"./listen/property-changes":10,"./shim":18}],3:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var Dict = require("./dict");
var List = require("./list");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var TreeLog = require("./tree-log");
var PropertyChanges = require("./listen/property-changes");

var object_has = Object.prototype.hasOwnProperty;

module.exports = FastSet;

function FastSet(values, equals, hash, getDefault) {
    if (!(this instanceof FastSet)) {
        return new FastSet(values, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    var self = this;
    this.buckets = new this.Buckets(null, function getDefaultBucket() {
        return new self.Bucket();
    });
    this.length = 0;
    this.addEach(values);
}

FastSet.FastSet = FastSet; // hack so require("fast-set").FastSet will work in MontageJS

Object.addEach(FastSet.prototype, GenericCollection.prototype);
Object.addEach(FastSet.prototype, GenericSet.prototype);
Object.addEach(FastSet.prototype, PropertyChanges.prototype);

FastSet.prototype.Buckets = Dict;
FastSet.prototype.Bucket = List;

FastSet.prototype.constructClone = function (values) {
    return new this.constructor(
        values,
        this.contentEquals,
        this.contentHash,
        this.getDefault
    );
};

FastSet.prototype.has = function (value) {
    var hash = this.contentHash(value);
    return this.buckets.get(hash).has(value);
};

FastSet.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#get does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        return buckets.get(hash).get(value);
    } else {
        return this.getDefault(value);
    }
};

FastSet.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("FastSet#delete does not support second argument: equals");
    }
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (buckets.has(hash)) {
        var bucket = buckets.get(hash);
        if (bucket["delete"](value)) {
            this.length--;
            if (bucket.length === 0) {
                buckets["delete"](hash);
            }
            return true;
        }
    }
    return false;
};

FastSet.prototype.clear = function () {
    this.buckets.clear();
    this.length = 0;
};

FastSet.prototype.add = function (value) {
    var hash = this.contentHash(value);
    var buckets = this.buckets;
    if (!buckets.has(hash)) {
        buckets.set(hash, new this.Bucket(null, this.contentEquals));
    }
    if (!buckets.get(hash).has(value)) {
        buckets.get(hash).add(value);
        this.length++;
        return true;
    }
    return false;
};

FastSet.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var buckets = this.buckets;
    var index = 0;
    return buckets.reduce(function (basis, bucket) {
        return bucket.reduce(function (basis, value) {
            return callback.call(thisp, basis, value, index++, this);
        }, basis, this);
    }, basis, this);
};

FastSet.prototype.one = function () {
    if (this.length > 0) {
        return this.buckets.one().one();
    }
};

FastSet.prototype.iterate = function () {
    return this.buckets.values().flatten().iterate();
};

FastSet.prototype.log = function (charmap, logNode, callback, thisp) {
    charmap = charmap || TreeLog.unicodeSharp;
    logNode = logNode || this.logNode;
    if (!callback) {
        callback = console.log;
        thisp = console;
    }
    callback = callback.bind(thisp);

    var buckets = this.buckets;
    var hashes = buckets.keys();
    hashes.forEach(function (hash, index) {
        var branch;
        var leader;
        if (index === hashes.length - 1) {
            branch = charmap.fromAbove;
            leader = ' ';
        } else if (index === 0) {
            branch = charmap.branchDown;
            leader = charmap.strafe;
        } else {
            branch = charmap.fromBoth;
            leader = charmap.strafe;
        }
        var bucket = buckets.get(hash);
        callback.call(thisp, branch + charmap.through + charmap.branchDown + ' ' + hash);
        bucket.forEach(function (value, node) {
            var branch, below;
            if (node === bucket.head.prev) {
                branch = charmap.fromAbove;
                below = ' ';
            } else {
                branch = charmap.fromBoth;
                below = charmap.strafe;
            }
            var written;
            logNode(
                node,
                function (line) {
                    if (!written) {
                        callback.call(thisp, leader + ' ' + branch + charmap.through + charmap.through + line);
                        written = true;
                    } else {
                        callback.call(thisp, leader + ' ' + below + '  ' + line);
                    }
                },
                function (line) {
                    callback.call(thisp, leader + ' ' + charmap.strafe + '  ' + line);
                }
            );
        });
    });
};

FastSet.prototype.logNode = function (node, write) {
    var value = node.value;
    if (Object(value) === value) {
        JSON.stringify(value, null, 4).split("\n").forEach(function (line) {
            write(" " + line);
        });
    } else {
        write(" " + value);
    }
};


},{"./dict":2,"./generic-collection":4,"./generic-set":7,"./list":8,"./listen/property-changes":10,"./shim":18,"./tree-log":19}],4:[function(require,module,exports){
"use strict";

module.exports = GenericCollection;
function GenericCollection() {
    throw new Error("Can't construct. GenericCollection is a mixin.");
}

GenericCollection.EmptyArray = Object.freeze([]);

GenericCollection.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            values.forEach(this.add, this);
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            Object.keys(values).forEach(function (key) {
                this.add(values[key], key);
            }, this);
        }
    } else if (values && typeof values.length === "number") {
        // Strings
        for (var i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    return this;
};

// This is sufficiently generic for Map (since the value may be a key)
// and ordered collections (since it forwards the equals argument)
GenericCollection.prototype.deleteEach = function (values, equals) {
    values.forEach(function (value) {
        this["delete"](value, equals);
    }, this);
    return this;
};

// all of the following functions are implemented in terms of "reduce".
// some need "constructClone".

GenericCollection.prototype.forEach = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (undefined, value, key, object, depth) {
        callback.call(thisp, value, key, object, depth);
    }, undefined);
};

GenericCollection.prototype.map = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = [];
    this.reduce(function (undefined, value, key, object, depth) {
        result.push(callback.call(thisp, value, key, object, depth));
    }, undefined);
    return result;
};

GenericCollection.prototype.enumerate = function (start) {
    if (start == null) {
        start = 0;
    }
    var result = [];
    this.reduce(function (undefined, value) {
        result.push([start++, value]);
    }, undefined);
    return result;
};

GenericCollection.prototype.group = function (callback, thisp, equals) {
    equals = equals || Object.equals;
    var groups = [];
    var keys = [];
    this.forEach(function (value, key, object) {
        var key = callback.call(thisp, value, key, object);
        var index = keys.indexOf(key, equals);
        var group;
        if (index === -1) {
            group = [];
            groups.push([key, group]);
            keys.push(key);
        } else {
            group = groups[index][1];
        }
        group.push(value);
    });
    return groups;
};

GenericCollection.prototype.toArray = function () {
    return this.map(Function.identity);
};

// this depends on stringable keys, which apply to Array and Iterator
// because they have numeric keys and all Maps since they may use
// strings as keys.  List, Set, and SortedSet have nodes for keys, so
// toObject would not be meaningful.
GenericCollection.prototype.toObject = function () {
    var object = {};
    this.reduce(function (undefined, value, key) {
        object[key] = value;
    }, undefined);
    return object;
};

GenericCollection.prototype.filter = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    var result = this.constructClone();
    this.reduce(function (undefined, value, key, object, depth) {
        if (callback.call(thisp, value, key, object, depth)) {
            result.add(value, key);
        }
    }, undefined);
    return result;
};

GenericCollection.prototype.every = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result && callback.call(thisp, value, key, object, depth);
    }, true);
};

GenericCollection.prototype.some = function (callback /*, thisp*/) {
    var thisp = arguments[1];
    return this.reduce(function (result, value, key, object, depth) {
        return result || callback.call(thisp, value, key, object, depth);
    }, false);
};

GenericCollection.prototype.all = function () {
    return this.every(Boolean);
};

GenericCollection.prototype.any = function () {
    return this.some(Boolean);
};

GenericCollection.prototype.min = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) < 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.max = function (compare) {
    compare = compare || this.contentCompare || Object.compare;
    var first = true;
    return this.reduce(function (result, value) {
        if (first) {
            first = false;
            return value;
        } else {
            return compare(value, result) > 0 ? value : result;
        }
    }, undefined);
};

GenericCollection.prototype.sum = function (zero) {
    zero = zero === undefined ? 0 : zero;
    return this.reduce(function (a, b) {
        return a + b;
    }, zero);
};

GenericCollection.prototype.average = function (zero) {
    var sum = zero === undefined ? 0 : zero;
    var count = zero === undefined ? 0 : zero;
    this.reduce(function (undefined, value) {
        sum += value;
        count += 1;
    }, undefined);
    return sum / count;
};

GenericCollection.prototype.concat = function () {
    var result = this.constructClone(this);
    for (var i = 0; i < arguments.length; i++) {
        result.addEach(arguments[i]);
    }
    return result;
};

GenericCollection.prototype.flatten = function () {
    var self = this;
    return this.reduce(function (result, array) {
        array.forEach(function (value) {
            this.push(value);
        }, result, self);
        return result;
    }, []);
};

GenericCollection.prototype.zip = function () {
    var table = Array.prototype.slice.call(arguments);
    table.unshift(this);
    return Array.unzip(table);
}

GenericCollection.prototype.join = function (delimiter) {
    return this.reduce(function (result, string) {
        // work-around for reduce that does not support no-basis form
        if (result === void 0) {
            return string;
        } else {
            return result + delimiter + string;
        }
    }, void 0);
};

GenericCollection.prototype.sorted = function (compare, by, order) {
    compare = compare || this.contentCompare || Object.compare;
    // account for comparators generated by Function.by
    if (compare.by) {
        by = compare.by;
        compare = compare.compare || this.contentCompare || Object.compare;
    } else {
        by = by || Function.identity;
    }
    if (order === undefined)
        order = 1;
    return this.map(function (item) {
        return {
            by: by(item),
            value: item
        };
    })
    .sort(function (a, b) {
        return compare(a.by, b.by) * order;
    })
    .map(function (pair) {
        return pair.value;
    });
};

GenericCollection.prototype.reversed = function () {
    return this.constructClone(this).reverse();
};

GenericCollection.prototype.clone = function (depth, memo) {
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    var clone = this.constructClone();
    this.forEach(function (value, key) {
        clone.add(Object.clone(value, depth - 1, memo), key);
    }, this);
    return clone;
};

GenericCollection.prototype.only = function () {
    if (this.length === 1) {
        return this.one();
    }
};

GenericCollection.prototype.iterator = function () {
    return this.iterate.apply(this, arguments);
};

require("./shim-array");


},{"./shim-array":14}],5:[function(require,module,exports){
"use strict";

var Object = require("./shim-object");
var MapChanges = require("./listen/map-changes");
var PropertyChanges = require("./listen/property-changes");

module.exports = GenericMap;
function GenericMap() {
    throw new Error("Can't construct. GenericMap is a mixin.");
}

Object.addEach(GenericMap.prototype, MapChanges.prototype);
Object.addEach(GenericMap.prototype, PropertyChanges.prototype);

// all of these methods depend on the constructor providing a `store` set

GenericMap.prototype.isMap = true;

GenericMap.prototype.addEach = function (values) {
    if (values && Object(values) === values) {
        if (typeof values.forEach === "function") {
            // copy map-alikes
            if (values.isMap === true) {
                values.forEach(function (value, key) {
                    this.set(key, value);
                }, this);
            // iterate key value pairs of other iterables
            } else {
                values.forEach(function (pair) {
                    this.set(pair[0], pair[1]);
                }, this);
            }
        } else if (typeof values.length === "number") {
            // Array-like objects that do not implement forEach, ergo,
            // Arguments
            for (var i = 0; i < values.length; i++) {
                this.add(values[i], i);
            }
        } else {
            // copy other objects as map-alikes
            Object.keys(values).forEach(function (key) {
                this.set(key, values[key]);
            }, this);
        }
    } else if (values && typeof values.length === "number") {
        // String
        for (var i = 0; i < values.length; i++) {
            this.add(values[i], i);
        }
    }
    return this;
}

GenericMap.prototype.get = function (key, defaultValue) {
    var item = this.store.get(new this.Item(key));
    if (item) {
        return item.value;
    } else if (arguments.length > 1) {
        return defaultValue;
    } else {
        return this.getDefault(key);
    }
};

GenericMap.prototype.set = function (key, value) {
    var item = new this.Item(key, value);
    var found = this.store.get(item);
    var grew = false;
    if (found) { // update
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, found.value);
        }
        found.value = value;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    } else { // create
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, undefined);
        }
        if (this.store.add(item)) {
            this.length++;
            grew = true;
        }
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, value);
        }
    }
    return grew;
};

GenericMap.prototype.add = function (value, key) {
    return this.set(key, value);
};

GenericMap.prototype.has = function (key) {
    return this.store.has(new this.Item(key));
};

GenericMap.prototype['delete'] = function (key) {
    var item = new this.Item(key);
    if (this.store.has(item)) {
        var from = this.store.get(item).value;
        if (this.dispatchesMapChanges) {
            this.dispatchBeforeMapChange(key, from);
        }
        this.store["delete"](item);
        this.length--;
        if (this.dispatchesMapChanges) {
            this.dispatchMapChange(key, undefined);
        }
        return true;
    }
    return false;
};

GenericMap.prototype.clear = function () {
    var keys;
    if (this.dispatchesMapChanges) {
        this.forEach(function (value, key) {
            this.dispatchBeforeMapChange(key, value);
        }, this);
        keys = this.keys();
    }
    this.store.clear();
    this.length = 0;
    if (this.dispatchesMapChanges) {
        keys.forEach(function (key) {
            this.dispatchMapChange(key);
        }, this);
    }
};

GenericMap.prototype.reduce = function (callback, basis, thisp) {
    return this.store.reduce(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.reduceRight = function (callback, basis, thisp) {
    return this.store.reduceRight(function (basis, item) {
        return callback.call(thisp, basis, item.value, item.key, this);
    }, basis, this);
};

GenericMap.prototype.keys = function () {
    return this.map(function (value, key) {
        return key;
    });
};

GenericMap.prototype.values = function () {
    return this.map(Function.identity);
};

GenericMap.prototype.entries = function () {
    return this.map(function (value, key) {
        return [key, value];
    });
};

// XXX deprecated
GenericMap.prototype.items = function () {
    return this.entries();
};

GenericMap.prototype.equals = function (that, equals) {
    equals = equals || Object.equals;
    if (this === that) {
        return true;
    } else if (that && typeof that.every === "function") {
        return that.length === this.length && that.every(function (value, key) {
            return equals(this.get(key), value);
        }, this);
    } else {
        var keys = Object.keys(that);
        return keys.length === this.length && Object.keys(that).every(function (key) {
            return equals(this.get(key), that[key]);
        }, this);
    }
};

GenericMap.prototype.toJSON = function () {
    return this.entries();
};

GenericMap.prototype.Item = Item;

function Item(key, value) {
    this.key = key;
    this.value = value;
}

Item.prototype.equals = function (that) {
    return Object.equals(this.key, that.key) && Object.equals(this.value, that.value);
};

Item.prototype.compare = function (that) {
    return Object.compare(this.key, that.key);
};


},{"./listen/map-changes":9,"./listen/property-changes":10,"./shim-object":16}],6:[function(require,module,exports){

var Object = require("./shim-object");

module.exports = GenericOrder;
function GenericOrder() {
    throw new Error("Can't construct. GenericOrder is a mixin.");
}

GenericOrder.prototype.equals = function (that, equals) {
    equals = equals || this.contentEquals || Object.equals;

    if (this === that) {
        return true;
    }
    if (!that) {
        return false;
    }

    var self = this;
    return (
        this.length === that.length &&
        this.zip(that).every(function (pair) {
            return equals(pair[0], pair[1]);
        })
    );
};

GenericOrder.prototype.compare = function (that, compare) {
    compare = compare || this.contentCompare || Object.compare;

    if (this === that) {
        return 0;
    }
    if (!that) {
        return 1;
    }

    var length = Math.min(this.length, that.length);
    var comparison = this.zip(that).reduce(function (comparison, pair, index) {
        if (comparison === 0) {
            if (index >= length) {
                return comparison;
            } else {
                return compare(pair[0], pair[1]);
            }
        } else {
            return comparison;
        }
    }, 0);
    if (comparison === 0) {
        return this.length - that.length;
    }
    return comparison;
};

GenericOrder.prototype.toJSON = function () {
    return this.toArray();
};

},{"./shim-object":16}],7:[function(require,module,exports){

module.exports = GenericSet;
function GenericSet() {
    throw new Error("Can't construct. GenericSet is a mixin.");
}

GenericSet.prototype.isSet = true;

GenericSet.prototype.union = function (that) {
    var union =  this.constructClone(this);
    union.addEach(that);
    return union;
};

GenericSet.prototype.intersection = function (that) {
    return this.constructClone(this.filter(function (value) {
        return that.has(value);
    }));
};

GenericSet.prototype.difference = function (that) {
    var union =  this.constructClone(this);
    union.deleteEach(that);
    return union;
};

GenericSet.prototype.symmetricDifference = function (that) {
    var union = this.union(that);
    var intersection = this.intersection(that);
    return union.difference(intersection);
};

GenericSet.prototype.deleteAll = function (value) {
    // deleteAll is equivalent to delete for sets since they guarantee that
    // only one value exists for an equivalence class, but deleteAll returns
    // the count of deleted values instead of whether a value was deleted.
    return +this["delete"](value);
};

GenericSet.prototype.equals = function (that, equals) {
    var self = this;
    return (
        that && typeof that.reduce === "function" &&
        this.length === that.length &&
        that.reduce(function (equal, value) {
            return equal && self.has(value, equals);
        }, true)
    );
};

GenericSet.prototype.toJSON = function () {
    return this.toArray();
};

// W3C DOMTokenList API overlap (does not handle variadic arguments)

GenericSet.prototype.contains = function (value) {
    return this.has(value);
};

GenericSet.prototype.remove = function (value) {
    return this["delete"](value);
};

GenericSet.prototype.toggle = function (value) {
    if (this.has(value)) {
        this["delete"](value);
    } else {
        this.add(value);
    }
};


},{}],8:[function(require,module,exports){
"use strict";

module.exports = List;

var Shim = require("./shim");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

function List(values, equals, getDefault) {
    if (!(this instanceof List)) {
        return new List(values, equals, getDefault);
    }
    var head = this.head = new this.Node();
    head.next = head;
    head.prev = head;
    this.contentEquals = equals || Object.equals;
    this.getDefault = getDefault || Function.noop;
    this.length = 0;
    this.addEach(values);
}

List.List = List; // hack so require("list").List will work in MontageJS

Object.addEach(List.prototype, GenericCollection.prototype);
Object.addEach(List.prototype, GenericOrder.prototype);
Object.addEach(List.prototype, PropertyChanges.prototype);
Object.addEach(List.prototype, RangeChanges.prototype);

List.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.getDefault);
};

List.prototype.find = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.next);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.next;
    }
};

List.prototype.findLast = function (value, equals, index) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = this.scan(index, head.prev);
    while (at !== head) {
        if (equals(at.value, value)) {
            return at;
        }
        at = at.prev;
    }
};

List.prototype.has = function (value, equals) {
    return !!this.find(value, equals);
};

List.prototype.get = function (value, equals) {
    var found = this.find(value, equals);
    if (found) {
        return found.value;
    }
    return this.getDefault(value);
};

// LIFO (delete removes the most recently added equivalent value)
List.prototype["delete"] = function (value, equals) {
    var found = this.findLast(value, equals);
    if (found) {
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchBeforeRangeChange(plus, minus, found.index);
        }
        found["delete"]();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.updateIndexes(found.next, found.index);
            this.dispatchRangeChange(plus, minus, found.index);
        }
        return true;
    }
    return false;
};

List.prototype.deleteAll = function (value, equals) {
    equals = equals || this.contentEquals;
    var head = this.head;
    var at = head.next;
    var count = 0;
    while (at !== head) {
        if (equals(value, at.value)) {
            at["delete"]();
            count++;
        }
        at = at.next;
    }
    this.length -= count;
    return count;
};

List.prototype.clear = function () {
    var plus, minus;
    if (this.dispatchesRangeChanges) {
        minus = this.toArray();
        plus = [];
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    this.head.next = this.head.prev = this.head;
    this.length = 0;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.add = function (value) {
    var node = new this.Node(value)
    if (this.dispatchesRangeChanges) {
        node.index = this.length;
        this.dispatchBeforeRangeChange([value], [], node.index);
    }
    this.head.addBefore(node);
    this.length++;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([value], [], node.index);
    }
    return true;
};

List.prototype.push = function () {
    var head = this.head;
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = []
        var index = this.length;
        this.dispatchBeforeRangeChange(plus, minus, index);
        var start = this.head.prev;
    }
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        head.addBefore(node);
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(start.next, start.index === undefined ? 0 : start.index + 1);
        this.dispatchRangeChange(plus, minus, index);
    }
};

List.prototype.unshift = function () {
    if (this.dispatchesRangeChanges) {
        var plus = Array.prototype.slice.call(arguments);
        var minus = [];
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    var at = this.head;
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];
        var node = new this.Node(value);
        at.addAfter(node);
        at = node;
    }
    this.length += arguments.length;
    if (this.dispatchesRangeChanges) {
        this.updateIndexes(this.head.next, 0);
        this.dispatchRangeChange(plus, minus, 0);
    }
};

List.prototype.pop = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.prev.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            var index = this.length - 1;
            this.dispatchBeforeRangeChange(plus, minus, index);
        }
        head.prev['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange(plus, minus, index);
        }
    }
    return value;
};

List.prototype.shift = function () {
    var value;
    var head = this.head;
    if (head.prev !== head) {
        value = head.next.value;
        if (this.dispatchesRangeChanges) {
            var plus = [];
            var minus = [value];
            this.dispatchBeforeRangeChange(plus, minus, 0);
        }
        head.next['delete']();
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.updateIndexes(this.head.next, 0);
            this.dispatchRangeChange(plus, minus, 0);
        }
    }
    return value;
};

List.prototype.peek = function () {
    if (this.head !== this.head.next) {
        return this.head.next.value;
    }
};

List.prototype.poke = function (value) {
    if (this.head !== this.head.next) {
        this.head.next.value = value;
    } else {
        this.push(value);
    }
};

List.prototype.one = function () {
    return this.peek();
};

// TODO
// List.prototype.indexOf = function (value) {
// };

// TODO
// List.prototype.lastIndexOf = function (value) {
// };

// an internal utility for coercing index offsets to nodes
List.prototype.scan = function (at, fallback) {
    var head = this.head;
    if (typeof at === "number") {
        var count = at;
        if (count >= 0) {
            at = head.next;
            while (count) {
                count--;
                at = at.next;
                if (at == head) {
                    break;
                }
            }
        } else {
            at = head;
            while (count < 0) {
                count++;
                at = at.prev;
                if (at == head) {
                    break;
                }
            }
        }
        return at;
    } else {
        return at || fallback;
    }
};

// at and end may both be positive or negative numbers (in which cases they
// correspond to numeric indicies, or nodes)
List.prototype.slice = function (at, end) {
    var sliced = [];
    var head = this.head;
    at = this.scan(at, head.next);
    end = this.scan(end, head);

    while (at !== end && at !== head) {
        sliced.push(at.value);
        at = at.next;
    }

    return sliced;
};

List.prototype.splice = function (at, length /*...plus*/) {
    return this.swap(at, length, Array.prototype.slice.call(arguments, 2));
};

List.prototype.swap = function (start, length, plus) {
    var initial = start;
    // start will be head if start is null or -1 (meaning from the end), but
    // will be head.next if start is 0 (meaning from the beginning)
    start = this.scan(start, this.head);
    if (length == null) {
        length = Infinity;
    }
    plus = Array.from(plus);

    // collect the minus array
    var minus = [];
    var at = start;
    while (length-- && length >= 0 && at !== this.head) {
        minus.push(at.value);
        at = at.next;
    }

    // before range change
    var index, startNode;
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            index = this.length;
        } else if (start.prev === this.head) {
            index = 0;
        } else {
            index = start.index;
        }
        startNode = start.prev;
        this.dispatchBeforeRangeChange(plus, minus, index);
    }

    // delete minus
    var at = start;
    for (var i = 0, at = start; i < minus.length; i++, at = at.next) {
        at["delete"]();
    }
    // add plus
    if (initial == null && at === this.head) {
        at = this.head.next;
    }
    for (var i = 0; i < plus.length; i++) {
        var node = new this.Node(plus[i]);
        at.addBefore(node);
    }
    // adjust length
    this.length += plus.length - minus.length;

    // after range change
    if (this.dispatchesRangeChanges) {
        if (start === this.head) {
            this.updateIndexes(this.head.next, 0);
        } else {
            this.updateIndexes(startNode.next, startNode.index + 1);
        }
        this.dispatchRangeChange(plus, minus, index);
    }

    return minus;
};

List.prototype.reverse = function () {
    if (this.dispatchesRangeChanges) {
        var minus = this.toArray();
        var plus = minus.reversed();
        this.dispatchBeforeRangeChange(plus, minus, 0);
    }
    var at = this.head;
    do {
        var temp = at.next;
        at.next = at.prev;
        at.prev = temp;
        at = at.next;
    } while (at !== this.head);
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange(plus, minus, 0);
    }
    return this;
};

List.prototype.sort = function () {
    this.swap(0, this.length, this.sorted());
};

// TODO account for missing basis argument
List.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.next;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.next;
    }
    return basis;
};

List.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var head = this.head;
    var at = head.prev;
    while (at !== head) {
        basis = callback.call(thisp, basis, at.value, at, this);
        at = at.prev;
    }
    return basis;
};

List.prototype.updateIndexes = function (node, index) {
    while (node !== this.head) {
        node.index = index++;
        node = node.next;
    }
};

List.prototype.makeObservable = function () {
    this.head.index = -1;
    this.updateIndexes(this.head.next, 0);
    this.dispatchesRangeChanges = true;
};

List.prototype.iterate = function () {
    return new ListIterator(this.head);
};

function ListIterator(head) {
    this.head = head;
    this.at = head.next;
};

ListIterator.prototype.next = function () {
    if (this.at === this.head) {
        throw StopIteration;
    } else {
        var value = this.at.value;
        this.at = this.at.next;
        return value;
    }
};

List.prototype.Node = Node;

function Node(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
};

Node.prototype["delete"] = function () {
    this.prev.next = this.next;
    this.next.prev = this.prev;
};

Node.prototype.addBefore = function (node) {
    var prev = this.prev;
    this.prev = node;
    node.prev = prev;
    prev.next = node;
    node.next = this;
};

Node.prototype.addAfter = function (node) {
    var next = this.next;
    this.next = node;
    node.next = next;
    next.prev = node;
    node.prev = this;
};


},{"./generic-collection":4,"./generic-order":6,"./listen/property-changes":10,"./listen/range-changes":11,"./shim":18}],9:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");
var List = require("../list");

module.exports = MapChanges;
function MapChanges() {
    throw new Error("Can't construct. MapChanges is a mixin.");
}

var object_owns = Object.prototype.hasOwnProperty;

/*
    Object map change descriptors carry information necessary for adding,
    removing, dispatching, and shorting events to listeners for map changes
    for a particular key on a particular object.  These descriptors are used
    here for shallow map changes.

    {
        willChangeListeners:Array(Function)
        changeListeners:Array(Function)
    }
*/

var mapChangeDescriptors = new WeakMap();

MapChanges.prototype.getAllMapChangeDescriptors = function () {
    var Dict = require("../dict");
    if (!mapChangeDescriptors.has(this)) {
        mapChangeDescriptors.set(this, Dict());
    }
    return mapChangeDescriptors.get(this);
};

MapChanges.prototype.getMapChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllMapChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, {
            willChangeListeners: new List(),
            changeListeners: new List()
        });
    }
    return tokenChangeDescriptors.get(token);
};

MapChanges.prototype.addMapChangeListener = function (listener, token, beforeChange) {
    if (!this.isObservable && this.makeObservable) {
        // for Array
        this.makeObservable();
    }
    var descriptor = this.getMapChangeDescriptor(token);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    listeners.push(listener);
    Object.defineProperty(this, "dispatchesMapChanges", {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
    });

    var self = this;
    return function cancelMapChangeListener() {
        if (!self) {
            // TODO throw new Error("Can't remove map change listener again");
            return;
        }
        self.removeMapChangeListener(listener, token, beforeChange);
        self = null;
    };
};

MapChanges.prototype.removeMapChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getMapChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var node = listeners.findLast(listener);
    if (!node) {
        throw new Error("Can't remove map change listener: does not exist: token " + JSON.stringify(token));
    }
    node["delete"]();
};

MapChanges.prototype.dispatchMapChange = function (key, value, beforeChange) {
    var descriptors = this.getAllMapChangeDescriptors();
    var changeName = "Map" + (beforeChange ? "WillChange" : "Change");
    descriptors.forEach(function (descriptor, token) {

        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        var listeners;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }

        var tokenName = "handle" + (
            token.slice(0, 1).toUpperCase() +
            token.slice(1)
        ) + changeName;

        try {
            // dispatch to each listener
            listeners.forEach(function (listener) {
                if (listener[tokenName]) {
                    listener[tokenName](value, key, this);
                } else if (listener.call) {
                    listener.call(listener, value, key, this);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }, this);
        } finally {
            descriptor.isActive = false;
        }

    }, this);
};

MapChanges.prototype.addBeforeMapChangeListener = function (listener, token) {
    return this.addMapChangeListener(listener, token, true);
};

MapChanges.prototype.removeBeforeMapChangeListener = function (listener, token) {
    return this.removeMapChangeListener(listener, token, true);
};

MapChanges.prototype.dispatchBeforeMapChange = function (key, value) {
    return this.dispatchMapChange(key, value, true);
};


},{"../dict":2,"../list":8,"weak-map":12}],10:[function(require,module,exports){
/*
    Based in part on observable arrays from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/*
    This module is responsible for observing changes to owned properties of
    objects and changes to the content of arrays caused by method calls.
    The interface for observing array content changes establishes the methods
    necessary for any collection with observable content.
*/

require("../shim");

var object_owns = Object.prototype.hasOwnProperty;

// Object property descriptors carry information necessary for adding,
// removing, dispatching, and shorting events to listeners for property changes
// for a particular key on a particular object.  These descriptors are used
// here for shallow property changes.  The current listeners are the ones
// modified by add and remove own property change listener methods.  During
// property change dispatch, we capture a snapshot of the current listeners in
// the active change listeners array.  The descriptor also keeps a memo of the
// corresponding handler method names.
//
// {
//     willChangeListeners:{current, active:Array<Function>, ...method names}
//     changeListeners:{current, active:Array<Function>, ...method names}
// }

// Maybe remove entries from this table if the corresponding object no longer
// has any property change listeners for any key.  However, the cost of
// book-keeping is probably not warranted since it would be rare for an
// observed object to no longer be observed unless it was about to be disposed
// of or reused as an observable.  The only benefit would be in avoiding bulk
// calls to dispatchOwnPropertyChange events on objects that have no listeners.

//  To observe shallow property changes for a particular key of a particular
//  object, we install a property descriptor on the object that overrides the previous
//  descriptor.  The overridden descriptors are stored in this weak map.  The
//  weak map associates an object with another object that maps property names
//  to property descriptors.
//
//  object.__overriddenPropertyDescriptors__[key]
//
//  We retain the old descriptor for various purposes.  For one, if the property
//  is no longer being observed by anyone, we revert the property descriptor to
//  the original.  For "value" descriptors, we store the actual value of the
//  descriptor on the overridden descriptor, so when the property is reverted, it
//  retains the most recently set value.  For "get" and "set" descriptors,
//  we observe then forward "get" and "set" operations to the original descriptor.

module.exports = PropertyChanges;

function PropertyChanges() {
    throw new Error("This is an abstract interface. Mix it. Don't construct it");
}

PropertyChanges.debug = true;

PropertyChanges.prototype.getOwnPropertyChangeDescriptor = function (key) {
    if (!this.__propertyChangeListeners__) {
        Object.defineProperty(this, "__propertyChangeListeners__", {
            value: {},
            enumerable: false,
            configurable: true,
            writable: true
        });
    }
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__;
    if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
        var propertyName = String(key);
        propertyName = propertyName && propertyName[0].toUpperCase() + propertyName.slice(1);
        objectPropertyChangeDescriptors[key] = {
            willChangeListeners: {
                current: [],
                active: [],
                specificHandlerMethodName: "handle" + propertyName + "WillChange",
                genericHandlerMethodName: "handlePropertyWillChange"
            },
            changeListeners: {
                current: [],
                active: [],
                specificHandlerMethodName: "handle" + propertyName + "Change",
                genericHandlerMethodName: "handlePropertyChange"
            }
        };
    }
    return objectPropertyChangeDescriptors[key];
};

PropertyChanges.prototype.hasOwnPropertyChangeDescriptor = function (key) {
    if (!this.__propertyChangeListeners__) {
        return false;
    }
    if (!key) {
        return true;
    }
    var objectPropertyChangeDescriptors = this.__propertyChangeListeners__;
    if (!object_owns.call(objectPropertyChangeDescriptors, key)) {
        return false;
    }
    return true;
};

PropertyChanges.prototype.addOwnPropertyChangeListener = function (key, listener, beforeChange) {
    if (this.makeObservable && !this.isObservable) {
        this.makeObservable(); // particularly for observable arrays, for
        // their length property
    }
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);
    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }
    PropertyChanges.makePropertyObservable(this, key);
    listeners.current.push(listener);

    var self = this;
    return function cancelOwnPropertyChangeListener() {
        PropertyChanges.removeOwnPropertyChangeListener(self, key, listeners.current, beforeChange);
        self = null;
    };
};

PropertyChanges.prototype.addBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.removeOwnPropertyChangeListener = function (key, listener, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.current.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove property change listener: does not exist: property name" + JSON.stringify(key));
    }
    listeners.current.splice(index, 1);
};

PropertyChanges.prototype.removeBeforeOwnPropertyChangeListener = function (key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(this, key, listener, true);
};

PropertyChanges.prototype.dispatchOwnPropertyChange = function (key, value, beforeChange) {
    var descriptor = PropertyChanges.getOwnPropertyChangeDescriptor(this, key);

    if (descriptor.isActive) {
        return;
    }
    descriptor.isActive = true;

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

	if (listeners.length === 0) return;

    try {
        // dispatch to each listener
        dispatchEach.call(this, listeners, key, value);
    } finally {
        descriptor.isActive = false;
    }
};

// Factored out of parent to avoid try/catch deoptimization
function dispatchEach(listeners, key, value) {
    // copy snapshot of current listeners to active listeners
    var active = listeners.active;
    var current = listeners.current;
    var index = active.length = current.length;
    while (index--) {
        active[index] = current[index];
    }
    for (var i = 0, length = active.length; i < length; i++) {
        var listener = active[i];
        if (current.indexOf(listener) < 0) {
			//This is fixing the issue causing a regression in Montage's repetition
            continue;
        }
        var thisp = listener;
        listener = (
            listener[listeners.specificHandlerMethodName] ||
            listener[listeners.genericHandlerMethodName] ||
            listener
        );
        if (!listener.call) {
            throw new Error("No event listener for " + listeners.specificHandlerName + " or " + listeners.genericHandlerName + " or call on " + listener);
        }
        listener.call(thisp, value, key, this);
    }
}

PropertyChanges.prototype.dispatchBeforeOwnPropertyChange = function (key, listener) {
    return PropertyChanges.dispatchOwnPropertyChange(this, key, listener, true);
};

PropertyChanges.prototype.makePropertyObservable = function (key) {
    // arrays are special.  we do not support direct setting of properties
    // on an array.  instead, call .set(index, value).  this is observable.
    // 'length' property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(this)) {
        return;
    }

    if (!Object.isExtensible(this)) {
        throw new Error("Can't make property " + JSON.stringify(key) + " observable on " + this + " because object is not extensible");
    }

    var state;
    if (typeof this.__state__ === "object") {
        state = this.__state__;
    } else {
        state = {};
        if (Object.isExtensible(this)) {
            Object.defineProperty(this, "__state__", {
                value: state,
                writable: true,
                enumerable: false
            });
        }
    }
    state[key] = this[key];

    // memoize overridden property descriptor table
    if (!this.__overriddenPropertyDescriptors__) {
        overriddenPropertyDescriptors = {};
        Object.defineProperty(this, "__overriddenPropertyDescriptors__", {
            value: overriddenPropertyDescriptors,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    var overriddenPropertyDescriptors = this.__overriddenPropertyDescriptors__;

    if (object_owns.call(overriddenPropertyDescriptors, key)) {
        // if we have already recorded an overridden property descriptor,
        // we have already installed the observer, so short-here
        return;
    }

    // walk up the prototype chain to find a property descriptor for
    // the property name
    var overriddenDescriptor;
    var attached = this;
    do {
        overriddenDescriptor = Object.getOwnPropertyDescriptor(attached, key);
        if (overriddenDescriptor) {
            break;
        }
        attached = Object.getPrototypeOf(attached);
    } while (attached);
    // or default to an undefined value
    overriddenDescriptor = overriddenDescriptor || {
        value: undefined,
        enumerable: true,
        writable: true,
        configurable: true
    };

    if (!overriddenDescriptor.configurable) {
        return;
    }

    // memoize the descriptor so we know not to install another layer,
    // and so we can reuse the overridden descriptor when uninstalling
    overriddenPropertyDescriptors[key] = overriddenDescriptor;

    // give up *after* storing the overridden property descriptor so it
    // can be restored by uninstall.  Unwritable properties are
    // silently not overriden.  Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!overriddenDescriptor.writable && !overriddenDescriptor.set) {
        return;
    }

    // TODO reflect current value on a displayed property

    var propertyListener;
    // in both of these new descriptor variants, we reuse the overridden
    // descriptor to either store the current value or apply getters
    // and setters.  this is handy since we can reuse the overridden
    // descriptor if we uninstall the observer.  We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ('value' in overriddenDescriptor) {
        propertyListener = {
            get: function () {
                return overriddenDescriptor.value
            },
            set: function (value) {
                if (value === overriddenDescriptor.value) {
                    return value;
                }
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, overriddenDescriptor.value);
                overriddenDescriptor.value = value;
                state[key] = value;
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    } else { // 'get' or 'set', but not necessarily both
        propertyListener = {
            get: function () {
                if (overriddenDescriptor.get) {
                    return overriddenDescriptor.get.apply(this, arguments);
                }
            },
            set: function (value) {
                var formerValue;

                // get the actual former value if possible
                if (overriddenDescriptor.get) {
                    formerValue = overriddenDescriptor.get.apply(this, arguments);
                }
                // call through to actual setter
                if (overriddenDescriptor.set) {
                    overriddenDescriptor.set.apply(this, arguments)
                }
                // use getter, if possible, to discover whether the set
                // was successful
                if (overriddenDescriptor.get) {
                    value = overriddenDescriptor.get.apply(this, arguments);
                    state[key] = value;
                }
                // if it has not changed, suppress a notification
                if (value === formerValue) {
                    return value;
                }
                PropertyChanges.dispatchBeforeOwnPropertyChange(this, key, formerValue);

                // dispatch the new value: the given value if there is
                // no getter, or the actual value if there is one
                PropertyChanges.dispatchOwnPropertyChange(this, key, value);
                return value;
            },
            enumerable: overriddenDescriptor.enumerable,
            configurable: true
        };
    }

    Object.defineProperty(this, key, propertyListener);
};

// constructor functions

PropertyChanges.getOwnPropertyChangeDescriptor = function (object, key) {
    if (object.getOwnPropertyChangeDescriptor) {
        return object.getOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.getOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.hasOwnPropertyChangeDescriptor = function (object, key) {
    if (object.hasOwnPropertyChangeDescriptor) {
        return object.hasOwnPropertyChangeDescriptor(key);
    } else {
        return PropertyChanges.prototype.hasOwnPropertyChangeDescriptor.call(object, key);
    }
};

PropertyChanges.addOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.addOwnPropertyChangeListener) {
        return object.addOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.addOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.removeOwnPropertyChangeListener = function (object, key, listener, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.removeOwnPropertyChangeListener) {
        return object.removeOwnPropertyChangeListener(key, listener, beforeChange);
    } else {
        return PropertyChanges.prototype.removeOwnPropertyChangeListener.call(object, key, listener, beforeChange);
    }
};

PropertyChanges.dispatchOwnPropertyChange = function (object, key, value, beforeChange) {
    if (!Object.isObject(object)) {
    } else if (object.dispatchOwnPropertyChange) {
        return object.dispatchOwnPropertyChange(key, value, beforeChange);
    } else {
        return PropertyChanges.prototype.dispatchOwnPropertyChange.call(object, key, value, beforeChange);
    }
};

PropertyChanges.addBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.addOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.removeBeforeOwnPropertyChangeListener = function (object, key, listener) {
    return PropertyChanges.removeOwnPropertyChangeListener(object, key, listener, true);
};

PropertyChanges.dispatchBeforeOwnPropertyChange = function (object, key, value) {
    return PropertyChanges.dispatchOwnPropertyChange(object, key, value, true);
};

PropertyChanges.makePropertyObservable = function (object, key) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(key);
    } else {
        return PropertyChanges.prototype.makePropertyObservable.call(object, key);
    }
};


},{"../shim":18}],11:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");
var Dict = require("../dict");

var rangeChangeDescriptors = new WeakMap(); // {isActive, willChangeListeners, changeListeners}

module.exports = RangeChanges;
function RangeChanges() {
    throw new Error("Can't construct. RangeChanges is a mixin.");
}

RangeChanges.prototype.getAllRangeChangeDescriptors = function () {
    if (!rangeChangeDescriptors.has(this)) {
        rangeChangeDescriptors.set(this, Dict());
    }
    return rangeChangeDescriptors.get(this);
};

RangeChanges.prototype.getRangeChangeDescriptor = function (token) {
    var tokenChangeDescriptors = this.getAllRangeChangeDescriptors();
    token = token || "";
    if (!tokenChangeDescriptors.has(token)) {
        tokenChangeDescriptors.set(token, {
            isActive: false,
            changeListeners: [],
            willChangeListeners: []
        });
    }
    return tokenChangeDescriptors.get(token);
};

RangeChanges.prototype.addRangeChangeListener = function (listener, token, beforeChange) {
    // a concession for objects like Array that are not inherently observable
    if (!this.isObservable && this.makeObservable) {
        this.makeObservable();
    }

    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    // even if already registered
    listeners.push(listener);
    Object.defineProperty(this, "dispatchesRangeChanges", {
        value: true,
        writable: true,
        configurable: true,
        enumerable: false
    });

    var self = this;
    return function cancelRangeChangeListener() {
        if (!self) {
            // TODO throw new Error("Range change listener " + JSON.stringify(token) + " has already been canceled");
            return;
        }
        self.removeRangeChangeListener(listener, token, beforeChange);
        self = null;
    };
};

RangeChanges.prototype.removeRangeChangeListener = function (listener, token, beforeChange) {
    var descriptor = this.getRangeChangeDescriptor(token);

    var listeners;
    if (beforeChange) {
        listeners = descriptor.willChangeListeners;
    } else {
        listeners = descriptor.changeListeners;
    }

    var index = listeners.lastIndexOf(listener);
    if (index === -1) {
        throw new Error("Can't remove range change listener: does not exist: token " + JSON.stringify(token));
    }
    listeners.splice(index, 1);
};

RangeChanges.prototype.dispatchRangeChange = function (plus, minus, index, beforeChange) {
    var descriptors = this.getAllRangeChangeDescriptors();
    var changeName = "Range" + (beforeChange ? "WillChange" : "Change");
    descriptors.forEach(function (descriptor, token) {

        if (descriptor.isActive) {
            return;
        } else {
            descriptor.isActive = true;
        }

        // before or after
        var listeners;
        if (beforeChange) {
            listeners = descriptor.willChangeListeners;
        } else {
            listeners = descriptor.changeListeners;
        }

        var tokenName = "handle" + (
            token.slice(0, 1).toUpperCase() +
            token.slice(1)
        ) + changeName;
        // notably, defaults to "handleRangeChange" or "handleRangeWillChange"
        // if token is "" (the default)

        // dispatch each listener
        try {
            listeners.slice().forEach(function (listener) {
                if (listeners.indexOf(listener) < 0) {
                    return;
                }
                if (listener[tokenName]) {
                    listener[tokenName](plus, minus, index, this, beforeChange);
                } else if (listener.call) {
                    listener.call(this, plus, minus, index, this, beforeChange);
                } else {
                    throw new Error("Handler " + listener + " has no method " + tokenName + " and is not callable");
                }
            }, this);
        } finally {
            descriptor.isActive = false;
        }
    }, this);
};

RangeChanges.prototype.addBeforeRangeChangeListener = function (listener, token) {
    return this.addRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.removeBeforeRangeChangeListener = function (listener, token) {
    return this.removeRangeChangeListener(listener, token, true);
};

RangeChanges.prototype.dispatchBeforeRangeChange = function (plus, minus, index) {
    return this.dispatchRangeChange(plus, minus, index, true);
};


},{"../dict":2,"weak-map":12}],12:[function(require,module,exports){
// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Install a leaky WeakMap emulation on platforms that
 * don't provide a built-in one.
 *
 * <p>Assumes that an ES5 platform where, if {@code WeakMap} is
 * already present, then it conforms to the anticipated ES6
 * specification. To run this file on an ES5 or almost ES5
 * implementation where the {@code WeakMap} specification does not
 * quite conform, run <code>repairES5.js</code> first.
 *
 * <p>Even though WeakMapModule is not global, the linter thinks it
 * is, which is why it is in the overrides list below.
 *
 * <p>NOTE: Before using this WeakMap emulation in a non-SES
 * environment, see the note below about hiddenRecord.
 *
 * @author Mark S. Miller
 * @requires crypto, ArrayBuffer, Uint8Array, navigator, console
 * @overrides WeakMap, ses, Proxy
 * @overrides WeakMapModule
 */

/**
 * This {@code WeakMap} emulation is observably equivalent to the
 * ES-Harmony WeakMap, but with leakier garbage collection properties.
 *
 * <p>As with true WeakMaps, in this emulation, a key does not
 * retain maps indexed by that key and (crucially) a map does not
 * retain the keys it indexes. A map by itself also does not retain
 * the values associated with that map.
 *
 * <p>However, the values associated with a key in some map are
 * retained so long as that key is retained and those associations are
 * not overridden. For example, when used to support membranes, all
 * values exported from a given membrane will live for the lifetime
 * they would have had in the absence of an interposed membrane. Even
 * when the membrane is revoked, all objects that would have been
 * reachable in the absence of revocation will still be reachable, as
 * far as the GC can tell, even though they will no longer be relevant
 * to ongoing computation.
 *
 * <p>The API implemented here is approximately the API as implemented
 * in FF6.0a1 and agreed to by MarkM, Andreas Gal, and Dave Herman,
 * rather than the offially approved proposal page. TODO(erights):
 * upgrade the ecmascript WeakMap proposal page to explain this API
 * change and present to EcmaScript committee for their approval.
 *
 * <p>The first difference between the emulation here and that in
 * FF6.0a1 is the presence of non enumerable {@code get___, has___,
 * set___, and delete___} methods on WeakMap instances to represent
 * what would be the hidden internal properties of a primitive
 * implementation. Whereas the FF6.0a1 WeakMap.prototype methods
 * require their {@code this} to be a genuine WeakMap instance (i.e.,
 * an object of {@code [[Class]]} "WeakMap}), since there is nothing
 * unforgeable about the pseudo-internal method names used here,
 * nothing prevents these emulated prototype methods from being
 * applied to non-WeakMaps with pseudo-internal methods of the same
 * names.
 *
 * <p>Another difference is that our emulated {@code
 * WeakMap.prototype} is not itself a WeakMap. A problem with the
 * current FF6.0a1 API is that WeakMap.prototype is itself a WeakMap
 * providing ambient mutability and an ambient communications
 * channel. Thus, if a WeakMap is already present and has this
 * problem, repairES5.js wraps it in a safe wrappper in order to
 * prevent access to this channel. (See
 * PATCH_MUTABLE_FROZEN_WEAKMAP_PROTO in repairES5.js).
 */

/**
 * If this is a full <a href=
 * "http://code.google.com/p/es-lab/wiki/SecureableES5"
 * >secureable ES5</a> platform and the ES-Harmony {@code WeakMap} is
 * absent, install an approximate emulation.
 *
 * <p>If WeakMap is present but cannot store some objects, use our approximate
 * emulation as a wrapper.
 *
 * <p>If this is almost a secureable ES5 platform, then WeakMap.js
 * should be run after repairES5.js.
 *
 * <p>See {@code WeakMap} for documentation of the garbage collection
 * properties of this WeakMap emulation.
 */
(function WeakMapModule() {
  "use strict";

  if (typeof ses !== 'undefined' && ses.ok && !ses.ok()) {
    // already too broken, so give up
    return;
  }

  /**
   * In some cases (current Firefox), we must make a choice betweeen a
   * WeakMap which is capable of using all varieties of host objects as
   * keys and one which is capable of safely using proxies as keys. See
   * comments below about HostWeakMap and DoubleWeakMap for details.
   *
   * This function (which is a global, not exposed to guests) marks a
   * WeakMap as permitted to do what is necessary to index all host
   * objects, at the cost of making it unsafe for proxies.
   *
   * Do not apply this function to anything which is not a genuine
   * fresh WeakMap.
   */
  function weakMapPermitHostObjects(map) {
    // identity of function used as a secret -- good enough and cheap
    if (map.permitHostObjects___) {
      map.permitHostObjects___(weakMapPermitHostObjects);
    }
  }
  if (typeof ses !== 'undefined') {
    ses.weakMapPermitHostObjects = weakMapPermitHostObjects;
  }

  // IE 11 has no Proxy but has a broken WeakMap such that we need to patch
  // it using DoubleWeakMap; this flag tells DoubleWeakMap so.
  var doubleWeakMapCheckSilentFailure = false;

  // Check if there is already a good-enough WeakMap implementation, and if so
  // exit without replacing it.
  if (typeof WeakMap === 'function') {
    var HostWeakMap = WeakMap;
    // There is a WeakMap -- is it good enough?
    if (typeof navigator !== 'undefined' &&
        /Firefox/.test(navigator.userAgent)) {
      // We're now *assuming not*, because as of this writing (2013-05-06)
      // Firefox's WeakMaps have a miscellany of objects they won't accept, and
      // we don't want to make an exhaustive list, and testing for just one
      // will be a problem if that one is fixed alone (as they did for Event).

      // If there is a platform that we *can* reliably test on, here's how to
      // do it:
      //  var problematic = ... ;
      //  var testHostMap = new HostWeakMap();
      //  try {
      //    testHostMap.set(problematic, 1);  // Firefox 20 will throw here
      //    if (testHostMap.get(problematic) === 1) {
      //      return;
      //    }
      //  } catch (e) {}

    } else {
      // IE 11 bug: WeakMaps silently fail to store frozen objects.
      var testMap = new HostWeakMap();
      var testObject = Object.freeze({});
      testMap.set(testObject, 1);
      if (testMap.get(testObject) !== 1) {
        doubleWeakMapCheckSilentFailure = true;
        // Fall through to installing our WeakMap.
      } else {
        module.exports = WeakMap;
        return;
      }
    }
  }

  var hop = Object.prototype.hasOwnProperty;
  var gopn = Object.getOwnPropertyNames;
  var defProp = Object.defineProperty;
  var isExtensible = Object.isExtensible;

  /**
   * Security depends on HIDDEN_NAME being both <i>unguessable</i> and
   * <i>undiscoverable</i> by untrusted code.
   *
   * <p>Given the known weaknesses of Math.random() on existing
   * browsers, it does not generate unguessability we can be confident
   * of.
   *
   * <p>It is the monkey patching logic in this file that is intended
   * to ensure undiscoverability. The basic idea is that there are
   * three fundamental means of discovering properties of an object:
   * The for/in loop, Object.keys(), and Object.getOwnPropertyNames(),
   * as well as some proposed ES6 extensions that appear on our
   * whitelist. The first two only discover enumerable properties, and
   * we only use HIDDEN_NAME to name a non-enumerable property, so the
   * only remaining threat should be getOwnPropertyNames and some
   * proposed ES6 extensions that appear on our whitelist. We monkey
   * patch them to remove HIDDEN_NAME from the list of properties they
   * returns.
   *
   * <p>TODO(erights): On a platform with built-in Proxies, proxies
   * could be used to trap and thereby discover the HIDDEN_NAME, so we
   * need to monkey patch Proxy.create, Proxy.createFunction, etc, in
   * order to wrap the provided handler with the real handler which
   * filters out all traps using HIDDEN_NAME.
   *
   * <p>TODO(erights): Revisit Mike Stay's suggestion that we use an
   * encapsulated function at a not-necessarily-secret name, which
   * uses the Stiegler shared-state rights amplification pattern to
   * reveal the associated value only to the WeakMap in which this key
   * is associated with that value. Since only the key retains the
   * function, the function can also remember the key without causing
   * leakage of the key, so this doesn't violate our general gc
   * goals. In addition, because the name need not be a guarded
   * secret, we could efficiently handle cross-frame frozen keys.
   */
  var HIDDEN_NAME_PREFIX = 'weakmap:';
  var HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'ident:' + Math.random() + '___';

  if (typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function' &&
      typeof ArrayBuffer === 'function' &&
      typeof Uint8Array === 'function') {
    var ab = new ArrayBuffer(25);
    var u8s = new Uint8Array(ab);
    crypto.getRandomValues(u8s);
    HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'rand:' +
      Array.prototype.map.call(u8s, function(u8) {
        return (u8 % 36).toString(36);
      }).join('') + '___';
  }

  function isNotHiddenName(name) {
    return !(
        name.substr(0, HIDDEN_NAME_PREFIX.length) == HIDDEN_NAME_PREFIX &&
        name.substr(name.length - 3) === '___');
  }

  /**
   * Monkey patch getOwnPropertyNames to avoid revealing the
   * HIDDEN_NAME.
   *
   * <p>The ES5.1 spec requires each name to appear only once, but as
   * of this writing, this requirement is controversial for ES6, so we
   * made this code robust against this case. If the resulting extra
   * search turns out to be expensive, we can probably relax this once
   * ES6 is adequately supported on all major browsers, iff no browser
   * versions we support at that time have relaxed this constraint
   * without providing built-in ES6 WeakMaps.
   */
  defProp(Object, 'getOwnPropertyNames', {
    value: function fakeGetOwnPropertyNames(obj) {
      return gopn(obj).filter(isNotHiddenName);
    }
  });

  /**
   * getPropertyNames is not in ES5 but it is proposed for ES6 and
   * does appear in our whitelist, so we need to clean it too.
   */
  if ('getPropertyNames' in Object) {
    var originalGetPropertyNames = Object.getPropertyNames;
    defProp(Object, 'getPropertyNames', {
      value: function fakeGetPropertyNames(obj) {
        return originalGetPropertyNames(obj).filter(isNotHiddenName);
      }
    });
  }

  /**
   * <p>To treat objects as identity-keys with reasonable efficiency
   * on ES5 by itself (i.e., without any object-keyed collections), we
   * need to add a hidden property to such key objects when we
   * can. This raises several issues:
   * <ul>
   * <li>Arranging to add this property to objects before we lose the
   *     chance, and
   * <li>Hiding the existence of this new property from most
   *     JavaScript code.
   * <li>Preventing <i>certification theft</i>, where one object is
   *     created falsely claiming to be the key of an association
   *     actually keyed by another object.
   * <li>Preventing <i>value theft</i>, where untrusted code with
   *     access to a key object but not a weak map nevertheless
   *     obtains access to the value associated with that key in that
   *     weak map.
   * </ul>
   * We do so by
   * <ul>
   * <li>Making the name of the hidden property unguessable, so "[]"
   *     indexing, which we cannot intercept, cannot be used to access
   *     a property without knowing the name.
   * <li>Making the hidden property non-enumerable, so we need not
   *     worry about for-in loops or {@code Object.keys},
   * <li>monkey patching those reflective methods that would
   *     prevent extensions, to add this hidden property first,
   * <li>monkey patching those methods that would reveal this
   *     hidden property.
   * </ul>
   * Unfortunately, because of same-origin iframes, we cannot reliably
   * add this hidden property before an object becomes
   * non-extensible. Instead, if we encounter a non-extensible object
   * without a hidden record that we can detect (whether or not it has
   * a hidden record stored under a name secret to us), then we just
   * use the key object itself to represent its identity in a brute
   * force leaky map stored in the weak map, losing all the advantages
   * of weakness for these.
   */
  function getHiddenRecord(key) {
    if (key !== Object(key)) {
      throw new TypeError('Not an object: ' + key);
    }
    var hiddenRecord = key[HIDDEN_NAME];
    if (hiddenRecord && hiddenRecord.key === key) { return hiddenRecord; }
    if (!isExtensible(key)) {
      // Weak map must brute force, as explained in doc-comment above.
      return void 0;
    }

    // The hiddenRecord and the key point directly at each other, via
    // the "key" and HIDDEN_NAME properties respectively. The key
    // field is for quickly verifying that this hidden record is an
    // own property, not a hidden record from up the prototype chain.
    //
    // NOTE: Because this WeakMap emulation is meant only for systems like
    // SES where Object.prototype is frozen without any numeric
    // properties, it is ok to use an object literal for the hiddenRecord.
    // This has two advantages:
    // * It is much faster in a performance critical place
    // * It avoids relying on Object.create(null), which had been
    //   problematic on Chrome 28.0.1480.0. See
    //   https://code.google.com/p/google-caja/issues/detail?id=1687
    hiddenRecord = { key: key };

    // When using this WeakMap emulation on platforms where
    // Object.prototype might not be frozen and Object.create(null) is
    // reliable, use the following two commented out lines instead.
    // hiddenRecord = Object.create(null);
    // hiddenRecord.key = key;

    // Please contact us if you need this to work on platforms where
    // Object.prototype might not be frozen and
    // Object.create(null) might not be reliable.

    try {
      defProp(key, HIDDEN_NAME, {
        value: hiddenRecord,
        writable: false,
        enumerable: false,
        configurable: false
      });
      return hiddenRecord;
    } catch (error) {
      // Under some circumstances, isExtensible seems to misreport whether
      // the HIDDEN_NAME can be defined.
      // The circumstances have not been isolated, but at least affect
      // Node.js v0.10.26 on TravisCI / Linux, but not the same version of
      // Node.js on OS X.
      return void 0;
    }
  }

  /**
   * Monkey patch operations that would make their argument
   * non-extensible.
   *
   * <p>The monkey patched versions throw a TypeError if their
   * argument is not an object, so it should only be done to functions
   * that should throw a TypeError anyway if their argument is not an
   * object.
   */
  (function(){
    var oldFreeze = Object.freeze;
    defProp(Object, 'freeze', {
      value: function identifyingFreeze(obj) {
        getHiddenRecord(obj);
        return oldFreeze(obj);
      }
    });
    var oldSeal = Object.seal;
    defProp(Object, 'seal', {
      value: function identifyingSeal(obj) {
        getHiddenRecord(obj);
        return oldSeal(obj);
      }
    });
    var oldPreventExtensions = Object.preventExtensions;
    defProp(Object, 'preventExtensions', {
      value: function identifyingPreventExtensions(obj) {
        getHiddenRecord(obj);
        return oldPreventExtensions(obj);
      }
    });
  })();

  function constFunc(func) {
    func.prototype = null;
    return Object.freeze(func);
  }

  var calledAsFunctionWarningDone = false;
  function calledAsFunctionWarning() {
    // Future ES6 WeakMap is currently (2013-09-10) expected to reject WeakMap()
    // but we used to permit it and do it ourselves, so warn only.
    if (!calledAsFunctionWarningDone && typeof console !== 'undefined') {
      calledAsFunctionWarningDone = true;
      console.warn('WeakMap should be invoked as new WeakMap(), not ' +
          'WeakMap(). This will be an error in the future.');
    }
  }

  var nextId = 0;

  var OurWeakMap = function() {
    if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
      calledAsFunctionWarning();
    }

    // We are currently (12/25/2012) never encountering any prematurely
    // non-extensible keys.
    var keys = []; // brute force for prematurely non-extensible keys.
    var values = []; // brute force for corresponding values.
    var id = nextId++;

    function get___(key, opt_default) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord ? hiddenRecord[id] : opt_default;
      } else {
        index = keys.indexOf(key);
        return index >= 0 ? values[index] : opt_default;
      }
    }

    function has___(key) {
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord;
      } else {
        return keys.indexOf(key) >= 0;
      }
    }

    function set___(key, value) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        hiddenRecord[id] = value;
      } else {
        index = keys.indexOf(key);
        if (index >= 0) {
          values[index] = value;
        } else {
          // Since some browsers preemptively terminate slow turns but
          // then continue computing with presumably corrupted heap
          // state, we here defensively get keys.length first and then
          // use it to update both the values and keys arrays, keeping
          // them in sync.
          index = keys.length;
          values[index] = value;
          // If we crash here, values will be one longer than keys.
          keys[index] = key;
        }
      }
      return this;
    }

    function delete___(key) {
      var hiddenRecord = getHiddenRecord(key);
      var index, lastIndex;
      if (hiddenRecord) {
        return id in hiddenRecord && delete hiddenRecord[id];
      } else {
        index = keys.indexOf(key);
        if (index < 0) {
          return false;
        }
        // Since some browsers preemptively terminate slow turns but
        // then continue computing with potentially corrupted heap
        // state, we here defensively get keys.length first and then use
        // it to update both the keys and the values array, keeping
        // them in sync. We update the two with an order of assignments,
        // such that any prefix of these assignments will preserve the
        // key/value correspondence, either before or after the delete.
        // Note that this needs to work correctly when index === lastIndex.
        lastIndex = keys.length - 1;
        keys[index] = void 0;
        // If we crash here, there's a void 0 in the keys array, but
        // no operation will cause a "keys.indexOf(void 0)", since
        // getHiddenRecord(void 0) will always throw an error first.
        values[index] = values[lastIndex];
        // If we crash here, values[index] cannot be found here,
        // because keys[index] is void 0.
        keys[index] = keys[lastIndex];
        // If index === lastIndex and we crash here, then keys[index]
        // is still void 0, since the aliasing killed the previous key.
        keys.length = lastIndex;
        // If we crash here, keys will be one shorter than values.
        values.length = lastIndex;
        return true;
      }
    }

    return Object.create(OurWeakMap.prototype, {
      get___:    { value: constFunc(get___) },
      has___:    { value: constFunc(has___) },
      set___:    { value: constFunc(set___) },
      delete___: { value: constFunc(delete___) }
    });
  };

  OurWeakMap.prototype = Object.create(Object.prototype, {
    get: {
      /**
       * Return the value most recently associated with key, or
       * opt_default if none.
       */
      value: function get(key, opt_default) {
        return this.get___(key, opt_default);
      },
      writable: true,
      configurable: true
    },

    has: {
      /**
       * Is there a value associated with key in this WeakMap?
       */
      value: function has(key) {
        return this.has___(key);
      },
      writable: true,
      configurable: true
    },

    set: {
      /**
       * Associate value with key in this WeakMap, overwriting any
       * previous association if present.
       */
      value: function set(key, value) {
        return this.set___(key, value);
      },
      writable: true,
      configurable: true
    },

    'delete': {
      /**
       * Remove any association for key in this WeakMap, returning
       * whether there was one.
       *
       * <p>Note that the boolean return here does not work like the
       * {@code delete} operator. The {@code delete} operator returns
       * whether the deletion succeeds at bringing about a state in
       * which the deleted property is absent. The {@code delete}
       * operator therefore returns true if the property was already
       * absent, whereas this {@code delete} method returns false if
       * the association was already absent.
       */
      value: function remove(key) {
        return this.delete___(key);
      },
      writable: true,
      configurable: true
    }
  });

  if (typeof HostWeakMap === 'function') {
    (function() {
      // If we got here, then the platform has a WeakMap but we are concerned
      // that it may refuse to store some key types. Therefore, make a map
      // implementation which makes use of both as possible.

      // In this mode we are always using double maps, so we are not proxy-safe.
      // This combination does not occur in any known browser, but we had best
      // be safe.
      if (doubleWeakMapCheckSilentFailure && typeof Proxy !== 'undefined') {
        Proxy = undefined;
      }

      function DoubleWeakMap() {
        if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
          calledAsFunctionWarning();
        }

        // Preferable, truly weak map.
        var hmap = new HostWeakMap();

        // Our hidden-property-based pseudo-weak-map. Lazily initialized in the
        // 'set' implementation; thus we can avoid performing extra lookups if
        // we know all entries actually stored are entered in 'hmap'.
        var omap = undefined;

        // Hidden-property maps are not compatible with proxies because proxies
        // can observe the hidden name and either accidentally expose it or fail
        // to allow the hidden property to be set. Therefore, we do not allow
        // arbitrary WeakMaps to switch to using hidden properties, but only
        // those which need the ability, and unprivileged code is not allowed
        // to set the flag.
        //
        // (Except in doubleWeakMapCheckSilentFailure mode in which case we
        // disable proxies.)
        var enableSwitching = false;

        function dget(key, opt_default) {
          if (omap) {
            return hmap.has(key) ? hmap.get(key)
                : omap.get___(key, opt_default);
          } else {
            return hmap.get(key, opt_default);
          }
        }

        function dhas(key) {
          return hmap.has(key) || (omap ? omap.has___(key) : false);
        }

        var dset;
        if (doubleWeakMapCheckSilentFailure) {
          dset = function(key, value) {
            hmap.set(key, value);
            if (!hmap.has(key)) {
              if (!omap) { omap = new OurWeakMap(); }
              omap.set(key, value);
            }
            return this;
          };
        } else {
          dset = function(key, value) {
            if (enableSwitching) {
              try {
                hmap.set(key, value);
              } catch (e) {
                if (!omap) { omap = new OurWeakMap(); }
                omap.set___(key, value);
              }
            } else {
              hmap.set(key, value);
            }
            return this;
          };
        }

        function ddelete(key) {
          var result = !!hmap['delete'](key);
          if (omap) { return omap.delete___(key) || result; }
          return result;
        }

        return Object.create(OurWeakMap.prototype, {
          get___:    { value: constFunc(dget) },
          has___:    { value: constFunc(dhas) },
          set___:    { value: constFunc(dset) },
          delete___: { value: constFunc(ddelete) },
          permitHostObjects___: { value: constFunc(function(token) {
            if (token === weakMapPermitHostObjects) {
              enableSwitching = true;
            } else {
              throw new Error('bogus call to permitHostObjects___');
            }
          })}
        });
      }
      DoubleWeakMap.prototype = OurWeakMap.prototype;
      module.exports = DoubleWeakMap;

      // define .constructor to hide OurWeakMap ctor
      Object.defineProperty(WeakMap.prototype, 'constructor', {
        value: WeakMap,
        enumerable: false,  // as default .constructor is
        configurable: true,
        writable: true
      });
    })();
  } else {
    // There is no host WeakMap, so we must use the emulation.

    // Emulated WeakMaps are incompatible with native proxies (because proxies
    // can observe the hidden name), so we must disable Proxy usage (in
    // ArrayLike and Domado, currently).
    if (typeof Proxy !== 'undefined') {
      Proxy = undefined;
    }

    module.exports = OurWeakMap;
  }
})();

},{}],13:[function(require,module,exports){
"use strict";

var Shim = require("./shim");
var List = require("./list");
var FastSet = require("./fast-set");
var GenericCollection = require("./generic-collection");
var GenericSet = require("./generic-set");
var PropertyChanges = require("./listen/property-changes");
var RangeChanges = require("./listen/range-changes");

module.exports = Set;

function Set(values, equals, hash, getDefault) {
    if (!(this instanceof Set)) {
        return new Set(values, equals, hash, getDefault);
    }
    equals = equals || Object.equals;
    hash = hash || Object.hash;
    getDefault = getDefault || Function.noop;
    this.contentEquals = equals;
    this.contentHash = hash;
    this.getDefault = getDefault;
    // a list of values in insertion order, used for all operations that depend
    // on iterating in insertion order
    this.order = new this.Order(undefined, equals);
    // a set of nodes from the order list, indexed by the corresponding value,
    // used for all operations that need to quickly seek  value in the list
    this.store = new this.Store(
        undefined,
        function (a, b) {
            return equals(a.value, b.value);
        },
        function (node) {
            return hash(node.value);
        }
    );
    this.length = 0;
    this.addEach(values);
}

Set.Set = Set; // hack so require("set").Set will work in MontageJS

Object.addEach(Set.prototype, GenericCollection.prototype);
Object.addEach(Set.prototype, GenericSet.prototype);
Object.addEach(Set.prototype, PropertyChanges.prototype);
Object.addEach(Set.prototype, RangeChanges.prototype);

Set.prototype.Order = List;
Set.prototype.Store = FastSet;

Set.prototype.constructClone = function (values) {
    return new this.constructor(values, this.contentEquals, this.contentHash, this.getDefault);
};

Set.prototype.has = function (value) {
    var node = new this.order.Node(value);
    return this.store.has(node);
};

Set.prototype.get = function (value, equals) {
    if (equals) {
        throw new Error("Set#get does not support second argument: equals");
    }
    var node = new this.order.Node(value);
    node = this.store.get(node);
    if (node) {
        return node.value;
    } else {
        return this.getDefault(value);
    }
};

Set.prototype.add = function (value) {
    var node = new this.order.Node(value);
    if (!this.store.has(node)) {
        var index = this.length;
        if (this.dispatchesRangeChanges) {
            this.dispatchBeforeRangeChange([value], [], index);
        }
        this.order.add(value);
        node = this.order.head.prev;
        this.store.add(node);
        this.length++;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([value], [], index);
        }
        return true;
    }
    return false;
};

Set.prototype["delete"] = function (value, equals) {
    if (equals) {
        throw new Error("Set#delete does not support second argument: equals");
    }
    var node = new this.order.Node(value);
    if (this.store.has(node)) {
        node = this.store.get(node);
        if (this.dispatchesRangeChanges) {
            this.dispatchBeforeRangeChange([], [value], node.index);
        }
        this.store["delete"](node); // removes from the set
        this.order.splice(node, 1); // removes the node from the list
        this.length--;
        if (this.dispatchesRangeChanges) {
            this.dispatchRangeChange([], [value], node.index);
        }
        return true;
    }
    return false;
};

Set.prototype.pop = function () {
    if (this.length) {
        var result = this.order.head.prev.value;
        this["delete"](result);
        return result;
    }
};

Set.prototype.shift = function () {
    if (this.length) {
        var result = this.order.head.next.value;
        this["delete"](result);
        return result;
    }
};

Set.prototype.one = function () {
    if (this.length > 0) {
        return this.store.one().value;
    }
};

Set.prototype.clear = function () {
    var clearing;
    if (this.dispatchesRangeChanges) {
        clearing = this.toArray();
        this.dispatchBeforeRangeChange([], clearing, 0);
    }
    this.store.clear();
    this.order.clear();
    this.length = 0;
    if (this.dispatchesRangeChanges) {
        this.dispatchRangeChange([], clearing, 0);
    }
};

Set.prototype.reduce = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.order;
    var index = 0;
    return list.reduce(function (basis, value) {
        return callback.call(thisp, basis, value, index++, this);
    }, basis, this);
};

Set.prototype.reduceRight = function (callback, basis /*, thisp*/) {
    var thisp = arguments[2];
    var list = this.order;
    var index = this.length - 1;
    return list.reduceRight(function (basis, value) {
        return callback.call(thisp, basis, value, index--, this);
    }, basis, this);
};

Set.prototype.iterate = function () {
    return this.order.iterate();
};

Set.prototype.log = function () {
    var set = this.store;
    return set.log.apply(set, arguments);
};

Set.prototype.makeObservable = function () {
    this.order.makeObservable();
};


},{"./fast-set":3,"./generic-collection":4,"./generic-set":7,"./list":8,"./listen/property-changes":10,"./listen/range-changes":11,"./shim":18}],14:[function(require,module,exports){
"use strict";

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

var Function = require("./shim-function");
var GenericCollection = require("./generic-collection");
var GenericOrder = require("./generic-order");
var WeakMap = require("weak-map");

module.exports = Array;

var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;

Array.empty = [];

if (Object.freeze) {
    Object.freeze(Array.empty);
}

Array.from = function (values) {
    var array = [];
    array.addEach(values);
    return array;
};

Array.unzip = function (table) {
    var transpose = [];
    var length = Infinity;
    // compute shortest row
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        table[i] = row.toArray();
        if (row.length < length) {
            length = row.length;
        }
    }
    for (var i = 0; i < table.length; i++) {
        var row = table[i];
        for (var j = 0; j < row.length; j++) {
            if (j < length && j in row) {
                transpose[j] = transpose[j] || [];
                transpose[j][i] = row[j];
            }
        }
    }
    return transpose;
};

function define(key, value) {
    Object.defineProperty(Array.prototype, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

define("addEach", GenericCollection.prototype.addEach);
define("deleteEach", GenericCollection.prototype.deleteEach);
define("toArray", GenericCollection.prototype.toArray);
define("toObject", GenericCollection.prototype.toObject);
define("all", GenericCollection.prototype.all);
define("any", GenericCollection.prototype.any);
define("min", GenericCollection.prototype.min);
define("max", GenericCollection.prototype.max);
define("sum", GenericCollection.prototype.sum);
define("average", GenericCollection.prototype.average);
define("only", GenericCollection.prototype.only);
define("flatten", GenericCollection.prototype.flatten);
define("zip", GenericCollection.prototype.zip);
define("enumerate", GenericCollection.prototype.enumerate);
define("group", GenericCollection.prototype.group);
define("sorted", GenericCollection.prototype.sorted);
define("reversed", GenericCollection.prototype.reversed);

define("constructClone", function (values) {
    var clone = new this.constructor();
    clone.addEach(values);
    return clone;
});

define("has", function (value, equals) {
    return this.find(value, equals) !== -1;
});

define("get", function (index, defaultValue) {
    if (+index !== index)
        throw new Error("Indicies must be numbers");
    if (!index in this) {
        return defaultValue;
    } else {
        return this[index];
    }
});

define("set", function (index, value) {
    this[index] = value;
    return true;
});

define("add", function (value) {
    this.push(value);
    return true;
});

define("delete", function (value, equals) {
    var index = this.find(value, equals);
    if (index !== -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
});

define("deleteAll", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var count = 0;
    for (var index = 0; index < this.length;) {
        if (equals(value, this[index])) {
            this.swap(index, 1);
            count++;
        } else {
            index++;
        }
    }
    return count;
});

define("find", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    for (var index = 0; index < this.length; index++) {
        if (index in this && equals(value, this[index])) {
            return index;
        }
    }
    return -1;
});

define("findLast", function (value, equals) {
    equals = equals || this.contentEquals || Object.equals;
    var index = this.length;
    do {
        index--;
        if (index in this && equals(this[index], value)) {
            return index;
        }
    } while (index > 0);
    return -1;
});

define("swap", function (start, length, plus) {
    var args, plusLength, i, j, returnValue;
    if (start > this.length) {
        this.length = start;
    }
    if (typeof plus !== "undefined") {
        args = [start, length];
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
        i = 0;
        plusLength = plus.length;
        // 1000 is a magic number, presumed to be smaller than the remaining
        // stack length. For swaps this small, we take the fast path and just
        // use the underlying Array splice. We could measure the exact size of
        // the remaining stack using a try/catch around an unbounded recursive
        // function, but this would defeat the purpose of short-circuiting in
        // the common case.
        if (plusLength < 1000) {
            for (i; i < plusLength; i++) {
                args[i+2] = plus[i];
            }
            return array_splice.apply(this, args);
        } else {
            // Avoid maximum call stack error.
            // First delete the desired entries.
            returnValue = array_splice.apply(this, args);
            // Second batch in 1000s.
            for (i; i < plusLength;) {
                args = [start+i, 0];
                for (j = 2; j < 1002 && i < plusLength; j++, i++) {
                    args[j] = plus[i];
                }
                array_splice.apply(this, args);
            }
            return returnValue;
        }
    // using call rather than apply to cut down on transient objects
    } else if (typeof length !== "undefined") {
        return array_splice.call(this, start, length);
    }  else if (typeof start !== "undefined") {
        return array_splice.call(this, start);
    } else {
        return [];
    }
});

define("peek", function () {
    return this[0];
});

define("poke", function (value) {
    if (this.length > 0) {
        this[0] = value;
    }
});

define("peekBack", function () {
    if (this.length > 0) {
        return this[this.length - 1];
    }
});

define("pokeBack", function (value) {
    if (this.length > 0) {
        this[this.length - 1] = value;
    }
});

define("one", function () {
    for (var i in this) {
        if (Object.owns(this, i)) {
            return this[i];
        }
    }
});

if (!Array.prototype.clear) {
    define("clear", function () {
        this.length = 0;
        return this;
    });
}

define("compare", function (that, compare) {
    compare = compare || Object.compare;
    var i;
    var length;
    var lhs;
    var rhs;
    var relative;

    if (this === that) {
        return 0;
    }

    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.compare.call(this, that, compare);
    }

    length = Math.min(this.length, that.length);

    for (i = 0; i < length; i++) {
        if (i in this) {
            if (!(i in that)) {
                return -1;
            } else {
                lhs = this[i];
                rhs = that[i];
                relative = compare(lhs, rhs);
                if (relative) {
                    return relative;
                }
            }
        } else if (i in that) {
            return 1;
        }
    }

    return this.length - that.length;
});

define("equals", function (that, equals) {
    equals = equals || Object.equals;
    var i = 0;
    var length = this.length;
    var left;
    var right;

    if (this === that) {
        return true;
    }
    if (!that || !Array.isArray(that)) {
        return GenericOrder.prototype.equals.call(this, that);
    }

    if (length !== that.length) {
        return false;
    } else {
        for (; i < length; ++i) {
            if (i in this) {
                if (!(i in that)) {
                    return false;
                }
                left = this[i];
                right = that[i];
                if (!equals(left, right)) {
                    return false;
                }
            } else {
                if (i in that) {
                    return false;
                }
            }
        }
    }
    return true;
});

define("clone", function (depth, memo) {
    if (depth == null) {
        depth = Infinity;
    } else if (depth === 0) {
        return this;
    }
    memo = memo || new WeakMap();
    if (memo.has(this)) {
        return memo.get(this);
    }
    var clone = new Array(this.length);
    memo.set(this, clone);
    for (var i in this) {
        clone[i] = Object.clone(this[i], depth - 1, memo);
    };
    return clone;
});

define("iterate", function (start, end) {
    return new ArrayIterator(this, start, end);
});

define("Iterator", ArrayIterator);

function ArrayIterator(array, start, end) {
    this.array = array;
    this.start = start == null ? 0 : start;
    this.end = end;
};

ArrayIterator.prototype.next = function () {
    if (this.start === (this.end == null ? this.array.length : this.end)) {
        throw StopIteration;
    } else {
        return this.array[this.start++];
    }
};


},{"./generic-collection":4,"./generic-order":6,"./shim-function":15,"weak-map":12}],15:[function(require,module,exports){

module.exports = Function;

/**
    A utility to reduce unnecessary allocations of <code>function () {}</code>
    in its many colorful variations.  It does nothing and returns
    <code>undefined</code> thus makes a suitable default in some circumstances.

    @function external:Function.noop
*/
Function.noop = function () {
};

/**
    A utility to reduce unnecessary allocations of <code>function (x) {return
    x}</code> in its many colorful but ultimately wasteful parameter name
    variations.

    @function external:Function.identity
    @param {Any} any value
    @returns {Any} that value
*/
Function.identity = function (value) {
    return value;
};

/**
    A utility for creating a comparator function for a particular aspect of a
    figurative class of objects.

    @function external:Function.by
    @param {Function} relation A function that accepts a value and returns a
    corresponding value to use as a representative when sorting that object.
    @param {Function} compare an alternate comparator for comparing the
    represented values.  The default is <code>Object.compare</code>, which
    does a deep, type-sensitive, polymorphic comparison.
    @returns {Function} a comparator that has been annotated with
    <code>by</code> and <code>compare</code> properties so
    <code>sorted</code> can perform a transform that reduces the need to call
    <code>by</code> on each sorted object to just once.
 */
Function.by = function (by , compare) {
    compare = compare || Object.compare;
    by = by || Function.identity;
    var compareBy = function (a, b) {
        return compare(by(a), by(b));
    };
    compareBy.compare = compare;
    compareBy.by = by;
    return compareBy;
};

// TODO document
Function.get = function (key) {
    return function (object) {
        return Object.get(object, key);
    };
};


},{}],16:[function(require,module,exports){
"use strict";

var WeakMap = require("weak-map");

module.exports = Object;

/*
    Based in part on extras from Motorola Mobility’s Montage
    Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
    3-Clause BSD License
    https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
*/

/**
    Defines extensions to intrinsic <code>Object</code>.
    @see [Object class]{@link external:Object}
*/

/**
    A utility object to avoid unnecessary allocations of an empty object
    <code>{}</code>.  This object is frozen so it is safe to share.

    @object external:Object.empty
*/
Object.empty = Object.freeze(Object.create(null));

/**
    Returns whether the given value is an object, as opposed to a value.
    Unboxed numbers, strings, true, false, undefined, and null are not
    objects.  Arrays are objects.

    @function external:Object.isObject
    @param {Any} value
    @returns {Boolean} whether the given value is an object
*/
Object.isObject = function (object) {
    return Object(object) === object;
};

/**
    Returns the value of an any value, particularly objects that
    implement <code>valueOf</code>.

    <p>Note that, unlike the precedent of methods like
    <code>Object.equals</code> and <code>Object.compare</code> would suggest,
    this method is named <code>Object.getValueOf</code> instead of
    <code>valueOf</code>.  This is a delicate issue, but the basis of this
    decision is that the JavaScript runtime would be far more likely to
    accidentally call this method with no arguments, assuming that it would
    return the value of <code>Object</code> itself in various situations,
    whereas <code>Object.equals(Object, null)</code> protects against this case
    by noting that <code>Object</code> owns the <code>equals</code> property
    and therefore does not delegate to it.

    @function external:Object.getValueOf
    @param {Any} value a value or object wrapping a value
    @returns {Any} the primitive value of that object, if one exists, or passes
    the value through
*/
Object.getValueOf = function (value) {
    if (value && typeof value.valueOf === "function") {
        value = value.valueOf();
    }
    return value;
};

var hashMap = new WeakMap();
Object.hash = function (object) {
    if (object && typeof object.hash === "function") {
        return "" + object.hash();
    } else if (Object(object) === object) {
        if (!hashMap.has(object)) {
            hashMap.set(object, Math.random().toString(36).slice(2));
        }
        return hashMap.get(object);
    } else {
        return "" + object;
    }
};

/**
    A shorthand for <code>Object.prototype.hasOwnProperty.call(object,
    key)</code>.  Returns whether the object owns a property for the given key.
    It does not consult the prototype chain and works for any string (including
    "hasOwnProperty") except "__proto__".

    @function external:Object.owns
    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object owns a property wfor the given key.
*/
var owns = Object.prototype.hasOwnProperty;
Object.owns = function (object, key) {
    return owns.call(object, key);
};

/**
    A utility that is like Object.owns but is also useful for finding
    properties on the prototype chain, provided that they do not refer to
    methods on the Object prototype.  Works for all strings except "__proto__".

    <p>Alternately, you could use the "in" operator as long as the object
    descends from "null" instead of the Object.prototype, as with
    <code>Object.create(null)</code>.  However,
    <code>Object.create(null)</code> only works in fully compliant EcmaScript 5
    JavaScript engines and cannot be faithfully shimmed.

    <p>If the given object is an instance of a type that implements a method
    named "has", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the instance.

    @param {Object} object
    @param {String} key
    @returns {Boolean} whether the object, or any of its prototypes except
    <code>Object.prototype</code>
    @function external:Object.has
*/
Object.has = function (object, key) {
    if (typeof object !== "object") {
        throw new Error("Object.has can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "has"
    if (object && typeof object.has === "function") {
        return object.has(key);
    // otherwise report whether the key is on the prototype chain,
    // as long as it is not one of the methods on object.prototype
    } else if (typeof key === "string") {
        return key in object && object[key] !== Object.prototype[key];
    } else {
        throw new Error("Key must be a string for Object.has on plain objects");
    }
};

/**
    Gets the value for a corresponding key from an object.

    <p>Uses Object.has to determine whether there is a corresponding value for
    the given key.  As such, <code>Object.get</code> is capable of retriving
    values from the prototype chain as long as they are not from the
    <code>Object.prototype</code>.

    <p>If there is no corresponding value, returns the given default, which may
    be <code>undefined</code>.

    <p>If the given object is an instance of a type that implements a method
    named "get", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  In that
    case, the domain of the key depends on the implementation.  For a `Map`,
    for example, the key might be any object.

    @param {Object} object
    @param {String} key
    @param {Any} value a default to return, <code>undefined</code> if omitted
    @returns {Any} value for key, or default value
    @function external:Object.get
*/
Object.get = function (object, key, value) {
    if (typeof object !== "object") {
        throw new Error("Object.get can't accept non-object: " + typeof object);
    }
    // forward to mapped collections that implement "get"
    if (object && typeof object.get === "function") {
        return object.get(key, value);
    } else if (Object.has(object, key)) {
        return object[key];
    } else {
        return value;
    }
};

/**
    Sets the value for a given key on an object.

    <p>If the given object is an instance of a type that implements a method
    named "set", this function defers to the collection, so this method can be
    used to generically handle objects, arrays, or other collections.  As such,
    the key domain varies by the object type.

    @param {Object} object
    @param {String} key
    @param {Any} value
    @returns <code>undefined</code>
    @function external:Object.set
*/
Object.set = function (object, key, value) {
    if (object && typeof object.set === "function") {
        object.set(key, value);
    } else {
        object[key] = value;
    }
};

Object.addEach = function (target, source) {
    if (!source) {
    } else if (typeof source.forEach === "function" && !source.hasOwnProperty("forEach")) {
        // copy map-alikes
        if (source.isMap === true) {
            source.forEach(function (value, key) {
                target[key] = value;
            });
        // iterate key value pairs of other iterables
        } else {
            source.forEach(function (pair) {
                target[pair[0]] = pair[1];
            });
        }
    } else if (typeof source.length === "number") {
        // arguments, strings
        for (var index = 0; index < source.length; index++) {
            target[index] = source[index];
        }
    } else {
        // copy other objects as map-alikes
        Object.keys(source).forEach(function (key) {
            target[key] = source[key];
        });
    }
    return target;
};

/**
    Iterates over the owned properties of an object.

    @function external:Object.forEach
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
*/
Object.forEach = function (object, callback, thisp) {
    Object.keys(object).forEach(function (key) {
        callback.call(thisp, object[key], key, object);
    });
};

/**
    Iterates over the owned properties of a map, constructing a new array of
    mapped values.

    @function external:Object.map
    @param {Object} object an object to iterate.
    @param {Function} callback a function to call for every key and value
    pair in the object.  Receives <code>value</code>, <code>key</code>,
    and <code>object</code> as arguments.
    @param {Object} thisp the <code>this</code> to pass through to the
    callback
    @returns {Array} the respective values returned by the callback for each
    item in the object.
*/
Object.map = function (object, callback, thisp) {
    return Object.keys(object).map(function (key) {
        return callback.call(thisp, object[key], key, object);
    });
};

/**
    Returns the values for owned properties of an object.

    @function external:Object.map
    @param {Object} object
    @returns {Array} the respective value for each owned property of the
    object.
*/
Object.values = function (object) {
    return Object.map(object, Function.identity);
};

// TODO inline document concat
Object.concat = function () {
    var object = {};
    for (var i = 0; i < arguments.length; i++) {
        Object.addEach(object, arguments[i]);
    }
    return object;
};

Object.from = Object.concat;

/**
    Returns whether two values are identical.  Any value is identical to itself
    and only itself.  This is much more restictive than equivalence and subtly
    different than strict equality, <code>===</code> because of edge cases
    including negative zero and <code>NaN</code>.  Identity is useful for
    resolving collisions among keys in a mapping where the domain is any value.
    This method does not delgate to any method on an object and cannot be
    overridden.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:egal
    @param {Any} this
    @param {Any} that
    @returns {Boolean} whether this and that are identical
    @function external:Object.is
*/
Object.is = function (x, y) {
    if (x === y) {
        // 0 === -0, but they are not identical
        return x !== 0 || 1 / x === 1 / y;
    }
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return x !== x && y !== y;
};

/**
    Performs a polymorphic, type-sensitive deep equivalence comparison of any
    two values.

    <p>As a basic principle, any value is equivalent to itself (as in
    identity), any boxed version of itself (as a <code>new Number(10)</code> is
    to 10), and any deep clone of itself.

    <p>Equivalence has the following properties:

    <ul>
        <li><strong>polymorphic:</strong>
            If the given object is an instance of a type that implements a
            methods named "equals", this function defers to the method.  So,
            this function can safely compare any values regardless of type,
            including undefined, null, numbers, strings, any pair of objects
            where either implements "equals", or object literals that may even
            contain an "equals" key.
        <li><strong>type-sensitive:</strong>
            Incomparable types are not equal.  No object is equivalent to any
            array.  No string is equal to any other number.
        <li><strong>deep:</strong>
            Collections with equivalent content are equivalent, recursively.
        <li><strong>equivalence:</strong>
            Identical values and objects are equivalent, but so are collections
            that contain equivalent content.  Whether order is important varies
            by type.  For Arrays and lists, order is important.  For Objects,
            maps, and sets, order is not important.  Boxed objects are mutally
            equivalent with their unboxed values, by virtue of the standard
            <code>valueOf</code> method.
    </ul>
    @param this
    @param that
    @returns {Boolean} whether the values are deeply equivalent
    @function external:Object.equals
*/
Object.equals = function (a, b, equals, memo) {
    equals = equals || Object.equals;
    // unbox objects, but do not confuse object literals
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return true;
    if (Object.isObject(a)) {
        memo = memo || new WeakMap();
        if (memo.has(a)) {
            return true;
        }
        memo.set(a, true);
    }
    if (Object.isObject(a) && typeof a.equals === "function") {
        return a.equals(b, equals, memo);
    }
    // commutative
    if (Object.isObject(b) && typeof b.equals === "function") {
        return b.equals(a, equals, memo);
    }
    if (Object.isObject(a) && Object.isObject(b)) {
        if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
            for (var name in a) {
                if (!equals(a[name], b[name], equals, memo)) {
                    return false;
                }
            }
            for (var name in b) {
                if (!(name in a) || !equals(b[name], a[name], equals, memo)) {
                    return false;
                }
            }
            return true;
        }
    }
    // NaN !== NaN, but they are equal.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    // We have established that a !== b, but if a !== a && b !== b, they are
    // both NaN.
    if (a !== a && b !== b)
        return true;
    if (!a || !b)
        return a === b;
    return false;
};

// Because a return value of 0 from a `compare` function  may mean either
// "equals" or "is incomparable", `equals` cannot be defined in terms of
// `compare`.  However, `compare` *can* be defined in terms of `equals` and
// `lessThan`.  Again however, more often it would be desirable to implement
// all of the comparison functions in terms of compare rather than the other
// way around.

/**
    Determines the order in which any two objects should be sorted by returning
    a number that has an analogous relationship to zero as the left value to
    the right.  That is, if the left is "less than" the right, the returned
    value will be "less than" zero, where "less than" may be any other
    transitive relationship.

    <p>Arrays are compared by the first diverging values, or by length.

    <p>Any two values that are incomparable return zero.  As such,
    <code>equals</code> should not be implemented with <code>compare</code>
    since incomparability is indistinguishable from equality.

    <p>Sorts strings lexicographically.  This is not suitable for any
    particular international setting.  Different locales sort their phone books
    in very different ways, particularly regarding diacritics and ligatures.

    <p>If the given object is an instance of a type that implements a method
    named "compare", this function defers to the instance.  The method does not
    need to be an owned property to distinguish it from an object literal since
    object literals are incomparable.  Unlike <code>Object</code> however,
    <code>Array</code> implements <code>compare</code>.

    @param {Any} left
    @param {Any} right
    @returns {Number} a value having the same transitive relationship to zero
    as the left and right values.
    @function external:Object.compare
*/
Object.compare = function (a, b) {
    // unbox objects, but do not confuse object literals
    // mercifully handles the Date case
    a = Object.getValueOf(a);
    b = Object.getValueOf(b);
    if (a === b)
        return 0;
    var aType = typeof a;
    var bType = typeof b;
    if (aType === "number" && bType === "number")
        return a - b;
    if (aType === "string" && bType === "string")
        return a < b ? -Infinity : Infinity;
        // the possibility of equality elimiated above
    if (a && typeof a.compare === "function")
        return a.compare(b);
    // not commutative, the relationship is reversed
    if (b && typeof b.compare === "function")
        return -b.compare(a);
    return 0;
};

/**
    Creates a deep copy of any value.  Values, being immutable, are
    returned without alternation.  Forwards to <code>clone</code> on
    objects and arrays.

    @function external:Object.clone
    @param {Any} value a value to clone
    @param {Number} depth an optional traversal depth, defaults to infinity.
    A value of <code>0</code> means to make no clone and return the value
    directly.
    @param {Map} memo an optional memo of already visited objects to preserve
    reference cycles.  The cloned object will have the exact same shape as the
    original, but no identical objects.  Te map may be later used to associate
    all objects in the original object graph with their corresponding member of
    the cloned graph.
    @returns a copy of the value
*/
Object.clone = function (value, depth, memo) {
    value = Object.getValueOf(value);
    memo = memo || new WeakMap();
    if (depth === undefined) {
        depth = Infinity;
    } else if (depth === 0) {
        return value;
    }
    if (Object.isObject(value)) {
        if (!memo.has(value)) {
            if (value && typeof value.clone === "function") {
                memo.set(value, value.clone(depth, memo));
            } else {
                var prototype = Object.getPrototypeOf(value);
                if (prototype === null || prototype === Object.prototype) {
                    var clone = Object.create(prototype);
                    memo.set(value, clone);
                    for (var key in value) {
                        clone[key] = Object.clone(value[key], depth - 1, memo);
                    }
                } else {
                    throw new Error("Can't clone " + value);
                }
            }
        }
        return memo.get(value);
    }
    return value;
};

/**
    Removes all properties owned by this object making the object suitable for
    reuse.

    @function external:Object.clear
    @returns this
*/
Object.clear = function (object) {
    if (object && typeof object.clear === "function") {
        object.clear();
    } else {
        var keys = Object.keys(object),
            i = keys.length;
        while (i) {
            i--;
            delete object[keys[i]];
        }
    }
    return object;
};


},{"weak-map":12}],17:[function(require,module,exports){

/**
    accepts a string; returns the string with regex metacharacters escaped.
    the returned string can safely be used within a regex to match a literal
    string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
    |, #, [comma], and whitespace.
*/
if (!RegExp.escape) {
    var special = /[-[\]{}()*+?.\\^$|,#\s]/g;
    RegExp.escape = function (string) {
        return string.replace(special, "\\$&");
    };
}


},{}],18:[function(require,module,exports){

var Array = require("./shim-array");
var Object = require("./shim-object");
var Function = require("./shim-function");
var RegExp = require("./shim-regexp");


},{"./shim-array":14,"./shim-function":15,"./shim-object":16,"./shim-regexp":17}],19:[function(require,module,exports){
"use strict";

module.exports = TreeLog;

function TreeLog() {
}

TreeLog.ascii = {
    intersection: "+",
    through: "-",
    branchUp: "+",
    branchDown: "+",
    fromBelow: ".",
    fromAbove: "'",
    fromBoth: "+",
    strafe: "|"
};

TreeLog.unicodeRound = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u256d", // round corner
    fromAbove: "\u2570", // round corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};

TreeLog.unicodeSharp = {
    intersection: "\u254b",
    through: "\u2501",
    branchUp: "\u253b",
    branchDown: "\u2533",
    fromBelow: "\u250f", // sharp corner
    fromAbove: "\u2517", // sharp corner
    fromBoth: "\u2523",
    strafe: "\u2503"
};


},{}],20:[function(require,module,exports){
"use strict";

var Dispatcher = require("flux").Dispatcher;

module.exports = new Dispatcher();

},{"flux":"flux"}],21:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var dispatcher = _interopRequire(require("./dispatcher"));

var routes = _interopRequire(require("./routes"));

module.exports = {

  dispatcher: dispatcher,

  routes: routes

};

},{"./dispatcher":20,"./routes":22}],22:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// Components

var App = _interopRequire(require("../pages/app"));

var Home = _interopRequire(require("../pages/home"));

var NotFound = _interopRequire(require("../pages/not-found"));

var TaskPage = _interopRequire(require("../pages/tasks"));

// Dependencies

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var routes = React.createElement(
  Route,
  { path: "/", handler: App },
  React.createElement(DefaultRoute, { handler: Home }),
  React.createElement(NotFoundRoute, { handler: NotFound }),
  React.createElement(Route, { path: "tasks", handler: TaskPage })
);

module.exports = routes;

},{"../pages/app":25,"../pages/home":26,"../pages/not-found":27,"../pages/tasks":28,"react":"react","react-router":"react-router"}],23:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Set = _interopRequire(require("collections/set"));

var Tasks = new Set([]);

module.exports = Tasks;

},{"collections/set":13}],24:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TextField = (function (_React$Component) {
  function TextField() {
    _classCallCheck(this, TextField);

    this.state = {
      read: true,
      value: ""
    };
  }

  _inherits(TextField, _React$Component);

  _createClass(TextField, {
    onClick: {
      value: function onClick() {
        this.setState({ read: false });
      }
    },
    onKeyUp: {
      value: function onKeyUp(event) {
        if (event.keyCode === 13) {
          this.setState({ read: true });
        }
      }
    },
    onInputChange: {
      value: function onInputChange(event) {
        this.setState({ value: event.target.value });
      }
    },
    render: {
      value: function render() {
        var value = this.state.value;
        var input = React.createElement("input", { type: "text", onChange: this.onInputChange.bind(this), onKeyUp: this.onKeyUp.bind(this) });
        var span = React.createElement(
          "span",
          null,
          value
        );
        return React.createElement(
          "div",
          null,
          this.state.read ? value.length ? span : "No value" : "",
          !this.state.read && input,
          React.createElement(
            "button",
            { onClick: this.onClick.bind(this) },
            " Edit"
          )
        );
      }
    }
  });

  return TextField;
})(React.Component);

module.exports = TextField;

},{"react":"react"}],25:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var classnames = _interopRequire(require("classnames"));

var React = _interopRequire(require("react"));

var RouteHandler = require("react-router").RouteHandler;

var App = (function (_React$Component) {
  function App() {
    _classCallCheck(this, App);

    this.state = {
      open: false
    };
  }

  _inherits(App, _React$Component);

  _createClass(App, {
    onClick: {

      /**
       * Handle click event
       * @param {string} source
       * @param {SyntheticEvent} event
       */

      value: function onClick(source, event) {
        // Always close nav drawer if main was clicked
        if (source === "main") this.setState({ open: false });
        // Otherwise toggle open
        else this.setState({ open: !this.state.open });
      }
    },
    render: {
      value: function render() {
        var open = { open: this.state.open };
        return React.createElement(
          "div",
          null,
          React.createElement(
            "header",
            { className: "site ui-blue" },
            React.createElement(
              "div",
              {
                className: classnames("hamburger menu", open),
                href: "#",
                onClick: this.onClick.bind(this, "icon") },
              React.createElement("i", null)
            ),
            React.createElement(
              "div",
              { className: "logo" },
              "React:Life"
            )
          ),
          React.createElement(
            "nav",
            { className: classnames("site ui-blue", open), onClick: this.onClick.bind(this, "nav") },
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "#" },
                  " Link "
                )
              )
            )
          ),
          React.createElement(
            "main",
            { className: classnames(open), onClick: this.onClick.bind(this, "main") },
            React.createElement(RouteHandler, null)
          )
        );
      }
    }
  });

  return App;
})(React.Component);

module.exports = App;
/* this is the important part */

},{"classnames":"classnames","react":"react","react-router":"react-router"}],26:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TextField = _interopRequire(require("../fields/text-field"));

var Home = (function (_React$Component) {
  function Home() {
    _classCallCheck(this, Home);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Home, _React$Component);

  _createClass(Home, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            { className: "text-center" },
            " React Form "
          ),
          React.createElement(
            "div",
            { className: "container", id: "app" },
            React.createElement(TextField, null)
          )
        );
      }
    }
  });

  return Home;
})(React.Component);

module.exports = Home;

},{"../fields/text-field":24,"react":"react"}],27:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var NotFound = (function (_React$Component) {
  function NotFound() {
    _classCallCheck(this, NotFound);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(NotFound, _React$Component);

  _createClass(NotFound, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            null,
            " What You Talking About, Willis?"
          )
        );
      }
    }
  });

  return NotFound;
})(React.Component);

module.exports = NotFound;

},{"react":"react"}],28:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TaskList = _interopRequire(require("./task-list"));

var Tasks = _interopRequire(require("../../data/tasks"));

var TaskPage = (function (_React$Component) {
  function TaskPage() {
    _classCallCheck(this, TaskPage);

    this.state = {
      Tasks: Tasks
    };
  }

  _inherits(TaskPage, _React$Component);

  _createClass(TaskPage, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "h2",
            { className: "text-center" },
            " Tasks "
          ),
          React.createElement(TaskList, { tasks: this.state.Tasks.toArray() })
        );
      }
    }
  });

  return TaskPage;
})(React.Component);

module.exports = TaskPage;

},{"../../data/tasks":23,"./task-list":29,"react":"react"}],29:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TaskList = (function (_React$Component) {
  function TaskList() {
    for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
      props[_key] = arguments[_key];
    }

    _classCallCheck(this, TaskList);

    _get(Object.getPrototypeOf(TaskList.prototype), "constructor", this).apply(this, props);
    this.state = {
      tasks: this.props.tasks || []
    };
  }

  _inherits(TaskList, _React$Component);

  _createClass(TaskList, {
    render: {
      value: function render() {
        return React.createElement(
          "ul",
          null,
          this.state.tasks.map(function (task) {
            return React.createElement(
              "li",
              null,
              " ",
              task.title,
              " "
            );
          })
        );
      }
    }
  });

  return TaskList;
})(React.Component);

module.exports = TaskList;

},{"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2RpY3QuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvZmFzdC1zZXQuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvZ2VuZXJpYy1jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2dlbmVyaWMtbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL2dlbmVyaWMtb3JkZXIuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvZ2VuZXJpYy1zZXQuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvbGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9saXN0ZW4vbWFwLWNoYW5nZXMuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvbGlzdGVuL3Byb3BlcnR5LWNoYW5nZXMuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvbGlzdGVuL3JhbmdlLWNoYW5nZXMuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvbm9kZV9tb2R1bGVzL3dlYWstbWFwL3dlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL3NldC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy9zaGltLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvbGxlY3Rpb25zL3NoaW0tZnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvc2hpbS1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvc2hpbS1yZWdleHAuanMiLCJub2RlX21vZHVsZXMvY29sbGVjdGlvbnMvc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9jb2xsZWN0aW9ucy90cmVlLWxvZy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2pzL2FwcC9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvanMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvanMvYXBwL3JvdXRlcy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2pzL2RhdGEvdGFza3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9qcy9maWVsZHMvdGV4dC1maWVsZC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2pzL3BhZ2VzL2FwcC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2pzL3BhZ2VzL2hvbWUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9qcy9wYWdlcy9ub3QtZm91bmQuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9qcy9wYWdlcy90YXNrcy9pbmRleC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2pzL3BhZ2VzL3Rhc2tzL3Rhc2stbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7OztJQUVOLEdBQUcsMkJBQU0sT0FBTzs7SUFDaEIsS0FBSywyQkFBTSxPQUFPOztJQUNsQixNQUFNLDJCQUFNLGNBQWM7O0FBRWpDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLE9BQU8sRUFBRTtBQUN4QyxPQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFDLE9BQU8sT0FBRSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUMxRCxDQUFDLENBQUM7Ozs7Ozs7O0FDUkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQSxZQUFZLENBQUM7O0lBRUwsVUFBVSxXQUFPLE1BQU0sRUFBdkIsVUFBVTs7QUFFbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7QUNKbEMsWUFBWSxDQUFDOzs7O0lBRU4sVUFBVSwyQkFBTSxjQUFjOztJQUM5QixNQUFNLDJCQUFNLFVBQVU7O2lCQUVkOztBQUViLFlBQVUsRUFBRSxVQUFVOztBQUV0QixRQUFNLEVBQUUsTUFBTTs7Q0FFZjs7O0FDWEQsWUFBWSxDQUFDOzs7Ozs7SUFHTixHQUFHLDJCQUFNLGNBQWM7O0lBQ3ZCLElBQUksMkJBQU0sZUFBZTs7SUFDekIsUUFBUSwyQkFBTSxvQkFBb0I7O0lBQ2xDLFFBQVEsMkJBQU0sZ0JBQWdCOzs7O0lBRzlCLEtBQUssMkJBQU0sT0FBTzs7SUFDbEIsTUFBTSwyQkFBTSxjQUFjOztBQUVqQyxJQUFJLEtBQUssR0FBSSxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzFCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQzs7QUFFekMsSUFBSSxNQUFNLEdBQ1I7QUFBQyxPQUFLO0lBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxPQUFPLEVBQUUsR0FBRyxBQUFDO0VBQzNCLG9CQUFDLFlBQVksSUFBQyxPQUFPLEVBQUUsSUFBSSxBQUFDLEdBQUc7RUFDL0Isb0JBQUMsYUFBYSxJQUFDLE9BQU8sRUFBRSxRQUFRLEFBQUMsR0FBRTtFQUNuQyxvQkFBQyxLQUFLLElBQUMsSUFBSSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUUsUUFBUSxBQUFDLEdBQUc7Q0FDbkMsQUFDVCxDQUFDOztpQkFFYSxNQUFNOzs7QUN4QnJCLFlBQVksQ0FBQzs7OztJQUVOLEdBQUcsMkJBQU0saUJBQWlCOztBQUVqQyxJQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7aUJBRVQsS0FBSzs7O0FDTnBCLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUVOLEtBQUssMkJBQU0sT0FBTzs7SUFFbkIsU0FBUztBQUVGLFdBRlAsU0FBUyxHQUVDOzBCQUZWLFNBQVM7O0FBR1gsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFVBQUksRUFBRSxJQUFJO0FBQ1YsV0FBSyxFQUFFLEVBQUU7S0FDVixDQUFDO0dBQ0g7O1lBUEcsU0FBUzs7ZUFBVCxTQUFTO0FBU2IsV0FBTzthQUFBLG1CQUFHO0FBQ1IsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO09BQ2hDOztBQUVELFdBQU87YUFBQSxpQkFBQyxLQUFLLEVBQUU7QUFDYixZQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxFQUFFO0FBQ3hCLGNBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMvQjtPQUNGOztBQUVELGlCQUFhO2FBQUEsdUJBQUMsS0FBSyxFQUFFO0FBQ25CLFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO09BQzlDOztBQUVELFVBQU07YUFBQSxrQkFBRztBQUNQLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzdCLFlBQUksS0FBSyxHQUFHLCtCQUFPLElBQUksRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxBQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxBQUFDLEdBQUUsQ0FBQztBQUM1RyxZQUFJLElBQUksR0FBRzs7O1VBQU8sS0FBSztTQUFRLENBQUM7QUFDaEMsZUFDRTs7O1VBQ0csSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUksS0FBSyxDQUFDLE1BQU0sR0FBSSxJQUFJLEdBQUcsVUFBVSxHQUFJLEVBQUU7VUFDMUQsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLO1VBQzFCOztjQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQzs7V0FBZTtTQUNwRCxDQUNOO09BQ0g7Ozs7U0FsQ0csU0FBUztHQUFTLEtBQUssQ0FBQyxTQUFTOztpQkFxQ3hCLFNBQVM7OztBQ3pDeEIsWUFBWSxDQUFDOzs7Ozs7Ozs7O0lBRU4sVUFBVSwyQkFBTSxZQUFZOztJQUM1QixLQUFLLDJCQUFNLE9BQU87O0lBQ2pCLFlBQVksV0FBTyxjQUFjLEVBQWpDLFlBQVk7O0lBRWQsR0FBRztBQUVJLFdBRlAsR0FBRyxHQUVPOzBCQUZWLEdBQUc7O0FBR0wsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFVBQUksRUFBRSxLQUFLO0tBQ1osQ0FBQztHQUNIOztZQU5HLEdBQUc7O2VBQUgsR0FBRztBQWFQLFdBQU87Ozs7Ozs7O2FBQUEsaUJBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTs7QUFFckIsWUFBSSxNQUFNLEtBQUssTUFBTSxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7O2FBRy9CLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7T0FDN0M7O0FBRUQsVUFBTTthQUFBLGtCQUFHO0FBQ1AsWUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxlQUNFOzs7VUFDRTs7Y0FBUSxTQUFTLEVBQUMsY0FBYztZQUM1Qjs7O0FBQ0UseUJBQVMsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEFBQUM7QUFDOUMsb0JBQUksRUFBQyxHQUFHO0FBQ1IsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEFBQUM7Y0FDekMsOEJBQU87YUFDSDtZQUNOOztnQkFBSyxTQUFTLEVBQUMsTUFBTTs7YUFBaUI7V0FDakM7VUFDVDs7Y0FBSyxTQUFTLEVBQUUsVUFBVSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQUFBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEFBQUM7WUFDeEY7OztjQUNFOzs7Z0JBQ0U7O29CQUFHLElBQUksRUFBQyxHQUFHOztpQkFBVztlQUNuQjthQUNGO1dBQ0Q7VUFDTjs7Y0FBTSxTQUFTLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxBQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQUFBQztZQUV4RSxvQkFBQyxZQUFZLE9BQUU7V0FDWjtTQUNILENBQ1A7T0FDRjs7OztTQWhERyxHQUFHO0dBQVMsS0FBSyxDQUFDLFNBQVM7O2lCQW9EbEIsR0FBRzs7OztBQzFEbEIsWUFBWSxDQUFDOzs7Ozs7Ozs7O0lBRU4sS0FBSywyQkFBTSxPQUFPOztJQUNsQixTQUFTLDJCQUFNLHNCQUFzQjs7SUFFdEMsSUFBSTtXQUFKLElBQUk7MEJBQUosSUFBSTs7Ozs7OztZQUFKLElBQUk7O2VBQUosSUFBSTtBQUVSLFVBQU07YUFBQSxrQkFBRztBQUNQLGVBQ0U7OztVQUNFOztjQUFJLFNBQVMsRUFBQyxhQUFhOztXQUFrQjtVQUM3Qzs7Y0FBSyxTQUFTLEVBQUMsV0FBVyxFQUFDLEVBQUUsRUFBQyxLQUFLO1lBQy9CLG9CQUFDLFNBQVMsT0FBRTtXQUNWO1NBQ0YsQ0FDUDtPQUNGOzs7O1NBWEcsSUFBSTtHQUFTLEtBQUssQ0FBQyxTQUFTOztpQkFlbkIsSUFBSTs7O0FDcEJuQixZQUFZLENBQUM7Ozs7Ozs7Ozs7SUFFTixLQUFLLDJCQUFNLE9BQU87O0lBRW5CLFFBQVE7V0FBUixRQUFROzBCQUFSLFFBQVE7Ozs7Ozs7WUFBUixRQUFROztlQUFSLFFBQVE7QUFFWixVQUFNO2FBQUEsa0JBQUc7QUFDUCxlQUNFOzs7VUFDRTs7OztXQUF5QztTQUNyQyxDQUNOO09BQ0g7Ozs7U0FSRyxRQUFRO0dBQVMsS0FBSyxDQUFDLFNBQVM7O2lCQWF2QixRQUFROzs7QUNqQnZCLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUVOLEtBQUssMkJBQU0sT0FBTzs7SUFDbEIsUUFBUSwyQkFBTSxhQUFhOztJQUMzQixLQUFLLDJCQUFNLGtCQUFrQjs7SUFFOUIsUUFBUTtBQUVELFdBRlAsUUFBUSxHQUVFOzBCQUZWLFFBQVE7O0FBR1YsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFdBQUssRUFBRSxLQUFLO0tBQ2IsQ0FBQztHQUNIOztZQU5HLFFBQVE7O2VBQVIsUUFBUTtBQVFaLFVBQU07YUFBQSxrQkFBRztBQUNQLGVBQ0U7O1lBQUssU0FBUyxFQUFDLE1BQU07VUFDbkI7O2NBQUksU0FBUyxFQUFDLGFBQWE7O1dBQWE7VUFDeEMsb0JBQUMsUUFBUSxJQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQUFBQyxHQUFFO1NBQzFDLENBQ047T0FDSDs7OztTQWZHLFFBQVE7R0FBUyxLQUFLLENBQUMsU0FBUzs7aUJBbUJ2QixRQUFROzs7QUN6QnZCLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0lBRU4sS0FBSywyQkFBTSxPQUFPOztJQUVuQixRQUFRO0FBRUQsV0FGUCxRQUFRLEdBRVU7c0NBQVAsS0FBSztBQUFMLFdBQUs7OzswQkFGaEIsUUFBUTs7QUFHViwrQkFIRSxRQUFRLDhDQUdELEtBQUssRUFBRTtBQUNoQixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsV0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7S0FDOUIsQ0FBQztHQUNIOztZQVBHLFFBQVE7O2VBQVIsUUFBUTtBQVNaLFVBQU07YUFBQSxrQkFBRztBQUNQLGVBQ0U7OztVQUNHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7bUJBQUk7Ozs7Y0FBTSxJQUFJLENBQUMsS0FBSzs7YUFBTztXQUFBLENBQUM7U0FDbkQsQ0FDTDtPQUNIOzs7O1NBZkcsUUFBUTtHQUFTLEtBQUssQ0FBQyxTQUFTOztpQkFrQnZCLFFBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cblJvdXRlci5ydW4oQXBwLnJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSk7XG59KTtcblxuLy8gT3IsIGlmIHlvdSdkIGxpa2UgdG8gdXNlIHRoZSBIVE1MNSBoaXN0b3J5IEFQSSBmb3IgY2xlYW5lciBVUkxzOlxuLy8gUm91dGVyLnJ1bihyb3V0ZXMsIFJvdXRlci5IaXN0b3J5TG9jYXRpb24sIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4vLyAgIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhcHAnKSk7XG4vLyB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG52YXIgR2VuZXJpY01hcCA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtbWFwXCIpO1xudmFyIFByb3BlcnR5Q2hhbmdlcyA9IHJlcXVpcmUoXCIuL2xpc3Rlbi9wcm9wZXJ0eS1jaGFuZ2VzXCIpO1xuXG4vLyBCdXJnbGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvZGljdFxuXG5tb2R1bGUuZXhwb3J0cyA9IERpY3Q7XG5mdW5jdGlvbiBEaWN0KHZhbHVlcywgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBEaWN0KSkge1xuICAgICAgICByZXR1cm4gbmV3IERpY3QodmFsdWVzLCBnZXREZWZhdWx0KTtcbiAgICB9XG4gICAgZ2V0RGVmYXVsdCA9IGdldERlZmF1bHQgfHwgRnVuY3Rpb24ubm9vcDtcbiAgICB0aGlzLmdldERlZmF1bHQgPSBnZXREZWZhdWx0O1xuICAgIHRoaXMuc3RvcmUgPSB7fTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5hZGRFYWNoKHZhbHVlcyk7XG59XG5cbkRpY3QuRGljdCA9IERpY3Q7IC8vIGhhY2sgc28gcmVxdWlyZShcImRpY3RcIikuRGljdCB3aWxsIHdvcmsgaW4gTW9udGFnZUpTLlxuXG5mdW5jdGlvbiBtYW5nbGUoa2V5KSB7XG4gICAgLy8gVXNlIFwiJFwiIGFzIHRoZSBtYW5nbGUgcHJlZml4IHNvIGRpY3Rpb25hcmllcyBvZiB2YWxpZCBpZGVudGlmaWVycyBjYW5cbiAgICAvLyB0YWtlIGFkdmFudGFnZSBvZiBvcHRpbWl6YXRpb25zIGZvciBvYmplY3RzIGNvbnRhaW5pbmcgb25seSB2YWxpZFxuICAgIC8vIGlkZW50aWZpZXJzLiBJIGhhdmUgbm90IHZlcmlmaWVkIHRoYXQgdGhpcyBtYWtlcyBhIGRpZmZlcmVuY2UuXG4gICAgcmV0dXJuIFwiJFwiICsga2V5O1xufVxuXG5mdW5jdGlvbiB1bm1hbmdsZShtYW5nbGVkKSB7XG4gICAgcmV0dXJuIG1hbmdsZWQuc2xpY2UoMSk7XG59XG5cbk9iamVjdC5hZGRFYWNoKERpY3QucHJvdG90eXBlLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUpO1xuT2JqZWN0LmFkZEVhY2goRGljdC5wcm90b3R5cGUsIEdlbmVyaWNNYXAucHJvdG90eXBlKTtcbk9iamVjdC5hZGRFYWNoKERpY3QucHJvdG90eXBlLCBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlKTtcblxuRGljdC5wcm90b3R5cGUuY29uc3RydWN0Q2xvbmUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHZhbHVlcywgdGhpcy5nZXREZWZhdWx0KTtcbn07XG5cbkRpY3QucHJvdG90eXBlLmFzc2VydFN0cmluZyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwia2V5IG11c3QgYmUgYSBzdHJpbmcgYnV0IEdvdCBcIiArIGtleSk7XG4gICAgfVxufVxuXG5EaWN0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICB0aGlzLmFzc2VydFN0cmluZyhrZXkpO1xuICAgIHZhciBtYW5nbGVkID0gbWFuZ2xlKGtleSk7XG4gICAgaWYgKG1hbmdsZWQgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVttYW5nbGVkXTtcbiAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdChrZXkpO1xuICAgIH1cbn07XG5cbkRpY3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5hc3NlcnRTdHJpbmcoa2V5KTtcbiAgICB2YXIgbWFuZ2xlZCA9IG1hbmdsZShrZXkpO1xuICAgIGlmIChtYW5nbGVkIGluIHRoaXMuc3RvcmUpIHsgLy8gdXBkYXRlXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdGhpcy5zdG9yZVttYW5nbGVkXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZVttYW5nbGVkXSA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaE1hcENoYW5nZShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHsgLy8gY3JlYXRlXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICB0aGlzLnN0b3JlW21hbmdsZWRdID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn07XG5cbkRpY3QucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB0aGlzLmFzc2VydFN0cmluZyhrZXkpO1xuICAgIHZhciBtYW5nbGVkID0gbWFuZ2xlKGtleSk7XG4gICAgcmV0dXJuIG1hbmdsZWQgaW4gdGhpcy5zdG9yZTtcbn07XG5cbkRpY3QucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHRoaXMuYXNzZXJ0U3RyaW5nKGtleSk7XG4gICAgdmFyIG1hbmdsZWQgPSBtYW5nbGUoa2V5KTtcbiAgICBpZiAobWFuZ2xlZCBpbiB0aGlzLnN0b3JlKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdGhpcy5zdG9yZVttYW5nbGVkXSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuc3RvcmVbbWFuZ2xlKGtleSldO1xuICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaE1hcENoYW5nZShrZXksIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkRpY3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXksIG1hbmdsZWQ7XG4gICAgZm9yIChtYW5nbGVkIGluIHRoaXMuc3RvcmUpIHtcbiAgICAgICAga2V5ID0gdW5tYW5nbGUobWFuZ2xlZCk7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgdGhpcy5zdG9yZVttYW5nbGVkXSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRoaXMuc3RvcmVbbWFuZ2xlZF07XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG59O1xuXG5EaWN0LnByb3RvdHlwZS5yZWR1Y2UgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzLCB0aGlzcCkge1xuICAgIGZvciAodmFyIG1hbmdsZWQgaW4gdGhpcy5zdG9yZSkge1xuICAgICAgICBiYXNpcyA9IGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB0aGlzLnN0b3JlW21hbmdsZWRdLCB1bm1hbmdsZShtYW5nbGVkKSwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiBiYXNpcztcbn07XG5cbkRpY3QucHJvdG90eXBlLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcywgdGhpc3ApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5zdG9yZSkucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGJhc2lzLCBtYW5nbGVkKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgc3RvcmVbbWFuZ2xlZF0sIHVubWFuZ2xlKG1hbmdsZWQpLCBzZWxmKTtcbiAgICB9LCBiYXNpcyk7XG59O1xuXG5EaWN0LnByb3RvdHlwZS5vbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGtleTtcbiAgICBmb3IgKGtleSBpbiB0aGlzLnN0b3JlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlW2tleV07XG4gICAgfVxufTtcblxuRGljdC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRvT2JqZWN0KCk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBTaGltID0gcmVxdWlyZShcIi4vc2hpbVwiKTtcbnZhciBEaWN0ID0gcmVxdWlyZShcIi4vZGljdFwiKTtcbnZhciBMaXN0ID0gcmVxdWlyZShcIi4vbGlzdFwiKTtcbnZhciBHZW5lcmljQ29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL2dlbmVyaWMtY29sbGVjdGlvblwiKTtcbnZhciBHZW5lcmljU2V0ID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1zZXRcIik7XG52YXIgVHJlZUxvZyA9IHJlcXVpcmUoXCIuL3RyZWUtbG9nXCIpO1xudmFyIFByb3BlcnR5Q2hhbmdlcyA9IHJlcXVpcmUoXCIuL2xpc3Rlbi9wcm9wZXJ0eS1jaGFuZ2VzXCIpO1xuXG52YXIgb2JqZWN0X2hhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmFzdFNldDtcblxuZnVuY3Rpb24gRmFzdFNldCh2YWx1ZXMsIGVxdWFscywgaGFzaCwgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBGYXN0U2V0KSkge1xuICAgICAgICByZXR1cm4gbmV3IEZhc3RTZXQodmFsdWVzLCBlcXVhbHMsIGhhc2gsIGdldERlZmF1bHQpO1xuICAgIH1cbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICBoYXNoID0gaGFzaCB8fCBPYmplY3QuaGFzaDtcbiAgICBnZXREZWZhdWx0ID0gZ2V0RGVmYXVsdCB8fCBGdW5jdGlvbi5ub29wO1xuICAgIHRoaXMuY29udGVudEVxdWFscyA9IGVxdWFscztcbiAgICB0aGlzLmNvbnRlbnRIYXNoID0gaGFzaDtcbiAgICB0aGlzLmdldERlZmF1bHQgPSBnZXREZWZhdWx0O1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmJ1Y2tldHMgPSBuZXcgdGhpcy5CdWNrZXRzKG51bGwsIGZ1bmN0aW9uIGdldERlZmF1bHRCdWNrZXQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5CdWNrZXQoKTtcbiAgICB9KTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5hZGRFYWNoKHZhbHVlcyk7XG59XG5cbkZhc3RTZXQuRmFzdFNldCA9IEZhc3RTZXQ7IC8vIGhhY2sgc28gcmVxdWlyZShcImZhc3Qtc2V0XCIpLkZhc3RTZXQgd2lsbCB3b3JrIGluIE1vbnRhZ2VKU1xuXG5PYmplY3QuYWRkRWFjaChGYXN0U2V0LnByb3RvdHlwZSwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlKTtcbk9iamVjdC5hZGRFYWNoKEZhc3RTZXQucHJvdG90eXBlLCBHZW5lcmljU2V0LnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChGYXN0U2V0LnByb3RvdHlwZSwgUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZSk7XG5cbkZhc3RTZXQucHJvdG90eXBlLkJ1Y2tldHMgPSBEaWN0O1xuRmFzdFNldC5wcm90b3R5cGUuQnVja2V0ID0gTGlzdDtcblxuRmFzdFNldC5wcm90b3R5cGUuY29uc3RydWN0Q2xvbmUgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHRoaXMuY29udGVudEVxdWFscyxcbiAgICAgICAgdGhpcy5jb250ZW50SGFzaCxcbiAgICAgICAgdGhpcy5nZXREZWZhdWx0XG4gICAgKTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBoYXNoID0gdGhpcy5jb250ZW50SGFzaCh2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMuYnVja2V0cy5nZXQoaGFzaCkuaGFzKHZhbHVlKTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgaWYgKGVxdWFscykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYXN0U2V0I2dldCBkb2VzIG5vdCBzdXBwb3J0IHNlY29uZCBhcmd1bWVudDogZXF1YWxzXCIpO1xuICAgIH1cbiAgICB2YXIgaGFzaCA9IHRoaXMuY29udGVudEhhc2godmFsdWUpO1xuICAgIHZhciBidWNrZXRzID0gdGhpcy5idWNrZXRzO1xuICAgIGlmIChidWNrZXRzLmhhcyhoYXNoKSkge1xuICAgICAgICByZXR1cm4gYnVja2V0cy5nZXQoaGFzaCkuZ2V0KHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0KHZhbHVlKTtcbiAgICB9XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgaWYgKGVxdWFscykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYXN0U2V0I2RlbGV0ZSBkb2VzIG5vdCBzdXBwb3J0IHNlY29uZCBhcmd1bWVudDogZXF1YWxzXCIpO1xuICAgIH1cbiAgICB2YXIgaGFzaCA9IHRoaXMuY29udGVudEhhc2godmFsdWUpO1xuICAgIHZhciBidWNrZXRzID0gdGhpcy5idWNrZXRzO1xuICAgIGlmIChidWNrZXRzLmhhcyhoYXNoKSkge1xuICAgICAgICB2YXIgYnVja2V0ID0gYnVja2V0cy5nZXQoaGFzaCk7XG4gICAgICAgIGlmIChidWNrZXRbXCJkZWxldGVcIl0odmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICAgICAgaWYgKGJ1Y2tldC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBidWNrZXRzW1wiZGVsZXRlXCJdKGhhc2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuRmFzdFNldC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5idWNrZXRzLmNsZWFyKCk7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xufTtcblxuRmFzdFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGhhc2ggPSB0aGlzLmNvbnRlbnRIYXNoKHZhbHVlKTtcbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cztcbiAgICBpZiAoIWJ1Y2tldHMuaGFzKGhhc2gpKSB7XG4gICAgICAgIGJ1Y2tldHMuc2V0KGhhc2gsIG5ldyB0aGlzLkJ1Y2tldChudWxsLCB0aGlzLmNvbnRlbnRFcXVhbHMpKTtcbiAgICB9XG4gICAgaWYgKCFidWNrZXRzLmdldChoYXNoKS5oYXModmFsdWUpKSB7XG4gICAgICAgIGJ1Y2tldHMuZ2V0KGhhc2gpLmFkZCh2YWx1ZSk7XG4gICAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZS5yZWR1Y2UgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciBidWNrZXRzID0gdGhpcy5idWNrZXRzO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuIGJ1Y2tldHMucmVkdWNlKGZ1bmN0aW9uIChiYXNpcywgYnVja2V0KSB7XG4gICAgICAgIHJldHVybiBidWNrZXQucmVkdWNlKGZ1bmN0aW9uIChiYXNpcywgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdmFsdWUsIGluZGV4KyssIHRoaXMpO1xuICAgICAgICB9LCBiYXNpcywgdGhpcyk7XG4gICAgfSwgYmFzaXMsIHRoaXMpO1xufTtcblxuRmFzdFNldC5wcm90b3R5cGUub25lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVja2V0cy5vbmUoKS5vbmUoKTtcbiAgICB9XG59O1xuXG5GYXN0U2V0LnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmJ1Y2tldHMudmFsdWVzKCkuZmxhdHRlbigpLml0ZXJhdGUoKTtcbn07XG5cbkZhc3RTZXQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uIChjaGFybWFwLCBsb2dOb2RlLCBjYWxsYmFjaywgdGhpc3ApIHtcbiAgICBjaGFybWFwID0gY2hhcm1hcCB8fCBUcmVlTG9nLnVuaWNvZGVTaGFycDtcbiAgICBsb2dOb2RlID0gbG9nTm9kZSB8fCB0aGlzLmxvZ05vZGU7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNvbnNvbGUubG9nO1xuICAgICAgICB0aGlzcCA9IGNvbnNvbGU7XG4gICAgfVxuICAgIGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGlzcCk7XG5cbiAgICB2YXIgYnVja2V0cyA9IHRoaXMuYnVja2V0cztcbiAgICB2YXIgaGFzaGVzID0gYnVja2V0cy5rZXlzKCk7XG4gICAgaGFzaGVzLmZvckVhY2goZnVuY3Rpb24gKGhhc2gsIGluZGV4KSB7XG4gICAgICAgIHZhciBicmFuY2g7XG4gICAgICAgIHZhciBsZWFkZXI7XG4gICAgICAgIGlmIChpbmRleCA9PT0gaGFzaGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuZnJvbUFib3ZlO1xuICAgICAgICAgICAgbGVhZGVyID0gJyAnO1xuICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBicmFuY2ggPSBjaGFybWFwLmJyYW5jaERvd247XG4gICAgICAgICAgICBsZWFkZXIgPSBjaGFybWFwLnN0cmFmZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyYW5jaCA9IGNoYXJtYXAuZnJvbUJvdGg7XG4gICAgICAgICAgICBsZWFkZXIgPSBjaGFybWFwLnN0cmFmZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYnVja2V0ID0gYnVja2V0cy5nZXQoaGFzaCk7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJyYW5jaCArIGNoYXJtYXAudGhyb3VnaCArIGNoYXJtYXAuYnJhbmNoRG93biArICcgJyArIGhhc2gpO1xuICAgICAgICBidWNrZXQuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBicmFuY2gsIGJlbG93O1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IGJ1Y2tldC5oZWFkLnByZXYpIHtcbiAgICAgICAgICAgICAgICBicmFuY2ggPSBjaGFybWFwLmZyb21BYm92ZTtcbiAgICAgICAgICAgICAgICBiZWxvdyA9ICcgJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJhbmNoID0gY2hhcm1hcC5mcm9tQm90aDtcbiAgICAgICAgICAgICAgICBiZWxvdyA9IGNoYXJtYXAuc3RyYWZlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHdyaXR0ZW47XG4gICAgICAgICAgICBsb2dOb2RlKFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3cml0dGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCBsZWFkZXIgKyAnICcgKyBicmFuY2ggKyBjaGFybWFwLnRocm91Z2ggKyBjaGFybWFwLnRocm91Z2ggKyBsaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgbGVhZGVyICsgJyAnICsgYmVsb3cgKyAnICAnICsgbGluZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc3AsIGxlYWRlciArICcgJyArIGNoYXJtYXAuc3RyYWZlICsgJyAgJyArIGxpbmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuRmFzdFNldC5wcm90b3R5cGUubG9nTm9kZSA9IGZ1bmN0aW9uIChub2RlLCB3cml0ZSkge1xuICAgIHZhciB2YWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgaWYgKE9iamVjdCh2YWx1ZSkgPT09IHZhbHVlKSB7XG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KS5zcGxpdChcIlxcblwiKS5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgICAgICB3cml0ZShcIiBcIiArIGxpbmUpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZShcIiBcIiArIHZhbHVlKTtcbiAgICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljQ29sbGVjdGlvbjtcbmZ1bmN0aW9uIEdlbmVyaWNDb2xsZWN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gR2VuZXJpY0NvbGxlY3Rpb24gaXMgYSBtaXhpbi5cIik7XG59XG5cbkdlbmVyaWNDb2xsZWN0aW9uLkVtcHR5QXJyYXkgPSBPYmplY3QuZnJlZXplKFtdKTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmFkZEVhY2ggPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgaWYgKHZhbHVlcyAmJiBPYmplY3QodmFsdWVzKSA9PT0gdmFsdWVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVzLmZvckVhY2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2godGhpcy5hZGQsIHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAvLyBBcnJheS1saWtlIG9iamVjdHMgdGhhdCBkbyBub3QgaW1wbGVtZW50IGZvckVhY2gsIGVyZ28sXG4gICAgICAgICAgICAvLyBBcmd1bWVudHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQodmFsdWVzW2ldLCBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQodmFsdWVzW2tleV0sIGtleSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodmFsdWVzICYmIHR5cGVvZiB2YWx1ZXMubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIC8vIFN0cmluZ3NcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBUaGlzIGlzIHN1ZmZpY2llbnRseSBnZW5lcmljIGZvciBNYXAgKHNpbmNlIHRoZSB2YWx1ZSBtYXkgYmUgYSBrZXkpXG4vLyBhbmQgb3JkZXJlZCBjb2xsZWN0aW9ucyAoc2luY2UgaXQgZm9yd2FyZHMgdGhlIGVxdWFscyBhcmd1bWVudClcbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5kZWxldGVFYWNoID0gZnVuY3Rpb24gKHZhbHVlcywgZXF1YWxzKSB7XG4gICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXNbXCJkZWxldGVcIl0odmFsdWUsIGVxdWFscyk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBhbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIGluIHRlcm1zIG9mIFwicmVkdWNlXCIuXG4vLyBzb21lIG5lZWQgXCJjb25zdHJ1Y3RDbG9uZVwiLlxuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKTtcbiAgICB9LCB1bmRlZmluZWQpO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCkge1xuICAgICAgICByZXN1bHQucHVzaChjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSk7XG4gICAgfSwgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmVudW1lcmF0ZSA9IGZ1bmN0aW9uIChzdGFydCkge1xuICAgIGlmIChzdGFydCA9PSBudWxsKSB7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHRoaXMucmVkdWNlKGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKFtzdGFydCsrLCB2YWx1ZV0pO1xuICAgIH0sIHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5ncm91cCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AsIGVxdWFscykge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCBPYmplY3QuZXF1YWxzO1xuICAgIHZhciBncm91cHMgPSBbXTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgIHZhciBrZXkgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwga2V5LCBvYmplY3QpO1xuICAgICAgICB2YXIgaW5kZXggPSBrZXlzLmluZGV4T2Yoa2V5LCBlcXVhbHMpO1xuICAgICAgICB2YXIgZ3JvdXA7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGdyb3VwID0gW107XG4gICAgICAgICAgICBncm91cHMucHVzaChba2V5LCBncm91cF0pO1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBncm91cCA9IGdyb3Vwc1tpbmRleF1bMV07XG4gICAgICAgIH1cbiAgICAgICAgZ3JvdXAucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGdyb3Vwcztcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChGdW5jdGlvbi5pZGVudGl0eSk7XG59O1xuXG4vLyB0aGlzIGRlcGVuZHMgb24gc3RyaW5nYWJsZSBrZXlzLCB3aGljaCBhcHBseSB0byBBcnJheSBhbmQgSXRlcmF0b3Jcbi8vIGJlY2F1c2UgdGhleSBoYXZlIG51bWVyaWMga2V5cyBhbmQgYWxsIE1hcHMgc2luY2UgdGhleSBtYXkgdXNlXG4vLyBzdHJpbmdzIGFzIGtleXMuICBMaXN0LCBTZXQsIGFuZCBTb3J0ZWRTZXQgaGF2ZSBub2RlcyBmb3Iga2V5cywgc29cbi8vIHRvT2JqZWN0IHdvdWxkIG5vdCBiZSBtZWFuaW5nZnVsLlxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnRvT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICB0aGlzLnJlZHVjZShmdW5jdGlvbiAodW5kZWZpbmVkLCB2YWx1ZSwga2V5KSB7XG4gICAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgfSwgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5jb25zdHJ1Y3RDbG9uZSgpO1xuICAgIHRoaXMucmVkdWNlKGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpKSB7XG4gICAgICAgICAgICByZXN1bHQuYWRkKHZhbHVlLCBrZXkpO1xuICAgICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmV2ZXJ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzFdO1xuICAgIHJldHVybiB0aGlzLnJlZHVjZShmdW5jdGlvbiAocmVzdWx0LCB2YWx1ZSwga2V5LCBvYmplY3QsIGRlcHRoKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCk7XG4gICAgfSwgdHJ1ZSk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuc29tZSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgdmFsdWUsIGtleSwgb2JqZWN0LCBkZXB0aCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBrZXksIG9iamVjdCwgZGVwdGgpO1xuICAgIH0sIGZhbHNlKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXZlcnkoQm9vbGVhbik7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYW55ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvbWUoQm9vbGVhbik7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKGNvbXBhcmUpIHtcbiAgICBjb21wYXJlID0gY29tcGFyZSB8fCB0aGlzLmNvbnRlbnRDb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIHZhbHVlKSB7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKHZhbHVlLCByZXN1bHQpIDwgMCA/IHZhbHVlIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKTtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAoY29tcGFyZSkge1xuICAgIGNvbXBhcmUgPSBjb21wYXJlIHx8IHRoaXMuY29udGVudENvbXBhcmUgfHwgT2JqZWN0LmNvbXBhcmU7XG4gICAgdmFyIGZpcnN0ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmUodmFsdWUsIHJlc3VsdCkgPiAwID8gdmFsdWUgOiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9LCB1bmRlZmluZWQpO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnN1bSA9IGZ1bmN0aW9uICh6ZXJvKSB7XG4gICAgemVybyA9IHplcm8gPT09IHVuZGVmaW5lZCA/IDAgOiB6ZXJvO1xuICAgIHJldHVybiB0aGlzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgfSwgemVybyk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYXZlcmFnZSA9IGZ1bmN0aW9uICh6ZXJvKSB7XG4gICAgdmFyIHN1bSA9IHplcm8gPT09IHVuZGVmaW5lZCA/IDAgOiB6ZXJvO1xuICAgIHZhciBjb3VudCA9IHplcm8gPT09IHVuZGVmaW5lZCA/IDAgOiB6ZXJvO1xuICAgIHRoaXMucmVkdWNlKGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlKSB7XG4gICAgICAgIHN1bSArPSB2YWx1ZTtcbiAgICAgICAgY291bnQgKz0gMTtcbiAgICB9LCB1bmRlZmluZWQpO1xuICAgIHJldHVybiBzdW0gLyBjb3VudDtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuY29uc3RydWN0Q2xvbmUodGhpcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0LmFkZEVhY2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5mbGF0dGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgYXJyYXkpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0sIHJlc3VsdCwgc2VsZik7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW10pO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnppcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGFibGUgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHRhYmxlLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIEFycmF5LnVuemlwKHRhYmxlKTtcbn1cblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAoZGVsaW1pdGVyKSB7XG4gICAgcmV0dXJuIHRoaXMucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIHN0cmluZykge1xuICAgICAgICAvLyB3b3JrLWFyb3VuZCBmb3IgcmVkdWNlIHRoYXQgZG9lcyBub3Qgc3VwcG9ydCBuby1iYXNpcyBmb3JtXG4gICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQgKyBkZWxpbWl0ZXIgKyBzdHJpbmc7XG4gICAgICAgIH1cbiAgICB9LCB2b2lkIDApO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnNvcnRlZCA9IGZ1bmN0aW9uIChjb21wYXJlLCBieSwgb3JkZXIpIHtcbiAgICBjb21wYXJlID0gY29tcGFyZSB8fCB0aGlzLmNvbnRlbnRDb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIC8vIGFjY291bnQgZm9yIGNvbXBhcmF0b3JzIGdlbmVyYXRlZCBieSBGdW5jdGlvbi5ieVxuICAgIGlmIChjb21wYXJlLmJ5KSB7XG4gICAgICAgIGJ5ID0gY29tcGFyZS5ieTtcbiAgICAgICAgY29tcGFyZSA9IGNvbXBhcmUuY29tcGFyZSB8fCB0aGlzLmNvbnRlbnRDb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJ5ID0gYnkgfHwgRnVuY3Rpb24uaWRlbnRpdHk7XG4gICAgfVxuICAgIGlmIChvcmRlciA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBvcmRlciA9IDE7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBieTogYnkoaXRlbSksXG4gICAgICAgICAgICB2YWx1ZTogaXRlbVxuICAgICAgICB9O1xuICAgIH0pXG4gICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUoYS5ieSwgYi5ieSkgKiBvcmRlcjtcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKHBhaXIpIHtcbiAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgfSk7XG59O1xuXG5HZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUucmV2ZXJzZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0Q2xvbmUodGhpcykucmV2ZXJzZSgpO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKGRlcHRoLCBtZW1vKSB7XG4gICAgaWYgKGRlcHRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGVwdGggPSBJbmZpbml0eTtcbiAgICB9IGVsc2UgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgY2xvbmUgPSB0aGlzLmNvbnN0cnVjdENsb25lKCk7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIGNsb25lLmFkZChPYmplY3QuY2xvbmUodmFsdWUsIGRlcHRoIC0gMSwgbWVtbyksIGtleSk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIGNsb25lO1xufTtcblxuR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLm9ubHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uZSgpO1xuICAgIH1cbn07XG5cbkdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5pdGVyYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVyYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5yZXF1aXJlKFwiLi9zaGltLWFycmF5XCIpO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE9iamVjdCA9IHJlcXVpcmUoXCIuL3NoaW0tb2JqZWN0XCIpO1xudmFyIE1hcENoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vbWFwLWNoYW5nZXNcIik7XG52YXIgUHJvcGVydHlDaGFuZ2VzID0gcmVxdWlyZShcIi4vbGlzdGVuL3Byb3BlcnR5LWNoYW5nZXNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY01hcDtcbmZ1bmN0aW9uIEdlbmVyaWNNYXAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29uc3RydWN0LiBHZW5lcmljTWFwIGlzIGEgbWl4aW4uXCIpO1xufVxuXG5PYmplY3QuYWRkRWFjaChHZW5lcmljTWFwLnByb3RvdHlwZSwgTWFwQ2hhbmdlcy5wcm90b3R5cGUpO1xuT2JqZWN0LmFkZEVhY2goR2VuZXJpY01hcC5wcm90b3R5cGUsIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUpO1xuXG4vLyBhbGwgb2YgdGhlc2UgbWV0aG9kcyBkZXBlbmQgb24gdGhlIGNvbnN0cnVjdG9yIHByb3ZpZGluZyBhIGBzdG9yZWAgc2V0XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLmlzTWFwID0gdHJ1ZTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuYWRkRWFjaCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICBpZiAodmFsdWVzICYmIE9iamVjdCh2YWx1ZXMpID09PSB2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXMuZm9yRWFjaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAvLyBjb3B5IG1hcC1hbGlrZXNcbiAgICAgICAgICAgIGlmICh2YWx1ZXMuaXNNYXAgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIC8vIGl0ZXJhdGUga2V5IHZhbHVlIHBhaXJzIG9mIG90aGVyIGl0ZXJhYmxlc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAocGFpcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChwYWlyWzBdLCBwYWlyWzFdKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWVzLmxlbmd0aCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgLy8gQXJyYXktbGlrZSBvYmplY3RzIHRoYXQgZG8gbm90IGltcGxlbWVudCBmb3JFYWNoLCBlcmdvLFxuICAgICAgICAgICAgLy8gQXJndW1lbnRzXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlc1tpXSwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjb3B5IG90aGVyIG9iamVjdHMgYXMgbWFwLWFsaWtlc1xuICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlc1trZXldKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh2YWx1ZXMgJiYgdHlwZW9mIHZhbHVlcy5sZW5ndGggPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgLy8gU3RyaW5nXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufVxuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMuc3RvcmUuZ2V0KG5ldyB0aGlzLkl0ZW0oa2V5KSk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHQoa2V5KTtcbiAgICB9XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHZhciBpdGVtID0gbmV3IHRoaXMuSXRlbShrZXksIHZhbHVlKTtcbiAgICB2YXIgZm91bmQgPSB0aGlzLnN0b3JlLmdldChpdGVtKTtcbiAgICB2YXIgZ3JldyA9IGZhbHNlO1xuICAgIGlmIChmb3VuZCkgeyAvLyB1cGRhdGVcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCBmb3VuZC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm91bmQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgeyAvLyBjcmVhdGVcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0b3JlLmFkZChpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy5sZW5ndGgrKztcbiAgICAgICAgICAgIGdyZXcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoTWFwQ2hhbmdlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBncmV3O1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuaGFzKG5ldyB0aGlzLkl0ZW0oa2V5KSk7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGl0ZW0gPSBuZXcgdGhpcy5JdGVtKGtleSk7XG4gICAgaWYgKHRoaXMuc3RvcmUuaGFzKGl0ZW0pKSB7XG4gICAgICAgIHZhciBmcm9tID0gdGhpcy5zdG9yZS5nZXQoaXRlbSkudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNNYXBDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlTWFwQ2hhbmdlKGtleSwgZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZVtcImRlbGV0ZVwiXShpdGVtKTtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5LCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cztcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzTWFwQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVNYXBDaGFuZ2Uoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBrZXlzID0gdGhpcy5rZXlzKCk7XG4gICAgfVxuICAgIHRoaXMuc3RvcmUuY2xlYXIoKTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc01hcENoYW5nZXMpIHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcywgdGhpc3ApIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5yZWR1Y2UoZnVuY3Rpb24gKGJhc2lzLCBpdGVtKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgaXRlbS52YWx1ZSwgaXRlbS5rZXksIHRoaXMpO1xuICAgIH0sIGJhc2lzLCB0aGlzKTtcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcywgdGhpc3ApIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5yZWR1Y2VSaWdodChmdW5jdGlvbiAoYmFzaXMsIGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCBpdGVtLnZhbHVlLCBpdGVtLmtleSwgdGhpcyk7XG4gICAgfSwgYmFzaXMsIHRoaXMpO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoRnVuY3Rpb24uaWRlbnRpdHkpO1xufTtcblxuR2VuZXJpY01hcC5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuIFtrZXksIHZhbHVlXTtcbiAgICB9KTtcbn07XG5cbi8vIFhYWCBkZXByZWNhdGVkXG5HZW5lcmljTWFwLnByb3RvdHlwZS5pdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzKCk7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAodGhhdCwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgaWYgKHRoaXMgPT09IHRoYXQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGF0ICYmIHR5cGVvZiB0aGF0LmV2ZXJ5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQubGVuZ3RoID09PSB0aGlzLmxlbmd0aCAmJiB0aGF0LmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHZhbHVlKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGF0KTtcbiAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoID09PSB0aGlzLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh0aGF0KS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKHRoaXMuZ2V0KGtleSksIHRoYXRba2V5XSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn07XG5cbkdlbmVyaWNNYXAucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzKCk7XG59O1xuXG5HZW5lcmljTWFwLnByb3RvdHlwZS5JdGVtID0gSXRlbTtcblxuZnVuY3Rpb24gSXRlbShrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5JdGVtLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBPYmplY3QuZXF1YWxzKHRoaXMua2V5LCB0aGF0LmtleSkgJiYgT2JqZWN0LmVxdWFscyh0aGlzLnZhbHVlLCB0aGF0LnZhbHVlKTtcbn07XG5cbkl0ZW0ucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBPYmplY3QuY29tcGFyZSh0aGlzLmtleSwgdGhhdC5rZXkpO1xufTtcblxuIiwiXG52YXIgT2JqZWN0ID0gcmVxdWlyZShcIi4vc2hpbS1vYmplY3RcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gR2VuZXJpY09yZGVyO1xuZnVuY3Rpb24gR2VuZXJpY09yZGVyKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gR2VuZXJpY09yZGVyIGlzIGEgbWl4aW4uXCIpO1xufVxuXG5HZW5lcmljT3JkZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uICh0aGF0LCBlcXVhbHMpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgdGhpcy5jb250ZW50RXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG5cbiAgICBpZiAodGhpcyA9PT0gdGhhdCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCF0aGF0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5sZW5ndGggPT09IHRoYXQubGVuZ3RoICYmXG4gICAgICAgIHRoaXMuemlwKHRoYXQpLmV2ZXJ5KGZ1bmN0aW9uIChwYWlyKSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKHBhaXJbMF0sIHBhaXJbMV0pO1xuICAgICAgICB9KVxuICAgICk7XG59O1xuXG5HZW5lcmljT3JkZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiAodGhhdCwgY29tcGFyZSkge1xuICAgIGNvbXBhcmUgPSBjb21wYXJlIHx8IHRoaXMuY29udGVudENvbXBhcmUgfHwgT2JqZWN0LmNvbXBhcmU7XG5cbiAgICBpZiAodGhpcyA9PT0gdGhhdCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKCF0aGF0KSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1pbih0aGlzLmxlbmd0aCwgdGhhdC5sZW5ndGgpO1xuICAgIHZhciBjb21wYXJpc29uID0gdGhpcy56aXAodGhhdCkucmVkdWNlKGZ1bmN0aW9uIChjb21wYXJpc29uLCBwYWlyLCBpbmRleCkge1xuICAgICAgICBpZiAoY29tcGFyaXNvbiA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wYXJpc29uO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGFyZShwYWlyWzBdLCBwYWlyWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJpc29uO1xuICAgICAgICB9XG4gICAgfSwgMCk7XG4gICAgaWYgKGNvbXBhcmlzb24gPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoIC0gdGhhdC5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBjb21wYXJpc29uO1xufTtcblxuR2VuZXJpY09yZGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9BcnJheSgpO1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljU2V0O1xuZnVuY3Rpb24gR2VuZXJpY1NldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb25zdHJ1Y3QuIEdlbmVyaWNTZXQgaXMgYSBtaXhpbi5cIik7XG59XG5cbkdlbmVyaWNTZXQucHJvdG90eXBlLmlzU2V0ID0gdHJ1ZTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHZhciB1bmlvbiA9ICB0aGlzLmNvbnN0cnVjdENsb25lKHRoaXMpO1xuICAgIHVuaW9uLmFkZEVhY2godGhhdCk7XG4gICAgcmV0dXJuIHVuaW9uO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUuaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RDbG9uZSh0aGlzLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQuaGFzKHZhbHVlKTtcbiAgICB9KSk7XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5kaWZmZXJlbmNlID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICB2YXIgdW5pb24gPSAgdGhpcy5jb25zdHJ1Y3RDbG9uZSh0aGlzKTtcbiAgICB1bmlvbi5kZWxldGVFYWNoKHRoYXQpO1xuICAgIHJldHVybiB1bmlvbjtcbn07XG5cbkdlbmVyaWNTZXQucHJvdG90eXBlLnN5bW1ldHJpY0RpZmZlcmVuY2UgPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHZhciB1bmlvbiA9IHRoaXMudW5pb24odGhhdCk7XG4gICAgdmFyIGludGVyc2VjdGlvbiA9IHRoaXMuaW50ZXJzZWN0aW9uKHRoYXQpO1xuICAgIHJldHVybiB1bmlvbi5kaWZmZXJlbmNlKGludGVyc2VjdGlvbik7XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5kZWxldGVBbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBkZWxldGVBbGwgaXMgZXF1aXZhbGVudCB0byBkZWxldGUgZm9yIHNldHMgc2luY2UgdGhleSBndWFyYW50ZWUgdGhhdFxuICAgIC8vIG9ubHkgb25lIHZhbHVlIGV4aXN0cyBmb3IgYW4gZXF1aXZhbGVuY2UgY2xhc3MsIGJ1dCBkZWxldGVBbGwgcmV0dXJuc1xuICAgIC8vIHRoZSBjb3VudCBvZiBkZWxldGVkIHZhbHVlcyBpbnN0ZWFkIG9mIHdoZXRoZXIgYSB2YWx1ZSB3YXMgZGVsZXRlZC5cbiAgICByZXR1cm4gK3RoaXNbXCJkZWxldGVcIl0odmFsdWUpO1xufTtcblxuR2VuZXJpY1NldC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHRoYXQsIGVxdWFscykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gKFxuICAgICAgICB0aGF0ICYmIHR5cGVvZiB0aGF0LnJlZHVjZSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgIHRoaXMubGVuZ3RoID09PSB0aGF0Lmxlbmd0aCAmJlxuICAgICAgICB0aGF0LnJlZHVjZShmdW5jdGlvbiAoZXF1YWwsIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWwgJiYgc2VsZi5oYXModmFsdWUsIGVxdWFscyk7XG4gICAgICAgIH0sIHRydWUpXG4gICAgKTtcbn07XG5cbkdlbmVyaWNTZXQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50b0FycmF5KCk7XG59O1xuXG4vLyBXM0MgRE9NVG9rZW5MaXN0IEFQSSBvdmVybGFwIChkb2VzIG5vdCBoYW5kbGUgdmFyaWFkaWMgYXJndW1lbnRzKVxuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyh2YWx1ZSk7XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpc1tcImRlbGV0ZVwiXSh2YWx1ZSk7XG59O1xuXG5HZW5lcmljU2V0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5oYXModmFsdWUpKSB7XG4gICAgICAgIHRoaXNbXCJkZWxldGVcIl0odmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWRkKHZhbHVlKTtcbiAgICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0O1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG52YXIgR2VuZXJpY09yZGVyID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1vcmRlclwiKTtcbnZhciBQcm9wZXJ0eUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcHJvcGVydHktY2hhbmdlc1wiKTtcbnZhciBSYW5nZUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcmFuZ2UtY2hhbmdlc1wiKTtcblxuZnVuY3Rpb24gTGlzdCh2YWx1ZXMsIGVxdWFscywgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBMaXN0KSkge1xuICAgICAgICByZXR1cm4gbmV3IExpc3QodmFsdWVzLCBlcXVhbHMsIGdldERlZmF1bHQpO1xuICAgIH1cbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZCA9IG5ldyB0aGlzLk5vZGUoKTtcbiAgICBoZWFkLm5leHQgPSBoZWFkO1xuICAgIGhlYWQucHJldiA9IGhlYWQ7XG4gICAgdGhpcy5jb250ZW50RXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgdGhpcy5nZXREZWZhdWx0ID0gZ2V0RGVmYXVsdCB8fCBGdW5jdGlvbi5ub29wO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmFkZEVhY2godmFsdWVzKTtcbn1cblxuTGlzdC5MaXN0ID0gTGlzdDsgLy8gaGFjayBzbyByZXF1aXJlKFwibGlzdFwiKS5MaXN0IHdpbGwgd29yayBpbiBNb250YWdlSlNcblxuT2JqZWN0LmFkZEVhY2goTGlzdC5wcm90b3R5cGUsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChMaXN0LnByb3RvdHlwZSwgR2VuZXJpY09yZGVyLnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChMaXN0LnByb3RvdHlwZSwgUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChMaXN0LnByb3RvdHlwZSwgUmFuZ2VDaGFuZ2VzLnByb3RvdHlwZSk7XG5cbkxpc3QucHJvdG90eXBlLmNvbnN0cnVjdENsb25lID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih2YWx1ZXMsIHRoaXMuY29udGVudEVxdWFscywgdGhpcy5nZXREZWZhdWx0KTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscywgaW5kZXgpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgdGhpcy5jb250ZW50RXF1YWxzO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIHZhciBhdCA9IHRoaXMuc2NhbihpbmRleCwgaGVhZC5uZXh0KTtcbiAgICB3aGlsZSAoYXQgIT09IGhlYWQpIHtcbiAgICAgICAgaWYgKGVxdWFscyhhdC52YWx1ZSwgdmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXQ7XG4gICAgICAgIH1cbiAgICAgICAgYXQgPSBhdC5uZXh0O1xuICAgIH1cbn07XG5cbkxpc3QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMsIGluZGV4KSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IHRoaXMuY29udGVudEVxdWFscztcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICB2YXIgYXQgPSB0aGlzLnNjYW4oaW5kZXgsIGhlYWQucHJldik7XG4gICAgd2hpbGUgKGF0ICE9PSBoZWFkKSB7XG4gICAgICAgIGlmIChlcXVhbHMoYXQudmFsdWUsIHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGF0O1xuICAgICAgICB9XG4gICAgICAgIGF0ID0gYXQucHJldjtcbiAgICB9XG59O1xuXG5MaXN0LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIHJldHVybiAhIXRoaXMuZmluZCh2YWx1ZSwgZXF1YWxzKTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgdmFyIGZvdW5kID0gdGhpcy5maW5kKHZhbHVlLCBlcXVhbHMpO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gZm91bmQudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldERlZmF1bHQodmFsdWUpO1xufTtcblxuLy8gTElGTyAoZGVsZXRlIHJlbW92ZXMgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgZXF1aXZhbGVudCB2YWx1ZSlcbkxpc3QucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICB2YXIgZm91bmQgPSB0aGlzLmZpbmRMYXN0KHZhbHVlLCBlcXVhbHMpO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICB2YXIgcGx1cyA9IFtdO1xuICAgICAgICAgICAgdmFyIG1pbnVzID0gW3ZhbHVlXTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVSYW5nZUNoYW5nZShwbHVzLCBtaW51cywgZm91bmQuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGZvdW5kW1wiZGVsZXRlXCJdKCk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcyhmb3VuZC5uZXh0LCBmb3VuZC5pbmRleCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIGZvdW5kLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuTGlzdC5wcm90b3R5cGUuZGVsZXRlQWxsID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgdGhpcy5jb250ZW50RXF1YWxzO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIHZhciBhdCA9IGhlYWQubmV4dDtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHdoaWxlIChhdCAhPT0gaGVhZCkge1xuICAgICAgICBpZiAoZXF1YWxzKHZhbHVlLCBhdC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGF0W1wiZGVsZXRlXCJdKCk7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICB9XG4gICAgdGhpcy5sZW5ndGggLT0gY291bnQ7XG4gICAgcmV0dXJuIGNvdW50O1xufTtcblxuTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdXMsIG1pbnVzO1xuICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgbWludXMgPSB0aGlzLnRvQXJyYXkoKTtcbiAgICAgICAgcGx1cyA9IFtdO1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIDApO1xuICAgIH1cbiAgICB0aGlzLmhlYWQubmV4dCA9IHRoaXMuaGVhZC5wcmV2ID0gdGhpcy5oZWFkO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hSYW5nZUNoYW5nZShwbHVzLCBtaW51cywgMCk7XG4gICAgfVxufTtcblxuTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5Ob2RlKHZhbHVlKVxuICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgbm9kZS5pbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoW3ZhbHVlXSwgW10sIG5vZGUuaW5kZXgpO1xuICAgIH1cbiAgICB0aGlzLmhlYWQuYWRkQmVmb3JlKG5vZGUpO1xuICAgIHRoaXMubGVuZ3RoKys7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UoW3ZhbHVlXSwgW10sIG5vZGUuaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhlYWQgPSB0aGlzLmhlYWQ7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB2YXIgcGx1cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBtaW51cyA9IFtdXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIGluZGV4KTtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5oZWFkLnByZXY7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5Ob2RlKHZhbHVlKTtcbiAgICAgICAgaGVhZC5hZGRCZWZvcmUobm9kZSk7XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoICs9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLnVwZGF0ZUluZGV4ZXMoc3RhcnQubmV4dCwgc3RhcnQuaW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiBzdGFydC5pbmRleCArIDEpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIGluZGV4KTtcbiAgICB9XG59O1xuXG5MaXN0LnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgdmFyIHBsdXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICB2YXIgbWludXMgPSBbXTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZVJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCAwKTtcbiAgICB9XG4gICAgdmFyIGF0ID0gdGhpcy5oZWFkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5Ob2RlKHZhbHVlKTtcbiAgICAgICAgYXQuYWRkQWZ0ZXIobm9kZSk7XG4gICAgICAgIGF0ID0gbm9kZTtcbiAgICB9XG4gICAgdGhpcy5sZW5ndGggKz0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcyh0aGlzLmhlYWQubmV4dCwgMCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hSYW5nZUNoYW5nZShwbHVzLCBtaW51cywgMCk7XG4gICAgfVxufTtcblxuTGlzdC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICBpZiAoaGVhZC5wcmV2ICE9PSBoZWFkKSB7XG4gICAgICAgIHZhbHVlID0gaGVhZC5wcmV2LnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICB2YXIgcGx1cyA9IFtdO1xuICAgICAgICAgICAgdmFyIG1pbnVzID0gW3ZhbHVlXTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVSYW5nZUNoYW5nZShwbHVzLCBtaW51cywgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGhlYWQucHJldlsnZGVsZXRlJ10oKTtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufTtcblxuTGlzdC5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIGlmIChoZWFkLnByZXYgIT09IGhlYWQpIHtcbiAgICAgICAgdmFsdWUgPSBoZWFkLm5leHQudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHZhciBwbHVzID0gW107XG4gICAgICAgICAgICB2YXIgbWludXMgPSBbdmFsdWVdO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZVJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCAwKTtcbiAgICAgICAgfVxuICAgICAgICBoZWFkLm5leHRbJ2RlbGV0ZSddKCk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcyh0aGlzLmhlYWQubmV4dCwgMCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaGVhZCAhPT0gdGhpcy5oZWFkLm5leHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVhZC5uZXh0LnZhbHVlO1xuICAgIH1cbn07XG5cbkxpc3QucHJvdG90eXBlLnBva2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5oZWFkICE9PSB0aGlzLmhlYWQubmV4dCkge1xuICAgICAgICB0aGlzLmhlYWQubmV4dC52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHVzaCh2YWx1ZSk7XG4gICAgfVxufTtcblxuTGlzdC5wcm90b3R5cGUub25lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnBlZWsoKTtcbn07XG5cbi8vIFRPRE9cbi8vIExpc3QucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAodmFsdWUpIHtcbi8vIH07XG5cbi8vIFRPRE9cbi8vIExpc3QucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4vLyB9O1xuXG4vLyBhbiBpbnRlcm5hbCB1dGlsaXR5IGZvciBjb2VyY2luZyBpbmRleCBvZmZzZXRzIHRvIG5vZGVzXG5MaXN0LnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gKGF0LCBmYWxsYmFjaykge1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIGlmICh0eXBlb2YgYXQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gYXQ7XG4gICAgICAgIGlmIChjb3VudCA+PSAwKSB7XG4gICAgICAgICAgICBhdCA9IGhlYWQubmV4dDtcbiAgICAgICAgICAgIHdoaWxlIChjb3VudCkge1xuICAgICAgICAgICAgICAgIGNvdW50LS07XG4gICAgICAgICAgICAgICAgYXQgPSBhdC5uZXh0O1xuICAgICAgICAgICAgICAgIGlmIChhdCA9PSBoZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF0ID0gaGVhZDtcbiAgICAgICAgICAgIHdoaWxlIChjb3VudCA8IDApIHtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgIGF0ID0gYXQucHJldjtcbiAgICAgICAgICAgICAgICBpZiAoYXQgPT0gaGVhZCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhdCB8fCBmYWxsYmFjaztcbiAgICB9XG59O1xuXG4vLyBhdCBhbmQgZW5kIG1heSBib3RoIGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIG51bWJlcnMgKGluIHdoaWNoIGNhc2VzIHRoZXlcbi8vIGNvcnJlc3BvbmQgdG8gbnVtZXJpYyBpbmRpY2llcywgb3Igbm9kZXMpXG5MaXN0LnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChhdCwgZW5kKSB7XG4gICAgdmFyIHNsaWNlZCA9IFtdO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIGF0ID0gdGhpcy5zY2FuKGF0LCBoZWFkLm5leHQpO1xuICAgIGVuZCA9IHRoaXMuc2NhbihlbmQsIGhlYWQpO1xuXG4gICAgd2hpbGUgKGF0ICE9PSBlbmQgJiYgYXQgIT09IGhlYWQpIHtcbiAgICAgICAgc2xpY2VkLnB1c2goYXQudmFsdWUpO1xuICAgICAgICBhdCA9IGF0Lm5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNsaWNlZDtcbn07XG5cbkxpc3QucHJvdG90eXBlLnNwbGljZSA9IGZ1bmN0aW9uIChhdCwgbGVuZ3RoIC8qLi4ucGx1cyovKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dhcChhdCwgbGVuZ3RoLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbiAoc3RhcnQsIGxlbmd0aCwgcGx1cykge1xuICAgIHZhciBpbml0aWFsID0gc3RhcnQ7XG4gICAgLy8gc3RhcnQgd2lsbCBiZSBoZWFkIGlmIHN0YXJ0IGlzIG51bGwgb3IgLTEgKG1lYW5pbmcgZnJvbSB0aGUgZW5kKSwgYnV0XG4gICAgLy8gd2lsbCBiZSBoZWFkLm5leHQgaWYgc3RhcnQgaXMgMCAobWVhbmluZyBmcm9tIHRoZSBiZWdpbm5pbmcpXG4gICAgc3RhcnQgPSB0aGlzLnNjYW4oc3RhcnQsIHRoaXMuaGVhZCk7XG4gICAgaWYgKGxlbmd0aCA9PSBudWxsKSB7XG4gICAgICAgIGxlbmd0aCA9IEluZmluaXR5O1xuICAgIH1cbiAgICBwbHVzID0gQXJyYXkuZnJvbShwbHVzKTtcblxuICAgIC8vIGNvbGxlY3QgdGhlIG1pbnVzIGFycmF5XG4gICAgdmFyIG1pbnVzID0gW107XG4gICAgdmFyIGF0ID0gc3RhcnQ7XG4gICAgd2hpbGUgKGxlbmd0aC0tICYmIGxlbmd0aCA+PSAwICYmIGF0ICE9PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgbWludXMucHVzaChhdC52YWx1ZSk7XG4gICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmUgcmFuZ2UgY2hhbmdlXG4gICAgdmFyIGluZGV4LCBzdGFydE5vZGU7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICBpZiAoc3RhcnQgPT09IHRoaXMuaGVhZCkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydC5wcmV2ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gc3RhcnQuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnROb2RlID0gc3RhcnQucHJldjtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEJlZm9yZVJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCBpbmRleCk7XG4gICAgfVxuXG4gICAgLy8gZGVsZXRlIG1pbnVzXG4gICAgdmFyIGF0ID0gc3RhcnQ7XG4gICAgZm9yICh2YXIgaSA9IDAsIGF0ID0gc3RhcnQ7IGkgPCBtaW51cy5sZW5ndGg7IGkrKywgYXQgPSBhdC5uZXh0KSB7XG4gICAgICAgIGF0W1wiZGVsZXRlXCJdKCk7XG4gICAgfVxuICAgIC8vIGFkZCBwbHVzXG4gICAgaWYgKGluaXRpYWwgPT0gbnVsbCAmJiBhdCA9PT0gdGhpcy5oZWFkKSB7XG4gICAgICAgIGF0ID0gdGhpcy5oZWFkLm5leHQ7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGx1cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyB0aGlzLk5vZGUocGx1c1tpXSk7XG4gICAgICAgIGF0LmFkZEJlZm9yZShub2RlKTtcbiAgICB9XG4gICAgLy8gYWRqdXN0IGxlbmd0aFxuICAgIHRoaXMubGVuZ3RoICs9IHBsdXMubGVuZ3RoIC0gbWludXMubGVuZ3RoO1xuXG4gICAgLy8gYWZ0ZXIgcmFuZ2UgY2hhbmdlXG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICBpZiAoc3RhcnQgPT09IHRoaXMuaGVhZCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVJbmRleGVzKHRoaXMuaGVhZC5uZXh0LCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcyhzdGFydE5vZGUubmV4dCwgc3RhcnROb2RlLmluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKHBsdXMsIG1pbnVzLCBpbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1pbnVzO1xufTtcblxuTGlzdC5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgIHZhciBtaW51cyA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB2YXIgcGx1cyA9IG1pbnVzLnJldmVyc2VkKCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hCZWZvcmVSYW5nZUNoYW5nZShwbHVzLCBtaW51cywgMCk7XG4gICAgfVxuICAgIHZhciBhdCA9IHRoaXMuaGVhZDtcbiAgICBkbyB7XG4gICAgICAgIHZhciB0ZW1wID0gYXQubmV4dDtcbiAgICAgICAgYXQubmV4dCA9IGF0LnByZXY7XG4gICAgICAgIGF0LnByZXYgPSB0ZW1wO1xuICAgICAgICBhdCA9IGF0Lm5leHQ7XG4gICAgfSB3aGlsZSAoYXQgIT09IHRoaXMuaGVhZCk7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIDApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkxpc3QucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zd2FwKDAsIHRoaXMubGVuZ3RoLCB0aGlzLnNvcnRlZCgpKTtcbn07XG5cbi8vIFRPRE8gYWNjb3VudCBmb3IgbWlzc2luZyBiYXNpcyBhcmd1bWVudFxuTGlzdC5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcyAvKiwgdGhpc3AqLykge1xuICAgIHZhciB0aGlzcCA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgICB2YXIgYXQgPSBoZWFkLm5leHQ7XG4gICAgd2hpbGUgKGF0ICE9PSBoZWFkKSB7XG4gICAgICAgIGJhc2lzID0gY2FsbGJhY2suY2FsbCh0aGlzcCwgYmFzaXMsIGF0LnZhbHVlLCBhdCwgdGhpcyk7XG4gICAgICAgIGF0ID0gYXQubmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2lzO1xufTtcblxuTGlzdC5wcm90b3R5cGUucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzIC8qLCB0aGlzcCovKSB7XG4gICAgdmFyIHRoaXNwID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICAgIHZhciBhdCA9IGhlYWQucHJldjtcbiAgICB3aGlsZSAoYXQgIT09IGhlYWQpIHtcbiAgICAgICAgYmFzaXMgPSBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgYXQudmFsdWUsIGF0LCB0aGlzKTtcbiAgICAgICAgYXQgPSBhdC5wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gYmFzaXM7XG59O1xuXG5MaXN0LnByb3RvdHlwZS51cGRhdGVJbmRleGVzID0gZnVuY3Rpb24gKG5vZGUsIGluZGV4KSB7XG4gICAgd2hpbGUgKG5vZGUgIT09IHRoaXMuaGVhZCkge1xuICAgICAgICBub2RlLmluZGV4ID0gaW5kZXgrKztcbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICB9XG59O1xuXG5MaXN0LnByb3RvdHlwZS5tYWtlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmhlYWQuaW5kZXggPSAtMTtcbiAgICB0aGlzLnVwZGF0ZUluZGV4ZXModGhpcy5oZWFkLm5leHQsIDApO1xuICAgIHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcyA9IHRydWU7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgTGlzdEl0ZXJhdG9yKHRoaXMuaGVhZCk7XG59O1xuXG5mdW5jdGlvbiBMaXN0SXRlcmF0b3IoaGVhZCkge1xuICAgIHRoaXMuaGVhZCA9IGhlYWQ7XG4gICAgdGhpcy5hdCA9IGhlYWQubmV4dDtcbn07XG5cbkxpc3RJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5hdCA9PT0gdGhpcy5oZWFkKSB7XG4gICAgICAgIHRocm93IFN0b3BJdGVyYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5hdC52YWx1ZTtcbiAgICAgICAgdGhpcy5hdCA9IHRoaXMuYXQubmV4dDtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn07XG5cbkxpc3QucHJvdG90eXBlLk5vZGUgPSBOb2RlO1xuXG5mdW5jdGlvbiBOb2RlKHZhbHVlKSB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbn07XG5cbk5vZGUucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJldi5uZXh0ID0gdGhpcy5uZXh0O1xuICAgIHRoaXMubmV4dC5wcmV2ID0gdGhpcy5wcmV2O1xufTtcblxuTm9kZS5wcm90b3R5cGUuYWRkQmVmb3JlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgcHJldiA9IHRoaXMucHJldjtcbiAgICB0aGlzLnByZXYgPSBub2RlO1xuICAgIG5vZGUucHJldiA9IHByZXY7XG4gICAgcHJldi5uZXh0ID0gbm9kZTtcbiAgICBub2RlLm5leHQgPSB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuYWRkQWZ0ZXIgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciBuZXh0ID0gdGhpcy5uZXh0O1xuICAgIHRoaXMubmV4dCA9IG5vZGU7XG4gICAgbm9kZS5uZXh0ID0gbmV4dDtcbiAgICBuZXh0LnByZXYgPSBub2RlO1xuICAgIG5vZGUucHJldiA9IHRoaXM7XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFdlYWtNYXAgPSByZXF1aXJlKFwid2Vhay1tYXBcIik7XG52YXIgTGlzdCA9IHJlcXVpcmUoXCIuLi9saXN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENoYW5nZXM7XG5mdW5jdGlvbiBNYXBDaGFuZ2VzKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gTWFwQ2hhbmdlcyBpcyBhIG1peGluLlwiKTtcbn1cblxudmFyIG9iamVjdF9vd25zID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLypcbiAgICBPYmplY3QgbWFwIGNoYW5nZSBkZXNjcmlwdG9ycyBjYXJyeSBpbmZvcm1hdGlvbiBuZWNlc3NhcnkgZm9yIGFkZGluZyxcbiAgICByZW1vdmluZywgZGlzcGF0Y2hpbmcsIGFuZCBzaG9ydGluZyBldmVudHMgdG8gbGlzdGVuZXJzIGZvciBtYXAgY2hhbmdlc1xuICAgIGZvciBhIHBhcnRpY3VsYXIga2V5IG9uIGEgcGFydGljdWxhciBvYmplY3QuICBUaGVzZSBkZXNjcmlwdG9ycyBhcmUgdXNlZFxuICAgIGhlcmUgZm9yIHNoYWxsb3cgbWFwIGNoYW5nZXMuXG5cbiAgICB7XG4gICAgICAgIHdpbGxDaGFuZ2VMaXN0ZW5lcnM6QXJyYXkoRnVuY3Rpb24pXG4gICAgICAgIGNoYW5nZUxpc3RlbmVyczpBcnJheShGdW5jdGlvbilcbiAgICB9XG4qL1xuXG52YXIgbWFwQ2hhbmdlRGVzY3JpcHRvcnMgPSBuZXcgV2Vha01hcCgpO1xuXG5NYXBDaGFuZ2VzLnByb3RvdHlwZS5nZXRBbGxNYXBDaGFuZ2VEZXNjcmlwdG9ycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgRGljdCA9IHJlcXVpcmUoXCIuLi9kaWN0XCIpO1xuICAgIGlmICghbWFwQ2hhbmdlRGVzY3JpcHRvcnMuaGFzKHRoaXMpKSB7XG4gICAgICAgIG1hcENoYW5nZURlc2NyaXB0b3JzLnNldCh0aGlzLCBEaWN0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gbWFwQ2hhbmdlRGVzY3JpcHRvcnMuZ2V0KHRoaXMpO1xufTtcblxuTWFwQ2hhbmdlcy5wcm90b3R5cGUuZ2V0TWFwQ2hhbmdlRGVzY3JpcHRvciA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHZhciB0b2tlbkNoYW5nZURlc2NyaXB0b3JzID0gdGhpcy5nZXRBbGxNYXBDaGFuZ2VEZXNjcmlwdG9ycygpO1xuICAgIHRva2VuID0gdG9rZW4gfHwgXCJcIjtcbiAgICBpZiAoIXRva2VuQ2hhbmdlRGVzY3JpcHRvcnMuaGFzKHRva2VuKSkge1xuICAgICAgICB0b2tlbkNoYW5nZURlc2NyaXB0b3JzLnNldCh0b2tlbiwge1xuICAgICAgICAgICAgd2lsbENoYW5nZUxpc3RlbmVyczogbmV3IExpc3QoKSxcbiAgICAgICAgICAgIGNoYW5nZUxpc3RlbmVyczogbmV3IExpc3QoKVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VuQ2hhbmdlRGVzY3JpcHRvcnMuZ2V0KHRva2VuKTtcbn07XG5cbk1hcENoYW5nZXMucHJvdG90eXBlLmFkZE1hcENoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGxpc3RlbmVyLCB0b2tlbiwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgaWYgKCF0aGlzLmlzT2JzZXJ2YWJsZSAmJiB0aGlzLm1ha2VPYnNlcnZhYmxlKSB7XG4gICAgICAgIC8vIGZvciBBcnJheVxuICAgICAgICB0aGlzLm1ha2VPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIHZhciBkZXNjcmlwdG9yID0gdGhpcy5nZXRNYXBDaGFuZ2VEZXNjcmlwdG9yKHRva2VuKTtcbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuY2hhbmdlTGlzdGVuZXJzO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGlzcGF0Y2hlc01hcENoYW5nZXNcIiwge1xuICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gY2FuY2VsTWFwQ2hhbmdlTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICghc2VsZikge1xuICAgICAgICAgICAgLy8gVE9ETyB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZW1vdmUgbWFwIGNoYW5nZSBsaXN0ZW5lciBhZ2FpblwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnJlbW92ZU1hcENoYW5nZUxpc3RlbmVyKGxpc3RlbmVyLCB0b2tlbiwgYmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgc2VsZiA9IG51bGw7XG4gICAgfTtcbn07XG5cbk1hcENoYW5nZXMucHJvdG90eXBlLnJlbW92ZU1hcENoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGxpc3RlbmVyLCB0b2tlbiwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSB0aGlzLmdldE1hcENoYW5nZURlc2NyaXB0b3IodG9rZW4pO1xuXG4gICAgdmFyIGxpc3RlbmVycztcbiAgICBpZiAoYmVmb3JlQ2hhbmdlKSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3Iud2lsbENoYW5nZUxpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLmNoYW5nZUxpc3RlbmVycztcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IGxpc3RlbmVycy5maW5kTGFzdChsaXN0ZW5lcik7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbW92ZSBtYXAgY2hhbmdlIGxpc3RlbmVyOiBkb2VzIG5vdCBleGlzdDogdG9rZW4gXCIgKyBKU09OLnN0cmluZ2lmeSh0b2tlbikpO1xuICAgIH1cbiAgICBub2RlW1wiZGVsZXRlXCJdKCk7XG59O1xuXG5NYXBDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaE1hcENoYW5nZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICB2YXIgZGVzY3JpcHRvcnMgPSB0aGlzLmdldEFsbE1hcENoYW5nZURlc2NyaXB0b3JzKCk7XG4gICAgdmFyIGNoYW5nZU5hbWUgPSBcIk1hcFwiICsgKGJlZm9yZUNoYW5nZSA/IFwiV2lsbENoYW5nZVwiIDogXCJDaGFuZ2VcIik7XG4gICAgZGVzY3JpcHRvcnMuZm9yRWFjaChmdW5jdGlvbiAoZGVzY3JpcHRvciwgdG9rZW4pIHtcblxuICAgICAgICBpZiAoZGVzY3JpcHRvci5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlzdGVuZXJzO1xuICAgICAgICBpZiAoYmVmb3JlQ2hhbmdlKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLndpbGxDaGFuZ2VMaXN0ZW5lcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLmNoYW5nZUxpc3RlbmVycztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0b2tlbk5hbWUgPSBcImhhbmRsZVwiICsgKFxuICAgICAgICAgICAgdG9rZW4uc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArXG4gICAgICAgICAgICB0b2tlbi5zbGljZSgxKVxuICAgICAgICApICsgY2hhbmdlTmFtZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gZGlzcGF0Y2ggdG8gZWFjaCBsaXN0ZW5lclxuICAgICAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyW3Rva2VuTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJbdG9rZW5OYW1lXSh2YWx1ZSwga2V5LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RlbmVyLmNhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbChsaXN0ZW5lciwgdmFsdWUsIGtleSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGFuZGxlciBcIiArIGxpc3RlbmVyICsgXCIgaGFzIG5vIG1ldGhvZCBcIiArIHRva2VuTmFtZSArIFwiIGFuZCBpcyBub3QgY2FsbGFibGVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH0sIHRoaXMpO1xufTtcblxuTWFwQ2hhbmdlcy5wcm90b3R5cGUuYWRkQmVmb3JlTWFwQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIsIHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWFwQ2hhbmdlTGlzdGVuZXIobGlzdGVuZXIsIHRva2VuLCB0cnVlKTtcbn07XG5cbk1hcENoYW5nZXMucHJvdG90eXBlLnJlbW92ZUJlZm9yZU1hcENoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGxpc3RlbmVyLCB0b2tlbikge1xuICAgIHJldHVybiB0aGlzLnJlbW92ZU1hcENoYW5nZUxpc3RlbmVyKGxpc3RlbmVyLCB0b2tlbiwgdHJ1ZSk7XG59O1xuXG5NYXBDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaEJlZm9yZU1hcENoYW5nZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hNYXBDaGFuZ2Uoa2V5LCB2YWx1ZSwgdHJ1ZSk7XG59O1xuXG4iLCIvKlxuICAgIEJhc2VkIGluIHBhcnQgb24gb2JzZXJ2YWJsZSBhcnJheXMgZnJvbSBNb3Rvcm9sYSBNb2JpbGl0eeKAmXMgTW9udGFnZVxuICAgIENvcHlyaWdodCAoYykgMjAxMiwgTW90b3JvbGEgTW9iaWxpdHkgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIDMtQ2xhdXNlIEJTRCBMaWNlbnNlXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL21vdG9yb2xhLW1vYmlsaXR5L21vbnRhZ2UvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuKi9cblxuLypcbiAgICBUaGlzIG1vZHVsZSBpcyByZXNwb25zaWJsZSBmb3Igb2JzZXJ2aW5nIGNoYW5nZXMgdG8gb3duZWQgcHJvcGVydGllcyBvZlxuICAgIG9iamVjdHMgYW5kIGNoYW5nZXMgdG8gdGhlIGNvbnRlbnQgb2YgYXJyYXlzIGNhdXNlZCBieSBtZXRob2QgY2FsbHMuXG4gICAgVGhlIGludGVyZmFjZSBmb3Igb2JzZXJ2aW5nIGFycmF5IGNvbnRlbnQgY2hhbmdlcyBlc3RhYmxpc2hlcyB0aGUgbWV0aG9kc1xuICAgIG5lY2Vzc2FyeSBmb3IgYW55IGNvbGxlY3Rpb24gd2l0aCBvYnNlcnZhYmxlIGNvbnRlbnQuXG4qL1xuXG5yZXF1aXJlKFwiLi4vc2hpbVwiKTtcblxudmFyIG9iamVjdF9vd25zID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gT2JqZWN0IHByb3BlcnR5IGRlc2NyaXB0b3JzIGNhcnJ5IGluZm9ybWF0aW9uIG5lY2Vzc2FyeSBmb3IgYWRkaW5nLFxuLy8gcmVtb3ZpbmcsIGRpc3BhdGNoaW5nLCBhbmQgc2hvcnRpbmcgZXZlbnRzIHRvIGxpc3RlbmVycyBmb3IgcHJvcGVydHkgY2hhbmdlc1xuLy8gZm9yIGEgcGFydGljdWxhciBrZXkgb24gYSBwYXJ0aWN1bGFyIG9iamVjdC4gIFRoZXNlIGRlc2NyaXB0b3JzIGFyZSB1c2VkXG4vLyBoZXJlIGZvciBzaGFsbG93IHByb3BlcnR5IGNoYW5nZXMuICBUaGUgY3VycmVudCBsaXN0ZW5lcnMgYXJlIHRoZSBvbmVzXG4vLyBtb2RpZmllZCBieSBhZGQgYW5kIHJlbW92ZSBvd24gcHJvcGVydHkgY2hhbmdlIGxpc3RlbmVyIG1ldGhvZHMuICBEdXJpbmdcbi8vIHByb3BlcnR5IGNoYW5nZSBkaXNwYXRjaCwgd2UgY2FwdHVyZSBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IGxpc3RlbmVycyBpblxuLy8gdGhlIGFjdGl2ZSBjaGFuZ2UgbGlzdGVuZXJzIGFycmF5LiAgVGhlIGRlc2NyaXB0b3IgYWxzbyBrZWVwcyBhIG1lbW8gb2YgdGhlXG4vLyBjb3JyZXNwb25kaW5nIGhhbmRsZXIgbWV0aG9kIG5hbWVzLlxuLy9cbi8vIHtcbi8vICAgICB3aWxsQ2hhbmdlTGlzdGVuZXJzOntjdXJyZW50LCBhY3RpdmU6QXJyYXk8RnVuY3Rpb24+LCAuLi5tZXRob2QgbmFtZXN9XG4vLyAgICAgY2hhbmdlTGlzdGVuZXJzOntjdXJyZW50LCBhY3RpdmU6QXJyYXk8RnVuY3Rpb24+LCAuLi5tZXRob2QgbmFtZXN9XG4vLyB9XG5cbi8vIE1heWJlIHJlbW92ZSBlbnRyaWVzIGZyb20gdGhpcyB0YWJsZSBpZiB0aGUgY29ycmVzcG9uZGluZyBvYmplY3Qgbm8gbG9uZ2VyXG4vLyBoYXMgYW55IHByb3BlcnR5IGNoYW5nZSBsaXN0ZW5lcnMgZm9yIGFueSBrZXkuICBIb3dldmVyLCB0aGUgY29zdCBvZlxuLy8gYm9vay1rZWVwaW5nIGlzIHByb2JhYmx5IG5vdCB3YXJyYW50ZWQgc2luY2UgaXQgd291bGQgYmUgcmFyZSBmb3IgYW5cbi8vIG9ic2VydmVkIG9iamVjdCB0byBubyBsb25nZXIgYmUgb2JzZXJ2ZWQgdW5sZXNzIGl0IHdhcyBhYm91dCB0byBiZSBkaXNwb3NlZFxuLy8gb2Ygb3IgcmV1c2VkIGFzIGFuIG9ic2VydmFibGUuICBUaGUgb25seSBiZW5lZml0IHdvdWxkIGJlIGluIGF2b2lkaW5nIGJ1bGtcbi8vIGNhbGxzIHRvIGRpc3BhdGNoT3duUHJvcGVydHlDaGFuZ2UgZXZlbnRzIG9uIG9iamVjdHMgdGhhdCBoYXZlIG5vIGxpc3RlbmVycy5cblxuLy8gIFRvIG9ic2VydmUgc2hhbGxvdyBwcm9wZXJ0eSBjaGFuZ2VzIGZvciBhIHBhcnRpY3VsYXIga2V5IG9mIGEgcGFydGljdWxhclxuLy8gIG9iamVjdCwgd2UgaW5zdGFsbCBhIHByb3BlcnR5IGRlc2NyaXB0b3Igb24gdGhlIG9iamVjdCB0aGF0IG92ZXJyaWRlcyB0aGUgcHJldmlvdXNcbi8vICBkZXNjcmlwdG9yLiAgVGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvcnMgYXJlIHN0b3JlZCBpbiB0aGlzIHdlYWsgbWFwLiAgVGhlXG4vLyAgd2VhayBtYXAgYXNzb2NpYXRlcyBhbiBvYmplY3Qgd2l0aCBhbm90aGVyIG9iamVjdCB0aGF0IG1hcHMgcHJvcGVydHkgbmFtZXNcbi8vICB0byBwcm9wZXJ0eSBkZXNjcmlwdG9ycy5cbi8vXG4vLyAgb2JqZWN0Ll9fb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnNfX1trZXldXG4vL1xuLy8gIFdlIHJldGFpbiB0aGUgb2xkIGRlc2NyaXB0b3IgZm9yIHZhcmlvdXMgcHVycG9zZXMuICBGb3Igb25lLCBpZiB0aGUgcHJvcGVydHlcbi8vICBpcyBubyBsb25nZXIgYmVpbmcgb2JzZXJ2ZWQgYnkgYW55b25lLCB3ZSByZXZlcnQgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3IgdG9cbi8vICB0aGUgb3JpZ2luYWwuICBGb3IgXCJ2YWx1ZVwiIGRlc2NyaXB0b3JzLCB3ZSBzdG9yZSB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZVxuLy8gIGRlc2NyaXB0b3Igb24gdGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvciwgc28gd2hlbiB0aGUgcHJvcGVydHkgaXMgcmV2ZXJ0ZWQsIGl0XG4vLyAgcmV0YWlucyB0aGUgbW9zdCByZWNlbnRseSBzZXQgdmFsdWUuICBGb3IgXCJnZXRcIiBhbmQgXCJzZXRcIiBkZXNjcmlwdG9ycyxcbi8vICB3ZSBvYnNlcnZlIHRoZW4gZm9yd2FyZCBcImdldFwiIGFuZCBcInNldFwiIG9wZXJhdGlvbnMgdG8gdGhlIG9yaWdpbmFsIGRlc2NyaXB0b3IuXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlDaGFuZ2VzO1xuXG5mdW5jdGlvbiBQcm9wZXJ0eUNoYW5nZXMoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBpcyBhbiBhYnN0cmFjdCBpbnRlcmZhY2UuIE1peCBpdC4gRG9uJ3QgY29uc3RydWN0IGl0XCIpO1xufVxuXG5Qcm9wZXJ0eUNoYW5nZXMuZGVidWcgPSB0cnVlO1xuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmdldE93blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvciA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIXRoaXMuX19wcm9wZXJ0eUNoYW5nZUxpc3RlbmVyc19fKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIl9fcHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnNfX1wiLCB7XG4gICAgICAgICAgICB2YWx1ZToge30sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9ycyA9IHRoaXMuX19wcm9wZXJ0eUNoYW5nZUxpc3RlbmVyc19fO1xuICAgIGlmICghb2JqZWN0X293bnMuY2FsbChvYmplY3RQcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3JzLCBrZXkpKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWUgPSBTdHJpbmcoa2V5KTtcbiAgICAgICAgcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lICYmIHByb3BlcnR5TmFtZVswXS50b1VwcGVyQ2FzZSgpICsgcHJvcGVydHlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBvYmplY3RQcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3JzW2tleV0gPSB7XG4gICAgICAgICAgICB3aWxsQ2hhbmdlTGlzdGVuZXJzOiB7XG4gICAgICAgICAgICAgICAgY3VycmVudDogW10sXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBbXSxcbiAgICAgICAgICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lOiBcImhhbmRsZVwiICsgcHJvcGVydHlOYW1lICsgXCJXaWxsQ2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lOiBcImhhbmRsZVByb3BlcnR5V2lsbENoYW5nZVwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhbmdlTGlzdGVuZXJzOiB7XG4gICAgICAgICAgICAgICAgY3VycmVudDogW10sXG4gICAgICAgICAgICAgICAgYWN0aXZlOiBbXSxcbiAgICAgICAgICAgICAgICBzcGVjaWZpY0hhbmRsZXJNZXRob2ROYW1lOiBcImhhbmRsZVwiICsgcHJvcGVydHlOYW1lICsgXCJDaGFuZ2VcIixcbiAgICAgICAgICAgICAgICBnZW5lcmljSGFuZGxlck1ldGhvZE5hbWU6IFwiaGFuZGxlUHJvcGVydHlDaGFuZ2VcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yc1trZXldO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCF0aGlzLl9fcHJvcGVydHlDaGFuZ2VMaXN0ZW5lcnNfXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICgha2V5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgb2JqZWN0UHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9ycyA9IHRoaXMuX19wcm9wZXJ0eUNoYW5nZUxpc3RlbmVyc19fO1xuICAgIGlmICghb2JqZWN0X293bnMuY2FsbChvYmplY3RQcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3JzLCBrZXkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgaWYgKHRoaXMubWFrZU9ic2VydmFibGUgJiYgIXRoaXMuaXNPYnNlcnZhYmxlKSB7XG4gICAgICAgIHRoaXMubWFrZU9ic2VydmFibGUoKTsgLy8gcGFydGljdWxhcmx5IGZvciBvYnNlcnZhYmxlIGFycmF5cywgZm9yXG4gICAgICAgIC8vIHRoZWlyIGxlbmd0aCBwcm9wZXJ0eVxuICAgIH1cbiAgICB2YXIgZGVzY3JpcHRvciA9IFByb3BlcnR5Q2hhbmdlcy5nZXRPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IodGhpcywga2V5KTtcbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuY2hhbmdlTGlzdGVuZXJzO1xuICAgIH1cbiAgICBQcm9wZXJ0eUNoYW5nZXMubWFrZVByb3BlcnR5T2JzZXJ2YWJsZSh0aGlzLCBrZXkpO1xuICAgIGxpc3RlbmVycy5jdXJyZW50LnB1c2gobGlzdGVuZXIpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiBjYW5jZWxPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKCkge1xuICAgICAgICBQcm9wZXJ0eUNoYW5nZXMucmVtb3ZlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcihzZWxmLCBrZXksIGxpc3RlbmVycy5jdXJyZW50LCBiZWZvcmVDaGFuZ2UpO1xuICAgICAgICBzZWxmID0gbnVsbDtcbiAgICB9O1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5hZGRCZWZvcmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGtleSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIodGhpcywga2V5LCBsaXN0ZW5lciwgdHJ1ZSk7XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBQcm9wZXJ0eUNoYW5nZXMuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKHRoaXMsIGtleSk7XG5cbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuY2hhbmdlTGlzdGVuZXJzO1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5jdXJyZW50Lmxhc3RJbmRleE9mKGxpc3RlbmVyKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJlbW92ZSBwcm9wZXJ0eSBjaGFuZ2UgbGlzdGVuZXI6IGRvZXMgbm90IGV4aXN0OiBwcm9wZXJ0eSBuYW1lXCIgKyBKU09OLnN0cmluZ2lmeShrZXkpKTtcbiAgICB9XG4gICAgbGlzdGVuZXJzLmN1cnJlbnQuc3BsaWNlKGluZGV4LCAxKTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUucmVtb3ZlQmVmb3JlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChrZXksIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKHRoaXMsIGtleSwgbGlzdGVuZXIsIHRydWUpO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIGJlZm9yZUNoYW5nZSkge1xuICAgIHZhciBkZXNjcmlwdG9yID0gUHJvcGVydHlDaGFuZ2VzLmdldE93blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcih0aGlzLCBrZXkpO1xuXG4gICAgaWYgKGRlc2NyaXB0b3IuaXNBY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZXNjcmlwdG9yLmlzQWN0aXZlID0gdHJ1ZTtcblxuICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgaWYgKGJlZm9yZUNoYW5nZSkge1xuICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLndpbGxDaGFuZ2VMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci5jaGFuZ2VMaXN0ZW5lcnM7XG4gICAgfVxuXG5cdGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBkaXNwYXRjaCB0byBlYWNoIGxpc3RlbmVyXG4gICAgICAgIGRpc3BhdGNoRWFjaC5jYWxsKHRoaXMsIGxpc3RlbmVycywga2V5LCB2YWx1ZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn07XG5cbi8vIEZhY3RvcmVkIG91dCBvZiBwYXJlbnQgdG8gYXZvaWQgdHJ5L2NhdGNoIGRlb3B0aW1pemF0aW9uXG5mdW5jdGlvbiBkaXNwYXRjaEVhY2gobGlzdGVuZXJzLCBrZXksIHZhbHVlKSB7XG4gICAgLy8gY29weSBzbmFwc2hvdCBvZiBjdXJyZW50IGxpc3RlbmVycyB0byBhY3RpdmUgbGlzdGVuZXJzXG4gICAgdmFyIGFjdGl2ZSA9IGxpc3RlbmVycy5hY3RpdmU7XG4gICAgdmFyIGN1cnJlbnQgPSBsaXN0ZW5lcnMuY3VycmVudDtcbiAgICB2YXIgaW5kZXggPSBhY3RpdmUubGVuZ3RoID0gY3VycmVudC5sZW5ndGg7XG4gICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgYWN0aXZlW2luZGV4XSA9IGN1cnJlbnRbaW5kZXhdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYWN0aXZlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGFjdGl2ZVtpXTtcbiAgICAgICAgaWYgKGN1cnJlbnQuaW5kZXhPZihsaXN0ZW5lcikgPCAwKSB7XG5cdFx0XHQvL1RoaXMgaXMgZml4aW5nIHRoZSBpc3N1ZSBjYXVzaW5nIGEgcmVncmVzc2lvbiBpbiBNb250YWdlJ3MgcmVwZXRpdGlvblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRoaXNwID0gbGlzdGVuZXI7XG4gICAgICAgIGxpc3RlbmVyID0gKFxuICAgICAgICAgICAgbGlzdGVuZXJbbGlzdGVuZXJzLnNwZWNpZmljSGFuZGxlck1ldGhvZE5hbWVdIHx8XG4gICAgICAgICAgICBsaXN0ZW5lcltsaXN0ZW5lcnMuZ2VuZXJpY0hhbmRsZXJNZXRob2ROYW1lXSB8fFxuICAgICAgICAgICAgbGlzdGVuZXJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lci5jYWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBldmVudCBsaXN0ZW5lciBmb3IgXCIgKyBsaXN0ZW5lcnMuc3BlY2lmaWNIYW5kbGVyTmFtZSArIFwiIG9yIFwiICsgbGlzdGVuZXJzLmdlbmVyaWNIYW5kbGVyTmFtZSArIFwiIG9yIGNhbGwgb24gXCIgKyBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzcCwgdmFsdWUsIGtleSwgdGhpcyk7XG4gICAgfVxufVxuXG5Qcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmRpc3BhdGNoQmVmb3JlT3duUHJvcGVydHlDaGFuZ2UgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZSh0aGlzLCBrZXksIGxpc3RlbmVyLCB0cnVlKTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUubWFrZVByb3BlcnR5T2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyBhcnJheXMgYXJlIHNwZWNpYWwuICB3ZSBkbyBub3Qgc3VwcG9ydCBkaXJlY3Qgc2V0dGluZyBvZiBwcm9wZXJ0aWVzXG4gICAgLy8gb24gYW4gYXJyYXkuICBpbnN0ZWFkLCBjYWxsIC5zZXQoaW5kZXgsIHZhbHVlKS4gIHRoaXMgaXMgb2JzZXJ2YWJsZS5cbiAgICAvLyAnbGVuZ3RoJyBwcm9wZXJ0eSBpcyBvYnNlcnZhYmxlIGZvciBhbGwgbXV0YXRpbmcgbWV0aG9kcyBiZWNhdXNlXG4gICAgLy8gb3VyIG92ZXJyaWRlcyBleHBsaWNpdGx5IGRpc3BhdGNoIHRoYXQgY2hhbmdlLlxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIU9iamVjdC5pc0V4dGVuc2libGUodGhpcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgbWFrZSBwcm9wZXJ0eSBcIiArIEpTT04uc3RyaW5naWZ5KGtleSkgKyBcIiBvYnNlcnZhYmxlIG9uIFwiICsgdGhpcyArIFwiIGJlY2F1c2Ugb2JqZWN0IGlzIG5vdCBleHRlbnNpYmxlXCIpO1xuICAgIH1cblxuICAgIHZhciBzdGF0ZTtcbiAgICBpZiAodHlwZW9mIHRoaXMuX19zdGF0ZV9fID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHN0YXRlID0gdGhpcy5fX3N0YXRlX187XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUgPSB7fTtcbiAgICAgICAgaWYgKE9iamVjdC5pc0V4dGVuc2libGUodGhpcykpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIl9fc3RhdGVfX1wiLCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0ZVtrZXldID0gdGhpc1trZXldO1xuXG4gICAgLy8gbWVtb2l6ZSBvdmVycmlkZGVuIHByb3BlcnR5IGRlc2NyaXB0b3IgdGFibGVcbiAgICBpZiAoIXRoaXMuX19vdmVycmlkZGVuUHJvcGVydHlEZXNjcmlwdG9yc19fKSB7XG4gICAgICAgIG92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzID0ge307XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIl9fb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnNfX1wiLCB7XG4gICAgICAgICAgICB2YWx1ZTogb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnMsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnMgPSB0aGlzLl9fb3ZlcnJpZGRlblByb3BlcnR5RGVzY3JpcHRvcnNfXztcblxuICAgIGlmIChvYmplY3Rfb3ducy5jYWxsKG92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzLCBrZXkpKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYWxyZWFkeSByZWNvcmRlZCBhbiBvdmVycmlkZGVuIHByb3BlcnR5IGRlc2NyaXB0b3IsXG4gICAgICAgIC8vIHdlIGhhdmUgYWxyZWFkeSBpbnN0YWxsZWQgdGhlIG9ic2VydmVyLCBzbyBzaG9ydC1oZXJlXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB3YWxrIHVwIHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gZmluZCBhIHByb3BlcnR5IGRlc2NyaXB0b3IgZm9yXG4gICAgLy8gdGhlIHByb3BlcnR5IG5hbWVcbiAgICB2YXIgb3ZlcnJpZGRlbkRlc2NyaXB0b3I7XG4gICAgdmFyIGF0dGFjaGVkID0gdGhpcztcbiAgICBkbyB7XG4gICAgICAgIG92ZXJyaWRkZW5EZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhdHRhY2hlZCwga2V5KTtcbiAgICAgICAgaWYgKG92ZXJyaWRkZW5EZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBhdHRhY2hlZCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihhdHRhY2hlZCk7XG4gICAgfSB3aGlsZSAoYXR0YWNoZWQpO1xuICAgIC8vIG9yIGRlZmF1bHQgdG8gYW4gdW5kZWZpbmVkIHZhbHVlXG4gICAgb3ZlcnJpZGRlbkRlc2NyaXB0b3IgPSBvdmVycmlkZGVuRGVzY3JpcHRvciB8fCB7XG4gICAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9O1xuXG4gICAgaWYgKCFvdmVycmlkZGVuRGVzY3JpcHRvci5jb25maWd1cmFibGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG1lbW9pemUgdGhlIGRlc2NyaXB0b3Igc28gd2Uga25vdyBub3QgdG8gaW5zdGFsbCBhbm90aGVyIGxheWVyLFxuICAgIC8vIGFuZCBzbyB3ZSBjYW4gcmV1c2UgdGhlIG92ZXJyaWRkZW4gZGVzY3JpcHRvciB3aGVuIHVuaW5zdGFsbGluZ1xuICAgIG92ZXJyaWRkZW5Qcm9wZXJ0eURlc2NyaXB0b3JzW2tleV0gPSBvdmVycmlkZGVuRGVzY3JpcHRvcjtcblxuICAgIC8vIGdpdmUgdXAgKmFmdGVyKiBzdG9yaW5nIHRoZSBvdmVycmlkZGVuIHByb3BlcnR5IGRlc2NyaXB0b3Igc28gaXRcbiAgICAvLyBjYW4gYmUgcmVzdG9yZWQgYnkgdW5pbnN0YWxsLiAgVW53cml0YWJsZSBwcm9wZXJ0aWVzIGFyZVxuICAgIC8vIHNpbGVudGx5IG5vdCBvdmVycmlkZW4uICBTaW5jZSBzdWNjZXNzIGlzIGluZGlzdGluZ3Vpc2hhYmxlIGZyb21cbiAgICAvLyBmYWlsdXJlLCB3ZSBsZXQgaXQgcGFzcyBidXQgZG9uJ3Qgd2FzdGUgdGltZSBvbiBpbnRlcmNlcHRpbmdcbiAgICAvLyBnZXQvc2V0LlxuICAgIGlmICghb3ZlcnJpZGRlbkRlc2NyaXB0b3Iud3JpdGFibGUgJiYgIW92ZXJyaWRkZW5EZXNjcmlwdG9yLnNldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETyByZWZsZWN0IGN1cnJlbnQgdmFsdWUgb24gYSBkaXNwbGF5ZWQgcHJvcGVydHlcblxuICAgIHZhciBwcm9wZXJ0eUxpc3RlbmVyO1xuICAgIC8vIGluIGJvdGggb2YgdGhlc2UgbmV3IGRlc2NyaXB0b3IgdmFyaWFudHMsIHdlIHJldXNlIHRoZSBvdmVycmlkZGVuXG4gICAgLy8gZGVzY3JpcHRvciB0byBlaXRoZXIgc3RvcmUgdGhlIGN1cnJlbnQgdmFsdWUgb3IgYXBwbHkgZ2V0dGVyc1xuICAgIC8vIGFuZCBzZXR0ZXJzLiAgdGhpcyBpcyBoYW5keSBzaW5jZSB3ZSBjYW4gcmV1c2UgdGhlIG92ZXJyaWRkZW5cbiAgICAvLyBkZXNjcmlwdG9yIGlmIHdlIHVuaW5zdGFsbCB0aGUgb2JzZXJ2ZXIuICBXZSBldmVuIHByZXNlcnZlIHRoZVxuICAgIC8vIGFzc2lnbm1lbnQgc2VtYW50aWNzLCB3aGVyZSB3ZSBnZXQgdGhlIHZhbHVlIGZyb20gdXAgdGhlXG4gICAgLy8gcHJvdG90eXBlIGNoYWluLCBhbmQgc2V0IGFzIGFuIG93bmVkIHByb3BlcnR5LlxuICAgIGlmICgndmFsdWUnIGluIG92ZXJyaWRkZW5EZXNjcmlwdG9yKSB7XG4gICAgICAgIHByb3BlcnR5TGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gb3ZlcnJpZGRlbkRlc2NyaXB0b3IudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBQcm9wZXJ0eUNoYW5nZXMuZGlzcGF0Y2hCZWZvcmVPd25Qcm9wZXJ0eUNoYW5nZSh0aGlzLCBrZXksIG92ZXJyaWRkZW5EZXNjcmlwdG9yLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBvdmVycmlkZGVuRGVzY3JpcHRvci52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHN0YXRlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBQcm9wZXJ0eUNoYW5nZXMuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZSh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogb3ZlcnJpZGRlbkRlc2NyaXB0b3IuZW51bWVyYWJsZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7IC8vICdnZXQnIG9yICdzZXQnLCBidXQgbm90IG5lY2Vzc2FyaWx5IGJvdGhcbiAgICAgICAgcHJvcGVydHlMaXN0ZW5lciA9IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG92ZXJyaWRkZW5EZXNjcmlwdG9yLmdldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmb3JtZXJWYWx1ZTtcblxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgYWN0dWFsIGZvcm1lciB2YWx1ZSBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybWVyVmFsdWUgPSBvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY2FsbCB0aHJvdWdoIHRvIGFjdHVhbCBzZXR0ZXJcbiAgICAgICAgICAgICAgICBpZiAob3ZlcnJpZGRlbkRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJyaWRkZW5EZXNjcmlwdG9yLnNldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHVzZSBnZXR0ZXIsIGlmIHBvc3NpYmxlLCB0byBkaXNjb3ZlciB3aGV0aGVyIHRoZSBzZXRcbiAgICAgICAgICAgICAgICAvLyB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBvdmVycmlkZGVuRGVzY3JpcHRvci5nZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiBpdCBoYXMgbm90IGNoYW5nZWQsIHN1cHByZXNzIGEgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBmb3JtZXJWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFByb3BlcnR5Q2hhbmdlcy5kaXNwYXRjaEJlZm9yZU93blByb3BlcnR5Q2hhbmdlKHRoaXMsIGtleSwgZm9ybWVyVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gZGlzcGF0Y2ggdGhlIG5ldyB2YWx1ZTogdGhlIGdpdmVuIHZhbHVlIGlmIHRoZXJlIGlzXG4gICAgICAgICAgICAgICAgLy8gbm8gZ2V0dGVyLCBvciB0aGUgYWN0dWFsIHZhbHVlIGlmIHRoZXJlIGlzIG9uZVxuICAgICAgICAgICAgICAgIFByb3BlcnR5Q2hhbmdlcy5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBvdmVycmlkZGVuRGVzY3JpcHRvci5lbnVtZXJhYmxlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwgcHJvcGVydHlMaXN0ZW5lcik7XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBmdW5jdGlvbnNcblxuUHJvcGVydHlDaGFuZ2VzLmdldE93blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIGlmIChvYmplY3QuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUuZ2V0T3duUHJvcGVydHlDaGFuZ2VEZXNjcmlwdG9yLmNhbGwob2JqZWN0LCBrZXkpO1xuICAgIH1cbn07XG5cblByb3BlcnR5Q2hhbmdlcy5oYXNPd25Qcm9wZXJ0eUNoYW5nZURlc2NyaXB0b3IgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0Lmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvcihrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmhhc093blByb3BlcnR5Q2hhbmdlRGVzY3JpcHRvci5jYWxsKG9iamVjdCwga2V5KTtcbiAgICB9XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMuYWRkT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgbGlzdGVuZXIsIGJlZm9yZUNoYW5nZSkge1xuICAgIGlmICghT2JqZWN0LmlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICB9IGVsc2UgaWYgKG9iamVjdC5hZGRPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuYWRkT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcihrZXksIGxpc3RlbmVyLCBiZWZvcmVDaGFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlLmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIuY2FsbChvYmplY3QsIGtleSwgbGlzdGVuZXIsIGJlZm9yZUNoYW5nZSk7XG4gICAgfVxufTtcblxuUHJvcGVydHlDaGFuZ2VzLnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIGxpc3RlbmVyLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICBpZiAoIU9iamVjdC5pc09iamVjdChvYmplY3QpKSB7XG4gICAgfSBlbHNlIGlmIChvYmplY3QucmVtb3ZlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0LnJlbW92ZU93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoa2V5LCBsaXN0ZW5lciwgYmVmb3JlQ2hhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5yZW1vdmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyLmNhbGwob2JqZWN0LCBrZXksIGxpc3RlbmVyLCBiZWZvcmVDaGFuZ2UpO1xuICAgIH1cbn07XG5cblByb3BlcnR5Q2hhbmdlcy5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgaWYgKCFPYmplY3QuaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIH0gZWxzZSBpZiAob2JqZWN0LmRpc3BhdGNoT3duUHJvcGVydHlDaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdC5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlKGtleSwgdmFsdWUsIGJlZm9yZUNoYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5wcm90b3R5cGUuZGlzcGF0Y2hPd25Qcm9wZXJ0eUNoYW5nZS5jYWxsKG9iamVjdCwga2V5LCB2YWx1ZSwgYmVmb3JlQ2hhbmdlKTtcbiAgICB9XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMuYWRkQmVmb3JlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLmFkZE93blByb3BlcnR5Q2hhbmdlTGlzdGVuZXIob2JqZWN0LCBrZXksIGxpc3RlbmVyLCB0cnVlKTtcbn07XG5cblByb3BlcnR5Q2hhbmdlcy5yZW1vdmVCZWZvcmVPd25Qcm9wZXJ0eUNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCBsaXN0ZW5lcikge1xuICAgIHJldHVybiBQcm9wZXJ0eUNoYW5nZXMucmVtb3ZlT3duUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcihvYmplY3QsIGtleSwgbGlzdGVuZXIsIHRydWUpO1xufTtcblxuUHJvcGVydHlDaGFuZ2VzLmRpc3BhdGNoQmVmb3JlT3duUHJvcGVydHlDaGFuZ2UgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb3BlcnR5Q2hhbmdlcy5kaXNwYXRjaE93blByb3BlcnR5Q2hhbmdlKG9iamVjdCwga2V5LCB2YWx1ZSwgdHJ1ZSk7XG59O1xuXG5Qcm9wZXJ0eUNoYW5nZXMubWFrZVByb3BlcnR5T2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIGlmIChvYmplY3QubWFrZVByb3BlcnR5T2JzZXJ2YWJsZSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0Lm1ha2VQcm9wZXJ0eU9ic2VydmFibGUoa2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvcGVydHlDaGFuZ2VzLnByb3RvdHlwZS5tYWtlUHJvcGVydHlPYnNlcnZhYmxlLmNhbGwob2JqZWN0LCBrZXkpO1xuICAgIH1cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgV2Vha01hcCA9IHJlcXVpcmUoXCJ3ZWFrLW1hcFwiKTtcbnZhciBEaWN0ID0gcmVxdWlyZShcIi4uL2RpY3RcIik7XG5cbnZhciByYW5nZUNoYW5nZURlc2NyaXB0b3JzID0gbmV3IFdlYWtNYXAoKTsgLy8ge2lzQWN0aXZlLCB3aWxsQ2hhbmdlTGlzdGVuZXJzLCBjaGFuZ2VMaXN0ZW5lcnN9XG5cbm1vZHVsZS5leHBvcnRzID0gUmFuZ2VDaGFuZ2VzO1xuZnVuY3Rpb24gUmFuZ2VDaGFuZ2VzKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNvbnN0cnVjdC4gUmFuZ2VDaGFuZ2VzIGlzIGEgbWl4aW4uXCIpO1xufVxuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmdldEFsbFJhbmdlQ2hhbmdlRGVzY3JpcHRvcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFyYW5nZUNoYW5nZURlc2NyaXB0b3JzLmhhcyh0aGlzKSkge1xuICAgICAgICByYW5nZUNoYW5nZURlc2NyaXB0b3JzLnNldCh0aGlzLCBEaWN0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2VDaGFuZ2VEZXNjcmlwdG9ycy5nZXQodGhpcyk7XG59O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmdldFJhbmdlQ2hhbmdlRGVzY3JpcHRvciA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHZhciB0b2tlbkNoYW5nZURlc2NyaXB0b3JzID0gdGhpcy5nZXRBbGxSYW5nZUNoYW5nZURlc2NyaXB0b3JzKCk7XG4gICAgdG9rZW4gPSB0b2tlbiB8fCBcIlwiO1xuICAgIGlmICghdG9rZW5DaGFuZ2VEZXNjcmlwdG9ycy5oYXModG9rZW4pKSB7XG4gICAgICAgIHRva2VuQ2hhbmdlRGVzY3JpcHRvcnMuc2V0KHRva2VuLCB7XG4gICAgICAgICAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICBjaGFuZ2VMaXN0ZW5lcnM6IFtdLFxuICAgICAgICAgICAgd2lsbENoYW5nZUxpc3RlbmVyczogW11cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbkNoYW5nZURlc2NyaXB0b3JzLmdldCh0b2tlbik7XG59O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLmFkZFJhbmdlQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIsIHRva2VuLCBiZWZvcmVDaGFuZ2UpIHtcbiAgICAvLyBhIGNvbmNlc3Npb24gZm9yIG9iamVjdHMgbGlrZSBBcnJheSB0aGF0IGFyZSBub3QgaW5oZXJlbnRseSBvYnNlcnZhYmxlXG4gICAgaWYgKCF0aGlzLmlzT2JzZXJ2YWJsZSAmJiB0aGlzLm1ha2VPYnNlcnZhYmxlKSB7XG4gICAgICAgIHRoaXMubWFrZU9ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGVzY3JpcHRvciA9IHRoaXMuZ2V0UmFuZ2VDaGFuZ2VEZXNjcmlwdG9yKHRva2VuKTtcblxuICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgaWYgKGJlZm9yZUNoYW5nZSkge1xuICAgICAgICBsaXN0ZW5lcnMgPSBkZXNjcmlwdG9yLndpbGxDaGFuZ2VMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci5jaGFuZ2VMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgLy8gZXZlbiBpZiBhbHJlYWR5IHJlZ2lzdGVyZWRcbiAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlc1wiLCB7XG4gICAgICAgIHZhbHVlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiBjYW5jZWxSYW5nZUNoYW5nZUxpc3RlbmVyKCkge1xuICAgICAgICBpZiAoIXNlbGYpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gdGhyb3cgbmV3IEVycm9yKFwiUmFuZ2UgY2hhbmdlIGxpc3RlbmVyIFwiICsgSlNPTi5zdHJpbmdpZnkodG9rZW4pICsgXCIgaGFzIGFscmVhZHkgYmVlbiBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnJlbW92ZVJhbmdlQ2hhbmdlTGlzdGVuZXIobGlzdGVuZXIsIHRva2VuLCBiZWZvcmVDaGFuZ2UpO1xuICAgICAgICBzZWxmID0gbnVsbDtcbiAgICB9O1xufTtcblxuUmFuZ2VDaGFuZ2VzLnByb3RvdHlwZS5yZW1vdmVSYW5nZUNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKGxpc3RlbmVyLCB0b2tlbiwgYmVmb3JlQ2hhbmdlKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSB0aGlzLmdldFJhbmdlQ2hhbmdlRGVzY3JpcHRvcih0b2tlbik7XG5cbiAgICB2YXIgbGlzdGVuZXJzO1xuICAgIGlmIChiZWZvcmVDaGFuZ2UpIHtcbiAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RlbmVycyA9IGRlc2NyaXB0b3IuY2hhbmdlTGlzdGVuZXJzO1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5sYXN0SW5kZXhPZihsaXN0ZW5lcik7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZW1vdmUgcmFuZ2UgY2hhbmdlIGxpc3RlbmVyOiBkb2VzIG5vdCBleGlzdDogdG9rZW4gXCIgKyBKU09OLnN0cmluZ2lmeSh0b2tlbikpO1xuICAgIH1cbiAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbn07XG5cblJhbmdlQ2hhbmdlcy5wcm90b3R5cGUuZGlzcGF0Y2hSYW5nZUNoYW5nZSA9IGZ1bmN0aW9uIChwbHVzLCBtaW51cywgaW5kZXgsIGJlZm9yZUNoYW5nZSkge1xuICAgIHZhciBkZXNjcmlwdG9ycyA9IHRoaXMuZ2V0QWxsUmFuZ2VDaGFuZ2VEZXNjcmlwdG9ycygpO1xuICAgIHZhciBjaGFuZ2VOYW1lID0gXCJSYW5nZVwiICsgKGJlZm9yZUNoYW5nZSA/IFwiV2lsbENoYW5nZVwiIDogXCJDaGFuZ2VcIik7XG4gICAgZGVzY3JpcHRvcnMuZm9yRWFjaChmdW5jdGlvbiAoZGVzY3JpcHRvciwgdG9rZW4pIHtcblxuICAgICAgICBpZiAoZGVzY3JpcHRvci5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzY3JpcHRvci5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBiZWZvcmUgb3IgYWZ0ZXJcbiAgICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgICAgaWYgKGJlZm9yZUNoYW5nZSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci53aWxsQ2hhbmdlTGlzdGVuZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gZGVzY3JpcHRvci5jaGFuZ2VMaXN0ZW5lcnM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdG9rZW5OYW1lID0gXCJoYW5kbGVcIiArIChcbiAgICAgICAgICAgIHRva2VuLnNsaWNlKDAsIDEpLnRvVXBwZXJDYXNlKCkgK1xuICAgICAgICAgICAgdG9rZW4uc2xpY2UoMSlcbiAgICAgICAgKSArIGNoYW5nZU5hbWU7XG4gICAgICAgIC8vIG5vdGFibHksIGRlZmF1bHRzIHRvIFwiaGFuZGxlUmFuZ2VDaGFuZ2VcIiBvciBcImhhbmRsZVJhbmdlV2lsbENoYW5nZVwiXG4gICAgICAgIC8vIGlmIHRva2VuIGlzIFwiXCIgKHRoZSBkZWZhdWx0KVxuXG4gICAgICAgIC8vIGRpc3BhdGNoIGVhY2ggbGlzdGVuZXJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zbGljZSgpLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJbdG9rZW5OYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lclt0b2tlbk5hbWVdKHBsdXMsIG1pbnVzLCBpbmRleCwgdGhpcywgYmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RlbmVyLmNhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBwbHVzLCBtaW51cywgaW5kZXgsIHRoaXMsIGJlZm9yZUNoYW5nZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSGFuZGxlciBcIiArIGxpc3RlbmVyICsgXCIgaGFzIG5vIG1ldGhvZCBcIiArIHRva2VuTmFtZSArIFwiIGFuZCBpcyBub3QgY2FsbGFibGVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcbn07XG5cblJhbmdlQ2hhbmdlcy5wcm90b3R5cGUuYWRkQmVmb3JlUmFuZ2VDaGFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uIChsaXN0ZW5lciwgdG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy5hZGRSYW5nZUNoYW5nZUxpc3RlbmVyKGxpc3RlbmVyLCB0b2tlbiwgdHJ1ZSk7XG59O1xuXG5SYW5nZUNoYW5nZXMucHJvdG90eXBlLnJlbW92ZUJlZm9yZVJhbmdlQ2hhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbiAobGlzdGVuZXIsIHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlUmFuZ2VDaGFuZ2VMaXN0ZW5lcihsaXN0ZW5lciwgdG9rZW4sIHRydWUpO1xufTtcblxuUmFuZ2VDaGFuZ2VzLnByb3RvdHlwZS5kaXNwYXRjaEJlZm9yZVJhbmdlQ2hhbmdlID0gZnVuY3Rpb24gKHBsdXMsIG1pbnVzLCBpbmRleCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UocGx1cywgbWludXMsIGluZGV4LCB0cnVlKTtcbn07XG5cbiIsIi8vIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSW5zdGFsbCBhIGxlYWt5IFdlYWtNYXAgZW11bGF0aW9uIG9uIHBsYXRmb3JtcyB0aGF0XG4gKiBkb24ndCBwcm92aWRlIGEgYnVpbHQtaW4gb25lLlxuICpcbiAqIDxwPkFzc3VtZXMgdGhhdCBhbiBFUzUgcGxhdGZvcm0gd2hlcmUsIGlmIHtAY29kZSBXZWFrTWFwfSBpc1xuICogYWxyZWFkeSBwcmVzZW50LCB0aGVuIGl0IGNvbmZvcm1zIHRvIHRoZSBhbnRpY2lwYXRlZCBFUzZcbiAqIHNwZWNpZmljYXRpb24uIFRvIHJ1biB0aGlzIGZpbGUgb24gYW4gRVM1IG9yIGFsbW9zdCBFUzVcbiAqIGltcGxlbWVudGF0aW9uIHdoZXJlIHRoZSB7QGNvZGUgV2Vha01hcH0gc3BlY2lmaWNhdGlvbiBkb2VzIG5vdFxuICogcXVpdGUgY29uZm9ybSwgcnVuIDxjb2RlPnJlcGFpckVTNS5qczwvY29kZT4gZmlyc3QuXG4gKlxuICogPHA+RXZlbiB0aG91Z2ggV2Vha01hcE1vZHVsZSBpcyBub3QgZ2xvYmFsLCB0aGUgbGludGVyIHRoaW5rcyBpdFxuICogaXMsIHdoaWNoIGlzIHdoeSBpdCBpcyBpbiB0aGUgb3ZlcnJpZGVzIGxpc3QgYmVsb3cuXG4gKlxuICogPHA+Tk9URTogQmVmb3JlIHVzaW5nIHRoaXMgV2Vha01hcCBlbXVsYXRpb24gaW4gYSBub24tU0VTXG4gKiBlbnZpcm9ubWVudCwgc2VlIHRoZSBub3RlIGJlbG93IGFib3V0IGhpZGRlblJlY29yZC5cbiAqXG4gKiBAYXV0aG9yIE1hcmsgUy4gTWlsbGVyXG4gKiBAcmVxdWlyZXMgY3J5cHRvLCBBcnJheUJ1ZmZlciwgVWludDhBcnJheSwgbmF2aWdhdG9yLCBjb25zb2xlXG4gKiBAb3ZlcnJpZGVzIFdlYWtNYXAsIHNlcywgUHJveHlcbiAqIEBvdmVycmlkZXMgV2Vha01hcE1vZHVsZVxuICovXG5cbi8qKlxuICogVGhpcyB7QGNvZGUgV2Vha01hcH0gZW11bGF0aW9uIGlzIG9ic2VydmFibHkgZXF1aXZhbGVudCB0byB0aGVcbiAqIEVTLUhhcm1vbnkgV2Vha01hcCwgYnV0IHdpdGggbGVha2llciBnYXJiYWdlIGNvbGxlY3Rpb24gcHJvcGVydGllcy5cbiAqXG4gKiA8cD5BcyB3aXRoIHRydWUgV2Vha01hcHMsIGluIHRoaXMgZW11bGF0aW9uLCBhIGtleSBkb2VzIG5vdFxuICogcmV0YWluIG1hcHMgaW5kZXhlZCBieSB0aGF0IGtleSBhbmQgKGNydWNpYWxseSkgYSBtYXAgZG9lcyBub3RcbiAqIHJldGFpbiB0aGUga2V5cyBpdCBpbmRleGVzLiBBIG1hcCBieSBpdHNlbGYgYWxzbyBkb2VzIG5vdCByZXRhaW5cbiAqIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIHRoYXQgbWFwLlxuICpcbiAqIDxwPkhvd2V2ZXIsIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIGEga2V5IGluIHNvbWUgbWFwIGFyZVxuICogcmV0YWluZWQgc28gbG9uZyBhcyB0aGF0IGtleSBpcyByZXRhaW5lZCBhbmQgdGhvc2UgYXNzb2NpYXRpb25zIGFyZVxuICogbm90IG92ZXJyaWRkZW4uIEZvciBleGFtcGxlLCB3aGVuIHVzZWQgdG8gc3VwcG9ydCBtZW1icmFuZXMsIGFsbFxuICogdmFsdWVzIGV4cG9ydGVkIGZyb20gYSBnaXZlbiBtZW1icmFuZSB3aWxsIGxpdmUgZm9yIHRoZSBsaWZldGltZVxuICogdGhleSB3b3VsZCBoYXZlIGhhZCBpbiB0aGUgYWJzZW5jZSBvZiBhbiBpbnRlcnBvc2VkIG1lbWJyYW5lLiBFdmVuXG4gKiB3aGVuIHRoZSBtZW1icmFuZSBpcyByZXZva2VkLCBhbGwgb2JqZWN0cyB0aGF0IHdvdWxkIGhhdmUgYmVlblxuICogcmVhY2hhYmxlIGluIHRoZSBhYnNlbmNlIG9mIHJldm9jYXRpb24gd2lsbCBzdGlsbCBiZSByZWFjaGFibGUsIGFzXG4gKiBmYXIgYXMgdGhlIEdDIGNhbiB0ZWxsLCBldmVuIHRob3VnaCB0aGV5IHdpbGwgbm8gbG9uZ2VyIGJlIHJlbGV2YW50XG4gKiB0byBvbmdvaW5nIGNvbXB1dGF0aW9uLlxuICpcbiAqIDxwPlRoZSBBUEkgaW1wbGVtZW50ZWQgaGVyZSBpcyBhcHByb3hpbWF0ZWx5IHRoZSBBUEkgYXMgaW1wbGVtZW50ZWRcbiAqIGluIEZGNi4wYTEgYW5kIGFncmVlZCB0byBieSBNYXJrTSwgQW5kcmVhcyBHYWwsIGFuZCBEYXZlIEhlcm1hbixcbiAqIHJhdGhlciB0aGFuIHRoZSBvZmZpYWxseSBhcHByb3ZlZCBwcm9wb3NhbCBwYWdlLiBUT0RPKGVyaWdodHMpOlxuICogdXBncmFkZSB0aGUgZWNtYXNjcmlwdCBXZWFrTWFwIHByb3Bvc2FsIHBhZ2UgdG8gZXhwbGFpbiB0aGlzIEFQSVxuICogY2hhbmdlIGFuZCBwcmVzZW50IHRvIEVjbWFTY3JpcHQgY29tbWl0dGVlIGZvciB0aGVpciBhcHByb3ZhbC5cbiAqXG4gKiA8cD5UaGUgZmlyc3QgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBlbXVsYXRpb24gaGVyZSBhbmQgdGhhdCBpblxuICogRkY2LjBhMSBpcyB0aGUgcHJlc2VuY2Ugb2Ygbm9uIGVudW1lcmFibGUge0Bjb2RlIGdldF9fXywgaGFzX19fLFxuICogc2V0X19fLCBhbmQgZGVsZXRlX19ffSBtZXRob2RzIG9uIFdlYWtNYXAgaW5zdGFuY2VzIHRvIHJlcHJlc2VudFxuICogd2hhdCB3b3VsZCBiZSB0aGUgaGlkZGVuIGludGVybmFsIHByb3BlcnRpZXMgb2YgYSBwcmltaXRpdmVcbiAqIGltcGxlbWVudGF0aW9uLiBXaGVyZWFzIHRoZSBGRjYuMGExIFdlYWtNYXAucHJvdG90eXBlIG1ldGhvZHNcbiAqIHJlcXVpcmUgdGhlaXIge0Bjb2RlIHRoaXN9IHRvIGJlIGEgZ2VudWluZSBXZWFrTWFwIGluc3RhbmNlIChpLmUuLFxuICogYW4gb2JqZWN0IG9mIHtAY29kZSBbW0NsYXNzXV19IFwiV2Vha01hcH0pLCBzaW5jZSB0aGVyZSBpcyBub3RoaW5nXG4gKiB1bmZvcmdlYWJsZSBhYm91dCB0aGUgcHNldWRvLWludGVybmFsIG1ldGhvZCBuYW1lcyB1c2VkIGhlcmUsXG4gKiBub3RoaW5nIHByZXZlbnRzIHRoZXNlIGVtdWxhdGVkIHByb3RvdHlwZSBtZXRob2RzIGZyb20gYmVpbmdcbiAqIGFwcGxpZWQgdG8gbm9uLVdlYWtNYXBzIHdpdGggcHNldWRvLWludGVybmFsIG1ldGhvZHMgb2YgdGhlIHNhbWVcbiAqIG5hbWVzLlxuICpcbiAqIDxwPkFub3RoZXIgZGlmZmVyZW5jZSBpcyB0aGF0IG91ciBlbXVsYXRlZCB7QGNvZGVcbiAqIFdlYWtNYXAucHJvdG90eXBlfSBpcyBub3QgaXRzZWxmIGEgV2Vha01hcC4gQSBwcm9ibGVtIHdpdGggdGhlXG4gKiBjdXJyZW50IEZGNi4wYTEgQVBJIGlzIHRoYXQgV2Vha01hcC5wcm90b3R5cGUgaXMgaXRzZWxmIGEgV2Vha01hcFxuICogcHJvdmlkaW5nIGFtYmllbnQgbXV0YWJpbGl0eSBhbmQgYW4gYW1iaWVudCBjb21tdW5pY2F0aW9uc1xuICogY2hhbm5lbC4gVGh1cywgaWYgYSBXZWFrTWFwIGlzIGFscmVhZHkgcHJlc2VudCBhbmQgaGFzIHRoaXNcbiAqIHByb2JsZW0sIHJlcGFpckVTNS5qcyB3cmFwcyBpdCBpbiBhIHNhZmUgd3JhcHBwZXIgaW4gb3JkZXIgdG9cbiAqIHByZXZlbnQgYWNjZXNzIHRvIHRoaXMgY2hhbm5lbC4gKFNlZVxuICogUEFUQ0hfTVVUQUJMRV9GUk9aRU5fV0VBS01BUF9QUk9UTyBpbiByZXBhaXJFUzUuanMpLlxuICovXG5cbi8qKlxuICogSWYgdGhpcyBpcyBhIGZ1bGwgPGEgaHJlZj1cbiAqIFwiaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2VzLWxhYi93aWtpL1NlY3VyZWFibGVFUzVcIlxuICogPnNlY3VyZWFibGUgRVM1PC9hPiBwbGF0Zm9ybSBhbmQgdGhlIEVTLUhhcm1vbnkge0Bjb2RlIFdlYWtNYXB9IGlzXG4gKiBhYnNlbnQsIGluc3RhbGwgYW4gYXBwcm94aW1hdGUgZW11bGF0aW9uLlxuICpcbiAqIDxwPklmIFdlYWtNYXAgaXMgcHJlc2VudCBidXQgY2Fubm90IHN0b3JlIHNvbWUgb2JqZWN0cywgdXNlIG91ciBhcHByb3hpbWF0ZVxuICogZW11bGF0aW9uIGFzIGEgd3JhcHBlci5cbiAqXG4gKiA8cD5JZiB0aGlzIGlzIGFsbW9zdCBhIHNlY3VyZWFibGUgRVM1IHBsYXRmb3JtLCB0aGVuIFdlYWtNYXAuanNcbiAqIHNob3VsZCBiZSBydW4gYWZ0ZXIgcmVwYWlyRVM1LmpzLlxuICpcbiAqIDxwPlNlZSB7QGNvZGUgV2Vha01hcH0gZm9yIGRvY3VtZW50YXRpb24gb2YgdGhlIGdhcmJhZ2UgY29sbGVjdGlvblxuICogcHJvcGVydGllcyBvZiB0aGlzIFdlYWtNYXAgZW11bGF0aW9uLlxuICovXG4oZnVuY3Rpb24gV2Vha01hcE1vZHVsZSgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgaWYgKHR5cGVvZiBzZXMgIT09ICd1bmRlZmluZWQnICYmIHNlcy5vayAmJiAhc2VzLm9rKCkpIHtcbiAgICAvLyBhbHJlYWR5IHRvbyBicm9rZW4sIHNvIGdpdmUgdXBcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogSW4gc29tZSBjYXNlcyAoY3VycmVudCBGaXJlZm94KSwgd2UgbXVzdCBtYWtlIGEgY2hvaWNlIGJldHdlZWVuIGFcbiAgICogV2Vha01hcCB3aGljaCBpcyBjYXBhYmxlIG9mIHVzaW5nIGFsbCB2YXJpZXRpZXMgb2YgaG9zdCBvYmplY3RzIGFzXG4gICAqIGtleXMgYW5kIG9uZSB3aGljaCBpcyBjYXBhYmxlIG9mIHNhZmVseSB1c2luZyBwcm94aWVzIGFzIGtleXMuIFNlZVxuICAgKiBjb21tZW50cyBiZWxvdyBhYm91dCBIb3N0V2Vha01hcCBhbmQgRG91YmxlV2Vha01hcCBmb3IgZGV0YWlscy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiAod2hpY2ggaXMgYSBnbG9iYWwsIG5vdCBleHBvc2VkIHRvIGd1ZXN0cykgbWFya3MgYVxuICAgKiBXZWFrTWFwIGFzIHBlcm1pdHRlZCB0byBkbyB3aGF0IGlzIG5lY2Vzc2FyeSB0byBpbmRleCBhbGwgaG9zdFxuICAgKiBvYmplY3RzLCBhdCB0aGUgY29zdCBvZiBtYWtpbmcgaXQgdW5zYWZlIGZvciBwcm94aWVzLlxuICAgKlxuICAgKiBEbyBub3QgYXBwbHkgdGhpcyBmdW5jdGlvbiB0byBhbnl0aGluZyB3aGljaCBpcyBub3QgYSBnZW51aW5lXG4gICAqIGZyZXNoIFdlYWtNYXAuXG4gICAqL1xuICBmdW5jdGlvbiB3ZWFrTWFwUGVybWl0SG9zdE9iamVjdHMobWFwKSB7XG4gICAgLy8gaWRlbnRpdHkgb2YgZnVuY3Rpb24gdXNlZCBhcyBhIHNlY3JldCAtLSBnb29kIGVub3VnaCBhbmQgY2hlYXBcbiAgICBpZiAobWFwLnBlcm1pdEhvc3RPYmplY3RzX19fKSB7XG4gICAgICBtYXAucGVybWl0SG9zdE9iamVjdHNfX18od2Vha01hcFBlcm1pdEhvc3RPYmplY3RzKTtcbiAgICB9XG4gIH1cbiAgaWYgKHR5cGVvZiBzZXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc2VzLndlYWtNYXBQZXJtaXRIb3N0T2JqZWN0cyA9IHdlYWtNYXBQZXJtaXRIb3N0T2JqZWN0cztcbiAgfVxuXG4gIC8vIElFIDExIGhhcyBubyBQcm94eSBidXQgaGFzIGEgYnJva2VuIFdlYWtNYXAgc3VjaCB0aGF0IHdlIG5lZWQgdG8gcGF0Y2hcbiAgLy8gaXQgdXNpbmcgRG91YmxlV2Vha01hcDsgdGhpcyBmbGFnIHRlbGxzIERvdWJsZVdlYWtNYXAgc28uXG4gIHZhciBkb3VibGVXZWFrTWFwQ2hlY2tTaWxlbnRGYWlsdXJlID0gZmFsc2U7XG5cbiAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYWxyZWFkeSBhIGdvb2QtZW5vdWdoIFdlYWtNYXAgaW1wbGVtZW50YXRpb24sIGFuZCBpZiBzb1xuICAvLyBleGl0IHdpdGhvdXQgcmVwbGFjaW5nIGl0LlxuICBpZiAodHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgSG9zdFdlYWtNYXAgPSBXZWFrTWFwO1xuICAgIC8vIFRoZXJlIGlzIGEgV2Vha01hcCAtLSBpcyBpdCBnb29kIGVub3VnaD9cbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgL0ZpcmVmb3gvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgIC8vIFdlJ3JlIG5vdyAqYXNzdW1pbmcgbm90KiwgYmVjYXVzZSBhcyBvZiB0aGlzIHdyaXRpbmcgKDIwMTMtMDUtMDYpXG4gICAgICAvLyBGaXJlZm94J3MgV2Vha01hcHMgaGF2ZSBhIG1pc2NlbGxhbnkgb2Ygb2JqZWN0cyB0aGV5IHdvbid0IGFjY2VwdCwgYW5kXG4gICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIG1ha2UgYW4gZXhoYXVzdGl2ZSBsaXN0LCBhbmQgdGVzdGluZyBmb3IganVzdCBvbmVcbiAgICAgIC8vIHdpbGwgYmUgYSBwcm9ibGVtIGlmIHRoYXQgb25lIGlzIGZpeGVkIGFsb25lIChhcyB0aGV5IGRpZCBmb3IgRXZlbnQpLlxuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhIHBsYXRmb3JtIHRoYXQgd2UgKmNhbiogcmVsaWFibHkgdGVzdCBvbiwgaGVyZSdzIGhvdyB0b1xuICAgICAgLy8gZG8gaXQ6XG4gICAgICAvLyAgdmFyIHByb2JsZW1hdGljID0gLi4uIDtcbiAgICAgIC8vICB2YXIgdGVzdEhvc3RNYXAgPSBuZXcgSG9zdFdlYWtNYXAoKTtcbiAgICAgIC8vICB0cnkge1xuICAgICAgLy8gICAgdGVzdEhvc3RNYXAuc2V0KHByb2JsZW1hdGljLCAxKTsgIC8vIEZpcmVmb3ggMjAgd2lsbCB0aHJvdyBoZXJlXG4gICAgICAvLyAgICBpZiAodGVzdEhvc3RNYXAuZ2V0KHByb2JsZW1hdGljKSA9PT0gMSkge1xuICAgICAgLy8gICAgICByZXR1cm47XG4gICAgICAvLyAgICB9XG4gICAgICAvLyAgfSBjYXRjaCAoZSkge31cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRSAxMSBidWc6IFdlYWtNYXBzIHNpbGVudGx5IGZhaWwgdG8gc3RvcmUgZnJvemVuIG9iamVjdHMuXG4gICAgICB2YXIgdGVzdE1hcCA9IG5ldyBIb3N0V2Vha01hcCgpO1xuICAgICAgdmFyIHRlc3RPYmplY3QgPSBPYmplY3QuZnJlZXplKHt9KTtcbiAgICAgIHRlc3RNYXAuc2V0KHRlc3RPYmplY3QsIDEpO1xuICAgICAgaWYgKHRlc3RNYXAuZ2V0KHRlc3RPYmplY3QpICE9PSAxKSB7XG4gICAgICAgIGRvdWJsZVdlYWtNYXBDaGVja1NpbGVudEZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAvLyBGYWxsIHRocm91Z2ggdG8gaW5zdGFsbGluZyBvdXIgV2Vha01hcC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gV2Vha01hcDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBob3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgZ29wbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICB2YXIgZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbiAgdmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGU7XG5cbiAgLyoqXG4gICAqIFNlY3VyaXR5IGRlcGVuZHMgb24gSElEREVOX05BTUUgYmVpbmcgYm90aCA8aT51bmd1ZXNzYWJsZTwvaT4gYW5kXG4gICAqIDxpPnVuZGlzY292ZXJhYmxlPC9pPiBieSB1bnRydXN0ZWQgY29kZS5cbiAgICpcbiAgICogPHA+R2l2ZW4gdGhlIGtub3duIHdlYWtuZXNzZXMgb2YgTWF0aC5yYW5kb20oKSBvbiBleGlzdGluZ1xuICAgKiBicm93c2VycywgaXQgZG9lcyBub3QgZ2VuZXJhdGUgdW5ndWVzc2FiaWxpdHkgd2UgY2FuIGJlIGNvbmZpZGVudFxuICAgKiBvZi5cbiAgICpcbiAgICogPHA+SXQgaXMgdGhlIG1vbmtleSBwYXRjaGluZyBsb2dpYyBpbiB0aGlzIGZpbGUgdGhhdCBpcyBpbnRlbmRlZFxuICAgKiB0byBlbnN1cmUgdW5kaXNjb3ZlcmFiaWxpdHkuIFRoZSBiYXNpYyBpZGVhIGlzIHRoYXQgdGhlcmUgYXJlXG4gICAqIHRocmVlIGZ1bmRhbWVudGFsIG1lYW5zIG9mIGRpc2NvdmVyaW5nIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0OlxuICAgKiBUaGUgZm9yL2luIGxvb3AsIE9iamVjdC5rZXlzKCksIGFuZCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcygpLFxuICAgKiBhcyB3ZWxsIGFzIHNvbWUgcHJvcG9zZWQgRVM2IGV4dGVuc2lvbnMgdGhhdCBhcHBlYXIgb24gb3VyXG4gICAqIHdoaXRlbGlzdC4gVGhlIGZpcnN0IHR3byBvbmx5IGRpc2NvdmVyIGVudW1lcmFibGUgcHJvcGVydGllcywgYW5kXG4gICAqIHdlIG9ubHkgdXNlIEhJRERFTl9OQU1FIHRvIG5hbWUgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSwgc28gdGhlXG4gICAqIG9ubHkgcmVtYWluaW5nIHRocmVhdCBzaG91bGQgYmUgZ2V0T3duUHJvcGVydHlOYW1lcyBhbmQgc29tZVxuICAgKiBwcm9wb3NlZCBFUzYgZXh0ZW5zaW9ucyB0aGF0IGFwcGVhciBvbiBvdXIgd2hpdGVsaXN0LiBXZSBtb25rZXlcbiAgICogcGF0Y2ggdGhlbSB0byByZW1vdmUgSElEREVOX05BTUUgZnJvbSB0aGUgbGlzdCBvZiBwcm9wZXJ0aWVzIHRoZXlcbiAgICogcmV0dXJucy5cbiAgICpcbiAgICogPHA+VE9ETyhlcmlnaHRzKTogT24gYSBwbGF0Zm9ybSB3aXRoIGJ1aWx0LWluIFByb3hpZXMsIHByb3hpZXNcbiAgICogY291bGQgYmUgdXNlZCB0byB0cmFwIGFuZCB0aGVyZWJ5IGRpc2NvdmVyIHRoZSBISURERU5fTkFNRSwgc28gd2VcbiAgICogbmVlZCB0byBtb25rZXkgcGF0Y2ggUHJveHkuY3JlYXRlLCBQcm94eS5jcmVhdGVGdW5jdGlvbiwgZXRjLCBpblxuICAgKiBvcmRlciB0byB3cmFwIHRoZSBwcm92aWRlZCBoYW5kbGVyIHdpdGggdGhlIHJlYWwgaGFuZGxlciB3aGljaFxuICAgKiBmaWx0ZXJzIG91dCBhbGwgdHJhcHMgdXNpbmcgSElEREVOX05BTUUuXG4gICAqXG4gICAqIDxwPlRPRE8oZXJpZ2h0cyk6IFJldmlzaXQgTWlrZSBTdGF5J3Mgc3VnZ2VzdGlvbiB0aGF0IHdlIHVzZSBhblxuICAgKiBlbmNhcHN1bGF0ZWQgZnVuY3Rpb24gYXQgYSBub3QtbmVjZXNzYXJpbHktc2VjcmV0IG5hbWUsIHdoaWNoXG4gICAqIHVzZXMgdGhlIFN0aWVnbGVyIHNoYXJlZC1zdGF0ZSByaWdodHMgYW1wbGlmaWNhdGlvbiBwYXR0ZXJuIHRvXG4gICAqIHJldmVhbCB0aGUgYXNzb2NpYXRlZCB2YWx1ZSBvbmx5IHRvIHRoZSBXZWFrTWFwIGluIHdoaWNoIHRoaXMga2V5XG4gICAqIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGF0IHZhbHVlLiBTaW5jZSBvbmx5IHRoZSBrZXkgcmV0YWlucyB0aGVcbiAgICogZnVuY3Rpb24sIHRoZSBmdW5jdGlvbiBjYW4gYWxzbyByZW1lbWJlciB0aGUga2V5IHdpdGhvdXQgY2F1c2luZ1xuICAgKiBsZWFrYWdlIG9mIHRoZSBrZXksIHNvIHRoaXMgZG9lc24ndCB2aW9sYXRlIG91ciBnZW5lcmFsIGdjXG4gICAqIGdvYWxzLiBJbiBhZGRpdGlvbiwgYmVjYXVzZSB0aGUgbmFtZSBuZWVkIG5vdCBiZSBhIGd1YXJkZWRcbiAgICogc2VjcmV0LCB3ZSBjb3VsZCBlZmZpY2llbnRseSBoYW5kbGUgY3Jvc3MtZnJhbWUgZnJvemVuIGtleXMuXG4gICAqL1xuICB2YXIgSElEREVOX05BTUVfUFJFRklYID0gJ3dlYWttYXA6JztcbiAgdmFyIEhJRERFTl9OQU1FID0gSElEREVOX05BTUVfUFJFRklYICsgJ2lkZW50OicgKyBNYXRoLnJhbmRvbSgpICsgJ19fXyc7XG5cbiAgaWYgKHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIEFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgVWludDhBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBhYiA9IG5ldyBBcnJheUJ1ZmZlcigyNSk7XG4gICAgdmFyIHU4cyA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHU4cyk7XG4gICAgSElEREVOX05BTUUgPSBISURERU5fTkFNRV9QUkVGSVggKyAncmFuZDonICtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh1OHMsIGZ1bmN0aW9uKHU4KSB7XG4gICAgICAgIHJldHVybiAodTggJSAzNikudG9TdHJpbmcoMzYpO1xuICAgICAgfSkuam9pbignJykgKyAnX19fJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTm90SGlkZGVuTmFtZShuYW1lKSB7XG4gICAgcmV0dXJuICEoXG4gICAgICAgIG5hbWUuc3Vic3RyKDAsIEhJRERFTl9OQU1FX1BSRUZJWC5sZW5ndGgpID09IEhJRERFTl9OQU1FX1BSRUZJWCAmJlxuICAgICAgICBuYW1lLnN1YnN0cihuYW1lLmxlbmd0aCAtIDMpID09PSAnX19fJyk7XG4gIH1cblxuICAvKipcbiAgICogTW9ua2V5IHBhdGNoIGdldE93blByb3BlcnR5TmFtZXMgdG8gYXZvaWQgcmV2ZWFsaW5nIHRoZVxuICAgKiBISURERU5fTkFNRS5cbiAgICpcbiAgICogPHA+VGhlIEVTNS4xIHNwZWMgcmVxdWlyZXMgZWFjaCBuYW1lIHRvIGFwcGVhciBvbmx5IG9uY2UsIGJ1dCBhc1xuICAgKiBvZiB0aGlzIHdyaXRpbmcsIHRoaXMgcmVxdWlyZW1lbnQgaXMgY29udHJvdmVyc2lhbCBmb3IgRVM2LCBzbyB3ZVxuICAgKiBtYWRlIHRoaXMgY29kZSByb2J1c3QgYWdhaW5zdCB0aGlzIGNhc2UuIElmIHRoZSByZXN1bHRpbmcgZXh0cmFcbiAgICogc2VhcmNoIHR1cm5zIG91dCB0byBiZSBleHBlbnNpdmUsIHdlIGNhbiBwcm9iYWJseSByZWxheCB0aGlzIG9uY2VcbiAgICogRVM2IGlzIGFkZXF1YXRlbHkgc3VwcG9ydGVkIG9uIGFsbCBtYWpvciBicm93c2VycywgaWZmIG5vIGJyb3dzZXJcbiAgICogdmVyc2lvbnMgd2Ugc3VwcG9ydCBhdCB0aGF0IHRpbWUgaGF2ZSByZWxheGVkIHRoaXMgY29uc3RyYWludFxuICAgKiB3aXRob3V0IHByb3ZpZGluZyBidWlsdC1pbiBFUzYgV2Vha01hcHMuXG4gICAqL1xuICBkZWZQcm9wKE9iamVjdCwgJ2dldE93blByb3BlcnR5TmFtZXMnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZha2VHZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikge1xuICAgICAgcmV0dXJuIGdvcG4ob2JqKS5maWx0ZXIoaXNOb3RIaWRkZW5OYW1lKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBnZXRQcm9wZXJ0eU5hbWVzIGlzIG5vdCBpbiBFUzUgYnV0IGl0IGlzIHByb3Bvc2VkIGZvciBFUzYgYW5kXG4gICAqIGRvZXMgYXBwZWFyIGluIG91ciB3aGl0ZWxpc3QsIHNvIHdlIG5lZWQgdG8gY2xlYW4gaXQgdG9vLlxuICAgKi9cbiAgaWYgKCdnZXRQcm9wZXJ0eU5hbWVzJyBpbiBPYmplY3QpIHtcbiAgICB2YXIgb3JpZ2luYWxHZXRQcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldFByb3BlcnR5TmFtZXM7XG4gICAgZGVmUHJvcChPYmplY3QsICdnZXRQcm9wZXJ0eU5hbWVzJywge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZha2VHZXRQcm9wZXJ0eU5hbWVzKG9iaikge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWxHZXRQcm9wZXJ0eU5hbWVzKG9iaikuZmlsdGVyKGlzTm90SGlkZGVuTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogPHA+VG8gdHJlYXQgb2JqZWN0cyBhcyBpZGVudGl0eS1rZXlzIHdpdGggcmVhc29uYWJsZSBlZmZpY2llbmN5XG4gICAqIG9uIEVTNSBieSBpdHNlbGYgKGkuZS4sIHdpdGhvdXQgYW55IG9iamVjdC1rZXllZCBjb2xsZWN0aW9ucyksIHdlXG4gICAqIG5lZWQgdG8gYWRkIGEgaGlkZGVuIHByb3BlcnR5IHRvIHN1Y2gga2V5IG9iamVjdHMgd2hlbiB3ZVxuICAgKiBjYW4uIFRoaXMgcmFpc2VzIHNldmVyYWwgaXNzdWVzOlxuICAgKiA8dWw+XG4gICAqIDxsaT5BcnJhbmdpbmcgdG8gYWRkIHRoaXMgcHJvcGVydHkgdG8gb2JqZWN0cyBiZWZvcmUgd2UgbG9zZSB0aGVcbiAgICogICAgIGNoYW5jZSwgYW5kXG4gICAqIDxsaT5IaWRpbmcgdGhlIGV4aXN0ZW5jZSBvZiB0aGlzIG5ldyBwcm9wZXJ0eSBmcm9tIG1vc3RcbiAgICogICAgIEphdmFTY3JpcHQgY29kZS5cbiAgICogPGxpPlByZXZlbnRpbmcgPGk+Y2VydGlmaWNhdGlvbiB0aGVmdDwvaT4sIHdoZXJlIG9uZSBvYmplY3QgaXNcbiAgICogICAgIGNyZWF0ZWQgZmFsc2VseSBjbGFpbWluZyB0byBiZSB0aGUga2V5IG9mIGFuIGFzc29jaWF0aW9uXG4gICAqICAgICBhY3R1YWxseSBrZXllZCBieSBhbm90aGVyIG9iamVjdC5cbiAgICogPGxpPlByZXZlbnRpbmcgPGk+dmFsdWUgdGhlZnQ8L2k+LCB3aGVyZSB1bnRydXN0ZWQgY29kZSB3aXRoXG4gICAqICAgICBhY2Nlc3MgdG8gYSBrZXkgb2JqZWN0IGJ1dCBub3QgYSB3ZWFrIG1hcCBuZXZlcnRoZWxlc3NcbiAgICogICAgIG9idGFpbnMgYWNjZXNzIHRvIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhhdCBrZXkgaW4gdGhhdFxuICAgKiAgICAgd2VhayBtYXAuXG4gICAqIDwvdWw+XG4gICAqIFdlIGRvIHNvIGJ5XG4gICAqIDx1bD5cbiAgICogPGxpPk1ha2luZyB0aGUgbmFtZSBvZiB0aGUgaGlkZGVuIHByb3BlcnR5IHVuZ3Vlc3NhYmxlLCBzbyBcIltdXCJcbiAgICogICAgIGluZGV4aW5nLCB3aGljaCB3ZSBjYW5ub3QgaW50ZXJjZXB0LCBjYW5ub3QgYmUgdXNlZCB0byBhY2Nlc3NcbiAgICogICAgIGEgcHJvcGVydHkgd2l0aG91dCBrbm93aW5nIHRoZSBuYW1lLlxuICAgKiA8bGk+TWFraW5nIHRoZSBoaWRkZW4gcHJvcGVydHkgbm9uLWVudW1lcmFibGUsIHNvIHdlIG5lZWQgbm90XG4gICAqICAgICB3b3JyeSBhYm91dCBmb3ItaW4gbG9vcHMgb3Ige0Bjb2RlIE9iamVjdC5rZXlzfSxcbiAgICogPGxpPm1vbmtleSBwYXRjaGluZyB0aG9zZSByZWZsZWN0aXZlIG1ldGhvZHMgdGhhdCB3b3VsZFxuICAgKiAgICAgcHJldmVudCBleHRlbnNpb25zLCB0byBhZGQgdGhpcyBoaWRkZW4gcHJvcGVydHkgZmlyc3QsXG4gICAqIDxsaT5tb25rZXkgcGF0Y2hpbmcgdGhvc2UgbWV0aG9kcyB0aGF0IHdvdWxkIHJldmVhbCB0aGlzXG4gICAqICAgICBoaWRkZW4gcHJvcGVydHkuXG4gICAqIDwvdWw+XG4gICAqIFVuZm9ydHVuYXRlbHksIGJlY2F1c2Ugb2Ygc2FtZS1vcmlnaW4gaWZyYW1lcywgd2UgY2Fubm90IHJlbGlhYmx5XG4gICAqIGFkZCB0aGlzIGhpZGRlbiBwcm9wZXJ0eSBiZWZvcmUgYW4gb2JqZWN0IGJlY29tZXNcbiAgICogbm9uLWV4dGVuc2libGUuIEluc3RlYWQsIGlmIHdlIGVuY291bnRlciBhIG5vbi1leHRlbnNpYmxlIG9iamVjdFxuICAgKiB3aXRob3V0IGEgaGlkZGVuIHJlY29yZCB0aGF0IHdlIGNhbiBkZXRlY3QgKHdoZXRoZXIgb3Igbm90IGl0IGhhc1xuICAgKiBhIGhpZGRlbiByZWNvcmQgc3RvcmVkIHVuZGVyIGEgbmFtZSBzZWNyZXQgdG8gdXMpLCB0aGVuIHdlIGp1c3RcbiAgICogdXNlIHRoZSBrZXkgb2JqZWN0IGl0c2VsZiB0byByZXByZXNlbnQgaXRzIGlkZW50aXR5IGluIGEgYnJ1dGVcbiAgICogZm9yY2UgbGVha3kgbWFwIHN0b3JlZCBpbiB0aGUgd2VhayBtYXAsIGxvc2luZyBhbGwgdGhlIGFkdmFudGFnZXNcbiAgICogb2Ygd2Vha25lc3MgZm9yIHRoZXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0SGlkZGVuUmVjb3JkKGtleSkge1xuICAgIGlmIChrZXkgIT09IE9iamVjdChrZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOb3QgYW4gb2JqZWN0OiAnICsga2V5KTtcbiAgICB9XG4gICAgdmFyIGhpZGRlblJlY29yZCA9IGtleVtISURERU5fTkFNRV07XG4gICAgaWYgKGhpZGRlblJlY29yZCAmJiBoaWRkZW5SZWNvcmQua2V5ID09PSBrZXkpIHsgcmV0dXJuIGhpZGRlblJlY29yZDsgfVxuICAgIGlmICghaXNFeHRlbnNpYmxlKGtleSkpIHtcbiAgICAgIC8vIFdlYWsgbWFwIG11c3QgYnJ1dGUgZm9yY2UsIGFzIGV4cGxhaW5lZCBpbiBkb2MtY29tbWVudCBhYm92ZS5cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgLy8gVGhlIGhpZGRlblJlY29yZCBhbmQgdGhlIGtleSBwb2ludCBkaXJlY3RseSBhdCBlYWNoIG90aGVyLCB2aWFcbiAgICAvLyB0aGUgXCJrZXlcIiBhbmQgSElEREVOX05BTUUgcHJvcGVydGllcyByZXNwZWN0aXZlbHkuIFRoZSBrZXlcbiAgICAvLyBmaWVsZCBpcyBmb3IgcXVpY2tseSB2ZXJpZnlpbmcgdGhhdCB0aGlzIGhpZGRlbiByZWNvcmQgaXMgYW5cbiAgICAvLyBvd24gcHJvcGVydHksIG5vdCBhIGhpZGRlbiByZWNvcmQgZnJvbSB1cCB0aGUgcHJvdG90eXBlIGNoYWluLlxuICAgIC8vXG4gICAgLy8gTk9URTogQmVjYXVzZSB0aGlzIFdlYWtNYXAgZW11bGF0aW9uIGlzIG1lYW50IG9ubHkgZm9yIHN5c3RlbXMgbGlrZVxuICAgIC8vIFNFUyB3aGVyZSBPYmplY3QucHJvdG90eXBlIGlzIGZyb3plbiB3aXRob3V0IGFueSBudW1lcmljXG4gICAgLy8gcHJvcGVydGllcywgaXQgaXMgb2sgdG8gdXNlIGFuIG9iamVjdCBsaXRlcmFsIGZvciB0aGUgaGlkZGVuUmVjb3JkLlxuICAgIC8vIFRoaXMgaGFzIHR3byBhZHZhbnRhZ2VzOlxuICAgIC8vICogSXQgaXMgbXVjaCBmYXN0ZXIgaW4gYSBwZXJmb3JtYW5jZSBjcml0aWNhbCBwbGFjZVxuICAgIC8vICogSXQgYXZvaWRzIHJlbHlpbmcgb24gT2JqZWN0LmNyZWF0ZShudWxsKSwgd2hpY2ggaGFkIGJlZW5cbiAgICAvLyAgIHByb2JsZW1hdGljIG9uIENocm9tZSAyOC4wLjE0ODAuMC4gU2VlXG4gICAgLy8gICBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1jYWphL2lzc3Vlcy9kZXRhaWw/aWQ9MTY4N1xuICAgIGhpZGRlblJlY29yZCA9IHsga2V5OiBrZXkgfTtcblxuICAgIC8vIFdoZW4gdXNpbmcgdGhpcyBXZWFrTWFwIGVtdWxhdGlvbiBvbiBwbGF0Zm9ybXMgd2hlcmVcbiAgICAvLyBPYmplY3QucHJvdG90eXBlIG1pZ2h0IG5vdCBiZSBmcm96ZW4gYW5kIE9iamVjdC5jcmVhdGUobnVsbCkgaXNcbiAgICAvLyByZWxpYWJsZSwgdXNlIHRoZSBmb2xsb3dpbmcgdHdvIGNvbW1lbnRlZCBvdXQgbGluZXMgaW5zdGVhZC5cbiAgICAvLyBoaWRkZW5SZWNvcmQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIC8vIGhpZGRlblJlY29yZC5rZXkgPSBrZXk7XG5cbiAgICAvLyBQbGVhc2UgY29udGFjdCB1cyBpZiB5b3UgbmVlZCB0aGlzIHRvIHdvcmsgb24gcGxhdGZvcm1zIHdoZXJlXG4gICAgLy8gT2JqZWN0LnByb3RvdHlwZSBtaWdodCBub3QgYmUgZnJvemVuIGFuZFxuICAgIC8vIE9iamVjdC5jcmVhdGUobnVsbCkgbWlnaHQgbm90IGJlIHJlbGlhYmxlLlxuXG4gICAgdHJ5IHtcbiAgICAgIGRlZlByb3Aoa2V5LCBISURERU5fTkFNRSwge1xuICAgICAgICB2YWx1ZTogaGlkZGVuUmVjb3JkLFxuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBoaWRkZW5SZWNvcmQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFVuZGVyIHNvbWUgY2lyY3Vtc3RhbmNlcywgaXNFeHRlbnNpYmxlIHNlZW1zIHRvIG1pc3JlcG9ydCB3aGV0aGVyXG4gICAgICAvLyB0aGUgSElEREVOX05BTUUgY2FuIGJlIGRlZmluZWQuXG4gICAgICAvLyBUaGUgY2lyY3Vtc3RhbmNlcyBoYXZlIG5vdCBiZWVuIGlzb2xhdGVkLCBidXQgYXQgbGVhc3QgYWZmZWN0XG4gICAgICAvLyBOb2RlLmpzIHYwLjEwLjI2IG9uIFRyYXZpc0NJIC8gTGludXgsIGJ1dCBub3QgdGhlIHNhbWUgdmVyc2lvbiBvZlxuICAgICAgLy8gTm9kZS5qcyBvbiBPUyBYLlxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW9ua2V5IHBhdGNoIG9wZXJhdGlvbnMgdGhhdCB3b3VsZCBtYWtlIHRoZWlyIGFyZ3VtZW50XG4gICAqIG5vbi1leHRlbnNpYmxlLlxuICAgKlxuICAgKiA8cD5UaGUgbW9ua2V5IHBhdGNoZWQgdmVyc2lvbnMgdGhyb3cgYSBUeXBlRXJyb3IgaWYgdGhlaXJcbiAgICogYXJndW1lbnQgaXMgbm90IGFuIG9iamVjdCwgc28gaXQgc2hvdWxkIG9ubHkgYmUgZG9uZSB0byBmdW5jdGlvbnNcbiAgICogdGhhdCBzaG91bGQgdGhyb3cgYSBUeXBlRXJyb3IgYW55d2F5IGlmIHRoZWlyIGFyZ3VtZW50IGlzIG5vdCBhblxuICAgKiBvYmplY3QuXG4gICAqL1xuICAoZnVuY3Rpb24oKXtcbiAgICB2YXIgb2xkRnJlZXplID0gT2JqZWN0LmZyZWV6ZTtcbiAgICBkZWZQcm9wKE9iamVjdCwgJ2ZyZWV6ZScsIHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpZGVudGlmeWluZ0ZyZWV6ZShvYmopIHtcbiAgICAgICAgZ2V0SGlkZGVuUmVjb3JkKG9iaik7XG4gICAgICAgIHJldHVybiBvbGRGcmVlemUob2JqKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgb2xkU2VhbCA9IE9iamVjdC5zZWFsO1xuICAgIGRlZlByb3AoT2JqZWN0LCAnc2VhbCcsIHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpZGVudGlmeWluZ1NlYWwob2JqKSB7XG4gICAgICAgIGdldEhpZGRlblJlY29yZChvYmopO1xuICAgICAgICByZXR1cm4gb2xkU2VhbChvYmopO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhciBvbGRQcmV2ZW50RXh0ZW5zaW9ucyA9IE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucztcbiAgICBkZWZQcm9wKE9iamVjdCwgJ3ByZXZlbnRFeHRlbnNpb25zJywge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlkZW50aWZ5aW5nUHJldmVudEV4dGVuc2lvbnMob2JqKSB7XG4gICAgICAgIGdldEhpZGRlblJlY29yZChvYmopO1xuICAgICAgICByZXR1cm4gb2xkUHJldmVudEV4dGVuc2lvbnMob2JqKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSkoKTtcblxuICBmdW5jdGlvbiBjb25zdEZ1bmMoZnVuYykge1xuICAgIGZ1bmMucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShmdW5jKTtcbiAgfVxuXG4gIHZhciBjYWxsZWRBc0Z1bmN0aW9uV2FybmluZ0RvbmUgPSBmYWxzZTtcbiAgZnVuY3Rpb24gY2FsbGVkQXNGdW5jdGlvbldhcm5pbmcoKSB7XG4gICAgLy8gRnV0dXJlIEVTNiBXZWFrTWFwIGlzIGN1cnJlbnRseSAoMjAxMy0wOS0xMCkgZXhwZWN0ZWQgdG8gcmVqZWN0IFdlYWtNYXAoKVxuICAgIC8vIGJ1dCB3ZSB1c2VkIHRvIHBlcm1pdCBpdCBhbmQgZG8gaXQgb3Vyc2VsdmVzLCBzbyB3YXJuIG9ubHkuXG4gICAgaWYgKCFjYWxsZWRBc0Z1bmN0aW9uV2FybmluZ0RvbmUgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjYWxsZWRBc0Z1bmN0aW9uV2FybmluZ0RvbmUgPSB0cnVlO1xuICAgICAgY29uc29sZS53YXJuKCdXZWFrTWFwIHNob3VsZCBiZSBpbnZva2VkIGFzIG5ldyBXZWFrTWFwKCksIG5vdCAnICtcbiAgICAgICAgICAnV2Vha01hcCgpLiBUaGlzIHdpbGwgYmUgYW4gZXJyb3IgaW4gdGhlIGZ1dHVyZS4nKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbmV4dElkID0gMDtcblxuICB2YXIgT3VyV2Vha01hcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBPdXJXZWFrTWFwKSkgeyAgLy8gYXBwcm94aW1hdGUgdGVzdCBmb3IgbmV3IC4uLigpXG4gICAgICBjYWxsZWRBc0Z1bmN0aW9uV2FybmluZygpO1xuICAgIH1cblxuICAgIC8vIFdlIGFyZSBjdXJyZW50bHkgKDEyLzI1LzIwMTIpIG5ldmVyIGVuY291bnRlcmluZyBhbnkgcHJlbWF0dXJlbHlcbiAgICAvLyBub24tZXh0ZW5zaWJsZSBrZXlzLlxuICAgIHZhciBrZXlzID0gW107IC8vIGJydXRlIGZvcmNlIGZvciBwcmVtYXR1cmVseSBub24tZXh0ZW5zaWJsZSBrZXlzLlxuICAgIHZhciB2YWx1ZXMgPSBbXTsgLy8gYnJ1dGUgZm9yY2UgZm9yIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgIHZhciBpZCA9IG5leHRJZCsrO1xuXG4gICAgZnVuY3Rpb24gZ2V0X19fKGtleSwgb3B0X2RlZmF1bHQpIHtcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIHZhciBoaWRkZW5SZWNvcmQgPSBnZXRIaWRkZW5SZWNvcmQoa2V5KTtcbiAgICAgIGlmIChoaWRkZW5SZWNvcmQpIHtcbiAgICAgICAgcmV0dXJuIGlkIGluIGhpZGRlblJlY29yZCA/IGhpZGRlblJlY29yZFtpZF0gOiBvcHRfZGVmYXVsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0ga2V5cy5pbmRleE9mKGtleSk7XG4gICAgICAgIHJldHVybiBpbmRleCA+PSAwID8gdmFsdWVzW2luZGV4XSA6IG9wdF9kZWZhdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc19fXyhrZXkpIHtcbiAgICAgIHZhciBoaWRkZW5SZWNvcmQgPSBnZXRIaWRkZW5SZWNvcmQoa2V5KTtcbiAgICAgIGlmIChoaWRkZW5SZWNvcmQpIHtcbiAgICAgICAgcmV0dXJuIGlkIGluIGhpZGRlblJlY29yZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrZXlzLmluZGV4T2Yoa2V5KSA+PSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldF9fXyhrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICB2YXIgaGlkZGVuUmVjb3JkID0gZ2V0SGlkZGVuUmVjb3JkKGtleSk7XG4gICAgICBpZiAoaGlkZGVuUmVjb3JkKSB7XG4gICAgICAgIGhpZGRlblJlY29yZFtpZF0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0ga2V5cy5pbmRleE9mKGtleSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNpbmNlIHNvbWUgYnJvd3NlcnMgcHJlZW1wdGl2ZWx5IHRlcm1pbmF0ZSBzbG93IHR1cm5zIGJ1dFxuICAgICAgICAgIC8vIHRoZW4gY29udGludWUgY29tcHV0aW5nIHdpdGggcHJlc3VtYWJseSBjb3JydXB0ZWQgaGVhcFxuICAgICAgICAgIC8vIHN0YXRlLCB3ZSBoZXJlIGRlZmVuc2l2ZWx5IGdldCBrZXlzLmxlbmd0aCBmaXJzdCBhbmQgdGhlblxuICAgICAgICAgIC8vIHVzZSBpdCB0byB1cGRhdGUgYm90aCB0aGUgdmFsdWVzIGFuZCBrZXlzIGFycmF5cywga2VlcGluZ1xuICAgICAgICAgIC8vIHRoZW0gaW4gc3luYy5cbiAgICAgICAgICBpbmRleCA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAvLyBJZiB3ZSBjcmFzaCBoZXJlLCB2YWx1ZXMgd2lsbCBiZSBvbmUgbG9uZ2VyIHRoYW4ga2V5cy5cbiAgICAgICAgICBrZXlzW2luZGV4XSA9IGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVsZXRlX19fKGtleSkge1xuICAgICAgdmFyIGhpZGRlblJlY29yZCA9IGdldEhpZGRlblJlY29yZChrZXkpO1xuICAgICAgdmFyIGluZGV4LCBsYXN0SW5kZXg7XG4gICAgICBpZiAoaGlkZGVuUmVjb3JkKSB7XG4gICAgICAgIHJldHVybiBpZCBpbiBoaWRkZW5SZWNvcmQgJiYgZGVsZXRlIGhpZGRlblJlY29yZFtpZF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IGtleXMuaW5kZXhPZihrZXkpO1xuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNpbmNlIHNvbWUgYnJvd3NlcnMgcHJlZW1wdGl2ZWx5IHRlcm1pbmF0ZSBzbG93IHR1cm5zIGJ1dFxuICAgICAgICAvLyB0aGVuIGNvbnRpbnVlIGNvbXB1dGluZyB3aXRoIHBvdGVudGlhbGx5IGNvcnJ1cHRlZCBoZWFwXG4gICAgICAgIC8vIHN0YXRlLCB3ZSBoZXJlIGRlZmVuc2l2ZWx5IGdldCBrZXlzLmxlbmd0aCBmaXJzdCBhbmQgdGhlbiB1c2VcbiAgICAgICAgLy8gaXQgdG8gdXBkYXRlIGJvdGggdGhlIGtleXMgYW5kIHRoZSB2YWx1ZXMgYXJyYXksIGtlZXBpbmdcbiAgICAgICAgLy8gdGhlbSBpbiBzeW5jLiBXZSB1cGRhdGUgdGhlIHR3byB3aXRoIGFuIG9yZGVyIG9mIGFzc2lnbm1lbnRzLFxuICAgICAgICAvLyBzdWNoIHRoYXQgYW55IHByZWZpeCBvZiB0aGVzZSBhc3NpZ25tZW50cyB3aWxsIHByZXNlcnZlIHRoZVxuICAgICAgICAvLyBrZXkvdmFsdWUgY29ycmVzcG9uZGVuY2UsIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlIGRlbGV0ZS5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgbmVlZHMgdG8gd29yayBjb3JyZWN0bHkgd2hlbiBpbmRleCA9PT0gbGFzdEluZGV4LlxuICAgICAgICBsYXN0SW5kZXggPSBrZXlzLmxlbmd0aCAtIDE7XG4gICAgICAgIGtleXNbaW5kZXhdID0gdm9pZCAwO1xuICAgICAgICAvLyBJZiB3ZSBjcmFzaCBoZXJlLCB0aGVyZSdzIGEgdm9pZCAwIGluIHRoZSBrZXlzIGFycmF5LCBidXRcbiAgICAgICAgLy8gbm8gb3BlcmF0aW9uIHdpbGwgY2F1c2UgYSBcImtleXMuaW5kZXhPZih2b2lkIDApXCIsIHNpbmNlXG4gICAgICAgIC8vIGdldEhpZGRlblJlY29yZCh2b2lkIDApIHdpbGwgYWx3YXlzIHRocm93IGFuIGVycm9yIGZpcnN0LlxuICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWVzW2xhc3RJbmRleF07XG4gICAgICAgIC8vIElmIHdlIGNyYXNoIGhlcmUsIHZhbHVlc1tpbmRleF0gY2Fubm90IGJlIGZvdW5kIGhlcmUsXG4gICAgICAgIC8vIGJlY2F1c2Uga2V5c1tpbmRleF0gaXMgdm9pZCAwLlxuICAgICAgICBrZXlzW2luZGV4XSA9IGtleXNbbGFzdEluZGV4XTtcbiAgICAgICAgLy8gSWYgaW5kZXggPT09IGxhc3RJbmRleCBhbmQgd2UgY3Jhc2ggaGVyZSwgdGhlbiBrZXlzW2luZGV4XVxuICAgICAgICAvLyBpcyBzdGlsbCB2b2lkIDAsIHNpbmNlIHRoZSBhbGlhc2luZyBraWxsZWQgdGhlIHByZXZpb3VzIGtleS5cbiAgICAgICAga2V5cy5sZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgICAgIC8vIElmIHdlIGNyYXNoIGhlcmUsIGtleXMgd2lsbCBiZSBvbmUgc2hvcnRlciB0aGFuIHZhbHVlcy5cbiAgICAgICAgdmFsdWVzLmxlbmd0aCA9IGxhc3RJbmRleDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoT3VyV2Vha01hcC5wcm90b3R5cGUsIHtcbiAgICAgIGdldF9fXzogICAgeyB2YWx1ZTogY29uc3RGdW5jKGdldF9fXykgfSxcbiAgICAgIGhhc19fXzogICAgeyB2YWx1ZTogY29uc3RGdW5jKGhhc19fXykgfSxcbiAgICAgIHNldF9fXzogICAgeyB2YWx1ZTogY29uc3RGdW5jKHNldF9fXykgfSxcbiAgICAgIGRlbGV0ZV9fXzogeyB2YWx1ZTogY29uc3RGdW5jKGRlbGV0ZV9fXykgfVxuICAgIH0pO1xuICB9O1xuXG4gIE91cldlYWtNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShPYmplY3QucHJvdG90eXBlLCB7XG4gICAgZ2V0OiB7XG4gICAgICAvKipcbiAgICAgICAqIFJldHVybiB0aGUgdmFsdWUgbW9zdCByZWNlbnRseSBhc3NvY2lhdGVkIHdpdGgga2V5LCBvclxuICAgICAgICogb3B0X2RlZmF1bHQgaWYgbm9uZS5cbiAgICAgICAqL1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldChrZXksIG9wdF9kZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldF9fXyhrZXksIG9wdF9kZWZhdWx0KTtcbiAgICAgIH0sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0sXG5cbiAgICBoYXM6IHtcbiAgICAgIC8qKlxuICAgICAgICogSXMgdGhlcmUgYSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGgga2V5IGluIHRoaXMgV2Vha01hcD9cbiAgICAgICAqL1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzX19fKGtleSk7XG4gICAgICB9LFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9LFxuXG4gICAgc2V0OiB7XG4gICAgICAvKipcbiAgICAgICAqIEFzc29jaWF0ZSB2YWx1ZSB3aXRoIGtleSBpbiB0aGlzIFdlYWtNYXAsIG92ZXJ3cml0aW5nIGFueVxuICAgICAgICogcHJldmlvdXMgYXNzb2NpYXRpb24gaWYgcHJlc2VudC5cbiAgICAgICAqL1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldF9fXyhrZXksIHZhbHVlKTtcbiAgICAgIH0sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0sXG5cbiAgICAnZGVsZXRlJzoge1xuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmUgYW55IGFzc29jaWF0aW9uIGZvciBrZXkgaW4gdGhpcyBXZWFrTWFwLCByZXR1cm5pbmdcbiAgICAgICAqIHdoZXRoZXIgdGhlcmUgd2FzIG9uZS5cbiAgICAgICAqXG4gICAgICAgKiA8cD5Ob3RlIHRoYXQgdGhlIGJvb2xlYW4gcmV0dXJuIGhlcmUgZG9lcyBub3Qgd29yayBsaWtlIHRoZVxuICAgICAgICoge0Bjb2RlIGRlbGV0ZX0gb3BlcmF0b3IuIFRoZSB7QGNvZGUgZGVsZXRlfSBvcGVyYXRvciByZXR1cm5zXG4gICAgICAgKiB3aGV0aGVyIHRoZSBkZWxldGlvbiBzdWNjZWVkcyBhdCBicmluZ2luZyBhYm91dCBhIHN0YXRlIGluXG4gICAgICAgKiB3aGljaCB0aGUgZGVsZXRlZCBwcm9wZXJ0eSBpcyBhYnNlbnQuIFRoZSB7QGNvZGUgZGVsZXRlfVxuICAgICAgICogb3BlcmF0b3IgdGhlcmVmb3JlIHJldHVybnMgdHJ1ZSBpZiB0aGUgcHJvcGVydHkgd2FzIGFscmVhZHlcbiAgICAgICAqIGFic2VudCwgd2hlcmVhcyB0aGlzIHtAY29kZSBkZWxldGV9IG1ldGhvZCByZXR1cm5zIGZhbHNlIGlmXG4gICAgICAgKiB0aGUgYXNzb2NpYXRpb24gd2FzIGFscmVhZHkgYWJzZW50LlxuICAgICAgICovXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxldGVfX18oa2V5KTtcbiAgICAgIH0sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBIb3N0V2Vha01hcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIC8vIElmIHdlIGdvdCBoZXJlLCB0aGVuIHRoZSBwbGF0Zm9ybSBoYXMgYSBXZWFrTWFwIGJ1dCB3ZSBhcmUgY29uY2VybmVkXG4gICAgICAvLyB0aGF0IGl0IG1heSByZWZ1c2UgdG8gc3RvcmUgc29tZSBrZXkgdHlwZXMuIFRoZXJlZm9yZSwgbWFrZSBhIG1hcFxuICAgICAgLy8gaW1wbGVtZW50YXRpb24gd2hpY2ggbWFrZXMgdXNlIG9mIGJvdGggYXMgcG9zc2libGUuXG5cbiAgICAgIC8vIEluIHRoaXMgbW9kZSB3ZSBhcmUgYWx3YXlzIHVzaW5nIGRvdWJsZSBtYXBzLCBzbyB3ZSBhcmUgbm90IHByb3h5LXNhZmUuXG4gICAgICAvLyBUaGlzIGNvbWJpbmF0aW9uIGRvZXMgbm90IG9jY3VyIGluIGFueSBrbm93biBicm93c2VyLCBidXQgd2UgaGFkIGJlc3RcbiAgICAgIC8vIGJlIHNhZmUuXG4gICAgICBpZiAoZG91YmxlV2Vha01hcENoZWNrU2lsZW50RmFpbHVyZSAmJiB0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFByb3h5ID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBEb3VibGVXZWFrTWFwKCkge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT3VyV2Vha01hcCkpIHsgIC8vIGFwcHJveGltYXRlIHRlc3QgZm9yIG5ldyAuLi4oKVxuICAgICAgICAgIGNhbGxlZEFzRnVuY3Rpb25XYXJuaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmVmZXJhYmxlLCB0cnVseSB3ZWFrIG1hcC5cbiAgICAgICAgdmFyIGhtYXAgPSBuZXcgSG9zdFdlYWtNYXAoKTtcblxuICAgICAgICAvLyBPdXIgaGlkZGVuLXByb3BlcnR5LWJhc2VkIHBzZXVkby13ZWFrLW1hcC4gTGF6aWx5IGluaXRpYWxpemVkIGluIHRoZVxuICAgICAgICAvLyAnc2V0JyBpbXBsZW1lbnRhdGlvbjsgdGh1cyB3ZSBjYW4gYXZvaWQgcGVyZm9ybWluZyBleHRyYSBsb29rdXBzIGlmXG4gICAgICAgIC8vIHdlIGtub3cgYWxsIGVudHJpZXMgYWN0dWFsbHkgc3RvcmVkIGFyZSBlbnRlcmVkIGluICdobWFwJy5cbiAgICAgICAgdmFyIG9tYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gSGlkZGVuLXByb3BlcnR5IG1hcHMgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggcHJveGllcyBiZWNhdXNlIHByb3hpZXNcbiAgICAgICAgLy8gY2FuIG9ic2VydmUgdGhlIGhpZGRlbiBuYW1lIGFuZCBlaXRoZXIgYWNjaWRlbnRhbGx5IGV4cG9zZSBpdCBvciBmYWlsXG4gICAgICAgIC8vIHRvIGFsbG93IHRoZSBoaWRkZW4gcHJvcGVydHkgdG8gYmUgc2V0LiBUaGVyZWZvcmUsIHdlIGRvIG5vdCBhbGxvd1xuICAgICAgICAvLyBhcmJpdHJhcnkgV2Vha01hcHMgdG8gc3dpdGNoIHRvIHVzaW5nIGhpZGRlbiBwcm9wZXJ0aWVzLCBidXQgb25seVxuICAgICAgICAvLyB0aG9zZSB3aGljaCBuZWVkIHRoZSBhYmlsaXR5LCBhbmQgdW5wcml2aWxlZ2VkIGNvZGUgaXMgbm90IGFsbG93ZWRcbiAgICAgICAgLy8gdG8gc2V0IHRoZSBmbGFnLlxuICAgICAgICAvL1xuICAgICAgICAvLyAoRXhjZXB0IGluIGRvdWJsZVdlYWtNYXBDaGVja1NpbGVudEZhaWx1cmUgbW9kZSBpbiB3aGljaCBjYXNlIHdlXG4gICAgICAgIC8vIGRpc2FibGUgcHJveGllcy4pXG4gICAgICAgIHZhciBlbmFibGVTd2l0Y2hpbmcgPSBmYWxzZTtcblxuICAgICAgICBmdW5jdGlvbiBkZ2V0KGtleSwgb3B0X2RlZmF1bHQpIHtcbiAgICAgICAgICBpZiAob21hcCkge1xuICAgICAgICAgICAgcmV0dXJuIGhtYXAuaGFzKGtleSkgPyBobWFwLmdldChrZXkpXG4gICAgICAgICAgICAgICAgOiBvbWFwLmdldF9fXyhrZXksIG9wdF9kZWZhdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhtYXAuZ2V0KGtleSwgb3B0X2RlZmF1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRoYXMoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIGhtYXAuaGFzKGtleSkgfHwgKG9tYXAgPyBvbWFwLmhhc19fXyhrZXkpIDogZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRzZXQ7XG4gICAgICAgIGlmIChkb3VibGVXZWFrTWFwQ2hlY2tTaWxlbnRGYWlsdXJlKSB7XG4gICAgICAgICAgZHNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGhtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgaWYgKCFobWFwLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgIGlmICghb21hcCkgeyBvbWFwID0gbmV3IE91cldlYWtNYXAoKTsgfVxuICAgICAgICAgICAgICBvbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChlbmFibGVTd2l0Y2hpbmcpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBobWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghb21hcCkgeyBvbWFwID0gbmV3IE91cldlYWtNYXAoKTsgfVxuICAgICAgICAgICAgICAgIG9tYXAuc2V0X19fKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBobWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkZGVsZXRlKGtleSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSAhIWhtYXBbJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgICAgaWYgKG9tYXApIHsgcmV0dXJuIG9tYXAuZGVsZXRlX19fKGtleSkgfHwgcmVzdWx0OyB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKE91cldlYWtNYXAucHJvdG90eXBlLCB7XG4gICAgICAgICAgZ2V0X19fOiAgICB7IHZhbHVlOiBjb25zdEZ1bmMoZGdldCkgfSxcbiAgICAgICAgICBoYXNfX186ICAgIHsgdmFsdWU6IGNvbnN0RnVuYyhkaGFzKSB9LFxuICAgICAgICAgIHNldF9fXzogICAgeyB2YWx1ZTogY29uc3RGdW5jKGRzZXQpIH0sXG4gICAgICAgICAgZGVsZXRlX19fOiB7IHZhbHVlOiBjb25zdEZ1bmMoZGRlbGV0ZSkgfSxcbiAgICAgICAgICBwZXJtaXRIb3N0T2JqZWN0c19fXzogeyB2YWx1ZTogY29uc3RGdW5jKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4gPT09IHdlYWtNYXBQZXJtaXRIb3N0T2JqZWN0cykge1xuICAgICAgICAgICAgICBlbmFibGVTd2l0Y2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdib2d1cyBjYWxsIHRvIHBlcm1pdEhvc3RPYmplY3RzX19fJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSl9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgRG91YmxlV2Vha01hcC5wcm90b3R5cGUgPSBPdXJXZWFrTWFwLnByb3RvdHlwZTtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gRG91YmxlV2Vha01hcDtcblxuICAgICAgLy8gZGVmaW5lIC5jb25zdHJ1Y3RvciB0byBoaWRlIE91cldlYWtNYXAgY3RvclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdlYWtNYXAucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCB7XG4gICAgICAgIHZhbHVlOiBXZWFrTWFwLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSwgIC8vIGFzIGRlZmF1bHQgLmNvbnN0cnVjdG9yIGlzXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0pKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlcmUgaXMgbm8gaG9zdCBXZWFrTWFwLCBzbyB3ZSBtdXN0IHVzZSB0aGUgZW11bGF0aW9uLlxuXG4gICAgLy8gRW11bGF0ZWQgV2Vha01hcHMgYXJlIGluY29tcGF0aWJsZSB3aXRoIG5hdGl2ZSBwcm94aWVzIChiZWNhdXNlIHByb3hpZXNcbiAgICAvLyBjYW4gb2JzZXJ2ZSB0aGUgaGlkZGVuIG5hbWUpLCBzbyB3ZSBtdXN0IGRpc2FibGUgUHJveHkgdXNhZ2UgKGluXG4gICAgLy8gQXJyYXlMaWtlIGFuZCBEb21hZG8sIGN1cnJlbnRseSkuXG4gICAgaWYgKHR5cGVvZiBQcm94eSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIFByb3h5ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gT3VyV2Vha01hcDtcbiAgfVxufSkoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgU2hpbSA9IHJlcXVpcmUoXCIuL3NoaW1cIik7XG52YXIgTGlzdCA9IHJlcXVpcmUoXCIuL2xpc3RcIik7XG52YXIgRmFzdFNldCA9IHJlcXVpcmUoXCIuL2Zhc3Qtc2V0XCIpO1xudmFyIEdlbmVyaWNDb2xsZWN0aW9uID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1jb2xsZWN0aW9uXCIpO1xudmFyIEdlbmVyaWNTZXQgPSByZXF1aXJlKFwiLi9nZW5lcmljLXNldFwiKTtcbnZhciBQcm9wZXJ0eUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcHJvcGVydHktY2hhbmdlc1wiKTtcbnZhciBSYW5nZUNoYW5nZXMgPSByZXF1aXJlKFwiLi9saXN0ZW4vcmFuZ2UtY2hhbmdlc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXQ7XG5cbmZ1bmN0aW9uIFNldCh2YWx1ZXMsIGVxdWFscywgaGFzaCwgZ2V0RGVmYXVsdCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTZXQpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KHZhbHVlcywgZXF1YWxzLCBoYXNoLCBnZXREZWZhdWx0KTtcbiAgICB9XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgaGFzaCA9IGhhc2ggfHwgT2JqZWN0Lmhhc2g7XG4gICAgZ2V0RGVmYXVsdCA9IGdldERlZmF1bHQgfHwgRnVuY3Rpb24ubm9vcDtcbiAgICB0aGlzLmNvbnRlbnRFcXVhbHMgPSBlcXVhbHM7XG4gICAgdGhpcy5jb250ZW50SGFzaCA9IGhhc2g7XG4gICAgdGhpcy5nZXREZWZhdWx0ID0gZ2V0RGVmYXVsdDtcbiAgICAvLyBhIGxpc3Qgb2YgdmFsdWVzIGluIGluc2VydGlvbiBvcmRlciwgdXNlZCBmb3IgYWxsIG9wZXJhdGlvbnMgdGhhdCBkZXBlbmRcbiAgICAvLyBvbiBpdGVyYXRpbmcgaW4gaW5zZXJ0aW9uIG9yZGVyXG4gICAgdGhpcy5vcmRlciA9IG5ldyB0aGlzLk9yZGVyKHVuZGVmaW5lZCwgZXF1YWxzKTtcbiAgICAvLyBhIHNldCBvZiBub2RlcyBmcm9tIHRoZSBvcmRlciBsaXN0LCBpbmRleGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlLFxuICAgIC8vIHVzZWQgZm9yIGFsbCBvcGVyYXRpb25zIHRoYXQgbmVlZCB0byBxdWlja2x5IHNlZWsgIHZhbHVlIGluIHRoZSBsaXN0XG4gICAgdGhpcy5zdG9yZSA9IG5ldyB0aGlzLlN0b3JlKFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzKGEudmFsdWUsIGIudmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIGhhc2gobm9kZS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICApO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmFkZEVhY2godmFsdWVzKTtcbn1cblxuU2V0LlNldCA9IFNldDsgLy8gaGFjayBzbyByZXF1aXJlKFwic2V0XCIpLlNldCB3aWxsIHdvcmsgaW4gTW9udGFnZUpTXG5cbk9iamVjdC5hZGRFYWNoKFNldC5wcm90b3R5cGUsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChTZXQucHJvdG90eXBlLCBHZW5lcmljU2V0LnByb3RvdHlwZSk7XG5PYmplY3QuYWRkRWFjaChTZXQucHJvdG90eXBlLCBQcm9wZXJ0eUNoYW5nZXMucHJvdG90eXBlKTtcbk9iamVjdC5hZGRFYWNoKFNldC5wcm90b3R5cGUsIFJhbmdlQ2hhbmdlcy5wcm90b3R5cGUpO1xuXG5TZXQucHJvdG90eXBlLk9yZGVyID0gTGlzdDtcblNldC5wcm90b3R5cGUuU3RvcmUgPSBGYXN0U2V0O1xuXG5TZXQucHJvdG90eXBlLmNvbnN0cnVjdENsb25lID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih2YWx1ZXMsIHRoaXMuY29udGVudEVxdWFscywgdGhpcy5jb250ZW50SGFzaCwgdGhpcy5nZXREZWZhdWx0KTtcbn07XG5cblNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5vcmRlci5Ob2RlKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5oYXMobm9kZSk7XG59O1xuXG5TZXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgaWYgKGVxdWFscykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXQjZ2V0IGRvZXMgbm90IHN1cHBvcnQgc2Vjb25kIGFyZ3VtZW50OiBlcXVhbHNcIik7XG4gICAgfVxuICAgIHZhciBub2RlID0gbmV3IHRoaXMub3JkZXIuTm9kZSh2YWx1ZSk7XG4gICAgbm9kZSA9IHRoaXMuc3RvcmUuZ2V0KG5vZGUpO1xuICAgIGlmIChub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHQodmFsdWUpO1xuICAgIH1cbn07XG5cblNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5vcmRlci5Ob2RlKHZhbHVlKTtcbiAgICBpZiAoIXRoaXMuc3RvcmUuaGFzKG5vZGUpKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoW3ZhbHVlXSwgW10sIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9yZGVyLmFkZCh2YWx1ZSk7XG4gICAgICAgIG5vZGUgPSB0aGlzLm9yZGVyLmhlYWQucHJldjtcbiAgICAgICAgdGhpcy5zdG9yZS5hZGQobm9kZSk7XG4gICAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXNSYW5nZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hSYW5nZUNoYW5nZShbdmFsdWVdLCBbXSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5TZXQucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBpZiAoZXF1YWxzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldCNkZWxldGUgZG9lcyBub3Qgc3VwcG9ydCBzZWNvbmQgYXJndW1lbnQ6IGVxdWFsc1wiKTtcbiAgICB9XG4gICAgdmFyIG5vZGUgPSBuZXcgdGhpcy5vcmRlci5Ob2RlKHZhbHVlKTtcbiAgICBpZiAodGhpcy5zdG9yZS5oYXMobm9kZSkpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuc3RvcmUuZ2V0KG5vZGUpO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVzUmFuZ2VDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoW10sIFt2YWx1ZV0sIG5vZGUuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RvcmVbXCJkZWxldGVcIl0obm9kZSk7IC8vIHJlbW92ZXMgZnJvbSB0aGUgc2V0XG4gICAgICAgIHRoaXMub3JkZXIuc3BsaWNlKG5vZGUsIDEpOyAvLyByZW1vdmVzIHRoZSBub2RlIGZyb20gdGhlIGxpc3RcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaFJhbmdlQ2hhbmdlKFtdLCBbdmFsdWVdLCBub2RlLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuU2V0LnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm9yZGVyLmhlYWQucHJldi52YWx1ZTtcbiAgICAgICAgdGhpc1tcImRlbGV0ZVwiXShyZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cblNldC5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm9yZGVyLmhlYWQubmV4dC52YWx1ZTtcbiAgICAgICAgdGhpc1tcImRlbGV0ZVwiXShyZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cblNldC5wcm90b3R5cGUub25lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUub25lKCkudmFsdWU7XG4gICAgfVxufTtcblxuU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2xlYXJpbmc7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICBjbGVhcmluZyA9IHRoaXMudG9BcnJheSgpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoQmVmb3JlUmFuZ2VDaGFuZ2UoW10sIGNsZWFyaW5nLCAwKTtcbiAgICB9XG4gICAgdGhpcy5zdG9yZS5jbGVhcigpO1xuICAgIHRoaXMub3JkZXIuY2xlYXIoKTtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMuZGlzcGF0Y2hlc1JhbmdlQ2hhbmdlcykge1xuICAgICAgICB0aGlzLmRpc3BhdGNoUmFuZ2VDaGFuZ2UoW10sIGNsZWFyaW5nLCAwKTtcbiAgICB9XG59O1xuXG5TZXQucHJvdG90eXBlLnJlZHVjZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIGxpc3QgPSB0aGlzLm9yZGVyO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uIChiYXNpcywgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIGJhc2lzLCB2YWx1ZSwgaW5kZXgrKywgdGhpcyk7XG4gICAgfSwgYmFzaXMsIHRoaXMpO1xufTtcblxuU2V0LnByb3RvdHlwZS5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMgLyosIHRoaXNwKi8pIHtcbiAgICB2YXIgdGhpc3AgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIGxpc3QgPSB0aGlzLm9yZGVyO1xuICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gbGlzdC5yZWR1Y2VSaWdodChmdW5jdGlvbiAoYmFzaXMsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNwLCBiYXNpcywgdmFsdWUsIGluZGV4LS0sIHRoaXMpO1xuICAgIH0sIGJhc2lzLCB0aGlzKTtcbn07XG5cblNldC5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmRlci5pdGVyYXRlKCk7XG59O1xuXG5TZXQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2V0ID0gdGhpcy5zdG9yZTtcbiAgICByZXR1cm4gc2V0LmxvZy5hcHBseShzZXQsIGFyZ3VtZW50cyk7XG59O1xuXG5TZXQucHJvdG90eXBlLm1ha2VPYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3JkZXIubWFrZU9ic2VydmFibGUoKTtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICAgIEJhc2VkIGluIHBhcnQgb24gZXh0cmFzIGZyb20gTW90b3JvbGEgTW9iaWxpdHnigJlzIE1vbnRhZ2VcbiAgICBDb3B5cmlnaHQgKGMpIDIwMTIsIE1vdG9yb2xhIE1vYmlsaXR5IExMQy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICAzLUNsYXVzZSBCU0QgTGljZW5zZVxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3Rvcm9sYS1tb2JpbGl0eS9tb250YWdlL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiovXG5cbnZhciBGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL3NoaW0tZnVuY3Rpb25cIik7XG52YXIgR2VuZXJpY0NvbGxlY3Rpb24gPSByZXF1aXJlKFwiLi9nZW5lcmljLWNvbGxlY3Rpb25cIik7XG52YXIgR2VuZXJpY09yZGVyID0gcmVxdWlyZShcIi4vZ2VuZXJpYy1vcmRlclwiKTtcbnZhciBXZWFrTWFwID0gcmVxdWlyZShcIndlYWstbWFwXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5O1xuXG52YXIgYXJyYXlfc3BsaWNlID0gQXJyYXkucHJvdG90eXBlLnNwbGljZTtcbnZhciBhcnJheV9zbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuQXJyYXkuZW1wdHkgPSBbXTtcblxuaWYgKE9iamVjdC5mcmVlemUpIHtcbiAgICBPYmplY3QuZnJlZXplKEFycmF5LmVtcHR5KTtcbn1cblxuQXJyYXkuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICBhcnJheS5hZGRFYWNoKHZhbHVlcyk7XG4gICAgcmV0dXJuIGFycmF5O1xufTtcblxuQXJyYXkudW56aXAgPSBmdW5jdGlvbiAodGFibGUpIHtcbiAgICB2YXIgdHJhbnNwb3NlID0gW107XG4gICAgdmFyIGxlbmd0aCA9IEluZmluaXR5O1xuICAgIC8vIGNvbXB1dGUgc2hvcnRlc3Qgcm93XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcm93ID0gdGFibGVbaV07XG4gICAgICAgIHRhYmxlW2ldID0gcm93LnRvQXJyYXkoKTtcbiAgICAgICAgaWYgKHJvdy5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IHJvdy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcm93ID0gdGFibGVbaV07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoaiA8IGxlbmd0aCAmJiBqIGluIHJvdykge1xuICAgICAgICAgICAgICAgIHRyYW5zcG9zZVtqXSA9IHRyYW5zcG9zZVtqXSB8fCBbXTtcbiAgICAgICAgICAgICAgICB0cmFuc3Bvc2Vbal1baV0gPSByb3dbal07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyYW5zcG9zZTtcbn07XG5cbmZ1bmN0aW9uIGRlZmluZShrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcbn1cblxuZGVmaW5lKFwiYWRkRWFjaFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYWRkRWFjaCk7XG5kZWZpbmUoXCJkZWxldGVFYWNoXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5kZWxldGVFYWNoKTtcbmRlZmluZShcInRvQXJyYXlcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnRvQXJyYXkpO1xuZGVmaW5lKFwidG9PYmplY3RcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnRvT2JqZWN0KTtcbmRlZmluZShcImFsbFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYWxsKTtcbmRlZmluZShcImFueVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuYW55KTtcbmRlZmluZShcIm1pblwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUubWluKTtcbmRlZmluZShcIm1heFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUubWF4KTtcbmRlZmluZShcInN1bVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuc3VtKTtcbmRlZmluZShcImF2ZXJhZ2VcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLmF2ZXJhZ2UpO1xuZGVmaW5lKFwib25seVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUub25seSk7XG5kZWZpbmUoXCJmbGF0dGVuXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5mbGF0dGVuKTtcbmRlZmluZShcInppcFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuemlwKTtcbmRlZmluZShcImVudW1lcmF0ZVwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUuZW51bWVyYXRlKTtcbmRlZmluZShcImdyb3VwXCIsIEdlbmVyaWNDb2xsZWN0aW9uLnByb3RvdHlwZS5ncm91cCk7XG5kZWZpbmUoXCJzb3J0ZWRcIiwgR2VuZXJpY0NvbGxlY3Rpb24ucHJvdG90eXBlLnNvcnRlZCk7XG5kZWZpbmUoXCJyZXZlcnNlZFwiLCBHZW5lcmljQ29sbGVjdGlvbi5wcm90b3R5cGUucmV2ZXJzZWQpO1xuXG5kZWZpbmUoXCJjb25zdHJ1Y3RDbG9uZVwiLCBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgdmFyIGNsb25lID0gbmV3IHRoaXMuY29uc3RydWN0b3IoKTtcbiAgICBjbG9uZS5hZGRFYWNoKHZhbHVlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xufSk7XG5cbmRlZmluZShcImhhc1wiLCBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIHJldHVybiB0aGlzLmZpbmQodmFsdWUsIGVxdWFscykgIT09IC0xO1xufSk7XG5cbmRlZmluZShcImdldFwiLCBmdW5jdGlvbiAoaW5kZXgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmICgraW5kZXggIT09IGluZGV4KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmRpY2llcyBtdXN0IGJlIG51bWJlcnNcIik7XG4gICAgaWYgKCFpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbaW5kZXhdO1xuICAgIH1cbn0pO1xuXG5kZWZpbmUoXCJzZXRcIiwgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgIHRoaXNbaW5kZXhdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuZGVmaW5lKFwiYWRkXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHVzaCh2YWx1ZSk7XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuZGVmaW5lKFwiZGVsZXRlXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5maW5kKHZhbHVlLCBlcXVhbHMpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufSk7XG5cbmRlZmluZShcImRlbGV0ZUFsbFwiLCBmdW5jdGlvbiAodmFsdWUsIGVxdWFscykge1xuICAgIGVxdWFscyA9IGVxdWFscyB8fCB0aGlzLmNvbnRlbnRFcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmxlbmd0aDspIHtcbiAgICAgICAgaWYgKGVxdWFscyh2YWx1ZSwgdGhpc1tpbmRleF0pKSB7XG4gICAgICAgICAgICB0aGlzLnN3YXAoaW5kZXgsIDEpO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufSk7XG5cbmRlZmluZShcImZpbmRcIiwgZnVuY3Rpb24gKHZhbHVlLCBlcXVhbHMpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgdGhpcy5jb250ZW50RXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGlmIChpbmRleCBpbiB0aGlzICYmIGVxdWFscyh2YWx1ZSwgdGhpc1tpbmRleF0pKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufSk7XG5cbmRlZmluZShcImZpbmRMYXN0XCIsIGZ1bmN0aW9uICh2YWx1ZSwgZXF1YWxzKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IHRoaXMuY29udGVudEVxdWFscyB8fCBPYmplY3QuZXF1YWxzO1xuICAgIHZhciBpbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgIGRvIHtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgaWYgKGluZGV4IGluIHRoaXMgJiYgZXF1YWxzKHRoaXNbaW5kZXhdLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgIH0gd2hpbGUgKGluZGV4ID4gMCk7XG4gICAgcmV0dXJuIC0xO1xufSk7XG5cbmRlZmluZShcInN3YXBcIiwgZnVuY3Rpb24gKHN0YXJ0LCBsZW5ndGgsIHBsdXMpIHtcbiAgICB2YXIgYXJncywgcGx1c0xlbmd0aCwgaSwgaiwgcmV0dXJuVmFsdWU7XG4gICAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSBzdGFydDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwbHVzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGFyZ3MgPSBbc3RhcnQsIGxlbmd0aF07XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShwbHVzKSkge1xuICAgICAgICAgICAgcGx1cyA9IGFycmF5X3NsaWNlLmNhbGwocGx1cyk7XG4gICAgICAgIH1cbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHBsdXNMZW5ndGggPSBwbHVzLmxlbmd0aDtcbiAgICAgICAgLy8gMTAwMCBpcyBhIG1hZ2ljIG51bWJlciwgcHJlc3VtZWQgdG8gYmUgc21hbGxlciB0aGFuIHRoZSByZW1haW5pbmdcbiAgICAgICAgLy8gc3RhY2sgbGVuZ3RoLiBGb3Igc3dhcHMgdGhpcyBzbWFsbCwgd2UgdGFrZSB0aGUgZmFzdCBwYXRoIGFuZCBqdXN0XG4gICAgICAgIC8vIHVzZSB0aGUgdW5kZXJseWluZyBBcnJheSBzcGxpY2UuIFdlIGNvdWxkIG1lYXN1cmUgdGhlIGV4YWN0IHNpemUgb2ZcbiAgICAgICAgLy8gdGhlIHJlbWFpbmluZyBzdGFjayB1c2luZyBhIHRyeS9jYXRjaCBhcm91bmQgYW4gdW5ib3VuZGVkIHJlY3Vyc2l2ZVxuICAgICAgICAvLyBmdW5jdGlvbiwgYnV0IHRoaXMgd291bGQgZGVmZWF0IHRoZSBwdXJwb3NlIG9mIHNob3J0LWNpcmN1aXRpbmcgaW5cbiAgICAgICAgLy8gdGhlIGNvbW1vbiBjYXNlLlxuICAgICAgICBpZiAocGx1c0xlbmd0aCA8IDEwMDApIHtcbiAgICAgICAgICAgIGZvciAoaTsgaSA8IHBsdXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbaSsyXSA9IHBsdXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXlfc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQXZvaWQgbWF4aW11bSBjYWxsIHN0YWNrIGVycm9yLlxuICAgICAgICAgICAgLy8gRmlyc3QgZGVsZXRlIHRoZSBkZXNpcmVkIGVudHJpZXMuXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGFycmF5X3NwbGljZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIC8vIFNlY29uZCBiYXRjaCBpbiAxMDAwcy5cbiAgICAgICAgICAgIGZvciAoaTsgaSA8IHBsdXNMZW5ndGg7KSB7XG4gICAgICAgICAgICAgICAgYXJncyA9IFtzdGFydCtpLCAwXTtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAyOyBqIDwgMTAwMiAmJiBpIDwgcGx1c0xlbmd0aDsgaisrLCBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tqXSA9IHBsdXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFycmF5X3NwbGljZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfVxuICAgIC8vIHVzaW5nIGNhbGwgcmF0aGVyIHRoYW4gYXBwbHkgdG8gY3V0IGRvd24gb24gdHJhbnNpZW50IG9iamVjdHNcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsZW5ndGggIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5X3NwbGljZS5jYWxsKHRoaXMsIHN0YXJ0LCBsZW5ndGgpO1xuICAgIH0gIGVsc2UgaWYgKHR5cGVvZiBzdGFydCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gYXJyYXlfc3BsaWNlLmNhbGwodGhpcywgc3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59KTtcblxuZGVmaW5lKFwicGVla1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXNbMF07XG59KTtcblxuZGVmaW5lKFwicG9rZVwiLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSB2YWx1ZTtcbiAgICB9XG59KTtcblxuZGVmaW5lKFwicGVla0JhY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXTtcbiAgICB9XG59KTtcblxuZGVmaW5lKFwicG9rZUJhY2tcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzW3RoaXMubGVuZ3RoIC0gMV0gPSB2YWx1ZTtcbiAgICB9XG59KTtcblxuZGVmaW5lKFwib25lXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgaWYgKE9iamVjdC5vd25zKHRoaXMsIGkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5pZiAoIUFycmF5LnByb3RvdHlwZS5jbGVhcikge1xuICAgIGRlZmluZShcImNsZWFyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9KTtcbn1cblxuZGVmaW5lKFwiY29tcGFyZVwiLCBmdW5jdGlvbiAodGhhdCwgY29tcGFyZSkge1xuICAgIGNvbXBhcmUgPSBjb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIHZhciBpO1xuICAgIHZhciBsZW5ndGg7XG4gICAgdmFyIGxocztcbiAgICB2YXIgcmhzO1xuICAgIHZhciByZWxhdGl2ZTtcblxuICAgIGlmICh0aGlzID09PSB0aGF0KSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmICghdGhhdCB8fCAhQXJyYXkuaXNBcnJheSh0aGF0KSkge1xuICAgICAgICByZXR1cm4gR2VuZXJpY09yZGVyLnByb3RvdHlwZS5jb21wYXJlLmNhbGwodGhpcywgdGhhdCwgY29tcGFyZSk7XG4gICAgfVxuXG4gICAgbGVuZ3RoID0gTWF0aC5taW4odGhpcy5sZW5ndGgsIHRoYXQubGVuZ3RoKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICBpZiAoIShpIGluIHRoYXQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaHMgPSB0aGlzW2ldO1xuICAgICAgICAgICAgICAgIHJocyA9IHRoYXRbaV07XG4gICAgICAgICAgICAgICAgcmVsYXRpdmUgPSBjb21wYXJlKGxocywgcmhzKTtcbiAgICAgICAgICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpIGluIHRoYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoIC0gdGhhdC5sZW5ndGg7XG59KTtcblxuZGVmaW5lKFwiZXF1YWxzXCIsIGZ1bmN0aW9uICh0aGF0LCBlcXVhbHMpIHtcbiAgICBlcXVhbHMgPSBlcXVhbHMgfHwgT2JqZWN0LmVxdWFscztcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgIHZhciBsZWZ0O1xuICAgIHZhciByaWdodDtcblxuICAgIGlmICh0aGlzID09PSB0aGF0KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXRoYXQgfHwgIUFycmF5LmlzQXJyYXkodGhhdCkpIHtcbiAgICAgICAgcmV0dXJuIEdlbmVyaWNPcmRlci5wcm90b3R5cGUuZXF1YWxzLmNhbGwodGhpcywgdGhhdCk7XG4gICAgfVxuXG4gICAgaWYgKGxlbmd0aCAhPT0gdGhhdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpIGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShpIGluIHRoYXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGVmdCA9IHRoaXNbaV07XG4gICAgICAgICAgICAgICAgcmlnaHQgPSB0aGF0W2ldO1xuICAgICAgICAgICAgICAgIGlmICghZXF1YWxzKGxlZnQsIHJpZ2h0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaSBpbiB0aGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuZGVmaW5lKFwiY2xvbmVcIiwgZnVuY3Rpb24gKGRlcHRoLCBtZW1vKSB7XG4gICAgaWYgKGRlcHRoID09IG51bGwpIHtcbiAgICAgICAgZGVwdGggPSBJbmZpbml0eTtcbiAgICB9IGVsc2UgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBtZW1vID0gbWVtbyB8fCBuZXcgV2Vha01hcCgpO1xuICAgIGlmIChtZW1vLmhhcyh0aGlzKSkge1xuICAgICAgICByZXR1cm4gbWVtby5nZXQodGhpcyk7XG4gICAgfVxuICAgIHZhciBjbG9uZSA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgbWVtby5zZXQodGhpcywgY2xvbmUpO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICBjbG9uZVtpXSA9IE9iamVjdC5jbG9uZSh0aGlzW2ldLCBkZXB0aCAtIDEsIG1lbW8pO1xuICAgIH07XG4gICAgcmV0dXJuIGNsb25lO1xufSk7XG5cbmRlZmluZShcIml0ZXJhdGVcIiwgZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5SXRlcmF0b3IodGhpcywgc3RhcnQsIGVuZCk7XG59KTtcblxuZGVmaW5lKFwiSXRlcmF0b3JcIiwgQXJyYXlJdGVyYXRvcik7XG5cbmZ1bmN0aW9uIEFycmF5SXRlcmF0b3IoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0ID09IG51bGwgPyAwIDogc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG59O1xuXG5BcnJheUl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXJ0ID09PSAodGhpcy5lbmQgPT0gbnVsbCA/IHRoaXMuYXJyYXkubGVuZ3RoIDogdGhpcy5lbmQpKSB7XG4gICAgICAgIHRocm93IFN0b3BJdGVyYXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlbdGhpcy5zdGFydCsrXTtcbiAgICB9XG59O1xuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb247XG5cbi8qKlxuICAgIEEgdXRpbGl0eSB0byByZWR1Y2UgdW5uZWNlc3NhcnkgYWxsb2NhdGlvbnMgb2YgPGNvZGU+ZnVuY3Rpb24gKCkge308L2NvZGU+XG4gICAgaW4gaXRzIG1hbnkgY29sb3JmdWwgdmFyaWF0aW9ucy4gIEl0IGRvZXMgbm90aGluZyBhbmQgcmV0dXJuc1xuICAgIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gdGh1cyBtYWtlcyBhIHN1aXRhYmxlIGRlZmF1bHQgaW4gc29tZSBjaXJjdW1zdGFuY2VzLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOkZ1bmN0aW9uLm5vb3BcbiovXG5GdW5jdGlvbi5ub29wID0gZnVuY3Rpb24gKCkge1xufTtcblxuLyoqXG4gICAgQSB1dGlsaXR5IHRvIHJlZHVjZSB1bm5lY2Vzc2FyeSBhbGxvY2F0aW9ucyBvZiA8Y29kZT5mdW5jdGlvbiAoeCkge3JldHVyblxuICAgIHh9PC9jb2RlPiBpbiBpdHMgbWFueSBjb2xvcmZ1bCBidXQgdWx0aW1hdGVseSB3YXN0ZWZ1bCBwYXJhbWV0ZXIgbmFtZVxuICAgIHZhcmlhdGlvbnMuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6RnVuY3Rpb24uaWRlbnRpdHlcbiAgICBAcGFyYW0ge0FueX0gYW55IHZhbHVlXG4gICAgQHJldHVybnMge0FueX0gdGhhdCB2YWx1ZVxuKi9cbkZ1bmN0aW9uLmlkZW50aXR5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xufTtcblxuLyoqXG4gICAgQSB1dGlsaXR5IGZvciBjcmVhdGluZyBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciBhc3BlY3Qgb2YgYVxuICAgIGZpZ3VyYXRpdmUgY2xhc3Mgb2Ygb2JqZWN0cy5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpGdW5jdGlvbi5ieVxuICAgIEBwYXJhbSB7RnVuY3Rpb259IHJlbGF0aW9uIEEgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIGEgdmFsdWUgYW5kIHJldHVybnMgYVxuICAgIGNvcnJlc3BvbmRpbmcgdmFsdWUgdG8gdXNlIGFzIGEgcmVwcmVzZW50YXRpdmUgd2hlbiBzb3J0aW5nIHRoYXQgb2JqZWN0LlxuICAgIEBwYXJhbSB7RnVuY3Rpb259IGNvbXBhcmUgYW4gYWx0ZXJuYXRlIGNvbXBhcmF0b3IgZm9yIGNvbXBhcmluZyB0aGVcbiAgICByZXByZXNlbnRlZCB2YWx1ZXMuICBUaGUgZGVmYXVsdCBpcyA8Y29kZT5PYmplY3QuY29tcGFyZTwvY29kZT4sIHdoaWNoXG4gICAgZG9lcyBhIGRlZXAsIHR5cGUtc2Vuc2l0aXZlLCBwb2x5bW9ycGhpYyBjb21wYXJpc29uLlxuICAgIEByZXR1cm5zIHtGdW5jdGlvbn0gYSBjb21wYXJhdG9yIHRoYXQgaGFzIGJlZW4gYW5ub3RhdGVkIHdpdGhcbiAgICA8Y29kZT5ieTwvY29kZT4gYW5kIDxjb2RlPmNvbXBhcmU8L2NvZGU+IHByb3BlcnRpZXMgc29cbiAgICA8Y29kZT5zb3J0ZWQ8L2NvZGU+IGNhbiBwZXJmb3JtIGEgdHJhbnNmb3JtIHRoYXQgcmVkdWNlcyB0aGUgbmVlZCB0byBjYWxsXG4gICAgPGNvZGU+Ynk8L2NvZGU+IG9uIGVhY2ggc29ydGVkIG9iamVjdCB0byBqdXN0IG9uY2UuXG4gKi9cbkZ1bmN0aW9uLmJ5ID0gZnVuY3Rpb24gKGJ5ICwgY29tcGFyZSkge1xuICAgIGNvbXBhcmUgPSBjb21wYXJlIHx8IE9iamVjdC5jb21wYXJlO1xuICAgIGJ5ID0gYnkgfHwgRnVuY3Rpb24uaWRlbnRpdHk7XG4gICAgdmFyIGNvbXBhcmVCeSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlKGJ5KGEpLCBieShiKSk7XG4gICAgfTtcbiAgICBjb21wYXJlQnkuY29tcGFyZSA9IGNvbXBhcmU7XG4gICAgY29tcGFyZUJ5LmJ5ID0gYnk7XG4gICAgcmV0dXJuIGNvbXBhcmVCeTtcbn07XG5cbi8vIFRPRE8gZG9jdW1lbnRcbkZ1bmN0aW9uLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldChvYmplY3QsIGtleSk7XG4gICAgfTtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgV2Vha01hcCA9IHJlcXVpcmUoXCJ3ZWFrLW1hcFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Q7XG5cbi8qXG4gICAgQmFzZWQgaW4gcGFydCBvbiBleHRyYXMgZnJvbSBNb3Rvcm9sYSBNb2JpbGl0eeKAmXMgTW9udGFnZVxuICAgIENvcHlyaWdodCAoYykgMjAxMiwgTW90b3JvbGEgTW9iaWxpdHkgTExDLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIDMtQ2xhdXNlIEJTRCBMaWNlbnNlXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL21vdG9yb2xhLW1vYmlsaXR5L21vbnRhZ2UvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuKi9cblxuLyoqXG4gICAgRGVmaW5lcyBleHRlbnNpb25zIHRvIGludHJpbnNpYyA8Y29kZT5PYmplY3Q8L2NvZGU+LlxuICAgIEBzZWUgW09iamVjdCBjbGFzc117QGxpbmsgZXh0ZXJuYWw6T2JqZWN0fVxuKi9cblxuLyoqXG4gICAgQSB1dGlsaXR5IG9iamVjdCB0byBhdm9pZCB1bm5lY2Vzc2FyeSBhbGxvY2F0aW9ucyBvZiBhbiBlbXB0eSBvYmplY3RcbiAgICA8Y29kZT57fTwvY29kZT4uICBUaGlzIG9iamVjdCBpcyBmcm96ZW4gc28gaXQgaXMgc2FmZSB0byBzaGFyZS5cblxuICAgIEBvYmplY3QgZXh0ZXJuYWw6T2JqZWN0LmVtcHR5XG4qL1xuT2JqZWN0LmVtcHR5ID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKG51bGwpKTtcblxuLyoqXG4gICAgUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBvYmplY3QsIGFzIG9wcG9zZWQgdG8gYSB2YWx1ZS5cbiAgICBVbmJveGVkIG51bWJlcnMsIHN0cmluZ3MsIHRydWUsIGZhbHNlLCB1bmRlZmluZWQsIGFuZCBudWxsIGFyZSBub3RcbiAgICBvYmplY3RzLiAgQXJyYXlzIGFyZSBvYmplY3RzLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5pc09iamVjdFxuICAgIEBwYXJhbSB7QW55fSB2YWx1ZVxuICAgIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBvYmplY3RcbiovXG5PYmplY3QuaXNPYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdChvYmplY3QpID09PSBvYmplY3Q7XG59O1xuXG4vKipcbiAgICBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhbnkgdmFsdWUsIHBhcnRpY3VsYXJseSBvYmplY3RzIHRoYXRcbiAgICBpbXBsZW1lbnQgPGNvZGU+dmFsdWVPZjwvY29kZT4uXG5cbiAgICA8cD5Ob3RlIHRoYXQsIHVubGlrZSB0aGUgcHJlY2VkZW50IG9mIG1ldGhvZHMgbGlrZVxuICAgIDxjb2RlPk9iamVjdC5lcXVhbHM8L2NvZGU+IGFuZCA8Y29kZT5PYmplY3QuY29tcGFyZTwvY29kZT4gd291bGQgc3VnZ2VzdCxcbiAgICB0aGlzIG1ldGhvZCBpcyBuYW1lZCA8Y29kZT5PYmplY3QuZ2V0VmFsdWVPZjwvY29kZT4gaW5zdGVhZCBvZlxuICAgIDxjb2RlPnZhbHVlT2Y8L2NvZGU+LiAgVGhpcyBpcyBhIGRlbGljYXRlIGlzc3VlLCBidXQgdGhlIGJhc2lzIG9mIHRoaXNcbiAgICBkZWNpc2lvbiBpcyB0aGF0IHRoZSBKYXZhU2NyaXB0IHJ1bnRpbWUgd291bGQgYmUgZmFyIG1vcmUgbGlrZWx5IHRvXG4gICAgYWNjaWRlbnRhbGx5IGNhbGwgdGhpcyBtZXRob2Qgd2l0aCBubyBhcmd1bWVudHMsIGFzc3VtaW5nIHRoYXQgaXQgd291bGRcbiAgICByZXR1cm4gdGhlIHZhbHVlIG9mIDxjb2RlPk9iamVjdDwvY29kZT4gaXRzZWxmIGluIHZhcmlvdXMgc2l0dWF0aW9ucyxcbiAgICB3aGVyZWFzIDxjb2RlPk9iamVjdC5lcXVhbHMoT2JqZWN0LCBudWxsKTwvY29kZT4gcHJvdGVjdHMgYWdhaW5zdCB0aGlzIGNhc2VcbiAgICBieSBub3RpbmcgdGhhdCA8Y29kZT5PYmplY3Q8L2NvZGU+IG93bnMgdGhlIDxjb2RlPmVxdWFsczwvY29kZT4gcHJvcGVydHlcbiAgICBhbmQgdGhlcmVmb3JlIGRvZXMgbm90IGRlbGVnYXRlIHRvIGl0LlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5nZXRWYWx1ZU9mXG4gICAgQHBhcmFtIHtBbnl9IHZhbHVlIGEgdmFsdWUgb3Igb2JqZWN0IHdyYXBwaW5nIGEgdmFsdWVcbiAgICBAcmV0dXJucyB7QW55fSB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoYXQgb2JqZWN0LCBpZiBvbmUgZXhpc3RzLCBvciBwYXNzZXNcbiAgICB0aGUgdmFsdWUgdGhyb3VnaFxuKi9cbk9iamVjdC5nZXRWYWx1ZU9mID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbnZhciBoYXNoTWFwID0gbmV3IFdlYWtNYXAoKTtcbk9iamVjdC5oYXNoID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdC5oYXNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBvYmplY3QuaGFzaCgpO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0KG9iamVjdCkgPT09IG9iamVjdCkge1xuICAgICAgICBpZiAoIWhhc2hNYXAuaGFzKG9iamVjdCkpIHtcbiAgICAgICAgICAgIGhhc2hNYXAuc2V0KG9iamVjdCwgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoTWFwLmdldChvYmplY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiICsgb2JqZWN0O1xuICAgIH1cbn07XG5cbi8qKlxuICAgIEEgc2hvcnRoYW5kIGZvciA8Y29kZT5PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LFxuICAgIGtleSk8L2NvZGU+LiAgUmV0dXJucyB3aGV0aGVyIHRoZSBvYmplY3Qgb3ducyBhIHByb3BlcnR5IGZvciB0aGUgZ2l2ZW4ga2V5LlxuICAgIEl0IGRvZXMgbm90IGNvbnN1bHQgdGhlIHByb3RvdHlwZSBjaGFpbiBhbmQgd29ya3MgZm9yIGFueSBzdHJpbmcgKGluY2x1ZGluZ1xuICAgIFwiaGFzT3duUHJvcGVydHlcIikgZXhjZXB0IFwiX19wcm90b19fXCIuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0Lm93bnNcbiAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAgQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIHRoZSBvYmplY3Qgb3ducyBhIHByb3BlcnR5IHdmb3IgdGhlIGdpdmVuIGtleS5cbiovXG52YXIgb3ducyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5PYmplY3Qub3ducyA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBvd25zLmNhbGwob2JqZWN0LCBrZXkpO1xufTtcblxuLyoqXG4gICAgQSB1dGlsaXR5IHRoYXQgaXMgbGlrZSBPYmplY3Qub3ducyBidXQgaXMgYWxzbyB1c2VmdWwgZm9yIGZpbmRpbmdcbiAgICBwcm9wZXJ0aWVzIG9uIHRoZSBwcm90b3R5cGUgY2hhaW4sIHByb3ZpZGVkIHRoYXQgdGhleSBkbyBub3QgcmVmZXIgdG9cbiAgICBtZXRob2RzIG9uIHRoZSBPYmplY3QgcHJvdG90eXBlLiAgV29ya3MgZm9yIGFsbCBzdHJpbmdzIGV4Y2VwdCBcIl9fcHJvdG9fX1wiLlxuXG4gICAgPHA+QWx0ZXJuYXRlbHksIHlvdSBjb3VsZCB1c2UgdGhlIFwiaW5cIiBvcGVyYXRvciBhcyBsb25nIGFzIHRoZSBvYmplY3RcbiAgICBkZXNjZW5kcyBmcm9tIFwibnVsbFwiIGluc3RlYWQgb2YgdGhlIE9iamVjdC5wcm90b3R5cGUsIGFzIHdpdGhcbiAgICA8Y29kZT5PYmplY3QuY3JlYXRlKG51bGwpPC9jb2RlPi4gIEhvd2V2ZXIsXG4gICAgPGNvZGU+T2JqZWN0LmNyZWF0ZShudWxsKTwvY29kZT4gb25seSB3b3JrcyBpbiBmdWxseSBjb21wbGlhbnQgRWNtYVNjcmlwdCA1XG4gICAgSmF2YVNjcmlwdCBlbmdpbmVzIGFuZCBjYW5ub3QgYmUgZmFpdGhmdWxseSBzaGltbWVkLlxuXG4gICAgPHA+SWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiBhIHR5cGUgdGhhdCBpbXBsZW1lbnRzIGEgbWV0aG9kXG4gICAgbmFtZWQgXCJoYXNcIiwgdGhpcyBmdW5jdGlvbiBkZWZlcnMgdG8gdGhlIGNvbGxlY3Rpb24sIHNvIHRoaXMgbWV0aG9kIGNhbiBiZVxuICAgIHVzZWQgdG8gZ2VuZXJpY2FsbHkgaGFuZGxlIG9iamVjdHMsIGFycmF5cywgb3Igb3RoZXIgY29sbGVjdGlvbnMuICBJbiB0aGF0XG4gICAgY2FzZSwgdGhlIGRvbWFpbiBvZiB0aGUga2V5IGRlcGVuZHMgb24gdGhlIGluc3RhbmNlLlxuXG4gICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICBAcmV0dXJucyB7Qm9vbGVhbn0gd2hldGhlciB0aGUgb2JqZWN0LCBvciBhbnkgb2YgaXRzIHByb3RvdHlwZXMgZXhjZXB0XG4gICAgPGNvZGU+T2JqZWN0LnByb3RvdHlwZTwvY29kZT5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0Lmhhc1xuKi9cbk9iamVjdC5oYXMgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPYmplY3QuaGFzIGNhbid0IGFjY2VwdCBub24tb2JqZWN0OiBcIiArIHR5cGVvZiBvYmplY3QpO1xuICAgIH1cbiAgICAvLyBmb3J3YXJkIHRvIG1hcHBlZCBjb2xsZWN0aW9ucyB0aGF0IGltcGxlbWVudCBcImhhc1wiXG4gICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LmhhcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuaGFzKGtleSk7XG4gICAgLy8gb3RoZXJ3aXNlIHJlcG9ydCB3aGV0aGVyIHRoZSBrZXkgaXMgb24gdGhlIHByb3RvdHlwZSBjaGFpbixcbiAgICAvLyBhcyBsb25nIGFzIGl0IGlzIG5vdCBvbmUgb2YgdGhlIG1ldGhvZHMgb24gb2JqZWN0LnByb3RvdHlwZVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4ga2V5IGluIG9iamVjdCAmJiBvYmplY3Rba2V5XSAhPT0gT2JqZWN0LnByb3RvdHlwZVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIktleSBtdXN0IGJlIGEgc3RyaW5nIGZvciBPYmplY3QuaGFzIG9uIHBsYWluIG9iamVjdHNcIik7XG4gICAgfVxufTtcblxuLyoqXG4gICAgR2V0cyB0aGUgdmFsdWUgZm9yIGEgY29ycmVzcG9uZGluZyBrZXkgZnJvbSBhbiBvYmplY3QuXG5cbiAgICA8cD5Vc2VzIE9iamVjdC5oYXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIHZhbHVlIGZvclxuICAgIHRoZSBnaXZlbiBrZXkuICBBcyBzdWNoLCA8Y29kZT5PYmplY3QuZ2V0PC9jb2RlPiBpcyBjYXBhYmxlIG9mIHJldHJpdmluZ1xuICAgIHZhbHVlcyBmcm9tIHRoZSBwcm90b3R5cGUgY2hhaW4gYXMgbG9uZyBhcyB0aGV5IGFyZSBub3QgZnJvbSB0aGVcbiAgICA8Y29kZT5PYmplY3QucHJvdG90eXBlPC9jb2RlPi5cblxuICAgIDxwPklmIHRoZXJlIGlzIG5vIGNvcnJlc3BvbmRpbmcgdmFsdWUsIHJldHVybnMgdGhlIGdpdmVuIGRlZmF1bHQsIHdoaWNoIG1heVxuICAgIGJlIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4uXG5cbiAgICA8cD5JZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIGEgdHlwZSB0aGF0IGltcGxlbWVudHMgYSBtZXRob2RcbiAgICBuYW1lZCBcImdldFwiLCB0aGlzIGZ1bmN0aW9uIGRlZmVycyB0byB0aGUgY29sbGVjdGlvbiwgc28gdGhpcyBtZXRob2QgY2FuIGJlXG4gICAgdXNlZCB0byBnZW5lcmljYWxseSBoYW5kbGUgb2JqZWN0cywgYXJyYXlzLCBvciBvdGhlciBjb2xsZWN0aW9ucy4gIEluIHRoYXRcbiAgICBjYXNlLCB0aGUgZG9tYWluIG9mIHRoZSBrZXkgZGVwZW5kcyBvbiB0aGUgaW1wbGVtZW50YXRpb24uICBGb3IgYSBgTWFwYCxcbiAgICBmb3IgZXhhbXBsZSwgdGhlIGtleSBtaWdodCBiZSBhbnkgb2JqZWN0LlxuXG4gICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICBAcGFyYW0ge0FueX0gdmFsdWUgYSBkZWZhdWx0IHRvIHJldHVybiwgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBpZiBvbWl0dGVkXG4gICAgQHJldHVybnMge0FueX0gdmFsdWUgZm9yIGtleSwgb3IgZGVmYXVsdCB2YWx1ZVxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuZ2V0XG4qL1xuT2JqZWN0LmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPYmplY3QuZ2V0IGNhbid0IGFjY2VwdCBub24tb2JqZWN0OiBcIiArIHR5cGVvZiBvYmplY3QpO1xuICAgIH1cbiAgICAvLyBmb3J3YXJkIHRvIG1hcHBlZCBjb2xsZWN0aW9ucyB0aGF0IGltcGxlbWVudCBcImdldFwiXG4gICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LmdldCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QuZ2V0KGtleSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LmhhcyhvYmplY3QsIGtleSkpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdFtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG59O1xuXG4vKipcbiAgICBTZXRzIHRoZSB2YWx1ZSBmb3IgYSBnaXZlbiBrZXkgb24gYW4gb2JqZWN0LlxuXG4gICAgPHA+SWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiBhIHR5cGUgdGhhdCBpbXBsZW1lbnRzIGEgbWV0aG9kXG4gICAgbmFtZWQgXCJzZXRcIiwgdGhpcyBmdW5jdGlvbiBkZWZlcnMgdG8gdGhlIGNvbGxlY3Rpb24sIHNvIHRoaXMgbWV0aG9kIGNhbiBiZVxuICAgIHVzZWQgdG8gZ2VuZXJpY2FsbHkgaGFuZGxlIG9iamVjdHMsIGFycmF5cywgb3Igb3RoZXIgY29sbGVjdGlvbnMuICBBcyBzdWNoLFxuICAgIHRoZSBrZXkgZG9tYWluIHZhcmllcyBieSB0aGUgb2JqZWN0IHR5cGUuXG5cbiAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAgQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgIEBwYXJhbSB7QW55fSB2YWx1ZVxuICAgIEByZXR1cm5zIDxjb2RlPnVuZGVmaW5lZDwvY29kZT5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LnNldFxuKi9cbk9iamVjdC5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LnNldCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG9iamVjdC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG59O1xuXG5PYmplY3QuYWRkRWFjaCA9IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICghc291cmNlKSB7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlLmZvckVhY2ggPT09IFwiZnVuY3Rpb25cIiAmJiAhc291cmNlLmhhc093blByb3BlcnR5KFwiZm9yRWFjaFwiKSkge1xuICAgICAgICAvLyBjb3B5IG1hcC1hbGlrZXNcbiAgICAgICAgaWYgKHNvdXJjZS5pc01hcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc291cmNlLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIGl0ZXJhdGUga2V5IHZhbHVlIHBhaXJzIG9mIG90aGVyIGl0ZXJhYmxlc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc291cmNlLmZvckVhY2goZnVuY3Rpb24gKHBhaXIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbcGFpclswXV0gPSBwYWlyWzFdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIC8vIGFyZ3VtZW50cywgc3RyaW5nc1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgc291cmNlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdGFyZ2V0W2luZGV4XSA9IHNvdXJjZVtpbmRleF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb3B5IG90aGVyIG9iamVjdHMgYXMgbWFwLWFsaWtlc1xuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAgICBJdGVyYXRlcyBvdmVyIHRoZSBvd25lZCBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdC5cblxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuZm9yRWFjaFxuICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgYW4gb2JqZWN0IHRvIGl0ZXJhdGUuXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIGZvciBldmVyeSBrZXkgYW5kIHZhbHVlXG4gICAgcGFpciBpbiB0aGUgb2JqZWN0LiAgUmVjZWl2ZXMgPGNvZGU+dmFsdWU8L2NvZGU+LCA8Y29kZT5rZXk8L2NvZGU+LFxuICAgIGFuZCA8Y29kZT5vYmplY3Q8L2NvZGU+IGFzIGFyZ3VtZW50cy5cbiAgICBAcGFyYW0ge09iamVjdH0gdGhpc3AgdGhlIDxjb2RlPnRoaXM8L2NvZGU+IHRvIHBhc3MgdGhyb3VnaCB0byB0aGVcbiAgICBjYWxsYmFja1xuKi9cbk9iamVjdC5mb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzcCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICAgIEl0ZXJhdGVzIG92ZXIgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBtYXAsIGNvbnN0cnVjdGluZyBhIG5ldyBhcnJheSBvZlxuICAgIG1hcHBlZCB2YWx1ZXMuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0Lm1hcFxuICAgIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgYW4gb2JqZWN0IHRvIGl0ZXJhdGUuXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIGZvciBldmVyeSBrZXkgYW5kIHZhbHVlXG4gICAgcGFpciBpbiB0aGUgb2JqZWN0LiAgUmVjZWl2ZXMgPGNvZGU+dmFsdWU8L2NvZGU+LCA8Y29kZT5rZXk8L2NvZGU+LFxuICAgIGFuZCA8Y29kZT5vYmplY3Q8L2NvZGU+IGFzIGFyZ3VtZW50cy5cbiAgICBAcGFyYW0ge09iamVjdH0gdGhpc3AgdGhlIDxjb2RlPnRoaXM8L2NvZGU+IHRvIHBhc3MgdGhyb3VnaCB0byB0aGVcbiAgICBjYWxsYmFja1xuICAgIEByZXR1cm5zIHtBcnJheX0gdGhlIHJlc3BlY3RpdmUgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmb3IgZWFjaFxuICAgIGl0ZW0gaW4gdGhlIG9iamVjdC5cbiovXG5PYmplY3QubWFwID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc3AsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdCk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAgICBSZXR1cm5zIHRoZSB2YWx1ZXMgZm9yIG93bmVkIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5tYXBcbiAgICBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAgQHJldHVybnMge0FycmF5fSB0aGUgcmVzcGVjdGl2ZSB2YWx1ZSBmb3IgZWFjaCBvd25lZCBwcm9wZXJ0eSBvZiB0aGVcbiAgICBvYmplY3QuXG4qL1xuT2JqZWN0LnZhbHVlcyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0Lm1hcChvYmplY3QsIEZ1bmN0aW9uLmlkZW50aXR5KTtcbn07XG5cbi8vIFRPRE8gaW5saW5lIGRvY3VtZW50IGNvbmNhdFxuT2JqZWN0LmNvbmNhdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgT2JqZWN0LmFkZEVhY2gob2JqZWN0LCBhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuT2JqZWN0LmZyb20gPSBPYmplY3QuY29uY2F0O1xuXG4vKipcbiAgICBSZXR1cm5zIHdoZXRoZXIgdHdvIHZhbHVlcyBhcmUgaWRlbnRpY2FsLiAgQW55IHZhbHVlIGlzIGlkZW50aWNhbCB0byBpdHNlbGZcbiAgICBhbmQgb25seSBpdHNlbGYuICBUaGlzIGlzIG11Y2ggbW9yZSByZXN0aWN0aXZlIHRoYW4gZXF1aXZhbGVuY2UgYW5kIHN1YnRseVxuICAgIGRpZmZlcmVudCB0aGFuIHN0cmljdCBlcXVhbGl0eSwgPGNvZGU+PT09PC9jb2RlPiBiZWNhdXNlIG9mIGVkZ2UgY2FzZXNcbiAgICBpbmNsdWRpbmcgbmVnYXRpdmUgemVybyBhbmQgPGNvZGU+TmFOPC9jb2RlPi4gIElkZW50aXR5IGlzIHVzZWZ1bCBmb3JcbiAgICByZXNvbHZpbmcgY29sbGlzaW9ucyBhbW9uZyBrZXlzIGluIGEgbWFwcGluZyB3aGVyZSB0aGUgZG9tYWluIGlzIGFueSB2YWx1ZS5cbiAgICBUaGlzIG1ldGhvZCBkb2VzIG5vdCBkZWxnYXRlIHRvIGFueSBtZXRob2Qgb24gYW4gb2JqZWN0IGFuZCBjYW5ub3QgYmVcbiAgICBvdmVycmlkZGVuLlxuICAgIEBzZWUgaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsXG4gICAgQHBhcmFtIHtBbnl9IHRoaXNcbiAgICBAcGFyYW0ge0FueX0gdGhhdFxuICAgIEByZXR1cm5zIHtCb29sZWFufSB3aGV0aGVyIHRoaXMgYW5kIHRoYXQgYXJlIGlkZW50aWNhbFxuICAgIEBmdW5jdGlvbiBleHRlcm5hbDpPYmplY3QuaXNcbiovXG5PYmplY3QuaXMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAgIC8vIDAgPT09IC0wLCBidXQgdGhleSBhcmUgbm90IGlkZW50aWNhbFxuICAgICAgICByZXR1cm4geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHk7XG4gICAgfVxuICAgIC8vIE5hTiAhPT0gTmFOLCBidXQgdGhleSBhcmUgaWRlbnRpY2FsLlxuICAgIC8vIE5hTnMgYXJlIHRoZSBvbmx5IG5vbi1yZWZsZXhpdmUgdmFsdWUsIGkuZS4sIGlmIHggIT09IHgsXG4gICAgLy8gdGhlbiB4IGlzIGEgTmFOLlxuICAgIC8vIGlzTmFOIGlzIGJyb2tlbjogaXQgY29udmVydHMgaXRzIGFyZ3VtZW50IHRvIG51bWJlciwgc29cbiAgICAvLyBpc05hTihcImZvb1wiKSA9PiB0cnVlXG4gICAgcmV0dXJuIHggIT09IHggJiYgeSAhPT0geTtcbn07XG5cbi8qKlxuICAgIFBlcmZvcm1zIGEgcG9seW1vcnBoaWMsIHR5cGUtc2Vuc2l0aXZlIGRlZXAgZXF1aXZhbGVuY2UgY29tcGFyaXNvbiBvZiBhbnlcbiAgICB0d28gdmFsdWVzLlxuXG4gICAgPHA+QXMgYSBiYXNpYyBwcmluY2lwbGUsIGFueSB2YWx1ZSBpcyBlcXVpdmFsZW50IHRvIGl0c2VsZiAoYXMgaW5cbiAgICBpZGVudGl0eSksIGFueSBib3hlZCB2ZXJzaW9uIG9mIGl0c2VsZiAoYXMgYSA8Y29kZT5uZXcgTnVtYmVyKDEwKTwvY29kZT4gaXNcbiAgICB0byAxMCksIGFuZCBhbnkgZGVlcCBjbG9uZSBvZiBpdHNlbGYuXG5cbiAgICA8cD5FcXVpdmFsZW5jZSBoYXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuXG4gICAgPHVsPlxuICAgICAgICA8bGk+PHN0cm9uZz5wb2x5bW9ycGhpYzo8L3N0cm9uZz5cbiAgICAgICAgICAgIElmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gaW5zdGFuY2Ugb2YgYSB0eXBlIHRoYXQgaW1wbGVtZW50cyBhXG4gICAgICAgICAgICBtZXRob2RzIG5hbWVkIFwiZXF1YWxzXCIsIHRoaXMgZnVuY3Rpb24gZGVmZXJzIHRvIHRoZSBtZXRob2QuICBTbyxcbiAgICAgICAgICAgIHRoaXMgZnVuY3Rpb24gY2FuIHNhZmVseSBjb21wYXJlIGFueSB2YWx1ZXMgcmVnYXJkbGVzcyBvZiB0eXBlLFxuICAgICAgICAgICAgaW5jbHVkaW5nIHVuZGVmaW5lZCwgbnVsbCwgbnVtYmVycywgc3RyaW5ncywgYW55IHBhaXIgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgd2hlcmUgZWl0aGVyIGltcGxlbWVudHMgXCJlcXVhbHNcIiwgb3Igb2JqZWN0IGxpdGVyYWxzIHRoYXQgbWF5IGV2ZW5cbiAgICAgICAgICAgIGNvbnRhaW4gYW4gXCJlcXVhbHNcIiBrZXkuXG4gICAgICAgIDxsaT48c3Ryb25nPnR5cGUtc2Vuc2l0aXZlOjwvc3Ryb25nPlxuICAgICAgICAgICAgSW5jb21wYXJhYmxlIHR5cGVzIGFyZSBub3QgZXF1YWwuICBObyBvYmplY3QgaXMgZXF1aXZhbGVudCB0byBhbnlcbiAgICAgICAgICAgIGFycmF5LiAgTm8gc3RyaW5nIGlzIGVxdWFsIHRvIGFueSBvdGhlciBudW1iZXIuXG4gICAgICAgIDxsaT48c3Ryb25nPmRlZXA6PC9zdHJvbmc+XG4gICAgICAgICAgICBDb2xsZWN0aW9ucyB3aXRoIGVxdWl2YWxlbnQgY29udGVudCBhcmUgZXF1aXZhbGVudCwgcmVjdXJzaXZlbHkuXG4gICAgICAgIDxsaT48c3Ryb25nPmVxdWl2YWxlbmNlOjwvc3Ryb25nPlxuICAgICAgICAgICAgSWRlbnRpY2FsIHZhbHVlcyBhbmQgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgYnV0IHNvIGFyZSBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgdGhhdCBjb250YWluIGVxdWl2YWxlbnQgY29udGVudC4gIFdoZXRoZXIgb3JkZXIgaXMgaW1wb3J0YW50IHZhcmllc1xuICAgICAgICAgICAgYnkgdHlwZS4gIEZvciBBcnJheXMgYW5kIGxpc3RzLCBvcmRlciBpcyBpbXBvcnRhbnQuICBGb3IgT2JqZWN0cyxcbiAgICAgICAgICAgIG1hcHMsIGFuZCBzZXRzLCBvcmRlciBpcyBub3QgaW1wb3J0YW50LiAgQm94ZWQgb2JqZWN0cyBhcmUgbXV0YWxseVxuICAgICAgICAgICAgZXF1aXZhbGVudCB3aXRoIHRoZWlyIHVuYm94ZWQgdmFsdWVzLCBieSB2aXJ0dWUgb2YgdGhlIHN0YW5kYXJkXG4gICAgICAgICAgICA8Y29kZT52YWx1ZU9mPC9jb2RlPiBtZXRob2QuXG4gICAgPC91bD5cbiAgICBAcGFyYW0gdGhpc1xuICAgIEBwYXJhbSB0aGF0XG4gICAgQHJldHVybnMge0Jvb2xlYW59IHdoZXRoZXIgdGhlIHZhbHVlcyBhcmUgZGVlcGx5IGVxdWl2YWxlbnRcbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LmVxdWFsc1xuKi9cbk9iamVjdC5lcXVhbHMgPSBmdW5jdGlvbiAoYSwgYiwgZXF1YWxzLCBtZW1vKSB7XG4gICAgZXF1YWxzID0gZXF1YWxzIHx8IE9iamVjdC5lcXVhbHM7XG4gICAgLy8gdW5ib3ggb2JqZWN0cywgYnV0IGRvIG5vdCBjb25mdXNlIG9iamVjdCBsaXRlcmFsc1xuICAgIGEgPSBPYmplY3QuZ2V0VmFsdWVPZihhKTtcbiAgICBiID0gT2JqZWN0LmdldFZhbHVlT2YoYik7XG4gICAgaWYgKGEgPT09IGIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIGlmIChPYmplY3QuaXNPYmplY3QoYSkpIHtcbiAgICAgICAgbWVtbyA9IG1lbW8gfHwgbmV3IFdlYWtNYXAoKTtcbiAgICAgICAgaWYgKG1lbW8uaGFzKGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBtZW1vLnNldChhLCB0cnVlKTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5pc09iamVjdChhKSAmJiB0eXBlb2YgYS5lcXVhbHMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gYS5lcXVhbHMoYiwgZXF1YWxzLCBtZW1vKTtcbiAgICB9XG4gICAgLy8gY29tbXV0YXRpdmVcbiAgICBpZiAoT2JqZWN0LmlzT2JqZWN0KGIpICYmIHR5cGVvZiBiLmVxdWFscyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBiLmVxdWFscyhhLCBlcXVhbHMsIG1lbW8pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmlzT2JqZWN0KGEpICYmIE9iamVjdC5pc09iamVjdChiKSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKGEpID09PSBPYmplY3QucHJvdG90eXBlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihiKSA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcXVhbHMoYVtuYW1lXSwgYltuYW1lXSwgZXF1YWxzLCBtZW1vKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBhKSB8fCAhZXF1YWxzKGJbbmFtZV0sIGFbbmFtZV0sIGVxdWFscywgbWVtbykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIE5hTiAhPT0gTmFOLCBidXQgdGhleSBhcmUgZXF1YWwuXG4gICAgLy8gTmFOcyBhcmUgdGhlIG9ubHkgbm9uLXJlZmxleGl2ZSB2YWx1ZSwgaS5lLiwgaWYgeCAhPT0geCxcbiAgICAvLyB0aGVuIHggaXMgYSBOYU4uXG4gICAgLy8gaXNOYU4gaXMgYnJva2VuOiBpdCBjb252ZXJ0cyBpdHMgYXJndW1lbnQgdG8gbnVtYmVyLCBzb1xuICAgIC8vIGlzTmFOKFwiZm9vXCIpID0+IHRydWVcbiAgICAvLyBXZSBoYXZlIGVzdGFibGlzaGVkIHRoYXQgYSAhPT0gYiwgYnV0IGlmIGEgIT09IGEgJiYgYiAhPT0gYiwgdGhleSBhcmVcbiAgICAvLyBib3RoIE5hTi5cbiAgICBpZiAoYSAhPT0gYSAmJiBiICE9PSBiKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoIWEgfHwgIWIpXG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIEJlY2F1c2UgYSByZXR1cm4gdmFsdWUgb2YgMCBmcm9tIGEgYGNvbXBhcmVgIGZ1bmN0aW9uICBtYXkgbWVhbiBlaXRoZXJcbi8vIFwiZXF1YWxzXCIgb3IgXCJpcyBpbmNvbXBhcmFibGVcIiwgYGVxdWFsc2AgY2Fubm90IGJlIGRlZmluZWQgaW4gdGVybXMgb2Zcbi8vIGBjb21wYXJlYC4gIEhvd2V2ZXIsIGBjb21wYXJlYCAqY2FuKiBiZSBkZWZpbmVkIGluIHRlcm1zIG9mIGBlcXVhbHNgIGFuZFxuLy8gYGxlc3NUaGFuYC4gIEFnYWluIGhvd2V2ZXIsIG1vcmUgb2Z0ZW4gaXQgd291bGQgYmUgZGVzaXJhYmxlIHRvIGltcGxlbWVudFxuLy8gYWxsIG9mIHRoZSBjb21wYXJpc29uIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBjb21wYXJlIHJhdGhlciB0aGFuIHRoZSBvdGhlclxuLy8gd2F5IGFyb3VuZC5cblxuLyoqXG4gICAgRGV0ZXJtaW5lcyB0aGUgb3JkZXIgaW4gd2hpY2ggYW55IHR3byBvYmplY3RzIHNob3VsZCBiZSBzb3J0ZWQgYnkgcmV0dXJuaW5nXG4gICAgYSBudW1iZXIgdGhhdCBoYXMgYW4gYW5hbG9nb3VzIHJlbGF0aW9uc2hpcCB0byB6ZXJvIGFzIHRoZSBsZWZ0IHZhbHVlIHRvXG4gICAgdGhlIHJpZ2h0LiAgVGhhdCBpcywgaWYgdGhlIGxlZnQgaXMgXCJsZXNzIHRoYW5cIiB0aGUgcmlnaHQsIHRoZSByZXR1cm5lZFxuICAgIHZhbHVlIHdpbGwgYmUgXCJsZXNzIHRoYW5cIiB6ZXJvLCB3aGVyZSBcImxlc3MgdGhhblwiIG1heSBiZSBhbnkgb3RoZXJcbiAgICB0cmFuc2l0aXZlIHJlbGF0aW9uc2hpcC5cblxuICAgIDxwPkFycmF5cyBhcmUgY29tcGFyZWQgYnkgdGhlIGZpcnN0IGRpdmVyZ2luZyB2YWx1ZXMsIG9yIGJ5IGxlbmd0aC5cblxuICAgIDxwPkFueSB0d28gdmFsdWVzIHRoYXQgYXJlIGluY29tcGFyYWJsZSByZXR1cm4gemVyby4gIEFzIHN1Y2gsXG4gICAgPGNvZGU+ZXF1YWxzPC9jb2RlPiBzaG91bGQgbm90IGJlIGltcGxlbWVudGVkIHdpdGggPGNvZGU+Y29tcGFyZTwvY29kZT5cbiAgICBzaW5jZSBpbmNvbXBhcmFiaWxpdHkgaXMgaW5kaXN0aW5ndWlzaGFibGUgZnJvbSBlcXVhbGl0eS5cblxuICAgIDxwPlNvcnRzIHN0cmluZ3MgbGV4aWNvZ3JhcGhpY2FsbHkuICBUaGlzIGlzIG5vdCBzdWl0YWJsZSBmb3IgYW55XG4gICAgcGFydGljdWxhciBpbnRlcm5hdGlvbmFsIHNldHRpbmcuICBEaWZmZXJlbnQgbG9jYWxlcyBzb3J0IHRoZWlyIHBob25lIGJvb2tzXG4gICAgaW4gdmVyeSBkaWZmZXJlbnQgd2F5cywgcGFydGljdWxhcmx5IHJlZ2FyZGluZyBkaWFjcml0aWNzIGFuZCBsaWdhdHVyZXMuXG5cbiAgICA8cD5JZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIGEgdHlwZSB0aGF0IGltcGxlbWVudHMgYSBtZXRob2RcbiAgICBuYW1lZCBcImNvbXBhcmVcIiwgdGhpcyBmdW5jdGlvbiBkZWZlcnMgdG8gdGhlIGluc3RhbmNlLiAgVGhlIG1ldGhvZCBkb2VzIG5vdFxuICAgIG5lZWQgdG8gYmUgYW4gb3duZWQgcHJvcGVydHkgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBvYmplY3QgbGl0ZXJhbCBzaW5jZVxuICAgIG9iamVjdCBsaXRlcmFscyBhcmUgaW5jb21wYXJhYmxlLiAgVW5saWtlIDxjb2RlPk9iamVjdDwvY29kZT4gaG93ZXZlcixcbiAgICA8Y29kZT5BcnJheTwvY29kZT4gaW1wbGVtZW50cyA8Y29kZT5jb21wYXJlPC9jb2RlPi5cblxuICAgIEBwYXJhbSB7QW55fSBsZWZ0XG4gICAgQHBhcmFtIHtBbnl9IHJpZ2h0XG4gICAgQHJldHVybnMge051bWJlcn0gYSB2YWx1ZSBoYXZpbmcgdGhlIHNhbWUgdHJhbnNpdGl2ZSByZWxhdGlvbnNoaXAgdG8gemVyb1xuICAgIGFzIHRoZSBsZWZ0IGFuZCByaWdodCB2YWx1ZXMuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5jb21wYXJlXG4qL1xuT2JqZWN0LmNvbXBhcmUgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIC8vIHVuYm94IG9iamVjdHMsIGJ1dCBkbyBub3QgY29uZnVzZSBvYmplY3QgbGl0ZXJhbHNcbiAgICAvLyBtZXJjaWZ1bGx5IGhhbmRsZXMgdGhlIERhdGUgY2FzZVxuICAgIGEgPSBPYmplY3QuZ2V0VmFsdWVPZihhKTtcbiAgICBiID0gT2JqZWN0LmdldFZhbHVlT2YoYik7XG4gICAgaWYgKGEgPT09IGIpXG4gICAgICAgIHJldHVybiAwO1xuICAgIHZhciBhVHlwZSA9IHR5cGVvZiBhO1xuICAgIHZhciBiVHlwZSA9IHR5cGVvZiBiO1xuICAgIGlmIChhVHlwZSA9PT0gXCJudW1iZXJcIiAmJiBiVHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIGlmIChhVHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBiVHlwZSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgcmV0dXJuIGEgPCBiID8gLUluZmluaXR5IDogSW5maW5pdHk7XG4gICAgICAgIC8vIHRoZSBwb3NzaWJpbGl0eSBvZiBlcXVhbGl0eSBlbGltaWF0ZWQgYWJvdmVcbiAgICBpZiAoYSAmJiB0eXBlb2YgYS5jb21wYXJlID09PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgIHJldHVybiBhLmNvbXBhcmUoYik7XG4gICAgLy8gbm90IGNvbW11dGF0aXZlLCB0aGUgcmVsYXRpb25zaGlwIGlzIHJldmVyc2VkXG4gICAgaWYgKGIgJiYgdHlwZW9mIGIuY29tcGFyZSA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICByZXR1cm4gLWIuY29tcGFyZShhKTtcbiAgICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICAgIENyZWF0ZXMgYSBkZWVwIGNvcHkgb2YgYW55IHZhbHVlLiAgVmFsdWVzLCBiZWluZyBpbW11dGFibGUsIGFyZVxuICAgIHJldHVybmVkIHdpdGhvdXQgYWx0ZXJuYXRpb24uICBGb3J3YXJkcyB0byA8Y29kZT5jbG9uZTwvY29kZT4gb25cbiAgICBvYmplY3RzIGFuZCBhcnJheXMuXG5cbiAgICBAZnVuY3Rpb24gZXh0ZXJuYWw6T2JqZWN0LmNsb25lXG4gICAgQHBhcmFtIHtBbnl9IHZhbHVlIGEgdmFsdWUgdG8gY2xvbmVcbiAgICBAcGFyYW0ge051bWJlcn0gZGVwdGggYW4gb3B0aW9uYWwgdHJhdmVyc2FsIGRlcHRoLCBkZWZhdWx0cyB0byBpbmZpbml0eS5cbiAgICBBIHZhbHVlIG9mIDxjb2RlPjA8L2NvZGU+IG1lYW5zIHRvIG1ha2Ugbm8gY2xvbmUgYW5kIHJldHVybiB0aGUgdmFsdWVcbiAgICBkaXJlY3RseS5cbiAgICBAcGFyYW0ge01hcH0gbWVtbyBhbiBvcHRpb25hbCBtZW1vIG9mIGFscmVhZHkgdmlzaXRlZCBvYmplY3RzIHRvIHByZXNlcnZlXG4gICAgcmVmZXJlbmNlIGN5Y2xlcy4gIFRoZSBjbG9uZWQgb2JqZWN0IHdpbGwgaGF2ZSB0aGUgZXhhY3Qgc2FtZSBzaGFwZSBhcyB0aGVcbiAgICBvcmlnaW5hbCwgYnV0IG5vIGlkZW50aWNhbCBvYmplY3RzLiAgVGUgbWFwIG1heSBiZSBsYXRlciB1c2VkIHRvIGFzc29jaWF0ZVxuICAgIGFsbCBvYmplY3RzIGluIHRoZSBvcmlnaW5hbCBvYmplY3QgZ3JhcGggd2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIG1lbWJlciBvZlxuICAgIHRoZSBjbG9uZWQgZ3JhcGguXG4gICAgQHJldHVybnMgYSBjb3B5IG9mIHRoZSB2YWx1ZVxuKi9cbk9iamVjdC5jbG9uZSA9IGZ1bmN0aW9uICh2YWx1ZSwgZGVwdGgsIG1lbW8pIHtcbiAgICB2YWx1ZSA9IE9iamVjdC5nZXRWYWx1ZU9mKHZhbHVlKTtcbiAgICBtZW1vID0gbWVtbyB8fCBuZXcgV2Vha01hcCgpO1xuICAgIGlmIChkZXB0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlcHRoID0gSW5maW5pdHk7XG4gICAgfSBlbHNlIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChPYmplY3QuaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIGlmICghbWVtby5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmNsb25lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBtZW1vLnNldCh2YWx1ZSwgdmFsdWUuY2xvbmUoZGVwdGgsIG1lbW8pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb25lID0gT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICBtZW1vLnNldCh2YWx1ZSwgY2xvbmUpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lW2tleV0gPSBPYmplY3QuY2xvbmUodmFsdWVba2V5XSwgZGVwdGggLSAxLCBtZW1vKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGNsb25lIFwiICsgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVtby5nZXQodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59O1xuXG4vKipcbiAgICBSZW1vdmVzIGFsbCBwcm9wZXJ0aWVzIG93bmVkIGJ5IHRoaXMgb2JqZWN0IG1ha2luZyB0aGUgb2JqZWN0IHN1aXRhYmxlIGZvclxuICAgIHJldXNlLlxuXG4gICAgQGZ1bmN0aW9uIGV4dGVybmFsOk9iamVjdC5jbGVhclxuICAgIEByZXR1cm5zIHRoaXNcbiovXG5PYmplY3QuY2xlYXIgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LmNsZWFyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgb2JqZWN0LmNsZWFyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpLFxuICAgICAgICAgICAgaSA9IGtleXMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaSkge1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgZGVsZXRlIG9iamVjdFtrZXlzW2ldXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuIiwiXG4vKipcbiAgICBhY2NlcHRzIGEgc3RyaW5nOyByZXR1cm5zIHRoZSBzdHJpbmcgd2l0aCByZWdleCBtZXRhY2hhcmFjdGVycyBlc2NhcGVkLlxuICAgIHRoZSByZXR1cm5lZCBzdHJpbmcgY2FuIHNhZmVseSBiZSB1c2VkIHdpdGhpbiBhIHJlZ2V4IHRvIG1hdGNoIGEgbGl0ZXJhbFxuICAgIHN0cmluZy4gZXNjYXBlZCBjaGFyYWN0ZXJzIGFyZSBbLCBdLCB7LCB9LCAoLCApLCAtLCAqLCArLCA/LCAuLCBcXCwgXiwgJCxcbiAgICB8LCAjLCBbY29tbWFdLCBhbmQgd2hpdGVzcGFjZS5cbiovXG5pZiAoIVJlZ0V4cC5lc2NhcGUpIHtcbiAgICB2YXIgc3BlY2lhbCA9IC9bLVtcXF17fSgpKis/LlxcXFxeJHwsI1xcc10vZztcbiAgICBSZWdFeHAuZXNjYXBlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2Uoc3BlY2lhbCwgXCJcXFxcJCZcIik7XG4gICAgfTtcbn1cblxuIiwiXG52YXIgQXJyYXkgPSByZXF1aXJlKFwiLi9zaGltLWFycmF5XCIpO1xudmFyIE9iamVjdCA9IHJlcXVpcmUoXCIuL3NoaW0tb2JqZWN0XCIpO1xudmFyIEZ1bmN0aW9uID0gcmVxdWlyZShcIi4vc2hpbS1mdW5jdGlvblwiKTtcbnZhciBSZWdFeHAgPSByZXF1aXJlKFwiLi9zaGltLXJlZ2V4cFwiKTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZUxvZztcblxuZnVuY3Rpb24gVHJlZUxvZygpIHtcbn1cblxuVHJlZUxvZy5hc2NpaSA9IHtcbiAgICBpbnRlcnNlY3Rpb246IFwiK1wiLFxuICAgIHRocm91Z2g6IFwiLVwiLFxuICAgIGJyYW5jaFVwOiBcIitcIixcbiAgICBicmFuY2hEb3duOiBcIitcIixcbiAgICBmcm9tQmVsb3c6IFwiLlwiLFxuICAgIGZyb21BYm92ZTogXCInXCIsXG4gICAgZnJvbUJvdGg6IFwiK1wiLFxuICAgIHN0cmFmZTogXCJ8XCJcbn07XG5cblRyZWVMb2cudW5pY29kZVJvdW5kID0ge1xuICAgIGludGVyc2VjdGlvbjogXCJcXHUyNTRiXCIsXG4gICAgdGhyb3VnaDogXCJcXHUyNTAxXCIsXG4gICAgYnJhbmNoVXA6IFwiXFx1MjUzYlwiLFxuICAgIGJyYW5jaERvd246IFwiXFx1MjUzM1wiLFxuICAgIGZyb21CZWxvdzogXCJcXHUyNTZkXCIsIC8vIHJvdW5kIGNvcm5lclxuICAgIGZyb21BYm92ZTogXCJcXHUyNTcwXCIsIC8vIHJvdW5kIGNvcm5lclxuICAgIGZyb21Cb3RoOiBcIlxcdTI1MjNcIixcbiAgICBzdHJhZmU6IFwiXFx1MjUwM1wiXG59O1xuXG5UcmVlTG9nLnVuaWNvZGVTaGFycCA9IHtcbiAgICBpbnRlcnNlY3Rpb246IFwiXFx1MjU0YlwiLFxuICAgIHRocm91Z2g6IFwiXFx1MjUwMVwiLFxuICAgIGJyYW5jaFVwOiBcIlxcdTI1M2JcIixcbiAgICBicmFuY2hEb3duOiBcIlxcdTI1MzNcIixcbiAgICBmcm9tQmVsb3c6IFwiXFx1MjUwZlwiLCAvLyBzaGFycCBjb3JuZXJcbiAgICBmcm9tQWJvdmU6IFwiXFx1MjUxN1wiLCAvLyBzaGFycCBjb3JuZXJcbiAgICBmcm9tQm90aDogXCJcXHUyNTIzXCIsXG4gICAgc3RyYWZlOiBcIlxcdTI1MDNcIlxufTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwYXRjaGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRpc3BhdGNoZXI6IGRpc3BhdGNoZXIsXG5cbiAgcm91dGVzOiByb3V0ZXNcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9wYWdlcy9hcHAnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vcGFnZXMvaG9tZSc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vcGFnZXMvbm90LWZvdW5kJztcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuLi9wYWdlcy90YXNrcyc7XG5cbi8vIERlcGVuZGVuY2llc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcblxubGV0IFJvdXRlICA9IFJvdXRlci5Sb3V0ZTtcbmxldCBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xubGV0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcblxudmFyIHJvdXRlcyA9IChcbiAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbiAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e0hvbWV9IC8+XG4gICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICA8Um91dGUgcGF0aD1cInRhc2tzXCIgaGFuZGxlcj17VGFza1BhZ2V9IC8+XG4gIDwvUm91dGU+XG4pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBTZXQgZnJvbSAnY29sbGVjdGlvbnMvc2V0JztcblxudmFyIFRhc2tzID0gbmV3IFNldChbXSk7XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBUZXh0RmllbGQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICByZWFkOiB0cnVlLFxuICAgICAgdmFsdWU6ICcnXG4gICAgfTtcbiAgfVxuXG4gIG9uQ2xpY2soKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHJlYWQ6IGZhbHNlIH0pO1xuICB9XG5cbiAgb25LZXlVcChldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYWQ6IHRydWUgfSk7XG4gICAgfVxuICB9XG5cbiAgb25JbnB1dENoYW5nZShldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgdmFyIGlucHV0ID0gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZS5iaW5kKHRoaXMpfSBvbktleVVwPXt0aGlzLm9uS2V5VXAuYmluZCh0aGlzKX0vPjtcbiAgICB2YXIgc3BhbiA9IDxzcGFuPnt2YWx1ZX08L3NwYW4+O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7dGhpcy5zdGF0ZS5yZWFkID8gKHZhbHVlLmxlbmd0aCA/ICBzcGFuIDogJ05vIHZhbHVlJykgOiAnJ31cbiAgICAgICAgeyF0aGlzLnN0YXRlLnJlYWQgJiYgaW5wdXR9XG4gICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcyl9PiBFZGl0PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRGaWVsZDtcblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvcGVuOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGNsaWNrIGV2ZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VcbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uQ2xpY2soc291cmNlLCBldmVudCkge1xuICAgIC8vIEFsd2F5cyBjbG9zZSBuYXYgZHJhd2VyIGlmIG1haW4gd2FzIGNsaWNrZWRcbiAgICBpZiAoc291cmNlID09PSAnbWFpbicpXG4gICAgICB0aGlzLnNldFN0YXRlKHsgb3BlbjogZmFsc2UgfSk7XG4gICAgLy8gT3RoZXJ3aXNlIHRvZ2dsZSBvcGVuXG4gICAgZWxzZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG9wZW46ICF0aGlzLnN0YXRlLm9wZW4gfSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgbGV0IG9wZW4gPSB7IG9wZW46IHRoaXMuc3RhdGUub3BlbiB9O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cInNpdGUgdWktYmx1ZVwiPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXCJoYW1idXJnZXIgbWVudVwiLCBvcGVuKX1cbiAgICAgICAgICAgICAgaHJlZj1cIiNcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzLCAnaWNvbicpfT5cbiAgICAgICAgICAgICAgPGk+PC9pPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvZ29cIj5SZWFjdDpMaWZlPC9kaXY+XG4gICAgICAgIDwvaGVhZGVyPlxuICAgICAgICA8bmF2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnc2l0ZSB1aS1ibHVlJywgb3Blbil9IG9uQ2xpY2s9e3RoaXMub25DbGljay5iaW5kKHRoaXMsICduYXYnKX0+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiPiBMaW5rIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9uYXY+XG4gICAgICAgIDxtYWluIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhvcGVuKX0gb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcywgJ21haW4nKX0+XG4gICAgICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgICAgICA8Um91dGVIYW5kbGVyLz5cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICcuLi9maWVsZHMvdGV4dC1maWVsZCc7XG5cbmNsYXNzIEhvbWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFJlYWN0IEZvcm0gPC9oMj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiBpZD1cImFwcFwiPlxuICAgICAgICAgICAgPFRleHRGaWVsZC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgSG9tZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgTm90Rm91bmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPiBXaGF0IFlvdSBUYWxraW5nIEFib3V0LCBXaWxsaXM/PC9oMT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IE5vdEZvdW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRhc2tMaXN0IGZyb20gJy4vdGFzay1saXN0JztcbmltcG9ydCBUYXNrcyBmcm9tICcuLi8uLi9kYXRhL3Rhc2tzJztcblxuY2xhc3MgVGFza1BhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBUYXNrczogVGFza3NcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2VcIj5cbiAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFRhc2tzIDwvaDI+XG4gICAgICAgIDxUYXNrTGlzdCB0YXNrcz17dGhpcy5zdGF0ZS5UYXNrcy50b0FycmF5KCl9Lz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgVGFza0xpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKC4uLnByb3BzKSB7XG4gICAgc3VwZXIoLi4ucHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0YXNrczogdGhpcy5wcm9wcy50YXNrcyB8fCBbXVxuICAgIH07XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bD5cbiAgICAgICAge3RoaXMuc3RhdGUudGFza3MubWFwKHRhc2sgPT4gPGxpPiB7dGFzay50aXRsZX0gPC9saT4pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tMaXN0O1xuIl19
