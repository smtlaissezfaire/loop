var jsp = require("uglify-js").parser;
var _ = require('./underscore');
var CodeFormatter = require('./code-formatter').codeFormatter;

var createSyntaxTree;
var collapseElseIfStatements;
var syntaxTreeToString;

var reverseCompiler = {};

var pushStatements = function(stmts, list) {
  _.each(stmts, function(stmt) {
    if (stmt) {
      list.contents.push(createSyntaxTree(stmt));
    }
  });
};

var _function = function(formalArguments, body) {
  var expr;

  formalArguments = {
    type: 'list',
    contents: _.map(formalArguments, function(arg) {
      return {
        type: 'id',
        contents: arg
      };
    })
  };

  expr = {
    type: 'list',
    contents: [
      { type: 'id', contents: 'lambda' },
      formalArguments
    ]
  };

  pushStatements(body, expr);

  return expr;
};

var isElseIf = function(args) {
  var elseStatement = args[2];
  return elseStatement && elseStatement[0] === 'if';
};

// check that all blocks are exactly one statement
var blocksAreOneStatement = function(args) {
  return _.none(args, function(arg) {
    if (arg[0] === 'block') {
      var blockStatements = arg[1];
      return blockStatements.length === 1;
    }
  });
};

var isIfExpression = function(args) {
  return !isElseIf(args) && blocksAreOneStatement(args);
};

var generateIfStatement = function(args) {
  var expr = {
    type: 'list',
    contents: [
      createSyntaxTree('if')
    ]
  };

  // if (x) { foo }
  // ["if",["name","x"],["block",[["stat",["name","foo"]]]]]

  var condition = args[0];
  var block = args[1];
  var blockStatements = block[1];
  var elseClause = args[2];

  expr.contents.push(createSyntaxTree(condition));

  pushStatements(blockStatements, expr);

  if (elseClause) {
    var elseStatements = elseClause[1];
    pushStatements(elseStatements, expr);
  }

  return expr;
};

// (cond (a (b))
//  (c (d))
//  (else (e)))
var generateCond = function(args) {
  var exprParts = collapseElseIfStatements(args);

  var expr = {
    type: 'list',
    contents: [
      createSyntaxTree('cond'),
    ]
  };

  var ifExpr = {
    type: 'list',
    contents: [
      createSyntaxTree(exprParts.if.expr),
    ]
  };

  pushStatements(exprParts.if.body, ifExpr);

  var elseIfStatements = _.map(exprParts.elseIfs, function(elseIf) {
    var elseIfStatement = {
      type: 'list',
      contents: [
        createSyntaxTree(elseIf.expr)
      ]
    };

    pushStatements(elseIf.body, elseIfStatement);

    return elseIfStatement;
  });

  var elseExpr;

  if (exprParts.else) {
    elseExpr = {
      type: 'list',
      contents: [
        createSyntaxTree('else')
      ]
    };

    pushStatements(exprParts.else.body, elseExpr);
  }

  expr.contents.push(ifExpr);

  _.each(elseIfStatements, function(stmt) {
    expr.contents.push(stmt);
  });

  if (elseExpr) {
    expr.contents.push(elseExpr);
  }

  return expr;
};


// {
//   if: { expr: expr, body: body },
//   elseIfs: [
//     { expr: expr, body: body },
//     ...
//   ],
//   else: {
//     body: body
//   }
// }
collapseElseIfStatements = function(args, collapsed) {
  if (!collapsed) {
    collapsed = {};
  }

  if (args[0] === 'if') {
    var ifExpr = args[1];
    var ifBody = args[2][1];
    var elseIfElse = args[3];

    var ifParts = {
      expr: ifExpr,
      body: ifBody
    };

    if (!collapsed.if) {
      collapsed.if = ifParts;
      collapsed.elseIfs = [];
    } else {
      collapsed.elseIfs.push(ifParts);
    }

    collapseElseIfStatements(elseIfElse, collapsed);
    return collapsed;
  } else if (args[0] === 'block') {
    var elseBlock = args[1];

    collapsed.else = {
      body: elseBlock
    };
  } else {
    throw new Error('Unknown error generating if statement');
  }
};

