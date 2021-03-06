var _ = require("./util/underscore");
var printTree = require('./util/tree-inspector').withLineNumbers;
var helpers = require('./util/helpers');
var compiler = {};
var loop = require('../loop');
var fs = require('fs');

var macros = {};

var extractFormals;
var macroReplaceFromLocals;
var isList;

compiler.reset = function() {
  macros = {};
};

// extract out macro definitions and add them to the macro list
compiler.addMacrosFromAst = function(ast) {
  _.each(ast, function(tree) {
    if (tree.type === 'list') {
      var contents = tree.contents;
      var firstEl = contents[0];

      if (firstEl.type === 'id' && firstEl.contents === 'define-macro') {
        var args = contents.slice(1);

        if (args.length % 2 !== 0) {
          throw new Error("define-macro takes two arguments: a pattern, and a replacement");
        }

        _.inGroupsOf(args, 2, function(list) {
          compiler.addMacro({
            template: list[0],
            replacement: list[1]
          });
        });
      }
    }
  });
};

compiler.transform = function(ast) {
  this.addMacrosFromAst(ast);

  ast = compiler.macroCompile(ast);

  // finally, remove any define-macros
  ast = _.reject(ast, function(tree) {
    if (tree.type === 'list') {
      var firstEl = tree.contents[0];
      return firstEl.type === 'id' && firstEl.contents === 'define-macro';
    }
  });

  return ast;
};

compiler.addMacro = function(obj) {
  var template = obj.template;

  if (!isList(template)) {
    throw new Error("macro template must be a list of two lists");
  }

  if (!template.contents[0] ||
      template.contents[0].type !== 'id') {
    throw new Error("macro template pattern must start with an id");
  }

  var id = obj.template.contents[0].contents;

  if (!macros[id]) {
    macros[id] = [];
  }

  macros[id].push(obj);
};

compiler.addEval = function() {
  compiler.addMacro({
    template: {
      type: 'list',
      contents: [
        { type: 'id', contents: '__loop_js_eval__'},
        { type: 'id', contents: 'args' },
        { type: 'macro-pattern' }
      ]
    },
    replacement: {
      type: '__loop_js_eval__',
      fn: function(locals) {
        var str = locals.args[0].contents;
        return require('vm').runInNewContext(str).toString();
      }
    }
  });

  compiler.addMacro({
    template: {
      type: 'list',
      contents: [
        { type: 'id', contents: 'loop.eval'},
        { type: 'id', contents: 'body' },
        { type: 'macro-pattern' }
      ]
    },
    replacement: {
      type: '__loop_eval__',
      fn: function(locals) {
        var loop = require('../loop');
        var macroTransformedAst = loop.macroCompiler.transform(locals);
        var ast = loop.loopEval(macroTransformedAst[1]);
        var uglifyAst = loop.toUglifyTree(ast, {});
        var pro = require("uglify-js").uglify;
        var jsCode = pro.gen_code(uglifyAst, {});

        return require('vm').runInNewContext(jsCode, {
          require: require,
          loop: loop,
          fs: fs
        }).toString();
      }
    }
  });
};

var isList = function(tree) {
  return tree && tree.type === 'list' && tree.contents;
};

var hasMacroPattern = function(macroTemplate) {
  if (!isList(macroTemplate)) {
    return false;
  }

  return _.any(macroTemplate.contents, function(el) {
    if (el.type === 'macro-pattern' || el.hasMacroPattern) {
      return true;
    }
  });
};

var noMacroPattern = function(macroTemplate) {
  return !hasMacroPattern(macroTemplate);
};

var equal = function(tree1, tree2) {
  var tree1IsList = isList(tree1);
  var tree2IsList = isList(tree2);

  if (tree1IsList && tree2IsList) {
    if (tree1.contents.length !== tree2.contents.length) {
      return false;
    }

    return _.all(tree1.contents, function(el, index) {
      return equal(el, tree2.contents[index]);
    });
  } else if (tree1IsList || tree2IsList) {
    return false;
  } else {
    if (tree1.type === tree2.type) {
      return tree1.contents === tree2.contents;
    } else {
      return false;
    }
  }
};

var macroMatchesTree;

