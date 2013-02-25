var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

var BINARY_OPERATORS = [
  "||",
  "&&",
  "|",
  "^",
  "&",
  "==",
  "===",
  "!=",
  "!==",
  "<",
  ">",
  "<=",
  ">=",
  "in",
  "instanceof",
  ">>",
  "<<",
  ">>>",
  "+",
  "-",
  "*",
  "/",
  "%"
];

describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree (binary operators)", function() {
  it('should eval binary operators properly', function() {
    _.each(BINARY_OPERATORS, function(operator) {
      var evaled = {
        type: 'funcall',
        function: { type: 'id', contents: operator },
        arguments: {
          type: 'list',
          contents: [
            { type: 'id', contents: 'foo' },
            { type: 'id', contents: 'bar' }
          ]
        }
      };

      var uglifyTree = ["toplevel",[["stat",["binary", operator, ["name","foo"], ["name","bar"]]]]];

      var out = loop.toUglifyTree([evaled]);
      assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
    });
  });
});