createSyntaxTree = function(statement) {
  var expr;

  if (statement instanceof Array) {
    // there are no explicit statements in loop!
    if (statement[0] === 'stat') {
      statement = statement[1];
    }

    var functionName = statement[0];
    var args = statement.slice(1);
    var key,
        value,
        contents,
        fun,
        formalArguments,
        body;

    switch (functionName) {
      case 'var':
        args = args[0];
        var isDefine = (args.length === 1 ? true : false);

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: isDefine ? 'define' : 'var' },
          ]
        };

        var pairs = _.map(args, function(arrayPair) {
          var name = createSyntaxTree(arrayPair[0]);
          var value;

          if (arrayPair[1]) {
            value = createSyntaxTree(arrayPair[1]);
          }

          var returnValue = {
            type: 'list',
            contents: [
              name
            ]
          };

          if (value) {
            returnValue.contents.push(value);
          }

          return returnValue;
        });

        if (isDefine) {
          var pair = pairs[0];
          _.each(pair.contents, function(el) {
            expr.contents.push(el);
          });
        } else {
          _.each(pairs, function(pair) {
            expr.contents.push(pair);
          });
        }

        break;
      case 'num':
        expr = {
          type: 'number',
          contents: statement[1]
        };

        break;
      case 'string':
        expr = {
          type: 'string',
          contents: statement[1]
        };

        break;
      case 'name':
        expr = {
          type: 'id',
          contents: args[0]
        };

        break;
      case 'assign':
        key = createSyntaxTree(statement[2]);
        value = createSyntaxTree(statement[3]);

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '=' },
            key,
            value
          ]
        };
        break;

      case 'dot':
        key = createSyntaxTree(statement[1]);
        value = createSyntaxTree(statement[2]);

        expr = {
          type: 'prop-access',
          key: key,
          value: value
        };

        break;

      case 'call':
        expr = {
          type: 'list',
          contents: []
        };

        pushStatements([args.shift()], expr);
        pushStatements(args[0], expr);
        break;
      case 'defun':
        var name = args[0];
        formalArguments = args[1];
        body = args[2];

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '=' },
            { type: 'id', contents: name },
            _function(formalArguments, body)
          ]
        };

        break;
      case 'function':
        formalArguments = args[1];
        body = args[2];

        expr = _function(formalArguments, body);
        break;
      case 'return':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'return' }
          ]
        };

        // TODO: Should there only be one arg here?
        pushStatements(args, expr);
        break;
      case 'binary':
      case 'unary-prefix':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: args.shift() }
          ]
        };

        pushStatements(args, expr);

        break;
      case 'if':
        if (isIfExpression(args)) {
          expr = generateIfStatement(args);
        } else {
          args.unshift(functionName);
          expr = generateCond(args);
        }

        break;
      case 'object':
        args = args[0];
        fun = {
          type: 'id',
          contents: '{}'
        };

        if (_.isEmpty(args)) {
          expr = fun;
        } else {
          expr = {
            type: 'list',
            contents: [
              fun
            ]
          };

          _.each(args, function(argPair) {
            // foo: 'bar' => [ 'foo', ['string', 'bar']]
            pushStatements(argPair, expr);
          });
        }

        break;
      case 'switch':
        condition = args.shift();
        args = args[0];

        var switchBody = _.map(args, function(caseOrDefault) {
          var cond = caseOrDefault.shift();
          var body = caseOrDefault;

          if (cond === null) { // default
            expr = {
              type: 'list',
              contents: [
                { type: 'id', contents: 'default' },
              ]
            };
          } else { // case
            expr = {
              type: 'list',
              contents: [
                { type: 'id', contents: 'case' },
                createSyntaxTree(cond)
              ]
            };
          }

          body = body[0];
          pushStatements(body, expr);
          return expr;
        });

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'switch' },
            createSyntaxTree(condition),
          ]
        };

        _.each(switchBody, function(e) {
          expr.contents.push(e);
        });

        break;
      case 'break':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'break' }
          ]
        };

        break;

      case 'throw':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'throw' },
            createSyntaxTree(args[0])
          ]
        };

        break;

      case 'new':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'new' }
          ]
        };

        var objectPrototype = args[0];
        var prototypeArgs = args[1];

        expr.contents.push(createSyntaxTree(objectPrototype));
        pushStatements(prototypeArgs, expr);

        break;

      case 'array':
        args = args[0];

        if (_.isEmpty(args)) {
          expr = {
            type: 'id', contents: '[]'
          };
        } else {
          expr = {
            type: 'list',
            contents: [
              { type: 'id', contents: '[]' }
            ]
          };

          pushStatements(args, expr);
        }

        break;

      case 'unary-postfix':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: args[0] },
            createSyntaxTree(args[1])
          ]
        };

        break;
      case 'conditional':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '?' },
            createSyntaxTree(args[0]),
            createSyntaxTree(args[1]),
            createSyntaxTree(args[2]),
          ]
        };

        break;

      case 'sub':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '[]' },
            createSyntaxTree(args[0]),
            createSyntaxTree(args[1])
          ]
        };
        break;
      case 'regexp':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '//' }
          ]
        };

        _.each(args, function(arg) {
          if (arg) {
            expr.contents.push({ type: 'string', contents: arg });
          }
        });

        break;

      case 'while':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'while' },
            createSyntaxTree(args.shift())
          ]
        };

        body = args[0];

        // skip the 'block'
        body = body[1];
        pushStatements(body, expr);

        break;
      case 'for':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'for' },
            {
              type: 'list',
              contents: [
                createSyntaxTree(args.shift()),
                createSyntaxTree(args.shift()),
                createSyntaxTree(args.shift()),
              ]
            }
          ]
        };

        // skip the 'block'
        args = args[0][1];

        pushStatements(args, expr);

        break;
      case 'try':
        var tryBody = args.shift();

        var catchBodyWithVar,
            catchVariable,
            catchBody;

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: 'try' }
          ]
        };

        pushStatements(tryBody, expr);

        if (!_.isEmpty(args)) {
          catchBodyWithVar = args.shift();

          catchVariable = catchBodyWithVar[0];
          catchBody = catchBodyWithVar[1];

          var catchStmt = {
            type: 'list',
            contents: [
              { type: 'id', contents: 'catch' },
              createSyntaxTree(catchVariable)
            ]
          };

          pushStatements(catchBody, catchStmt);
          expr.contents.push(catchStmt);
        }

        break;
      default:
        throw new Error("unknown type: " + functionName + "\n\nExpression: " + require("util").inspect(statement, null, 20));
    }
  } else if (typeof statement === 'string') {
    expr = {
      type: 'id',
      contents: statement
    };
  } else {
    throw new Error('unknown type of statement:', statement);
  }

  return expr;
};

