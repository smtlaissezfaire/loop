var loop = require('./../loop');
var pro = require("uglify-js").uglify;
var fs = require('fs');

var compiler = {};

compiler.compile = function(str, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  var stdlibBuiltInMacros = fs.readFileSync(__dirname + "/stdlib/built-ins.loop").toString();
  loop.macroCompiler.addMacrosFromAst(loop.parse(stdlibBuiltInMacros));

  var macroTransformedAst = loop.macroCompiler.transform(loop.parse(str));
  var ast = loop.loopEval(macroTransformedAst);
  var uglifyAst = loop.toUglifyTree(ast, options);

  if (options.remove_comments) {
    uglifyAst = pro.ast_comment_remover(uglifyAst);
  }

  if (options.mangle) {
    // get a new AST with mangled names
    uglifyAst = pro.ast_mangle(uglifyAst);
  }

  if (options.squeeze) {
    // get an AST with compression optimizations
    uglifyAst = pro.ast_squeeze(uglifyAst);
  }

  // compressed code here
  return pro.gen_code(uglifyAst, options);
};

module.exports = compiler;