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

  'it should be able to define and use an unless macro': function() {
    var code = "";
    code += "(define-macro";
    code += "  (unless condition";
    code += "    statements ...)";
    code += "  (if (! condition)";
    code += "    statements ...))";
    code += "";
    code += "(unless (=== x 10)";
    code += "  (bar)";
    code += "  (baz))";

    // TODO: should probably convert this into x !== 10
    var expectedCode = "if(!(x===10)){bar();baz()}";

    assert.equal(loop.compile(code), expectedCode);
  },

  'it should be able to use unless with ! and a var': function() {
    var code = "";
    code += "(define-macro";
    code += "  (unless condition";
    code += "    statements ...)";
    code += "  (if (! condition)";
    code += "    statements ...))";
    code += "";
    code += "(var (x 20))";
    code += "";
    code += "(unless (=== x 10)";
    code += "  (console.log x))";

    assert.equal(loop.compile(code), 'var x=20;if(!(x===10)){console.log(x)}');
  },

  'it should transform non top level macros': function() {
    var code = "";
    code += "(define-macro";
    code += "  (my-let ((var val) ...)";
    code += "    body ...)";
    code += "  ((lambda (var ...)";
    code += "    body ...) val ...))";

    code += "(my-let ((x 10))";
    code += "  (my-let ((y 20))";
    code += "    (+ x y)))";

    assert.equal(loop.compile(code), "(function(x){(function(y){x+y})(20)})(10)");
  },

  'it should be able to use two different macros': function() {
    var code = "";
    code += "(define-macro";
    code += "  (let ((var value) ...)";
    code += "    body ...)";
    code += "  ((function (var ...) body ...) value))";

    code += "(define-macro";
    code += "  (log x)";
    code += "  (console.log x))";

    code += "(let ((x 10))";
    code += "  (log x))";

    var expected = "";
    expected += "(function(x){";
    expected += "console.log(x)";
    expected += "})(10)";

    assert.equal(loop.compile(code), expected);
  },
  //
  // 'it should be able to use multiple patterns in a macro': function() {
  //   var code = "";
  //   code += '(define-macro';
  //   code += '  (log arg1 arg2 ...)';
  //   code += '  (console.log arg1 arg2 ...)';
  //   code += '  (log)';
  //   code += '  (console.log ""))';
  //   code += '\n';
  //   code += '(log)';
  //   code += '(log "foo")';
  //
  //   var expected = "";
  //   expected += 'console.log("");';
  //   expected += 'console.log("foo")';
  //   assert.equal(loop.compile(code), expected);
  // },
  //
  // 'it should be able to use multiple patterns in a macro if the patterns are switched': function() {
  //   var code = "";
  //   code += '(define-macro';
  //   code += '  (log arg1 arg2 ...)';
  //   code += '  (console.log arg1 arg2 ...)';
  //   code += '  (log)';
  //   code += '  (console.log ""))';
  //   code += '(log)';
  //   code += '(log "foo")';
  //
  //   var expected = "";
  //   expected += 'console.log("");';
  //   expected += 'console.log("foo")';
  //   assert.equal(loop.compile(code), expected);
  // },

  'it should allow one macro to reference another': function() {
    var code = "";
    code += "(define-macro";
    code += "  (plus a b)";
    code += "  (+ a b))";
    code += "  ";
    code += "(define-macro";
    code += "  (log-plus a b)";
    code += "  (console.log (plus a b)))";
    code += "  ";
    code += "(log-plus 10 20)";

    var expected = "";
    expected += "console.log(10+20)";

    assert.equal(loop.compile(code), expected);
  },

  // 'it should allow macros to be recursive': function() {}

  // 'it should be able to use let* (which builds off let and has multiple patterns)': function() {
  //   var code = "";
  //   code += "(define-macro";
  //   code += "  (let ((var value) ...)";
  //   code += "    body ...)";
  //   code += "  ((function (var ...) body ...) value))";
  //   code += "";
  //   code += "(define-macro";
  //   code += "  (let* () body ...)";
  //   code += "  (let () body ...)";
  //   code += "";
  //   code += "  (let* ((i1 v1)";
  //   code += "         (i2 v2) ...)";
  //   code += "    body ...)";
  //   code += "  (let ((i1 v1))";
  //   code += "    (let* ((i2 v2) ...)";
  //   code += "      body ...)))";
  //   code += "";
  //   code += "(let* ((a 10)";
  //   code += "       (b 20)";
  //   code += "       (x (+ a b)))";
  //   code += "  (console.log x))";
  //
  //   var expected = "";
  //   expected = "(function(a) {";
  //   expected = "  (function(b) {";
  //   expected = "    (function(x) {";
  //   expected = "      console.log(x);";
  //   expected = "    })(a + b);";
  //   expected = "  })(20);";
  //   expected = "})(10);";
  //
  //   assert.equal(loop.compile(code), expected);
  // }
}).export(module);