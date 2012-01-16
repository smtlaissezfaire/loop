var loop = require('./../loop');
var pro = require("uglify-js").uglify;

var compiler = {};

compiler.compile = function(str, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  var macroTransformedAst = loop.macroTransform(loop.parse(str));
  var ast = loop.loopEval(macroTransformedAst);
  var uglifyAst = loop.toUglifyTree(ast, options);

  if (options.mangle) {
    // get a new AST with mangled names
    uglifyAst = pro.ast_mangle(ast);
  }

  if (options.squeeze) {
    // get an AST with compression optimizations
    uglifyAst = pro.ast_squeeze(ast);
  }

  // compressed code here
  return pro.gen_code(uglifyAst, options);
};

module.exports = compiler;