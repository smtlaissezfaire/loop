var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("strings", function() {
  it('should parse a simple double quoted string as a string', function() {
    assert.equal(loop.compile("foo"), "foo");
  });

  it('should keep control characters in a string', function() {
    assert.equal(loop.compile('(define x "\\n")'), 'var x="\\n"');
  });
});