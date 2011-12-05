var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

vows.describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree (numbers)").addBatch({
  'it should eval unary operators properly': function() {
    var evaled = {
      type: 'funcall',
      function: { type: 'id', contents: '+' },
      arguments: {
        type: 'list',
        contents: [
          { type: 'number', contents: 1 },
          { type: 'number', contents: 2 }
        ]
      }
    };

    var uglifyTree = ["toplevel",[["stat",["binary","+",["num",1],["num",2]]]]];

    var out = loop.toUglifyTree([evaled]);
    // this is raising, for some reason:
    // assert.deepEqual(loop.toUglifyTree([evaled]), uglifyTree);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  }
}).export(module);
