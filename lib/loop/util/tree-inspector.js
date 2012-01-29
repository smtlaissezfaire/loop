var _ = require('./underscore');
var CodeFormatter = require('./code-formatter').codeFormatter;

var treeInspector = {};

treeInspector.fullInfo = function(tree) {
  return require('util').inspect(tree, null, 20);
};

var writeLine = function(tree, formatter) {
  formatter.ws(2);
  formatter.append('(' + tree.sourceInfo.first_line + ":" + tree.sourceInfo.first_column + ')');
};

var withLineNumbers = function(tree, formatter, isLast) {
  if (typeof formatter === 'undefined') {
    formatter = new CodeFormatter();
    formatter.newline();
  }

  if (tree.type === 'list') {
    var anyLists = _.any(tree.contents, function(el) {
      return el.type === 'list';
    });

    if (anyLists) {
      writeLine(tree, formatter);
      formatter.append('[');
      formatter.newline();
      formatter.indent(function() {
        _.eachWithLastBool(tree.contents, function(el, index, isLast) {
          withLineNumbers(el, formatter, isLast);
          formatter.newline();
        });
      });
      formatter.append(']');
    } else {
      writeLine(tree, formatter);
      formatter.append('[');
      _.eachWithLastBool(tree.contents, function(el, index, isLast) {
        withLineNumbers(el, formatter, isLast);
      });
      formatter.append(']');
    }
  } else {
    formatter.append(tree.contents);

    if (!isLast) {
      formatter.ws();
    }
  }

  return formatter.toString();
};

treeInspector.withLineNumbers = withLineNumbers;

module.exports = treeInspector;