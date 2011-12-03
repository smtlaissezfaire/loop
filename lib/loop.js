var mod = module.exports;

mod.compress = function(code) {
  var jsp = require("uglify-js").parser;
  var pro = require("uglify-js").uglify;

  // parse code and get the initial AST
  var ast = jsp.parse(code);
  // get a new AST with mangled names
  ast = pro.ast_mangle(ast);
  // get an AST with compression optimizations
  ast = pro.ast_squeeze(ast);
  // compressed code here
  var final_code = pro.gen_code(ast);

  return final_code;
};