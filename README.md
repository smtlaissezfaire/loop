h1. Loop

Dependencies:

    node
    npm

Installation:

    jake deps

Syntax:

  - loop convenience macros / libraries / special "syntax",
    macros
      - forward declarations
      - let (macro)
      - better object prototypes / inheritence ?
      - ???

  - base:
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
  Each phase deals with js / json, but can also produce lisp-ish syntax

  1. Program

      ((lambda () (+ x x)))

      equivalent in js: (function() { x + x })()

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

  4. Syntax tree undergoes transformations to get it into an equivalent uglify syntax: - DONE (sort of)

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
