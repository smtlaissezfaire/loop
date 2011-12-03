var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("Phase 0 - Js to compressed js").addBatch({
  'compressing javascript': {
    'it should do it': function() {
      var str = '';
      str += 'var foo = function (x) {\n';
      str += '  console.log(x + x);\n';
      str += '};';

      var compressedString = '';
      compressedString += 'var foo=function(a){';
      compressedString += 'console.log(a+a)';
      compressedString += '}';

      assert.equal(loop.compress(str), compressedString);
    }
  }
}).export(module);