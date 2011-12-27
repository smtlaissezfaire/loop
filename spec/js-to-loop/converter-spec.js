
var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

var fs = require('fs');

vows.describe("js to loop converter integration spec").addBatch({
  'it should be able to reverse compile a simple var expression': function() {
    var source = "var x = 10;";
    var expected = "(var (x 10))";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to reverse compile a simple var expression (with different vars)': function() {
    var source = "var y = 20;";
    var expected = "(var (y 20))";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to convert x=10': function() {
    var source = "x=20;";
    var expected = "(= x 20)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to access a property': function() {
    var source = "foo.bar";
    var expected = "foo.bar";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to set a property': function() {
    var source = "foo.bar = 10";
    var expected = "(= foo.bar 10)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to convert a function call': function() {
    var source = "foo(x, y);";
    var expected = "(foo x y)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to convert a defined function with an anonymous fun': function() {
    var source = "x = function(x, y) { return x + y };";
    var expected = "(= x (lambda (x y) (return (+ x y))))";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to compare with ===': function() {
    var source = "x === y";
    var expected = "(=== x y)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to use typeof': function() {
    var source = "typeof x";
    var expected = "(typeof x)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to handle an if statement': function() {
    var source = "if (x) { foo }";
    var expected = "(if x foo)";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should have support for strings': function() {
    var source = "x = 'foo'";
    var expected = "(= x \"foo\")";
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to support double quoted strings with single quote escaping': function() {
    var source = 'x = "foo\'bar"';
    var expected = '(= x "foo\'bar")';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should support an empty object literal in assignment': function() {
    var source = "x = {};";
    var expected = '(= x {})';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should support an object literal with values': function() {
    var source = "x = { a: 1, b: 2 };";
    var expected = '(= x ({} a 1 b 2))';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should properly handle a var with a dot expression': function() {
    var source = 'var jsp = require("uglify-js").parser;';
    var expected = '(var (jsp (require "uglify-js").parser))';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should properly handle switch / case / default / break statements': function() {
    var source = "";
    source += "switch(foo) {";
    source += "  case 'bar':";
    source += "    console.log('bar');";
    source += "    break;";
    source += "  default:";
    source += "    console.log('default');";
    source += "}";

    var expected = "";
    expected += '(switch foo ';

    expected += '(case "bar" ';
    expected += '(console.log "bar") ';
    expected += '(break))';

    expected += ' ';
    expected += '(default ';
    expected += '(console.log "default")))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to process a throw': function() {
    var source = 'throw "foo";';
    var expected = '(throw "foo")';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to handle the new keyword': function() {
    var source = 'new FooBar;';
    var expected = '(new FooBar)';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to handle the new keyword with args': function() {
    var source = 'new FooBar(1, 2, 3);';
    var expected = '(new FooBar 1 2 3)';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should be able to handle literal arrays': function() {
    var source = 'x = [1, 2, 3]';
    var expected = '(= x ([] 1 2 3))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should use the literal [] for creating an empty array': function() {
    var source = 'x = []';
    var expected = '(= x [])';

    assert.equal(loop.reverseCompile(source), expected);
  }

  // 'it should be able to convert the compiler file from js to loop': function() {
  //   var source = fs.readFileSync('./spec/js-to-loop/fixtures/compiler.js').toString();
  //   var expected = fs.readFileSync('./spec/js-to-loop/fixtures/compiler.loop').toString();
  //
  //   assert.equal(loop.reverseCompile(source), expected);
  // }
}).export(module);
