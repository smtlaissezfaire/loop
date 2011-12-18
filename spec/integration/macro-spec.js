var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

vows.describe("integration specs (macros)").addBatch({
  'it should be able to use a simple macro': function() {
    var code = "";
    code += "(define-macro";
    code += "  (swap-foo a b)";
    code += "  (foo b a))";
    code += "\n";
    code += "(swap-foo one two)";
    assert.equal(loop.compile(code), "foo(two,one)");
  },

  'it should be able to define and use let': function() {
    var code = "";
    code += "(define-macro";
    code += "  (my-let ((var val) ...)";
    code += "    body ...)";
    code += "  ((lambda (var ...)";
    code += "    body ...) val ...))";

    code += "(my-let ((x 10)";
    code += "      (y 20))";
    code += "  (console.log (+ x y)))";

    assert.equal(loop.compile(code), "(function(x,y){console.log(x+y)})(10,20)");
  },
}).export(module);