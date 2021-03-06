var assert = require("assert");
var loop = require(__dirname + "/../../lib/loop");

describe("phase 3: transform from eval'ed syntax into uglifyjs parse tree", function() {
  it('should eval a function call', function() {
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
    assert.equal(JSON.stringify(out), JSON.stringify(uglifyTree));
  });
});