var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

vows.describe("reverse compiler - indentation").addBatch({
  'it should put a multi expression var statement on multiple lines at the same indentation)': function() {
    var source = "var x = 10, y = 20;";
    var expected = '';
    expected += '(var (x 10)\n';
    expected += '     (y 20))';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should indent a lambda assignment': function() {
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
  },

  'it should outdent after the lambda is done': function() {
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
    expected += '    (+ z y)))';
    expected += '\n';
    expected += '(define y\n';
    expected += '  (lambda ()\n';
    expected += '    (+ x y)\n';
    expected += '    (+ z y)))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should indent a lambda in an assignment with =': function() {
    var source = '';
    source += 'var x;';
    source += 'x = function() {};';

    var expected = '';
    expected += '(define x)\n';
    expected += '(= x\n';
    expected += '  (lambda ()))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  // 'it should indent the second arg of any define if it is a list': function() {
  //   var source = '';
  //   source += 'var x = foo();';
  //
  //   var expected = '';
  //   expected += '(define x\n';
  //   expected += '  (foo))';
  //
  //   assert.equal(loop.reverseCompile(source), expected);
  // },

  'it should indent if statements': function() {
    var source = '';
    source += 'if (x) {';
    source += '  y + z;';
    source += '}';

    var expected = '';
    expected += '(if x\n';
    expected += '  (+ y z))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should indent var x; properly': function() {
    var source = 'var x; var y;';
    var expected = '';
    expected += '(define x)\n';
    expected += '(define y)';
    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should indent for': function() {
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
  },

  'if statements should have an extra newline if there is a statement after the if': function() {
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
  },

  'if statements should not have an extra newline inside a function when the last statement': function() {
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
  },

  'it should indent try/catch': function() {
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
  }
}).export(module);
