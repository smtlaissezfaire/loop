var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var macroCompiler = require(__dirname + "/../../lib/loop/macro-compiler");

var parseCode = function(code) {
  return loop.parse(code)[0];
};

var multi_arg_let_star = function() {
  var code = "";
  code += "  (let* ((i1 v1)";
  code += "         (i2 v2) ...)";
  code += "    body ...)";
  return code;
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
  'it should match ... in between arguments if the correct right + left number of arguments are present': function() {
    var macro = parseCode("(one two ... three four)");
    var code = parseCode("(one thee four)");

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
  },
  'it should not match a one arg subexpression to an empty macro subexpression without a pattern in it': function() {
    var macro = parseCode('(let* () body)');
    var code = parseCode('(let* (x 10) foo)');

    assert.equal(false, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should not match a one arg subexpression to an empty macro subexpression with a pattern in the outer expression': function() {
    var macro = parseCode('(let* () body ...)');
    var code = parseCode('(let* (x 10) foo bar)');

    assert.equal(false, macroCompiler.macroMatchesTree(macro, code));
  },
  'it should match a let* with a one arg list of args and a body': function() {
    var macro = parseCode(multi_arg_let_star());
    var code = parseCode('(let* ((x1 y1)) (console.log x))');

    assert.equal(true, macroCompiler.macroMatchesTree(macro, code));
  }
}).export(module);