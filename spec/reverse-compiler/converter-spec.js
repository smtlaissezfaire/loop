var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

var fs = require('fs');

var noIndentOptions = {
  varAlignment: false,
  defineIndentsLambda: false,
  lambdaIndentation: false,
  ifIndentation: false,
  forIndentation: false,
  tryIndentation: false,
  catchIndentation: false,
  switchIndentation: false,
  caseIndentation: false,
  defaultIndentation: false,
  labelIndentation: false,
  forInIndentation: false
};

vows.describe("js to loop converter integration spec").addBatch({
  'it should be able to reverse compile a simple var expression (and should use define for one statement)': function() {
    var source = "var x = 10;";
    var expected = "(define x 10)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to reverse compile a simple var expression (with different vars)': function() {
    var source = "var y = 20;";
    var expected = "(define y 20)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to reverse compile a multiple expression var statement': function() {
    var source = "var x = 10, y = 20;";
    var expected = "(var (x 10) (y 20))";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to convert x=10': function() {
    var source = "x=20;";
    var expected = "(= x 20)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to access a property': function() {
    var source = "foo.bar";
    var expected = "foo.bar";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to set a property': function() {
    var source = "foo.bar = 10";
    var expected = "(= foo.bar 10)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to convert a function call': function() {
    var source = "foo(x, y);";
    var expected = "(foo x y)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to convert a defined function with an anonymous fun': function() {
    var source = "x = function(x, y) { return x + y };";
    var expected = "(= x (lambda (x y) (return (+ x y))))";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to compare with ===': function() {
    var source = "x === y";
    var expected = "(=== x y)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to use typeof': function() {
    var source = "typeof x";
    var expected = "(typeof x)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle an if statement': function() {
    var source = "if (x) { foo }";
    var expected = "(if x foo)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should have support for strings': function() {
    var source = "x = 'foo'";
    var expected = "(= x \"foo\")";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to support double quoted strings with single quote escaping': function() {
    var source = 'x = "foo\'bar"';
    var expected = '(= x "foo\'bar")';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should support an empty object literal in assignment': function() {
    var source = "x = {};";
    var expected = '(= x {})';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should support an object literal with values': function() {
    var source = "x = { a: 1, b: 2 };";
    var expected = '(= x ({} a 1 b 2))';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should properly handle a var with a dot expression': function() {
    var source = 'var jsp = require("uglify-js").parser;';
    var expected = '(define jsp (require "uglify-js").parser)';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should properly handle switch / case / default / break statements': function() {
    var source = "";
    source += "switch(foo) {";
    source += "  case 'bar':";
    source += "    console.log('bar');";
    source += "    break;";
    source += "  default:";
    source += "    console.log('default');";
    source += "}";

    var expected = "";
    expected += '(switch foo ';

    expected += '(case "bar" ';
    expected += '(console.log "bar") ';
    expected += '(break))';

    expected += ' ';
    expected += '(default ';
    expected += '(console.log "default")))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to process a throw': function() {
    var source = 'throw "foo";';
    var expected = '(throw "foo")';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle the new keyword': function() {
    var source = 'new FooBar;';
    var expected = '(new FooBar)';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle the new keyword with args': function() {
    var source = 'new FooBar(1, 2, 3);';
    var expected = '(new FooBar 1 2 3)';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle literal arrays': function() {
    var source = 'x = [1, 2, 3]';
    var expected = '(= x ([] 1 2 3))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should use the literal [] for creating an empty array': function() {
    var source = 'x = []';
    var expected = '(= x [])';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle return 1;': function() {
    var source = '(function() { return 1;})';
    var expected = "(lambda () (return 1))";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle return;': function() {
    var source = '(function() { return;})';
    var expected = "(lambda () (return))";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle return null;': function() {
    var source = '(function() { return null;})';
    var expected = "(lambda () (return null))";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle x++': function() {
    var source = 'x++';
    var expected = "(++ x)";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle the ternary operator': function() {
    var source = "x = comments ? '/comments' : ''";
    var expected = '(= x (? comments "/comments" ""))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should allow subscripts': function() {
    var source = "x[10]";
    var expected = '([] x 10)';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to translate regexes': function() {
    var source = '/foo.*bar/';
    var expected = "(// \"foo.*bar\")";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle functions in non-anonymous fashion': function() {
    var source = 'function foo() { console.log("foo"); }';
    var expected = '(= foo (lambda () (console.log "foo")))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle while statements': function() {
    var source = "while (true) { x(); }";
    var expected = "(while true (x))";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle while without a block': function() {
    var source = "while (true) x();";
    var expected = "(while true (x))";

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle for': function() {
    var source = '';
    source += 'for (x = 0; x <= 10; x++) {';
    source += 'z();';
    source += '}';

    var expected = '(for ((= x 0) (<= x 10) (++ x)) (z))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should properly evaluate a function assignment inside a function (a regression)': function() {
    var source = '';
    source += 'var codeFormatter = function(options) {';
    source += '  foo = function() {};';
    source += '};';

    var expected = '';
    expected += '(define codeFormatter (lambda (options)';
    expected += ' (= foo (lambda ()))))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle try/catch': function() {
    var source = '';
    source += 'try {';
    source += '  foo();';
    source += '} catch (e) {';
    source += '  bar();';
    source += '}';

    var expected = '';
    expected += '(try';
    expected += ' (foo)';
    expected += ' (catch e';
    expected += ' (bar)))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle if / else (with one statement)': function() {
    var source = '';
    source += 'if (a) {';
    source += '  b();';
    source += '} else {';
    source += '  c();';
    source += '}';

    var expected = '';
    expected += '(if a (b)';
    expected += ' (c))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle if / else if / else': function() {
    var source = '';
    source += 'if (a) {';
    source += '  b();';
    source += '} else if (c) {';
    source += '  d();';
    source += '} else {';
    source += '  e();';
    source += '}';

    var expected = '';
    expected += '(cond (a (b))';
    expected += ' (c (d))';
    expected += ' (else (e)))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle a number as an object key': function() {
    var source = 'x = { 10: 20 }';
    var expected = '(= x ({} 10 20))';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle assignments with "this"': function() {
    var source = 'this.parseError = this.yy.parseError;';
    var expected = "(= this.parseError this.yy.parseError)";
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should handle uglify js not returning a proper block statement inside an if (an if returns without parents)': function() {
    var source = '';
    source += "if (typeof this.yy.parseError === 'function')";
    source += "    this.parseError = this.yy.parseError;";

    var expected = '';
    expected += '(if (=== (typeof this.yy.parseError) "function")';
    expected += ' (= this.parseError this.yy.parseError))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle for without a block': function() {
    var source = '';
    source += 'for (x = 0; x <= 10; x++)';
    source += '  console.log(x);';

    var expected = '';
    expected += '(for ((= x 0) (<= x 10) (++ x))';
    expected += ' (console.log x))';
    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle nested for statements': function() {
    var source = '';
    source += 'for (i = 0; items.length; i++)';
    source += '  for (j = 0; j < tests.length; i++)';
    source += '    if (!tests[j].pass(items[i])){';
    source += '      allPass = false;';
    source += '    }';

    var expected = '';
    expected += '(for ((= i 0) items.length (++ i))';
    expected += ' (for ((= j 0) (< j tests.length) (++ i))';
    expected += ' (if (! (([] tests j).pass ([] items i)))';
    expected += ' (= allPass false))))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  },

  'it should be able to handle labels': function() {
    var source = "";
    source += 'var allPass = true;';
    source += 'var i, j;';
    source += '';
    source += 'top:';
    source += 'for (i = 0; items.length; i++)';
    source += '  for (j = 0; j < tests.length; i++)';
    source += '    if (!tests[j].pass(items[i])){';
    source += '      allPass = false;';
    source += '      break top;';
    source += '    }';

    var expected = '';
    expected += '(define allPass true)\n';
    expected += '(var (i)\n';
    expected += '     (j))\n';
    expected += '(label top\n';
    expected += '  (for ((= i 0) items.length (++ i))\n';
    expected += '    (for ((= j 0) (< j tests.length) (++ i))\n';
    expected += '      (if (! (([] tests j).pass ([] items i)))\n';
    expected += '        (= allPass false)\n';
    expected += '        (break top)))))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should support for-in': function() {
    var source = '';
    source += 'for (key in obj) {';
    source += '  console.log(obj[key]);';
    source += '}';

    var expected = '';
    expected += '(for-in obj key\n';
    expected += '  (console.log ([] obj key)))';

    assert.equal(loop.reverseCompile(source), expected);
  },

  'it should support if / else if without an else': function() {
    var source = '';
    source += 'if (a) {';
    source += '  b();';
    source += '} else if (c) {';
    source += '  d();';
    source += '}';

    var expected = '';
    expected += '(cond';
    expected += ' (a (b))';
    expected += ' (c (d)))';

    assert.equal(loop.reverseCompile(source, noIndentOptions), expected);
  }
}).export(module);
