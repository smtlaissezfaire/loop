var _ = require("./underscore");
var compiler = {};

var macros = [];

var extractFormals;
var macroReplaceFromLocals;

compiler.macroTransform = function(ast) {
  macros = [];

  // extract out macro definitions,
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
  macros.push(obj);
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

var macroMatchesTree = function(macro, tree) {
  var treeIsList = isList(tree);
  var macroIsList = isList(macro);

  if (treeIsList && macroIsList) {
    if (noMacroPattern(macro) ||
        (hasMacroPattern(tree) && hasMacroPattern(macro))) {
      if (tree.contents.length === macro.contents.length) {
        return _.all(tree.contents, function(el, index) {
          return macroMatchesTree(macro.contents[index], el);
        });
      } else {
        return false;
      }
    } else {
      var nonCollapsedMacroPattern,
          collapsedMacroPattern;

      _.each(macro.contents, function(el) {
        if (nonCollapsedMacroPattern || collapsedMacroPattern) {
          throw new Error("Can only have one macro pattern in a list!");
        }

        if (el.type === 'macro-pattern') {
          nonCollapsedMacroPattern = true;
        } else if (el.hasMacroPattern) {
          collapsedMacroPattern = true;
        }
      });

      if (nonCollapsedMacroPattern) {
        return tree.contents.length >= macro.contents.length - 2;
      } else if (collapsedMacroPattern) {
        return tree.contents.length >= macro.contents.length - 1;
      } else {
        return false;
      }
    }
  } else if (treeIsList || macroIsList) {
    return false;
  } else {
    return true;
  }
};

var macroCompile = function(tree) {
  if (tree.type === 'list') {
    var contents = tree.contents;

    // macro transform subelements first
    tree.contents = _.map(contents, function(subtree) {
      return macroCompile(subtree);
    });

    if (tree.contents[0] && tree.contents[0].type === 'id') {
      _.each(macros, function(macro) {
        var functionName = macro.template.contents[0].contents;

        if (tree.contents[0].contents === functionName &&
            macroMatchesTree(macro.template, tree)) {
          var locals = extractFormals(macro.template, tree);
          tree = macroCompile(macroReplaceFromLocals(macro.replacement, locals));
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

  markOffPatternElements(template);

  template = removePatternElements(template);

  extractFormalsFromList(template, ast, locals);

  return locals;
};

var replaceFormalsFromList = function(replacement, locals) {
  replacement = _.clone(replacement);

  if (replacement.type === 'list') {
    var newContents = [];

    _.each(replacement.contents, function(el) {
      var newValue = replaceFormalsFromList(el, locals);

      if (newValue instanceof Array) {
        _.each(newValue, function(el) {
          newContents.push(el);
        });
      } else if (newValue) {
        newContents.push(newValue);
      // } else {
      //   // tree was removed, do nothing
      }
    });

    replacement.contents = newContents;
  } else if (replacement.type === 'id') {
    if (locals[replacement.contents]) {
      if (replacement.hasMacroPattern) {
        return locals[replacement.contents];
      } else {
        return locals[replacement.contents].shift();
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