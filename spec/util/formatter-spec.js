var vows = require("vows");
var assert = require("assert");
var CodeFormatter = require(__dirname + "/../../lib/loop/util/code-formatter").codeFormatter;

vows.describe("formatter spec - defining columns").addBatch({
  'it should be able to write two columns, and set a divider': function() {
    var cf = new CodeFormatter();
    cf.column(1, function() {
      cf.append('foo');
    });

    cf.column(2, function() {
      cf.append('bar');
    });

    assert.equal(cf.toString(), "foo | bar");
  },

  'it should do multiple lines': function() {
    var cf = new CodeFormatter();
    cf.column(1, function() {
      cf.append('foo');
      cf.newline();
      cf.append('bar');
      cf.newline();
      cf.append('baz');
    });

    cf.column(2, function() {
      cf.append('foo');
      cf.newline();
      cf.append('bar');
      cf.newline();
      cf.append('baz');
    });

    var expectedString = '';
    expectedString += "foo | foo\n";
    expectedString += "bar | bar\n";
    expectedString += "baz | baz";

    assert.equal(cf.toString(), expectedString);
  },

  'it should use the longest line': function() {
    var cf = new CodeFormatter();
    cf.column(1, function() {
      cf.append('foo');
      cf.newline();
      cf.append('bar');
      cf.newline();
      cf.append('baz');
    });

    cf.column(2, function() {
      cf.append('foo');
    });

    var expectedString = '';
    expectedString += "foo | foo\n";
    expectedString += "bar |    \n";
    expectedString += "baz |    ";

    assert.equal(cf.toString(), expectedString);
  },

  'it should use the longest line if the second line is longer': function() {
    var cf = new CodeFormatter();
    cf.column(1, function() {
      cf.append('foo');
      cf.newline();
      cf.append('bar');
    });

    cf.column(2, function() {
      cf.append('foo');
      cf.newline();
      cf.append('bar');
      cf.newline();
      cf.append('baz');
    });

    var expectedString = '';
    expectedString += "foo | foo\n";
    expectedString += "bar | bar\n";
    expectedString += "    | baz";

    assert.equal(cf.toString(), expectedString);
  },

  'it should use variable length columns': function() {
    var cf = new CodeFormatter();
    cf.column(1, function() {
      cf.append('one');
      cf.newline();
      cf.append('one two three');
    });

    cf.column(2, function() {
      cf.append('foo');
      cf.newline();
      cf.append('foo bar');
      cf.newline();
      cf.append('baz');
    });

    var expectedString = '';
    expectedString += "one           | foo    \n";
    expectedString += "one two three | foo bar\n";
    expectedString += "              | baz    ";

    assert.equal(cf.toString(), expectedString);
  }
}).export(module);