var exports = {};

exports.car = function(array) {
  return array[0];
};

exports.cdr = function(array) {
  if (array.length === 0) {
    throw new Error("can't take the cdr of an empty array");
  }

  return array.slice(1);
};

// TOOD: improve this?
exports.deepCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

module.exports = exports;
