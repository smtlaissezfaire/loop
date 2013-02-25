var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("reverse compiler - indentation", function() {
  it('should put a multi expression var statement on multiple lines at the same indentation)', function() {
    var source = "var x = 10, y = 20;";
    var expected = '';
    expected += '(var (x 10)\n';
    expected += '     (y 20))';
    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent a lambda assignment', function() {
    var source = '';
    source += 'var x = function() {';
    source += '  x + y;';
    source += '  z + y;';
    source += '};';

    var expected = '';
    expected += '(define x\n';
    expected += '  (lambda ()\n';
    expected += '    (+ x y)\n';
    expected += '    (+ z y)))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should outdent after the lambda is done', function() {
    var source = '';
    source += 'var x = function() {';
    source += '  x + y;';
    source += '  z + y;';
    source += '};';
    source += 'var y = function() {';
    source += '  x + y;';
    source += '  z + y;';
    source += '};';

    var expected = '';
    expected += '(define x\n';
    expected += '  (lambda ()\n';
    expected += '    (+ x y)\n';
    expected += '    (+ z y)))\n';
    expected += '\n';
    expected += '(define y\n';
    expected += '  (lambda ()\n';
    expected += '    (+ x y)\n';
    expected += '    (+ z y)))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent a lambda in an assignment with =', function() {
    var source = '';
    source += 'var x;';
    source += 'x = function() {};';

    var expected = '';
    expected += '(define x)\n';
    expected += '(= x\n';
    expected += '  (lambda ()))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent the second arg of any define if it is a list', function() {
    var source = '';
    source += 'var x = foo();';

    var expected = '';
    expected += '(define x\n';
    expected += '  (foo))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent if statements', function() {
    var source = '';
    source += 'if (x) {';
    source += '  y + z;';
    source += '  a + b;';
    source += '}';

    var expected = '';
    expected += '(if x\n';
    expected += '  (+ y z)\n';
    expected += '  (+ a b))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent var x; properly', function() {
    var source = 'var x; var y;';
    var expected = '';
    expected += '(define x)\n';
    expected += '(define y)';
    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent for', function() {
    var source = '';
    source += 'for (x = 0; x <= 10; x++) {';
    source += '  y();';
    source += '  z();';
    source += '}';

    var expected = '';
    expected += '(for ((= x 0) (<= x 10) (++ x))\n';
    expected += '  (y)\n';
    expected += '  (z))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('if statements should have an extra newline if there is a statement after the if', function() {
    var source = '';
    source += 'if (x) { y(); }';
    source += 'if (a) { b(); }';

    var expected = '';
    expected += '(if x\n';
    expected += '  (y))\n';
    expected += '\n';
    expected += '(if a\n';
    expected += '  (b))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('if statements should not have an extra newline inside a function when the last statement', function() {
    var source = '';
    source += 'var e = function() {';
    source += '  if (c) { d(); }';
    source += '}';

    var expected = '';
    expected += '(define e\n';
    expected += '  (lambda ()\n';
    expected += '    (if c\n';
    expected += '      (d))))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent try/catch', function() {
    var source = '';
    source += 'try {';
    source += '  foo();';
    source += '} catch (e) {';
    source += '  bar();';
    source += '}';

    var expected = '';
    expected += '(try\n';
    expected += '  (foo)\n';
    expected += '  (catch e\n';
    expected += '    (bar)))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should add a newline after an assignment of a variable to a lambda', function() {
    var source = '';
    source += 'x = function() {};';
    source += 'y = function() {};';

    var expected = '';
    expected += '(= x\n';
    expected += '  (lambda ()))\n';
    expected += '\n';
    expected += '(= y\n';
    expected += '  (lambda ()))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should add a newline after an assignment of a variable to a lambda with var', function() {
    var source = '';
    source += 'var x = function() {};';
    source += 'var y = function() {};';

    var expected = '';
    expected += '(define x\n';
    expected += '  (lambda ()))\n';
    expected += '\n';
    expected += '(define y\n';
    expected += '  (lambda ()))';

    assert.equal(loop.reverseCompile(source), expected);
  });

  it('should indent switch / case statements', function() {
    var source = '';
    source += 'switch (one) {';
    source += '  case "two":';
    source += '    foo();';
    source += '    break;';
    source += '  case "three":';
    source += '    bar();';
    source += '    break;';
    source += '  default:';
    source += '    baz();';
    source += '}';

    var expected = '';
    expected += '(switch one\n';
    expected += '  (case "two"\n';
    expected += '    (foo)\n';
    expected += '    (break))\n';
    expected += '  (case "three"\n';
    expected += '    (bar)\n';
    expected += '    (break))\n';
    expected += '  (default\n';
    expected += '    (baz)))';

    assert.equal(loop.reverseCompile(source), expected);
  });
});
