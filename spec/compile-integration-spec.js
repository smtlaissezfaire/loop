var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("integration spec").addBatch({
  'it should be able to compile a function call': function() {
    var inStream = "((lambda () (+ x x)))";
    var expectedOut = "(function(){x+x})()";

    assert.equal(loop.compile(inStream), expectedOut);
  }
}).export(module);