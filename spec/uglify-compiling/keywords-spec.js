var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

var _var = function() {
  var argumentPairs = _.toArray(arguments);

  var contents = _.map(argumentPairs, function(pair) {
    var mappedPairs = _.map(pair, function(id, index) {
      return { type: 'id', contents: id };
    });

    return {
      type: 'funcall',
      function: mappedPairs[0],
      arguments: {
        type: 'list',
        contents: mappedPairs.slice(1)
      }
    };
  });

  return {
    type: 'funcall',
    function: { type: 'id', contents: 'var' },
    arguments: {
      type: 'list',
      contents: contents
    }
  };
};

vows.describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree (keywords)").addBatch({
  'it should eval return properly': function() {
    var evaled = {
      type: 'funcall',
      function: { type: 'id', contents: 'return' },
      arguments: {
        type: 'list',
        contents: [
          { type: 'id', contents: 'foo' }
        ]
      }
    };

    var uglifyTree = ["toplevel",[["stat",["return", ["name", "foo"]]]]];

    var out = loop.toUglifyTree([evaled]);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  },

  'it should return empty if no args passed to return': function() {
    var evaled = {
      type: 'funcall',
      function: { type: 'id', contents: 'return' },
      arguments: {
        type: 'list',
        contents: []
      }
    };

    var uglifyTree = ["toplevel",[["stat",["return", null]]]];

    var out = loop.toUglifyTree([evaled]);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  },

  'it should support var with 1 arg': function() {
    var evaled = _var(['foo']);

    var uglifyTree = ["toplevel",[["var",[["foo"]]]]];

    var out = loop.toUglifyTree([evaled]);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  },

  'it should support var with 2 args': function() {
    var evaled = _var(['foo', 'bar']);

    var uglifyTree = ["toplevel",[["var",[["foo",["name","bar"]]]]]];

    var out = loop.toUglifyTree([evaled]);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  },

  'it should support var with 3 args': function() {
    // var foo=bar, baz, quxx = zed;'
    var evaled = _var(['foo', 'bar'], ['baz']);

    var uglifyTree = ["toplevel",[["var",[["foo",["name","bar"]],["baz"]]]]];

    var out = loop.toUglifyTree([evaled]);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  }
}).export(module);