var macroPatternMatches = function(macro, tree) {
  var i;
  var el;

  var patternElement;
  var macroElementsWithoutPattern = [];

  for (i = 0; i < macro.contents.length; i++) {
    el = macro.contents[i];

    if (el.type === 'macro-pattern') {
      patternElement = macro.contents[i-1];
    } else {
      macroElementsWithoutPattern.push(el);
    }
  }

  if (!patternElement) {
    if (tree.contents.length < macroElementsWithoutPattern.length) {
      return false;
    }

    return _.all(macroElementsWithoutPattern, function(macroElement, index) {
      return macroMatchesTree(macroElement, tree.contents[index]);
    });
  }

  // algorithm - scan the list from left to right
  // each arg corresponds to a regular argument, until we get the pattern arg
  // then do the opposite, in reverse
  if (tree.contents.length < macroElementsWithoutPattern.length - 1) {
    return false;
  }

  for (i = 0; i < macroElementsWithoutPattern.length; i++) {
    el = macroElementsWithoutPattern[i];

    if (el === patternElement) {
      break;
    }

    if (!macroMatchesTree(el, tree.contents[i])) {
      return false;
    }
  }

  for (i = macroElementsWithoutPattern.length - 1; i === 0; i--) {
    el = macroElementsWithoutPattern[i];

    if (el === patternElement) {
      break;
    }

    if (!macroMatchesTree(el, tree.contents[i])) {
      return false;
    }
  }

  return true;
};

macroMatchesTree = function(tree1, tree2) {
  var treesEqual = equal(tree1, tree2);
  if (treesEqual) {
    return true;
  }

  if (isList(tree1) && isList(tree2)) {
    if (hasMacroPattern(tree1)) {
      return macroPatternMatches(tree1, tree2);
    } else {
      if (tree1.contents.length !== tree2.contents.length) {
        return false;
      }

      return _.all(tree1.contents, function(el, index) {
        return macroMatchesTree(el, tree2.contents[index]);
      });
    }
  } else {
    return true;
  }
};

compiler.macroMatchesTree = macroMatchesTree;

var macroCompile = function(tree) {
  if (tree.type === 'list') {
    var contents = tree.contents;

    // don't macro transform define-macros
    if (tree.contents[0] &&
        tree.contents[0].type === 'id' &&
        tree.contents[0].contents === 'define-macro') {
      return tree;
    }

    // macro transform subelements first
    tree.contents = _.map(contents, function(subtree) {
      // console.log('== sub compiling:');
      // console.log(printTree(subtree));
      return macroCompile(subtree);
    });

    if (tree.contents[0] && tree.contents[0].type === 'id') {
      _.each(macros[tree.contents[0].contents], function(macro) {
        var functionName = macro.template.contents[0].contents;

        if (tree.contents[0].contents === functionName) {
          if (macroMatchesTree(macro.template, tree)) {
            // console.log("== Transforming");
            // console.log(printTree(tree));
            // console.log("=== With template:");
            // console.log(printTree(macro.template));

            var locals = extractFormals(macro.template, tree);
            tree = macroReplaceFromLocals(macro.replacement, locals);
            // console.log("=== TO:");
            // console.log(printTree(tree));
            // console.log('== recursing');
            tree = macroCompile(tree);
          }
        }
      });
    }
  }

  return tree;
};

compiler.macroCompile = function(ast) {
  return _.map(ast, function(tree) {
    return macroCompile(tree);
  });
};

// mark of elements that have a pattern by settings hasMacroPattern = true
// remove the macro pattern elements
var markOffPatternElements = function(template) {
  if (template.type !== 'list') {
    return;
  }

  template = template.contents;

  _.each(template, function(subtree, index) {
    if (subtree.type === 'macro-pattern') {
      return;
    }

    var nextSubtree = template[index+1];

    if (nextSubtree) {
      if (nextSubtree.type === 'macro-pattern') {
        subtree.hasMacroPattern = true;
      }
    }

    markOffPatternElements(subtree);
  });
};

var removePatternElements = function(template) {
  if (template.type !== 'list') {
    return template;
  }

  template.contents = _.reject(template.contents, function(subtree) {
    return subtree.type === 'macro-pattern';
  });

  template.contents = _.map(template.contents, function(el) {
    return removePatternElements(el);
  });

  return template;
};

