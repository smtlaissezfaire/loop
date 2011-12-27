# Loop

Loop is a scheme-ish language which compiles to javascript.

It's javascript, but with parentheses (and hence hygenic macros).

## WARNING

This is still super-alpha software.  Don't use it!

## Dependencies:

    node
    npm

## Installation:

    npm install -g jake
    npm install -g jison
    npm install -g vows@0.5.13
    jake deps

## Tests

Install dependencies, (as above), and run:

    jake

## Syntax

Proposed syntax:

    7                           => 7
    "foo"                       => "foo"
    'foo'                       => 'foo'
    [1,2,3]                     => [1 2 3]
    foo                         => foo
    foo()                       => (foo)
    function() { x + x }        => (function () (+ x x))
                                => (lambda () (+ x x))

    x = 10                      => (= x 10)
    var x = 10                  => (var (x 10))
                                => (define x 10)

    var x,                      => (var (x)
        y = 20                          (y 20))

    foo.bar                     => foo.bar
    foo.bar = 10                => (= foo.bar 10)

    foo['bar']                  => ([] foo 'bar')
    foo['bar'] = 10             => (= ([] foo 'bar') 10)

    foo.bar()                   => (foo.bar)
    foo = {}                    => (= foo {})
    { a: 'b', c: 'd' }          => { a 'b' c 'd' }
    [1,2,3,4]                   => [ 1 2 3 4 ]
    x[2]                        => ([] x 2)

    a && b                      => (&& a b)
    a || b                      => (|| a b)

    /a.*b/                      => /a.*b/

    new Object(1,2,3)           => (new Object 1 2 3)

    if (x) { y() }              => (if x
                                      (y))

    switch (foo.bar) {          => (switch foo.bar
      case 'one':                    (case 'one'
        console.log('one');             (console.log 'one')
        break;                          (break))
      default:                       (default
        console.log('default');         (console.log 'default)))
    }
