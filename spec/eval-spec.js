var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("phase 2: eval transformed syntax").addBatch({
  'it should eval a function call': function() {
    var unevaled = {
      type: 'list',
      contents: [
        {
          type: 'list',
          contents: [
            { type: 'id', contents: 'lambda' },
            { type: 'list', contents: [] },
            {
              type: 'list',
              contents: [
                { type: 'id', contents: '+'},
                { type: 'id', contents: 'x'},
                { type: 'id', contents: 'x'}
              ]
            }
          ]
        }
      ]
    };

    assert.deepEqual(loop.loopEval(unevaled), {
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
      arguments: { type: 'list', contents: [] },
    });
  }
}).export(module);