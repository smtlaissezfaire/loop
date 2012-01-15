var vows = require("vows");
var assert = require("assert");
var CodeFormatter = require(__dirname + "/../../lib/loop/code-formatter").codeFormatter;

vows.describe("whitespace formatting").addBatch({
  'it should be empty by default': function() {
    formatter = new CodeFormatter({});
    assert.equal(formatter.toString(), '');
  },

  'it should be able to add text': function() {
    formatter = new CodeFormatter({});
    formatter.append('foo');
    assert.equal(formatter.toString(), 'foo');
  },

  'it should be able to add newlines': function() {
    formatter = new CodeFormatter({});
    formatter.newline();
    assert.equal(formatter.toString(), '\n');
  },

  'it should be able to one level of indentation': function() {
    formatter = new CodeFormatter({});
    formatter.append('foo');
    formatter.newline();
    formatter.indent();
    formatter.append('bar');
    formatter.newline();
    formatter.append('baz');

    var expected = '';
    expected += 'foo\n';
    expected += '  bar\n';
    expected += '  baz';

    assert.equal(formatter.toString(), expected);
  },

  'it should not add indentation with multiple appends': function() {
    formatter = new CodeFormatter({});
    formatter.indent();
    formatter.append('foo');
    formatter.append('bar');

    var expected = '';
    expected += '  foobar';

    assert.equal(formatter.toString(), expected);
  },

  'it should be able to indent + outdent': function() {
    formatter = new CodeFormatter({});
    formatter.indent();
    formatter.append('foo');
    formatter.indent();
    formatter.newline();
    formatter.append('bar');
    formatter.outdent();
    formatter.newline();
    formatter.append('baz');

    var expected = '';
    expected += '  foo\n';
    expected += '    bar\n';
    expected += '  baz';

    assert.equal(formatter.toString(), expected);
  },

  'it should be able to use custom indentation marks': function() {
    formatter = new CodeFormatter({
      indentationMark: '\t'
    });
    formatter.indent();
    formatter.append('foo');
    formatter.indent();
    formatter.newline();
    formatter.append('bar');
    formatter.outdent();
    formatter.newline();
    formatter.append('baz');

    var expected = '';
    expected += '\tfoo\n';
    expected += '\t\tbar\n';
    expected += '\tbaz';

    assert.equal(formatter.toString(), expected);
  },

  'it should be able to force whitespace': function() {
    formatter = new CodeFormatter();
    formatter.append('foo');
    formatter.ws();
    formatter.append('bar');
    formatter.ws(3);
    formatter.append('end');

    var expected = '';
    expected += 'foo bar   end';

    assert.equal(formatter.toString(), expected);
  },

  'it should indent indent + outdent when indent is given a block': function() {
    formatter = new CodeFormatter();
    formatter.indent(function() {
      formatter.append('foo');
    });
    formatter.newline();
    formatter.append('bar');

    var expected = '';
    expected += '  foo\n';
    expected += 'bar';

    assert.equal(formatter.toString(), expected);
  }
}).export(module);
