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

  'it should be able to compile a function with function': function() {
    var inStream = "((function () (+ x x)))";
    var expectedOut = "(function(){x+x})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support strings': function() {
    var inStream = '((vows.describe "integration spec").addBatch)';
    var expectedOut = 'vows.describe("integration spec").addBatch()';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support single quoted strings': function() {
    var inStream = "((vows.describe 'integration spec').addBatch)";
    var expectedOut = "vows.describe(\"integration spec\").addBatch()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support unary operators': function() {
    var inStream = '(console.log (typeof foo))';
    var expectedOut = 'console.log(typeof foo)';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should handle booleans, null, undefined': function() {
    var inStream = '(console.log false)';
    var expectedOut = 'console.log(false)';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to return a value from a function': function() {
    var inStream = '((function() (return "foo")))';
    var expectedOut = '(function(){return"foo"})()';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should support the debugger keyword': function() {
    assert.equal(loop.compile('(debugger)'), 'debugger');
  },

  'it should support the var keyword': function() {
    assert.equal(loop.compile('(var (foo bar))'), 'var foo=bar');
  },

  'it should be able to use numbers': function() {
    assert.equal(loop.compile('(console.log (+ 1 1))'), 'console.log(1+1)');
    assert.equal(loop.compile('(console.log (+ 3.1415926 1))'), 'console.log(3.1415926+1)');
  },

  'it should allow an expanded let statement': function() {
    var code = "";
    code += "((lambda (x y)";
    code += "   (console.log (+ x y))) 10 20)";

    assert.equal(loop.compile(code), '(function(x,y){console.log(x+y)})(10,20)');
  },

  'it should be able to handle an if statement': function() {
    var code = "(if x (y))";
    assert.equal(loop.compile(code), 'if(x){y()}');
  },

  'it should be able to handle an if statement with no block conditions': function() {
    var code = "(if x)";

    assert.equal(loop.compile(code), 'if(x){}');
  },

  'it should be able to handle an if statement with multiple block conditions': function() {
    var code = "(if x (y) (+ 10 20))";

    assert.equal(loop.compile(code), 'if(x){y();10+20}');
  },

  'it should allow non list types in the conditions': function() {
    var code = "(if true (y))";

    assert.equal(loop.compile(code), 'if(true){y()}');
  },

  'it should allow a ! in the conditions': function() {
    var code = "(if (! foo) (y))";

    assert.equal(loop.compile(code), 'if(!foo){y()}');
  },

  'it should allow === as a comparison operator': function() {
    var code = "(if (=== x 10) (console.log \"foo\"))";
    assert.equal(loop.compile(code), 'if(x===10){console.log("foo")}');
  }
}).export(module);