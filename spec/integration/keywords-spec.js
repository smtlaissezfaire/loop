var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

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
    // this is raising, for some reason:
    // assert.deepEqual(loop.toUglifyTree([evaled]), uglifyTree);
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
    // this is raising, for some reason:
    // assert.deepEqual(loop.toUglifyTree([evaled]), uglifyTree);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  }
}).export(module);
