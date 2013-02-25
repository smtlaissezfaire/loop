var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

var defaultOptions = {
  indent_start : 0,
  indent_level : 2,
  quote_keys   : false,
  space_colon  : true,
  beautify     : true,
  ascii_only   : false,
  inline_script: false
};

describe("if + cond", function() {
  it('should be able to handle an if statement', function() {
    var code = "(if x (y))";
    assert.equal(loop.compile(code), 'if(x){y()}');
  });

  it('should be able to handle an if statement with no block conditions', function() {
    var code = "(if x)";

    assert.equal(loop.compile(code), 'if(x){}');
  });

  it('should be able to handle an if statement with multiple block conditions', function() {
    var code = "(if x (y) (+ 10 20))";

    assert.equal(loop.compile(code), 'if(x){y();10+20}');
  });

  it('should allow non list types in the conditions', function() {
    var code = "(if true (y))";

    assert.equal(loop.compile(code), 'if(true){y()}');
  });

  it('should allow a ! in the conditions', function() {
    var code = "(if (! foo) (y))";

    assert.equal(loop.compile(code), 'if(!foo){y()}');
  });

  it('should allow === as a comparison operator', function() {
    var code = "(if (=== x 10) (console.log \"foo\"))";
    assert.equal(loop.compile(code), 'if(x===10){console.log("foo")}');
  });

  it('should not insert semicolons into an if', function() {
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
  });

  it('should allow a cond statement', function() {
    var code = '';
    code += '(cond';
    code += '  (true (console.log true)))';

    var expected = '';
    expected += 'if (true) {\n';
    expected += '  console.log(true);\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should allow an else if in a cond', function() {
    var code = '';
    code += '(cond';
    code += '  (true (console.log 1))';
    code += '  (true (console.log 2)))';

    var expected = '';
    expected += 'if (true) {\n';
    expected += '  console.log(1);\n';
    expected += '} else if (true) {\n';
    expected += '  console.log(2);\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should allow multiple else ifs in a cond', function() {
    var code = '';
    code += '(cond';
    code += '  (true (console.log 1))';
    code += '  (true (console.log 2))';
    code += '  (true (console.log 3)))';

    var expected = '';
    expected += 'if (true) {\n';
    expected += '  console.log(1);\n';
    expected += '} else if (true) {\n';
    expected += '  console.log(2);\n';
    expected += '} else if (true) {\n';
    expected += '  console.log(3);\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should use the correct arguments in a cond', function() {
    var code = '';
    code += '(cond';
    code += '  ((=== x 1)';
    code += '   (console.log "1")';
    code += '   (console.log "2")))';

    var expected = '';
    expected += 'if (x === 1) {\n';
    expected += '  console.log("1");\n';
    expected += '  console.log("2");\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should allow a number in a cond', function() {
    var code = '';
    code += '(cond';
    code += '  (1 (console.log "1")))';

    var expected = '';
    expected += 'if (1) {\n';
    expected += '  console.log("1");\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should allow an else to a cond\'s if', function() {
    var code = '';
    code += '(cond';
    code += '  (false (console.log 1))';
    code += '  (else (console.log 2)))';

    var expected = '';
    expected += 'if (false) {\n';
    expected += '  console.log(1);\n';
    expected += '} else {\n';
    expected += '  console.log(2);\n';
    expected += '}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should error with an else if it isn\'t the last clause', function() {
    var code = '';
    code += '(cond';
    code += '  (foo (console.log 1))';
    code += '  (else (console.log 2))';
    code += '  (bar (console.log 3))';
    code += '  (baz (console.log 4)))';

    assert.throws(function() {
      loop.compile(code, defaultOptions);
    });
  });

  it('should be ok if cond has an empty body', function() {
    var code = '';
    code += '(cond';
    code += '  (foo))';

    var expected = '';
    expected += 'if (foo) {}';

    assert.equal(loop.compile(code, defaultOptions), expected);
  });

  it('should raise an error if cond has no body', function() {
    var code = '';
    code += '(cond)';
    assert.throws(function() {
      loop.compile(code);
    });
  });
});