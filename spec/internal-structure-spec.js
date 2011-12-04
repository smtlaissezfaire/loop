var vows = require("vows");
var assert = require("assert");
var loop = require(__dirname + "/../lib/loop");

vows.describe("phase 1: parsing to an internal structure").addBatch({
  'parsing to an external syntax': function() {
    var str = '((lambda () (+ x x)))';

    assert.deepEqual(loop.parse(str, { notTopLevel: true }), {
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
    });
  }
}).export(module);