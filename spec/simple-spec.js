var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

var transformEqual = function(input, expectedOut) {
  loop.transform(input, function(str) {
    assert.equal(str, expectedOut);
  });
};

vows.describe("Simple source to source transformation").addBatch({
  'vars': {
    "it should use var": function() {
      transformEqual("(var x)", "var x;\n");
    },

    "it should use the correct variable in var": function() {
      transformEqual("(var foo)", "var foo;\n");
    },

    "it should actually call the body of transform": function() {
      var called = false;

      loop.transform("(var x)", function() {
        called = true;
      });

      assert.equal(called, true);
    },

    "it should be able to var and set a variable": function() {
      transformEqual("(var x y)", "var x = y;\n");
    },


    "it should work with numbers": function() {
      transformEqual("(var x 10)", "var x = 10;\n");
    }
  },

  "user defined functions": {
    "it should be able to transform a call to one": function() {
      transformEqual("(foo 10 20)", "foo(10, 20);\n");
    },

    "it should transform a call to one with no args": function() {
      transformEqual("(foo)", "foo();\n");
    },

    "it should be able to create a function with function": function() {
      var str = "";
      str += "function() { \n";
      str += "  x;\n";
      str += "};\n";

      transformEqual("(function () x)", str);
    },

    "it should use the correct args with a self defined function": function() {
      var str = "";
      str += "function(one, two, three) { \n";
      str += "  x;\n";
      str += "};\n";

      transformEqual("(function (one two three) x)", str);
    },

    "it should have the body of the function": function() {
      var str = "";
      str += "function(one, two, three) { \n";
      str += "  x;\n";
      str += "  y;\n";
      str += "  z;\n";
      str += "};\n";

      transformEqual("(function (one two three) x y z)", str);
    },

    "it should be able to return at the end of a function": function() {
      var str = "";
      str += "function(one, two, three) { \n";
      str += "  x;\n";
      str += "  y;\n";
      str += "  return(z);\n";
      str += "};\n";

      transformEqual("(function (one two three) x y (return z))", str);
    }
  },

  "assignments": {
    "it should work with a simple assignment": function() {
      transformEqual("(= x 10)", "x = 10;\n");
    }
  },

  "objects": {
    "it should be able to get a property": function() {
      transformEqual("(propget x foo)", "x.foo;\n");
    },

    "it should be able to set a property": function() {
      transformEqual("(propset x foo 10)", "x.foo = 10;\n");
    },

    "it can use the shorthand x.y for propget": "pending", //function() {
    //   transformEqual("x.y", "x.y;\n");
    // },

    "it can treat a period like a function in function position": "pending", // function() {
    //       transformEqual("(x.y)", "x.y()");
    //     }

    "it should actually call the body of transform": function() {
      var called = false;

      loop.transform("17", function() {
        called = true;
      });

      assert.equal(called, true);
    },

    "it can use integers": function() {
      transformEqual("7", "7");
    },

    "it uses the correct int": function() {
      transformEqual("8", "8");
    },

    "it should use floating point numbers": "pending"// function() {
    //       transformEqual("3.1415926", "3.1415926");
    //     }
  },

  'math operators': {
    "it can use *": function() {
      transformEqual("(* 1 2)", "1 * 2;\n");
    },

    "it can work with many arguments": function() {
      transformEqual("(* 1 2 3)", "1 * 2 * 3;\n");
    },

    "it can use +": function() {
      transformEqual("(+ 1 2)", "1 + 2;\n");
    },

    "it can use -": function() {
      transformEqual("(- 1 2)", "1 - 2;\n");
    },

    "it can use /": function() {
      transformEqual("(/ 1 2)", "1 / 2;\n");
    }
  }

  // "it should transform an assignment": function() {
  //   assert.equal(transformEqual("(= x 10)"),
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