var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("integration spec").addBatch({
  'it should be able to compile a function call': function() {
    var inStream = "((lambda () (+ x x)))";
    var expectedOut = "(function(){x+x})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support user defined functions': function() {
    var inStream = "";
    inStream += "((lambda ()\n";
    inStream += "  (console.log (+ x x))))";
    var expectedOut = "(function(){console.log(x+x)})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to compile a function with function': function() {
    var inStream = "((function () (+ x x)))";
    var expectedOut = "(function(){x+x})()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support strings': function() {
    var inStream = '((vows.describe "integration spec").addBatch)';
    var expectedOut = 'vows.describe("integration spec").addBatch()';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support single quoted strings': function() {
    var inStream = "((vows.describe 'integration spec').addBatch)";
    var expectedOut = "vows.describe(\"integration spec\").addBatch()";

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to support unary operators': function() {
    var inStream = '(console.log (typeof foo))';
    var expectedOut = 'console.log(typeof foo)';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should handle booleans, null, undefined': function() {
    var inStream = '(console.log false)';
    var expectedOut = 'console.log(false)';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should be able to return a value from a function': function() {
    var inStream = '((function() (return "foo")))';
    var expectedOut = '(function(){return"foo"})()';

    assert.equal(loop.compile(inStream), expectedOut);
  },

  'it should support the debugger keyword': function() {
    assert.equal(loop.compile('(debugger)'), 'debugger');
  },

  'it should support the var keyword': function() {
    assert.equal(loop.compile('(var (foo bar))'), 'var foo=bar');
  },

  'it should be able to use numbers': function() {
    assert.equal(loop.compile('(console.log (+ 1 1))'), 'console.log(1+1)');
    assert.equal(loop.compile('(console.log (+ 3.1415926 1))'), 'console.log(3.1415926+1)');
  },

  'it should allow an expanded let statement': function() {
    var code = "";
    code += "((lambda (x y)";
    code += "   (console.log (+ x y))) 10 20)";

    assert.equal(loop.compile(code), '(function(x,y){console.log(x+y)})(10,20)');
  },

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

  'it should be able to create an object from the {} function': function() {
    var code = "(var (x ({})))";
    assert.equal(loop.compile(code), 'var x={}');
  },

  'it should be able to create an object from the {} function with keys and values': function() {
    var code = "(var (x ({} foo 3";
    code +=    "            bar 'something')))";
    assert.equal(loop.compile(code), 'var x={foo:3,bar:"something"}');
  },

  'it should allow a function in the value position': function() {
    var code = "(var (x ({} foo (+ 3 2)";
    code +=    "            bar 'something')))";
    assert.equal(loop.compile(code), 'var x={foo:3+2,bar:"something"}');
  },

  'it should be able to assign a variable': function() {
    var code = "(= x 10)";
    assert.equal(loop.compile(code), 'x=10');
  },

  'it should be able to write a property': function() {
    var code = "(= foo.bar 10)";
    assert.equal(loop.compile(code), "foo.bar=10");
  },

  'it should allow a throw statement': function() {
    var code = '(throw "foo")';
    assert.equal(loop.compile(code), 'throw("foo")');
  },

  'it should support new with no arguments': function() {
    var code = '(new Foo)';
    assert.equal(loop.compile(code), 'new Foo');
  },

  'it should support new with an argument': function() {
    var code = '(new Foo 1)';
    assert.equal(loop.compile(code), 'new Foo(1)');
  },

  'it should allow a throw with a new object': function() {
    var code = "(throw (new Error 'foo'))";
    assert.equal(loop.compile(code), 'throw(new Error("foo"))');
  },

  'it should allow try/catch': function() {
    var code = "";
    code += "(try";
    code += "   (foo+ 10 20)";
    code += "   (+ 1 2)";
    code += "   (catch e";
    code += "    (throw (new Error 'function does not exist!'))))";

    assert.equal(loop.compile(code), 'try{foo+(10,20);1+2}catch(e){throw(new Error("function does not exist!"))}');
  },

  'it should be able to use a for statement': function() {
    var code = "";
    code += "(var (x))";
    code += "(for ((= x 10)";
    code += "      (<= x 20)";
    code += "      (++ x))";
    code += "  (console.log x))";

    // TODO: How to differentiate between x++ and ++x?
    var expected = "";
    expected += "var x;";
    expected += "for(x=10;x<=20;++x){console.log(x)}";

    assert.equal(loop.compile(code), expected);
  },

  'it should be able to use define with an implicit pair': function() {
    var code = "";
    code += "(define foo bar)";

    assert.equal(loop.compile(code), "var foo=bar");
  },

  'it should not insert semicolons into an if': function() {
    var compilationOptions = {
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

    assert.equal(loop.compile(code, compilationOptions),
                 expected);
  },

  'it should use || as OR': function() {
    assert.equal(loop.compile("(|| a b)"),
                 "a||b");
  },

  'it should allow && as a function': function() {
    assert.equal(loop.compile("(&& a b)"),
                 "a&&b");
  },

  'it should allow [] as an empty array': function() {
    assert.equal(loop.compile("[]"), "[]");
  },

  'it should allow [] as an array constructor': function() {
    assert.equal(loop.compile("([] 1 2 3)"), "[1,2,3]");
  },

  'it should allow a array inside a hash': function() {
    var source = "";
    source += "({} type 'list'";
    source += "    contents ([] a b))";

    var expected = "";
    expected = '({type:"list",contents:[a,b]})';

    assert.equal(loop.compile(source), expected);
  },

  'it should allow utf-8 string values': function() {
    var source = "(= x \"汉语/漢語\")";
    var expected = "x=\"汉语/漢語\"";

    assert.equal(loop.compile(source), expected);
  },

  'it should allow utf-8 identifiers': function() {
    var source = "(屌 你 老 母)";
    var expected = "屌(你,老,母)";

    assert.equal(loop.compile(source), expected);
  }
}).export(module);