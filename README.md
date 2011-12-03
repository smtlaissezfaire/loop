h1. Loop

Dependencies:

    node
    npm install vows -g
    npm install jake -g
    npm install jslint -g
    npm install async
    npm install jison

TODO:
  - move to packages.json

Layers:
  - loop program
  - loop conveniences
  - loop syntax tree
  - javascript syntax tree
  - raw javascript (pretty printed)
  - uglify javascript (compressed)

Loop principles:

  base translator:
    - write javascript in scheme/lisp syntax
    - no differences from regular javascript
    - except macros!

  Loop additional packages:
    - cleanup ugly parts of javascript
    - prototypes as first class principle - use real js prototypes
