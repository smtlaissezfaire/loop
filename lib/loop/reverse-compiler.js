var jsp = require("uglify-js").parser;
var _ = require('./underscore');

var createSyntaxTree;

var reverseCompiler = {};

var _function = function(formalArguments, body) {
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

  _.each(body, function(e) {
    expr.contents.push(createSyntaxTree(e));
  });

  return expr;
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
        contents = [];

        fun = createSyntaxTree(args.shift());
        var convertedArgs = _.map(args[0], function(arg) {
          return createSyntaxTree(arg);
        });

        contents.push(fun);
        _.each(convertedArgs, function(arg) {
          contents.push(arg);
        });

        expr = {
          type: 'list',
          contents: contents
        };

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
        contents = [
          {
            type: 'id',
            contents: 'return'
          }
        ];

        // TODO: Should there only be one arg here?
        _.each(args, function(arg) {
          if (arg !== null) {
            contents.push(createSyntaxTree(arg));
          }
        });

        expr = {
          type: 'list',
          contents: contents
        };

        break;
      case 'binary':
        fun = {
          type: 'id',
          contents: args.shift()
        };

        contents = [ fun ];

        _.each(args, function(arg) {
          contents.push(createSyntaxTree(arg));
        });

        expr = {
          type: 'list',
          contents: contents
        };

        break;
      case 'unary-prefix':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: args[0] },
            createSyntaxTree(args[1])
          ]
        };

        break;
      case 'if':
        expr = {
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

        expr.contents.push(createSyntaxTree(condition));

        _.each(blockStatements, function(stmt) {
          expr.contents.push(createSyntaxTree(stmt));
        });

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
            _.each(argPair, function(el) {
              expr.contents.push(createSyntaxTree(el));
            });
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
          body = _.map(body, function(stmt) {
            return createSyntaxTree(stmt);
          });

          _.each(body, function(e) {
            expr.contents.push(e);
          });

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
        _.each(prototypeArgs, function(arg) {
          expr.contents.push(createSyntaxTree(arg));
        });

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

          _.each(args, function(arg) {
            expr.contents.push(createSyntaxTree(arg));
          });
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

        _.each(body, function(arg) {
          expr.contents.push(createSyntaxTree(arg));
        });

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

var syntaxTreeToString = function(statement, options) {
  switch (statement.type) {
    case 'list':
      var contents = statement.contents;
      var inner;

      var mappedStatements = _.map(contents, function(el) {
        return syntaxTreeToString(el);
      });

      if (contents[0] && contents[0].type === 'id') {
        var id = contents[0];

        if (id.contents === 'var') {
          if (options.varAlignment) {
            // 'var'
            inner = mappedStatements.shift();
            inner += ' ';
            // first arg
            inner += mappedStatements.shift();

            // other args
            _.each(mappedStatements, function(statement) {
              inner += "\n";
              inner += whitespace(5);
              inner += statement;
            });
          }
        }
      }

      if (!inner) {
        inner = mappedStatements.join(' ');
      }

      return "(" + inner + ")";
    case 'prop-access':
      // TODO: handle values that don't fit into typical dot syntax
      return syntaxTreeToString(statement.key) + "." + syntaxTreeToString(statement.value);
    case 'string':
      // TODO: better way to do this?  Polyfill for String#quote?
      // See: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/quote
      return JSON.stringify(statement.contents);
    case 'id':
    case 'number':
      return statement.contents;
    default:
      throw new Error('unknown statement type: ' + statement.type);
  }
};

reverseCompiler.compile = function(jsSource, options) {
  if (!options) {
    options = {};
  }

  options = _.extend({
    varAlignment: true
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

  return _.map(statements, function(statement) {
    return syntaxTreeToString(statement, options);
  }).join('\n');
};

module.exports = reverseCompiler;