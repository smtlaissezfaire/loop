var loop = module.exports;

loop.parse          = require('./loop/parser').parse;
loop.loopEval       = require('./loop/eval');
loop.macroTransform = require('./loop/macro-compiler').macroTransform;
loop.toUglifyTree   = require('./loop/uglify').transform;
loop.compile        = require('./loop/compiler').compile;
