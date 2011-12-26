
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
  }

  // 'it should be able to convert the compiler file from js to loop': function() {
  //   var source = fs.readFileSync('./spec/js-to-loop/fixtures/compiler.js').toString();
  //   var expected = fs.readFileSync('./spec/js-to-loop/fixtures/compiler.loop').toString();
  //
  //   assert.equal(loop.reverseCompile(source), expected);
  // }
}).export(module);