var extractFormalsFromList = function(template, ast, locals) {
  if (template.type !== 'list') {
    throw new Error('should not be a list in extractFormalsFromList');
  }

  _.each(template.contents, function(tree, index) {
    var codeTrees;
    var i;

    if (tree.type === 'list') {
      var contents = tree.contents;
      codeTrees = [];

      if (tree.hasMacroPattern) {
        for (i = index; i < ast.contents.length; i++) {
          codeTrees.push(ast.contents[i]);
        }
      } else {
        codeTrees.push(ast.contents[index]);
      }

      _.each(codeTrees, function(codeTree) {
        extractFormalsFromList(tree, codeTree, locals);
      });
    } else {
      var name = tree.contents;
      codeTrees = [];

      if (!name) {
        throw new Error('tree should have a name!');
      }

      if (tree.hasMacroPattern) {
        for (i = index; i < ast.contents.length; i++) {
          codeTrees.push(ast.contents[i]);
        }
      } else {
        if (!ast.contents[index]) {
          throw new Error('Non matching pattern!');
        }

        codeTrees.push(ast.contents[index]);
      }

      if (!locals[name]) {
        locals[name] = [];
      }

      _.each(codeTrees, function(codeTree) {
        locals[name].push(codeTree);
      });
    }
  });
};

extractFormals = function(template, ast) {
  var locals = {};
  template = helpers.deepCopy(template);
  markOffPatternElements(template);
  template = removePatternElements(template);
  extractFormalsFromList(template, ast, locals);
  return locals;
};

var replaceFormalsFromList = function(replacement, locals, shouldShift) {
  replacement = _.extend({}, replacement);


  if (replacement.type === '__loop_js_eval__') {
    return {
      type: 'raw_js',
      contents: replacement.fn(locals)
    };
  } else if (replacement.type === '__loop_eval__') {
    return {
      type: 'raw_js',
      contents: replacement.fn(locals)
    };
  } else if (replacement.type === 'list') {
    // use case:
    // replacement: (a b) ...,
    // locals: {}
    if (replacement.hasMacroPattern) {
      var anyHaveValues = _.any(replacement.contents, function(el) {
        return locals[el.contents];
      });

      if (!anyHaveValues) {
        return null;
      }
    }

    var newContents = [];
    var extraMacroPattern;

    _.each(replacement.contents, function(el) {
      var newValue;

      // in a macro pattern we'll have multiple values, so
      // we'll want to shift an element off the variable list.  Otherwise
      // we don't want to touch the variables, though, as in the
      // case of a repeated variable
      if (replacement.hasMacroPattern) {
        newValue = replaceFormalsFromList(el, locals, true);
      } else {
        newValue = replaceFormalsFromList(el, locals);
      }

      if (newValue instanceof Array) {
        _.each(newValue, function(el) {
          newContents.push(el);
        });
      } else if (newValue) {
        if (el.hasMacroPattern) {
          extraMacroPattern = el;
        }

        newContents.push(newValue);
      // } else {
      //   // tree was removed, do nothing
      }
    });

    // extract the rest of the macro pattern variables,
    // for instance, in a three argument let*
    if (extraMacroPattern) {
      var extraMacroPatternValues = replaceFormalsFromList(extraMacroPattern, locals);
      if (extraMacroPatternValues.type === 'list' && extraMacroPatternValues.contents.length > 0) {
        newContents.push(extraMacroPatternValues);
      }
    }

    replacement.contents = newContents;
  } else if (replacement.type === 'id') {
    if (locals[replacement.contents]) {
      if (replacement.hasMacroPattern) {
        return locals[replacement.contents];
      } else {
        if (shouldShift) {
          return locals[replacement.contents].shift();
        } else {
          return locals[replacement.contents][0];
        }
      }
    } else { // we found no actual value for this macro
      // if it is a macro pattern like ((a b) ...),
      // but an empty () was given, remove it
      if (replacement.hasMacroPattern) {
        return null;
      } else {
        // otherwise, we just didn't happen to find anything for it,
        // so leave the id as we found it
        return replacement;
      }
    }
  // } else {
  //   // ignore all other raw types.  strings, regexes, etc. never get replaced
  }

  return replacement;
};

macroReplaceFromLocals = function(replacement, locals) {
  markOffPatternElements(replacement);
  replacement = removePatternElements(replacement);
  return replaceFormalsFromList(replacement, locals);
};

module.exports = compiler;