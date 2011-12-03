h1. Loop

Dependencies:

    node
    npm

Installation:

    jake deps

Layers:
  - loop program
  - loop conveniences
  - loop syntax tree
  - javascript syntax tree
  - raw javascript (pretty printed)
  - uglify javascript (compressed) - DONE (loop.compress(js))

Loop principles:

  base translator:
    - write javascript in scheme/lisp syntax
    - no differences from regular javascript
    - except macros!

  Loop additional packages:
    - cleanup ugly parts of javascript
    - prototypes as first class principle - use real js prototypes
