var _ = require('underscore');

var extensions = {};

extensions.inGroupsOf = function(collection, perGroup, iterator) {
  var collector = [];

  var collectionLength = collection.length;

  _.each(collection, function(el, index) {
    collector.push(el);

    if (index === collectionLength - 1 ||
        (index + 1) % perGroup === 0) {
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

extensions.none = function() {
  return !_.all.apply(this, arguments);
};

extensions.eachWithLastBool = function(collection, fn) {
  var lastIndex = collection.length - 1;

  return _.each(collection, function(el, index) {
    return fn.call(_, el, index, lastIndex === index);
  });
};

extensions.fromUpto = function(start, end, fn) {
  var i;

  for (i = start; i <= end; i++) {
    fn(i);
  }
};

_.mixin(extensions);

module.exports = _;