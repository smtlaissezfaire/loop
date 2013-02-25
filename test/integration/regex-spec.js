var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("regex", function() {
  it('should parse a simple regexp', function() {
    assert.equal(loop.compile('/foobar/'), '/foobar/');
  });

  it('should parse a regex as a regex', function() {
    assert.equal(loop.compile('/^WHORU\\:(.*)\\n$/'), '/^WHORU\\:(.*)\\n$/');
  });

  it('should parse a regex as a regex with a modifier', function() {
    assert.equal(loop.compile('/foobar/i'), '/foobar/i');
  });
});