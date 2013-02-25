var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

var let_star = function() {
  var code = "";
  code += "(define-macro";
  code += "  (let ((var value) ...)";
  code += "    body ...)";
  code += "  ((function (var ...) body ...) value ...))";
  code += "";
  code += "(define-macro";
  code += "  (let* () body ...)";
  code += "  (let () body ...)";
  code += "";
  code += "  (let* ((i1 v1)";
  code += "         (i2 v2) ...)";
  code += "    body ...)";
  code += "  (let ((i1 v1))";
  code += "    (let* ((i2 v2) ...)";
  code += "      body ...)))";
  code += "";
  return code;
};

describe("integration specs (macros)", function() {
  it('should be able to use a simple macro', function() {
    var code = "";
    code += "(define-macro";
    code += "  (swap-foo a b)";
    code += "  (foo b a))";
    code += "\n";
    code += "(swap-foo one two)";
    assert.equal(loop.compile(code), "foo(two,one)");
  });

  it('should be able to define and use let', function() {
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
  });

  it('should be able to define and use let with no values', function() {
    var code = "";
    code += "(define-macro\n";
    code += "  (my-let ((var val) ...)\n";
    code += "    body ...)\n";
    code += "  ((lambda (var ...)\n";
    code += "    body ...) val ...))\n";
    code += "\n";
    code += "(my-let ()\n";
    code += "  (console.log (+ x y)))\n";

    assert.equal(loop.compile(code), "(function(){console.log(x+y)})()");
  });

  it('should be able to define and use an unless macro', function() {
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
  });

  it('should be able to use unless with ! and a var', function() {
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
  });

  it('should transform non top level macros', function() {
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
  });

  it('should be able to use two different macros', function() {
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
  });

  it('should consider ... like a * in a regex', function() {
    var code = '';
    code += '(define-macro ';
    code += '  (log arg1 arg2 arg3 ...)';
    code += '  (console.log arg1 arg2 arg3 ...))';
    code += '';
    code += '(log 1 2)';
    code += '(log 1 2 3)';
    code += '(log 1 2 3 4)';
    code += '(log 1 2 3 4 5)';

    var expected = '';
    expected += 'console.log(1,2);';
    expected += 'console.log(1,2,3);';
    expected += 'console.log(1,2,3,4);';
    expected += 'console.log(1,2,3,4,5)';

    assert.equal(loop.compile(code), expected);
  });

  it('should allow the gap in ... to come in the middle of a list', function() {
    var code = '';
    code += '(define-macro ';
    code += '  (log arg1 arg2 ... arg3)';
    code += '  (console.log arg1 arg2 ... arg3))';
    code += '';
    code += '(log 1 2)';
    code += '(log 1 2 3)';
    code += '(log 1 2 3 4)';
    code += '(log 1 2 3 4 5)';

    var expected = '';
    expected += 'console.log(1,2);';
    expected += 'console.log(1,2,3);';
    expected += 'console.log(1,2,3,4);';
    expected += 'console.log(1,2,3,4,5)';
  });

  it('should not try to transform a macro pattern which does not match', function() {
    var code = '';
    code += '(define-macro ';
    code += '  (log arg1 arg2 arg3 ...)';
    code += '  (console.log arg1 arg2 arg3 ...))';
    code += '';
    code += '(log 1)';

    var expected = '';
    expected += 'log(1)';

    assert.equal(loop.compile(code), expected);
  });

  it('should be able to use multiple patterns in a macro', function() {
    var code = "";
    code += '(define-macro';
    code += '  (log arg1 arg2 ...)';
    code += '  (console.log arg1 arg2 ...)';
    code += "\n";
    code += '  (log)';
    code += '  (console.log ""))';
    code += "\n";
    code += '(log)';
    code += '(log "foo")';

    var expected = "";
    expected += 'console.log("");';
    expected += 'console.log("foo")';
    assert.equal(loop.compile(code), expected);
  });

  it('should ignore macro patterns if the code is not called', function() {
    var code = "";
    code += '(define-macro';
    code += '  (log arg1 arg2 ...)';
    code += '  (console.log arg1 arg2 ...))';
    code += "\n";
    code += '(console.log "foo")';

    var expected = "";
    expected += 'console.log("foo")';

    assert.equal(loop.compile(code), expected);
  });

  it('should be able to use multiple patterns in a macro and extract out those patterns', function() {
    var code = "";
    code += '(define-macro';
    code += '  (log)';
    code += '  (console.log "")';
    code += "\n";
    code += '  (log arg1 arg2 ...)';
    code += '  (console.log arg1 arg2 ...))';

    var expected = "";

    assert.equal(loop.compile(code), expected);
  });

  it('should not match a macro pattern if the macro has no ellipses and the pattern is not the same length', function() {
    var code = "";
    code += '(define-macro';
    code += '  (log a b c)';
    code += '  (console.log a b c))';
    code += '';
    code += '(log)';
    code += '(log 1)';
    code += '(log 1 2)';
    code += '(log 1 2 3)';
    code += '(log 1 2 3 4)';

    var expected = "";
    expected += "log();";
    expected += "log(1);";
    expected += "log(1,2);";
    expected += "console.log(1,2,3);";
    expected += "log(1,2,3,4)";

    assert.equal(loop.compile(code), expected);
  });

  it('should be able to use multiple patterns in a macro if the patterns are switched', function() {
    var code = "";
    code += '(define-macro';
    code += '  (log)';
    code += '  (console.log "")';
    code += "\n";
    code += '  (log arg1 arg2 ...)';
    code += '  (console.log arg1 arg2 ...))';
    code += "\n";
    code += '(log)';
    code += '(log "foo")';

    var expected = "";
    expected += 'console.log("");';
    expected += 'console.log("foo")';
    assert.equal(loop.compile(code), expected);
  });

  it('should allow one macro to reference another', function() {
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
  });

  it('should pick the correct macro based on arguments', function() {
    var macroDefinitions = '';
    var code;

    macroDefinitions += '(define-macro';
    macroDefinitions += '  (arg-macro)';
    macroDefinitions += '  (console.log "zero-args")';
    macroDefinitions += '  ';
    macroDefinitions += '  (arg-macro x)';
    macroDefinitions += '  (console.log "one-arg")';
    macroDefinitions += '  ';
    macroDefinitions += '  (arg-macro x y ...)';
    macroDefinitions += '  (console.log "multi-args"))';

    code = macroDefinitions;
    code += '(arg-macro)';
    assert.equal(loop.compile(code), 'console.log("zero-args")');

    code = macroDefinitions;
    code += '(arg-macro 1)';
    assert.equal(loop.compile(code), 'console.log("one-arg")');

    code = macroDefinitions;
    code += '(arg-macro 1 2)';
    assert.equal(loop.compile(code), 'console.log("multi-args")');

    code = macroDefinitions;
    code += '(arg-macro 1 2 3)';
    assert.equal(loop.compile(code), 'console.log("multi-args")');

    //////////////////

    macroDefinitions = '';
    macroDefinitions += '(define-macro';
    macroDefinitions += '  (arg-macro ())';
    macroDefinitions += '  (console.log "zero-args")';
    macroDefinitions += '  ';
    macroDefinitions += '  (arg-macro (x))';
    macroDefinitions += '  (console.log "one-arg")';
    macroDefinitions += '  ';
    macroDefinitions += '  (arg-macro (x y ...))';
    macroDefinitions += '  (console.log "multi-args"))';

    code = macroDefinitions;
    code += '(arg-macro ())';
    assert.equal(loop.compile(code), 'console.log("zero-args")');

    code = macroDefinitions;
    code += '(arg-macro (1))';
    assert.equal(loop.compile(code), 'console.log("one-arg")');

    code = macroDefinitions;
    code += '(arg-macro (1 2))';
    assert.equal(loop.compile(code), 'console.log("multi-args")');

    code = macroDefinitions;
    code += '(arg-macro (1 2 3))';
    assert.equal(loop.compile(code), 'console.log("multi-args")');

    //////////////////

    macroDefinitions = '';
    macroDefinitions += '(define-macro';
    macroDefinitions += '  (arg-macro ())';
    macroDefinitions += '  (console.log "zero-args")';
    macroDefinitions += '  ';
    macroDefinitions += '  (arg-macro (x y ...))';
    macroDefinitions += '  (console.log x y ...))';

    code = macroDefinitions;
    code += '(arg-macro ())';
    assert.equal(loop.compile(code), 'console.log("zero-args")');

    code = macroDefinitions;
    code += '(arg-macro (1))';
    assert.equal(loop.compile(code), 'console.log(1)');

    code = macroDefinitions;
    code += '(arg-macro (1 2))';
    assert.equal(loop.compile(code), 'console.log(1,2)');

    code = macroDefinitions;
    code += '(arg-macro (1 2 3))';
    assert.equal(loop.compile(code), 'console.log(1,2,3)');
  });

  it('should allow recursion in macros', function() {
    var code = '';
    code += '(define-macro';
    code += '  (recursive-foo arg1)';
    code += '  (bar)';
    code += '';
    code += '  (recursive-foo arg1 arg2 ...)';
    code += '  (foo (recursive-foo arg2 ...)))';
    code += '';
    code += '(recursive-foo 1 2 3)';
    var expected = 'foo(foo(bar()))';

    assert.equal(loop.compile(code), expected);
  });

  it('should allow an empty argument list to let', function() {
    var code = "";
    code += "(define-macro";
    code += "  (let ((var value) ...)";
    code += "    body ...)";
    code += "  ((function (var ...) body ...) value ...))";

    code += "(let ()";
    code += "  (foo))";

    var expected = "(function(){foo()})()";

    assert.equal(loop.compile(code), expected);
  });

  describe('using let-star', function() {
    it('should return an empty function with 0 arguments', function() {
      var code = "";
      code += let_star();
      code += "(let* ()";
      code += "  (console.log x))";

      var expected = "";
      expected += "(function(){";
      expected += "console.log(x)";
      expected += "})()";

      assert.equal(loop.compile(code), expected);
    });

    it('should use one argument', function() {
      var code = "";
      code += let_star();
      code += "(let* ((x 10))";
      code += "  (console.log x))";

      var expected = "";
      expected += "(function(x){";
      expected +=   "(function(){";
      expected +=     "console.log(x)";
      expected +=   "})()";
      expected += "})(10)";

      assert.equal(loop.compile(code), expected);
    });

    it('should use two arguments', function() {
      var code = "";
      code += let_star();
      code += "(let* ((x 10) (y 20))";
      code += "  (console.log x))";

      var expected = "";
      expected += "(function(x){";
      expected +=   "(function(y){";
      expected +=     "(function(){";
      expected +=       "console.log(x)";
      expected +=     "})()";
      expected +=   "})(20)";
      expected += "})(10)";

      assert.equal(loop.compile(code), expected);
    });
    it('should use three arguments', function() {
      var code = "";
      code += let_star();
      code += "(let* ((x 10) (y 20) (z 30))";
      code += "  (console.log x))";

      var expected = "";
      expected += "(function(x){";
      expected +=   "(function(y){";
      expected +=     "(function(z){";
      expected +=       "(function(){";
      expected +=         "console.log(x)";
      expected +=       "})()";
      expected +=     "})(30)";
      expected +=   "})(20)";
      expected += "})(10)";

      assert.equal(loop.compile(code), expected);
    });
    it('should use one argument but multiple body statements', function() {
      var code = "";
      code += let_star();
      code += "(let* ((x 10))";
      code += "  (console.log x)";
      code += "  (foo bar)";
      code += "  (baz quxx one two three)";
      code += "  (console.log 'foo'))";

      var expected = "";
      expected += "(function(x){";
      expected +=   "(function(){";
      expected +=     "console.log(x);";
      expected +=     "foo(bar);";
      expected +=     "baz(quxx,one,two,three);";
      expected +=     "console.log(\"foo\")";
      expected +=   "})()";
      expected += "})(10)";

      assert.equal(loop.compile(code), expected);
    });
  });

  describe('quote', function() {
    it('should be able to quote', function() {
      var code = "(quote Foo)";
      var expected = "\"Foo\"";
      assert.equal(loop.compile(code), expected);
    });

    it('should be able to quote inside a define-macro', function() {
      var code = '';
      code += '(define-macro';
      code += '  (my-quote some-var)';
      code += '  (quote some-var))';
      code += '(my-quote Foo)';

      var expected = '"Foo"';

      assert.equal(loop.compile(code), expected);
    });
  });

  it('should allow substitution in the body of the macro more than once', function() {
    var code = '';
    code += '(define-macro ';
    code += '  (my-square num)';
    code += '  (mult num num))';
    code += '(my-square 2)';

    var expected = "mult(2,2)";
    assert.equal(loop.compile(code), expected);
  });

  it('should allow multiple substiution on multiple levels', function() {
    var code = '';
    code += '(define-macro ';
    code += '  (foo num)';
    code += '  (mult num (mult num 1)))';
    code += '(foo 2)';

    var expected = "mult(2,mult(2,1))";
    assert.equal(loop.compile(code), expected);
  });
});