var _ = require('underscore');

var extensions = {};

extensions.inGroupsOf = function(collection, perGroup, iterator) {
  var collector = [];

  _.each(collection, function(el, index) {
    collector.push(el);

    if ((index + 1) % perGroup === 0) {
      iterator(collector);
      collector = [];
    }
  });
};

if (Object.create) {
  extensions.create = Object.create;
} else {
  extensions.create = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}

extensions.inherit = function(proto) {
  var newObj = _.create(proto);
  newObj.protoParent = proto;
  return newObj;
};

_.mixin(extensions);

module.exports = _;