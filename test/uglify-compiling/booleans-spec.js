var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

var BOOLEANS = [
  "true",
  "false",
  "null",
  "undefined"
];

describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree (unary operators)", function() {
  it('should eval unary operators properly', function() {
    _.each(BOOLEANS, function(boolean) {
      var evaled = {
        type: 'id',
        contents: boolean
      };

      var uglifyTree = ["toplevel",[["stat", ['name', boolean]]]];

      var out = loop.toUglifyTree([evaled]);
      assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
    });
  });
});
