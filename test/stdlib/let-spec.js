var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("built in let", function() {
  it('should be able to use the let with 2 args', function() {
    var code = '';
    code += '(let ((x 10)';
    code += '      (y 20))';
    code += '  (console.log (+ x y)))';

    var expected = '';
    expected += '(function(x,y){';
    expected += 'console.log(x+y)';
    expected += '})(10,20)';

    assert.equal(loop.compile(code), expected);
  });

  it('should be able to use the let with zero args', function() {
    var code = '';
    code += '(let ()';
    code += '  (console.log (+ x y)))';

    var expected = '';
    expected += '(function(){';
    expected += 'console.log(x+y)';
    expected += '})()';

    assert.equal(loop.compile(code), expected);
  });

  it.pending('should always return the last value', function() {
    var code = '';
    code += '(let ()';
    code += '  (console.log (+ x y)))';

    var expected = '';
    expected += '(function(){';
    expected += 'console.log(x+y)';
    expected += '})()';

    assert.equal(loop.compile(code), expected);
  });
});