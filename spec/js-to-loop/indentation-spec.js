var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

vows.describe("reverse compiler - indentation").addBatch({
  'it put a multi expression var statement on multiple lines at the same indentation)': function() {
    var source = "var x = 10, y = 20;";
    var expected = '';
    expected += '(var (x 10)\n';
    expected += '     (y 20))';
    assert.equal(loop.reverseCompile(source), expected);
  },
}).export(module);
