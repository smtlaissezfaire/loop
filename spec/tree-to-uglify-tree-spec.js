var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree").addBatch({
  'it should eval a function call': function() {
    var evaled = {
      type: 'funcall',
      function: {
        type: 'funcall',
        function: { type: 'id', contents: 'lambda' },
        arguments: {
          type: 'list',
          contents: [
            {
              type: 'list',
              contents: []
            },
            {
              type: 'list',
              contents: [
                {
                  type: 'funcall',
                  function: { type: 'id', contents: '+' },
                  arguments: {
                    type: 'list',
                    contents: [
                      { type: 'id', contents: 'x' },
                      { type: 'id', contents: 'x' }
                    ]
                  }
                }
              ]
            }
          ]
        }
      },
      arguments: { type: 'list', contents: [] }
    };

    var uglifyTree = ["toplevel",[["stat",["call",["function",null,[],[["stat",["binary","+",["name","x"],["name","x"]]]]],[]]]]];

    var out = loop.toUglifyTree([evaled]);
    // this is raising, for some reason:
    // assert.deepEqual(loop.toUglifyTree([evaled]), uglifyTree);
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  }
}).export(module);