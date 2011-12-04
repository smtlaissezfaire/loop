h1. Loop

Dependencies:

    node
    npm

Installation:

    jake deps

Syntax:

  - loop convenience macros / libraries / special "syntax"
    ??? (TODO)

  - loop macros
    ??? (TODO)
      - let

  - loop as loop (nothing new to the JS language - just a straight translation)
    7                           => 7
    "foo"                       => "foo"
    [1,2,3]                     => ([] 1 2 3)
    foo                         => foo
    foo()                       => (foo)
    function() { x + x }        => (function () (+ x x))
    foo.bar                     => foo.bar
    foo['bar']                  => ??? (TODO)
    foo.bar = 10                => (= foo.bar 10)
    foo['bar'] = 10             => ??? (TODO)
    foo.bar()                   => (foo.bar)
    foo = {}                    => (= foo ({})) (change me?)
    { foo: 'bar' }              => ({} foo 'bar')
    x = 10                      => (= x 10)   (???)
    var x = 10                  => (var (= x 10)) (macro?) (??? should this be: (var x 10))

======================================

Layers:
  (javascript on the left, transformation on the right of the =>)

  parser => tokens (straightforward representation of syntax)

  Each phase deals with json, but can also produce lisp-ish syntax

  1. Program

      ((lambda () (+ x x)))

      equivalent in js: (function() { x + x }())

  2. jison Parser spits out representation in json: - DONE (sort of)

      {
        type: 'list',
        contents: [
          {
            type: 'list',
            contents: [
              { type: 'id', contents: 'lambda' },
              { type: 'list', contents: [] },
              {
                type: 'list',
                contents: [
                  { type: 'id', contents: '+'},
                  { type: 'id', contents: 'x'},
                  { type: 'id', contents: 'x'}
                ]
              }
            ]
          }
        ]
      }

    equivalent syntax in loop:

      (list
        (list
          (id lambda)
          (list)
          (list
            (id +)
            (id x)
            (id x))))

  3. Syntax tree gets "eval'ed" from pure syntax to have "meaning":  - DONE (sort of)

    (notice that (lambda () ...) is actually still considered a function call)

    {
      type: funcall,
      function: {
        type: 'funcall',
        function: { type: 'id', contents: 'lambda' },
        arguments: [
          {
            type: 'list',
            arguments: []
          }
          {
            type: 'list',
            arguments: [
              {
                type: 'funcall',
                function: { type: 'id', contents: '+' },
                arguments: [
                  { type: 'id', contents: 'x' },
                  { type: 'id', contents: 'x' }
                ]
              }
            ]
          }
        ]
      },
      arguments: { type: 'list', contents: [] },
    }

    (funcall
      (funcall
        (id 'lambda')
        (list)
        (list
          (funcall
            (id +)
            ((id x)
             (id x)))))
      ())


    Equivalent:

    (funcall
      'lambda
      (list)
      (list
        'funcall
        '+
        (list
          (id x)
          (id x))))

  4. Syntax tree undergoes transformations to get it into an equivalent uglify syntax:

    (notice that built in statements like + which were previously considered functions are here converted to binary, unary, etc for js)

    ["toplevel",
      [
        ["stat",
          ["call",
            ["function", null, [],
              [["stat",
                ["binary","+",
                  ["name","x"],
                  ["name","x"]]]]],
             []]]]]


  - loop syntax tree as lisp structure =>
    7                                                        => 7
    "foo"                                                    => "foo"
    ([] 1 2 3)                                               => [1,2,3]
    foo                                                      => foo
    (foo)                                                    => foo()
    (function () (+ x x))                                    => function() { x + x }
    foo.bar                                                  => foo.bar
    ??? (TODO)                                               => foo['bar']
    (= foo.bar 10)                                           => foo.bar = 10
    ??? (TODO)                                               => foo['bar'] = 10
    (foo.bar)                                                => foo.bar()
    (= foo ({})) (change me?)                                => foo = {}
    ({} foo 'bar')                                           => { foo: 'bar' }
    (= x 10)   (???)                                         => x = 10
    (var (= x 10)) (macro?) (??? should this be: (var x 10)) => var x = 10


  - loop syntax tree as

  - bridge: convert lisp syntax tree to objects:
    (number 7) => { type: 'number', contents: a7 }
    (list 'foo') => { type: 'list', contents: [ { type: 'string', contents: 'foo' }] }
    (funcall
       (function null () (...body...)
       (list))) =>

        {
          type: 'funcall',
          contents: [
            {
              type: 'funcall',
              contents: {
                { type: 'null'}
                { type: 'list', contents: [] }
                { type: 'list', contents: [....body contents ....]}
              }
            },
            {
              type: 'list',
              contents: []
            }
          ]
        }

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
