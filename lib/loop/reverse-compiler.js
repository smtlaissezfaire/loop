var jsp = require("uglify-js").parser;
var _ = require('./underscore');

var reverseCompiler = {};

var createSyntaxTree = function(statement) {
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
        fun;

    switch (functionName) {
      case 'var':
        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: functionName },
          ]
        };

        args = args[0];

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

        _.each(pairs, function(pair) {
          expr.contents.push(pair);
        });

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

      case 'function':
        var name = args[0];
        var formalArguments = args[1];
        var body = args[2];

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
          contents.push(createSyntaxTree(arg));
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
      default:
        throw new Error("unknown type: " + functionName);
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

var syntaxTreeToString = function(statement) {
  switch (statement.type) {
    case 'list':
      var inner = _.map(statement.contents, function(el) {
        return syntaxTreeToString(el);
      });

      return "(" + inner.join(" ") + ")";
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

reverseCompiler.compile = function(jsSource) {
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
    return syntaxTreeToString(statement);
  }).join('\n');
};

module.exports = reverseCompiler;