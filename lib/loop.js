var loop = module.exports;

loop.VERSION        = '0.0.1';
loop.parse          = require('./loop/parser').parse;
loop.loopEval       = require('./loop/eval');
loop.macroTransform = require('./loop/macro-compiler').macroTransform;
loop.toUglifyTree   = require('./loop/uglify').transform;
loop.compile        = require('./loop/compiler').compile;
loop.reverseCompile = require('./loop/reverse-compiler').compile;
loop.executable     = require('./loop/executable');
