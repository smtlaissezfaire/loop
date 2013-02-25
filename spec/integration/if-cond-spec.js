var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

vows.describe("if + cond").addBatch({
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
  },

  'it should not insert semicolons into an if': function() {
    var defaultOptions = {
      indent_start : 0,
      indent_level : 2,
      quote_keys   : false,
      space_colon  : true,
      beautify     : true,
      ascii_only   : false,
      inline_script: false
    };

    var code = "";
    code += "(function (str options)";
    code += "  (if (=== (typeof options) 'undefined')";
    code += "    (= options {})))";

    var expected = "";
    expected += "(function(str, options) {\n";
    expected += "  if (typeof options === \"undefined\") {\n";
    expected += "    options = {};\n";
    expected += "  }\n";
    expected += "});";

    assert.equal(loop.compile(code, defaultOptions),
                 expected);
  }
}).export(module);