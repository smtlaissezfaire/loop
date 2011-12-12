var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var _ = require('underscore');

vows.describe("function calling").addBatch({
  'it should pass arguments to an inline function': function() {
    var str = "((lambda (x y) (+ x y)) 10 20)";
    assert.equal(loop.compile(str), "(function(x,y){x+y})(10,20)");
  }
}).export(module);
