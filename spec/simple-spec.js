var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("Simple source to source transformation").addBatch({
  'variables': {
    "it should use define in place of var": function(str) {
      var self = this;

      loop.transform("(define x)", function(str) {
        console.log(str);

        assert.equal(str, "var x;\n");
      });
    },

    "it should use the correct variable in define": function(str) {
      var self = this;

      loop.transform("(define foo)", function(str) {
        console.log(str);

        assert.equal(str, "var foo;\n");
      });
    }
  }

  // "it should transform an assignment": function() {
  //   assert.equal(loop.transform("(= x 10)"), "x = 10;\n");
  // },
  //
  // "it should transform two assignments to only use one var statment": "pending",
  //
  // "it should transform a lambda expression": function() {
  //   var str = "function(x) { return x; }"
  //   assert.equal(transformer.transform("(lambda (x) x)"), str);
  // },
  //
  // "it should "
}).export(module);