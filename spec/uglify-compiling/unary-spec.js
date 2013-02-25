var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

var UNARY_OPERATORS = [
  "typeof",
  "void",
  "delete",
  "--",
  "++",
  "!",
  "~",
];

vows.describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree (unary operators)").addBatch({
  'it should eval unary operators properly': function() {
    _.each(UNARY_OPERATORS, function(operator) {
      var evaled = {
        type: 'funcall',
        function: { type: 'id', contents: operator },
        arguments: {
          type: 'list',
          contents: [
            { type: 'id', contents: 'foo' }
          ]
        }
      };

      var uglifyTree = ["toplevel",[["stat",["unary-prefix", operator, ["name","foo"]]]]];

      var out = loop.toUglifyTree([evaled]);
      assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
    });
  }
}).export(module);
