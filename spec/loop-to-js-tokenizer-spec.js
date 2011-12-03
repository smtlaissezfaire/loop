var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("Phase 2? - simplified tokens to uglify tokens").addBatch({
  'all of em': {
    'it should work for a simple number': function() {
      var tokens = loop.toUglifyTokens({
        type: 'number',
        contents: 1
      });

      assert.deepEqual(tokens, ["stat", ["num", 1]]);
    },

    'it should work for a simple string': function() {
      var tokens = loop.toUglifyTokens({
        type: 'string',
        contents: "foo"
      });

      assert.deepEqual(tokens, ["stat", ["string", "foo"]]);
    },

    'it should work for 1+1': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'binary',
          '+',
          {
            type: 'number',
            contents: '1'
          },
          {
            type: 'number',
            contents: '1'
          }
        ]
      });

      assert.deepEqual(tokens, ["stat", ["binary",
                                            "+",
                                            ["num", 1],
                                            ["num", 1]]]);
    },

    'it should work for 1++': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'unary-postfix',
          '++',
          {
            type: 'number',
            contents: '1'
          }
        ]
      });

      assert.deepEqual(tokens, ["stat", ["unary-postfix",
                                            "++",
                                            ["num", 1]]]);
    },

    'it should work for symbols (names)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'name',
          {
            type: 'string',
            contents: 'foo'
          }
        ]
      });

      assert.deepEqual(tokens, ["stat", ["name", "foo"]]);
    },

    'it should work for x++': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'unary-postfix',
          '++',
          {
            type: 'list',
            contents: [
              'name',
              {
                type: 'string',
                contents: 'x'
              }
            ]
          }
        ]
      });

      assert.deepEqual(tokens, ["stat", ['unary-postfix',
                                            '++',
                                            ["name", "x"]]]);
    },

    'it should work for unary-prefixes (typeof foo)': function() {
      // typeof foo
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'unary-prefix',
          'typeof',
          {
            type: 'list',
            contents: [
              'name',
              {
                type: 'string',
                contents: 'foo'
              }
            ]
          }
        ]
      });

      assert.deepEqual(tokens, ["stat", ['unary-prefix',
                                            'typeof',
                                            ["name", "foo"]]]);
    },

    'it should work for assigments (like a+= 10)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'assignment',
          '+',
          {
            type: 'list',
            contents: [
              'name',
              {
                type: 'string',
                contents: 'a'
              }
            ]
          },
          {
            type: 'number',
            contents: 10
          }
        ]
      });

      assert.deepEqual(tokens, ["stat",["assign","+",["name","a"],["num",10]]]);
    },

    'it should work for assigments (like a = 10)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'assignment',
          "=",
          {
            type: 'list',
            contents: [
              'name',
              {
                type: 'string',
                contents: 'a'
              }
            ]
          },
          {
            type: 'number',
            contents: 10
          }
        ]
      });

      assert.deepEqual(tokens, ["stat",["assign",true,["name","a"],["num",10]]]);
    },

    'it should work for var with one arg (like var x = 10;)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'keyword',
          'var',
          {
            type: 'list',
            contents: [
              {
                type: 'list',
                contents: [
                  {
                    type: 'string',
                    contents: 'x'
                  },
                  {
                    type: 'number',
                    contents: 10
                  }
                ]
              }
            ]
          }
        ]
      });

      // basically, looks like a let:
      // (var ((x 10)
      //       (y 20)))

      assert.deepEqual(tokens, ["var",
                                  [["x", ["num",10]]]]);
    },


    'it should work for var with one arg and no assignment (like var x;)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'keyword',
          'var',
          {
            type: 'list',
            contents: [
              {
                type: 'list',
                contents: [
                  {
                    type: 'string',
                    contents: 'x'
                  }
                ]
              }
            ]
          }
        ]
      });

      // basically, looks like a let:
      // (var ((x 10)
      //       (y 20)))

      assert.deepEqual(tokens, ["var",[["x"]]]);
    },

    'it should work for var with two args and assignemnts (like var x = 10, y = 20;)': function() {
      var tokens = loop.toUglifyTokens({
        type: 'list',
        contents: [
          'keyword',
          'var',
          {
            type: 'list',
            contents: [
              {
                type: 'list',
                contents: [
                  {
                    type: 'string',
                    contents: 'x'
                  },
                  {
                    type: 'number',
                    contents: 10
                  }
                ]
              },
              {
                type: 'list',
                contents: [
                  {
                    type: 'string',
                    contents: 'y'
                  },
                  {
                    type: 'number',
                    contents: 20
                  }
                ]
              }
            ]
          }
        ]
      });

      // basically, looks like a let:
      // (var ((x 10)
      //       (y 20)))
      assert.deepEqual(tokens, ["var", [
                                  ["x",["num",10]],
                                  ["y",["num",20]]]]);
    }
  }
}).export(module);