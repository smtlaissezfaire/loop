var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("switch-case", function() {
  it('should be able to handle a switch statement with no expressions', function() {
    var code = "";
    code += "(switch syntaxTree.type)";

    var expectedCode = "";
    expectedCode += "switch(syntaxTree.type){";
    expectedCode += "}";

    assert.equal(loop.compile(code), expectedCode);
  });

  it('should be able to handle a simple switch statement with a case', function() {
    var code = "";
    code += "(switch syntaxTree.type";
    code += "  (case \"foo\"";
    code += "    (console.log 'foo')))";

    var expectedCode = "";
    expectedCode += "switch(syntaxTree.type){";
    expectedCode += "case\"foo\":";
    expectedCode += "console.log(\"foo\")";
    expectedCode += "}";

    assert.equal(loop.compile(code), expectedCode);
  });

  it('should be able to handle multiple case statements', function() {
    var code = "";
    code += "(switch syntaxTree.type";
    code += "  (case \"foo\"";
    code += "    (console.log 'foo')";
    code += "    (foo 'bar')";
    code += "    (break))";
    code += "  (case \"baz\"";
    code += "    (console.log 'baz')";
    code += "    (bar 'baz')";
    code += "    (break)))";

    var expectedCode = "";
    expectedCode += 'switch(syntaxTree.type){';
    expectedCode += 'case"foo":';
    expectedCode += 'console.log("foo");';
    expectedCode += 'foo("bar");';
    expectedCode += 'break;';

    expectedCode += 'case"baz":';
    expectedCode += 'console.log("baz");';
    expectedCode += 'bar("baz");';
    expectedCode += 'break';
    expectedCode += '}';

    assert.equal(loop.compile(code), expectedCode);
  });

  it('should be able to handle a default case', function() {
    var code = "";
    code += "(switch syntaxTree.type";
    code += "  (case \"foo\"";
    code += "    (console.log 'foo')";
    code += "    (break))";
    code += "  (default";
    code += "    (console.log 'default')))";

    var expectedCode = "";
    expectedCode += 'switch(syntaxTree.type){';
    expectedCode += 'case"foo":';
    expectedCode += 'console.log("foo");';
    expectedCode += 'break;';

    expectedCode += 'default:';
    expectedCode += 'console.log("default")';
    expectedCode += '}';

    assert.equal(loop.compile(code), expectedCode);
  });
});
