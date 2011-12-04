var loop = module.exports;

loop.parse          = require('./loop/parser').parse;
loop.loopEval       = require('./loop/eval');
loop.toUglifyTree   = require('./loop/uglify').transform;
loop.compile        = require('./loop/compiler').compile;
