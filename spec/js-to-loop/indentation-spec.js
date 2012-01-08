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

  'it should indent an lambda assignment': function() {
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
  }
}).export(module);
