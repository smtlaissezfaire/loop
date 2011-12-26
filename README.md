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

I'm not providing any explicit examples of syntax right now, because this is still super alpha.

If you are curious, dig through:

    spec/compile-integration-spec.js
    spec/integration/macro-spec.js