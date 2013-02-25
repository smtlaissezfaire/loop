var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");
var path = require('path');

describe("include", function() {
  beforeEach(function() {
    loop.macroCompiler.reset();
  });

  it('should be able to include a file with .loop extension', function() {
    var filePath = path.join(__dirname, '..', 'fixtures', 'define_x_equal_to_one.loop');
    var code = "";
    code += "(__loop_include__ '" + filePath + "')";
    var expectedCode = "var x=1";
    assert.equal(loop.compile(code), expectedCode);
  });

  it('should be able to use the variables from a required file', function() {
    var filePath = path.join(__dirname, '..', 'fixtures', 'define_x_equal_to_one.loop');
    var code = "";
    code += "(__loop_include__ '" + filePath + "')";
    code += "(define y (+ x 10))";
    var expectedCode = '';
    expectedCode += "var x=1;";
    expectedCode += 'var y=x+10';
    assert.equal(loop.compile(code), expectedCode);
  });

  it('should be able to use a macro from a required file', function() {
    var filePath = path.join(__dirname, '..', 'fixtures', 'macro-my-unless.loop');
    var code = "";
    code += "(__loop_include__ \"" + filePath + "\")";
    code += '(my-unless x';
    code += '  (console.log "foo!"))';

    var expectedCode = '';
    expectedCode += 'if(!x){';
    expectedCode += 'console.log("foo!")';
    expectedCode += '}';

    assert.equal(loop.compile(code), expectedCode);
  });
});
