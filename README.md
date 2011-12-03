h1. Loop

Dependencies:

    node
    npm

Installation:

    jake deps

Layers:
  (javascript on the left, transformation on the right of the =>)

  - loop convenience macros / libraries / special "syntax"
    ??? (TODO)

  - loop macros
    ??? (TODO)

  - loop as loop (nothing new to the JS language - just a straight translation)
    7 => 7
    "foo" => "foo"
    [1,2,3] => ([] 1 2 3)
    foo => foo
    foo() => (foo)
    (function() { x + x }()) => (function () (+ x x))
    foo.bar           => foo.bar
    foo['bar']        => ??? (TODO)
    foo.bar = 10      => (= foo.bar 10)
    foo['bar'] = 10   => ??? (TODO)
    foo.bar()         => (foo.bar)
    foo = {}          => (= foo ({})) (change me?)
    { foo: 'bar' }    => ({} foo 'bar')

  - loop syntax tree as lisp structure =>
    (only primitives: list, atoms, strings?)
      7 => (number '7')
      "foo" => (string 'foo')
      [1, 2, 3] => (list (number '1') (number '2') (number '3'))
      foo (an identifer) => (id "foo")
      function foo() {} => (function (id 'foo') (..arguments..) (..body..))
      foo() => (funcall (id 'foo') (list))
      (function() { x + x }()) =>
        (funcall
          (function null () (...body...)
          (list)))
      foo.bar => (property-get (id 'foo') (id 'bar'))
      foo.bar = 10 (property-set (id 'foo') (id 'bar') (number '10'))
      foo['bar'] = 10  ... same ...
      {} => (object-create (list))
      { foo: 'bar' } => (object-create (list (id: 'foo') (name: 'bar')))

  - loop syntax tree as js tokens:
      7       => { type: 'number', contents: 7 }
      "foo"   => { type: 'string', contents: 'foo'}
      [1,2,3] => {
        type: 'list',
        contents: [
          { type: number, contents: 1 },
          { type: number, contents: 2 },
          { type: number, contents: 3 }
        ]
      }
      foo => { type: id, contents: 'foo' }
      function foo() {} => {
        type: 'function',
        name: 'foo',
        formalArguments: [],
        contents: [...body...]
      }
      foo() => {
        type: 'funcall'
        reference: { type: 'id', name: 'foo'},
        arguments: []
      }
      (function() { x + x; }()) => {
        type: 'funcall',
        arguments: [],
        reference: {
          type: 'function',
          name: null,
          formalArguments: [],
          contents: [...body...]
        }
      }
      foo.bar => {
        type: 'property-get',
        object: { id: 'foo' }
        key: { id: 'bar' }
      }
      foo.bar = 10 => {
        type: 'property-set',
        object: { id: 'foo' }
        key: { id: 'bar' }
        value: { number: 10 }
      }
      {} => {
        type: 'object',
        contents: []
      }
      { foo: 'bar' } => {
        type: 'object'
        contents: [
          { id: 'foo' },
          { string: 'bar' }
        ]
      }

  - uglify token stream:
      7 => ["stat", ["num", 1]]
  - javascript syntax tree (through uglify.parse(tokens))
  - raw javascript (pretty printed, through uglify)
  - uglify javascript (compressed) - DONE (loop.compress(js))

Loop principles:

  base translator:
    - write javascript in scheme/lisp syntax
    - no differences from regular javascript
    - except macros!

  Loop additional packages:
    - cleanup ugly parts of javascript
    - prototypes as first class principle - use real js prototypes
