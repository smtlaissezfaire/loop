var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("integration spec").addBatch({
  'it should be able to compile a function call': function() {
    var inStream = "((lambda () (+ x x)))";
    var expectedOut = "(function(){x+x})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support user defined functions': function() {
    var inStream = "";
    inStream += "((lambda ()\n";
    inStream += "  (console.log (+ x x))))";
    var expectedOut = "(function(){console.log(x+x)})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support strings': function() {
    var inStream = '((vows.describe "integration spec").addBatch)';
    var expectedOut = 'vows.describe("integration spec").addBatch()';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support unary operators': function() {
    var inStream = '(console.log (typeof foo))';
    var expectedOut = 'console.log(typeof foo)';

    assert.equal(loop.compile(inStream), expectedOut);
  }
}).export(module);