var whitespace = function(num) {
  var str = '';
  var i;

  for (i = 0; i < num; i++) {
    str += ' ';
  }

  return str;
};

var indentAfterArgs = function(numberOfArgs, contents, formatter, options) {
  var i;

  for (i = 1; i <= numberOfArgs; i++) {
    syntaxTreeToString(contents.shift(), formatter, options);

    if (i !== numberOfArgs) {
      formatter.ws();
    }
  }

  if (!_.isEmpty(contents)) {
    formatter.newline();
    formatter.indent(function() {
      _.each(contents, function(stmt, index) {
        var isLast = index + 1 === contents.length;

        syntaxTreeToString(stmt, formatter, options);

        if (!isLast) {
          formatter.newline();
        }
      });
    });
  }
};

syntaxTreeToString = function(statement, formatter, options) {
  switch (statement.type) {
    case 'list':
      var contents = statement.contents;
      var usesCustomFormatter = false;
      var writesClosingParen = false;

      formatter.append('(');

      if (contents[0] && contents[0].type === 'id') {
        var id = contents[0];

        switch(id.contents) {
          case 'var':
            if (options.varAlignment) {
              usesCustomFormatter = true;

              // 'var'
              syntaxTreeToString(contents.shift(), formatter, options);
              formatter.ws();
              // first arg
              syntaxTreeToString(contents.shift(), formatter, options);

              // other args
              _.each(contents, function(statement) {
                formatter.newline();
                formatter.ws(5);
                syntaxTreeToString(statement, formatter, options);
              });
            }

            break;
          case 'define':
          case '=':
            if (options.defineIndentsLambda) {
              var secondArgLambda = contents[2] &&
                                    contents[2].type === 'list' &&
                                    contents[2].contents[0] &&
                                    contents[2].contents[0].type === 'id' &&
                                    contents[2].contents[0].contents === 'lambda';

              if (secondArgLambda) {
                usesCustomFormatter = true;
                writesClosingParen = true;

                indentAfterArgs(2, contents, formatter, options);

                formatter.append(')');

                if (!options.isLast) {
                  formatter.newline();
                }
              }
            }

            break;
          case 'lambda':
            if (options.lambdaIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(2, contents, formatter, options);
            }
            break;
          case 'if':
            if (options.ifIndentation) {
              usesCustomFormatter = true;
              writesClosingParen = true;

              indentAfterArgs(2, contents, formatter, options);
              formatter.append(')');

              if (!options.isLast) {
                formatter.newline();
              }
            }
            break;
          case 'for':
            if (options.forIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(2, contents, formatter, options);
            }
            break;
          case 'try':
            if (options.tryIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(1, contents, formatter, options);
            }
            break;
          case 'catch':
            if (options.catchIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(2, contents, formatter, options);
            }
            break;
          case 'switch':
            if (options.switchIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(2, contents, formatter, options);
            }
            break;
          case 'case':
            if (options.caseIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(2, contents, formatter, options);
            }
            break;
          case 'default':
            if (options.defaultIndentation) {
              usesCustomFormatter = true;
              indentAfterArgs(1, contents, formatter, options);
            }
            break;
          // default:
        }
      }

      if (!usesCustomFormatter) {
        _.each(contents, function(el, index) {
          var last = index + 1 === contents.length;

          syntaxTreeToString(el, formatter, options);

          if (!last) {
            formatter.ws();
          }
        });
      }

      if (!writesClosingParen) {
        formatter.append(')');
      }

      break;
    case 'prop-access':
      // TODO: handle values that don't fit into typical dot syntax
      syntaxTreeToString(statement.key, formatter, options);
      formatter.append('.');
      syntaxTreeToString(statement.value, formatter, options);

      break;
    case 'string':
      // TODO: better way to do this?  Polyfill for String#quote?
      // See: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/quote
      formatter.append(JSON.stringify(statement.contents));
      break;
    case 'id':
    case 'number':
      formatter.append(statement.contents);
      break;
    default:
      throw new Error('unknown statement type: ' + statement.type);
  }
};

reverseCompiler.compile = function(jsSource, options) {
  if (!options) {
    options = {};
  }

  options = _.extend({
    varAlignment: true,
    defineIndentsLambda: true,
    lambdaIndentation: true,
    ifIndentation: true,
    forIndentation: true,
    tryIndentation: true,
    catchIndentation: true,
    switchIndentation: true,
    caseIndentation: true,
    defaultIndentation: true
  }, options);

  var jsp = require("uglify-js").parser;

  var parsedJsSource = jsp.parse(jsSource);
  if (parsedJsSource[0] !== 'toplevel') {
    throw new Error('can only reverse compile from top level js');
  }

  var statements = parsedJsSource.slice(1)[0];

  statements = _.map(statements, function(statement) {
    return createSyntaxTree(statement);
  });

  var codeFormatter = new CodeFormatter();

  _.each(statements, function(statement, index) {
    var last = index + 1 === statements.length;

    syntaxTreeToString(statement, codeFormatter, _.extend({
      isLast: last
    }, options));

    if (!last) {
      codeFormatter.newline();
    }
  });

  return codeFormatter.toString();
};

module.exports = reverseCompiler;