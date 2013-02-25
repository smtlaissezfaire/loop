var _ = require('underscore');
var helpers = require('./util/helpers');
var car = helpers.car;
var cdr = helpers.cdr;

// forward declarations
var loopEval;

var loopEvalCollection = function(array) {
  return _.map(array, function(node) {
    return loopEval(node);
  });
};

var loopEval = function(syntaxTree) {
  var contents = syntaxTree.contents;

  switch (syntaxTree.type) {
    case 'list':
      if (contents.length === 0) {
        throw new Error("list of length 0!");
      }

      var firstToken = car(contents);
      var remainingTokens = cdr(contents);

      if (firstToken.type === 'list') {
        return {
          type: 'funcall',
          function: loopEval(car(contents)),
          arguments: {
            type: 'list',
            contents: loopEvalCollection(cdr(contents))
          }
        };
      }

      var body;

      if (firstToken.type === 'prop-access') {
        body = loopEvalCollection(remainingTokens);

        return {
          type: 'funcall',
          function: loopEval(firstToken),
          arguments: {
            type: 'list',
            contents: body
          }
        };
      } else if (firstToken.contents === 'lambda') {
        var formalArgs = car(remainingTokens);
        body = loopEvalCollection(cdr(remainingTokens));

        return {
          type: 'funcall',
          function: firstToken,
          arguments: {
            type: 'list',
            contents: [
              formalArgs,
              {
                type: 'list',
                contents: body
              }
            ]
          }
        };
      } else { // user defined or built in function
        body = loopEvalCollection(remainingTokens);

        return {
          type: 'funcall',
          function: firstToken,
          arguments: {
            type: 'list',
            contents: body
          }
        };
      }
    case 'prop-access':
      var key = contents.key;
      var value = contents.value;

      return {
        type: 'prop-access',
        key: loopEval(key),
        value: loopEval(value)
      };
    case 'id':
    case 'string':
    case 'number':
    case 'comment':
    case 'regexp':
    case '__raw_js__':
      return syntaxTree;
    default:
      throw new Error('unknown type of syntaxTree, type: ' + syntaxTree.type);
  }
};

module.exports = function(branches) {
  return _.map(branches, function(branch) {
    return loopEval(branch);
  });
};