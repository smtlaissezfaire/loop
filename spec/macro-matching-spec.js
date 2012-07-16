var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");
var macroCompiler = require(__dirname + "/../lib/loop/macro-compiler");

var parseCode = function(code) {
  return loop.parse(code)[0];
};

vows.describe("macro matching").addBatch({
  'it should match a symbol to the same symbol': function() {
    var macro = parseCode('foo');
    var code = parseCode('foo');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  "it should match any two basic types (that aren't lists')": function() {
    var macro = parseCode('foo');
    var code = parseCode('1');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match two symbols that are different': function() {
    var macro = parseCode('foo');
    var code = parseCode('bar');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  "it should match if one tree is a list, but the other isn't": function() {
    var macro = parseCode('foo');
    var code = parseCode('(foo)');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match a list to a list with the same contents': function() {
    var macro = parseCode('(foo bar baz)');
    var code = parseCode('(foo bar baz)');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should not match a list with different numbers of arguments': function() {
    var macro = parseCode('(foo bar baz)');
    var code = parseCode('(foo bar)');

    assert.equal(false, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match a list with different contents': function() {
    var macro = parseCode('(foo bar baz)');
    var code = parseCode('(foo bar quxx)');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match ... to two arguments': function() {
    var macro = parseCode("(foo ...)");
    var code = parseCode("(foo bar)");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match ... to one argument': function() {
    var macro = parseCode("(foo ...)");
    var code = parseCode("(foo)");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match ... in between arguments': function() {
    var macro = parseCode("(foo ... bar)");
    var code = parseCode("(foo bar)");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match ... in between arguments if the right number of arguments are present': function() {
    var macro = parseCode("(foo ... bar baz)");
    var code = parseCode("(bar baz)");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should not match ... in between arguments if the wrong number of arguments are present': function() {
    var macro = parseCode("(foo ... bar baz)");
    var code = parseCode("(baz)");

    assert.equal(false, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should recur into subelements for trees of trees': function() {
    var macro = parseCode("((foo) (bar))");
    var code = parseCode("((foo) (bar))");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should recur into subelements for trees of trees, ignorning symbols': function() {
    var macro = parseCode("((foo) (bar))");
    var code = parseCode("((foo) (bar))");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should recur into subelements for trees of trees, ignorning symbols, but still looking at length': function() {
    var macro = parseCode("((foo) (bar))");
    var code = parseCode("((foo) (bar quxx))");

    assert.equal(false, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match a symbol name to a list': function() {
    var macro = parseCode("foo");
    var code = parseCode("(one two three)");

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  }
}).export(module);