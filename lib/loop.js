var loop = module.exports;

loop.compress       = require('./loop/compress');
loop.toUglifyTokens = require('./loop/uglify-tokens');
loop.parse          = require('./loop/parser').parse;
loop.loopEval       = require('./loop/eval');