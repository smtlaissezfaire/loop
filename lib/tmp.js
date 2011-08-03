var Tokenizer = require('tokenizer');
var t = new Tokenizer();
t.on('token', function(token, type) {
    console.log('%s(%s)', token, type);
});
t.addRule(/^f$/, 'whitespace');

var o = {
    coucou: 'salut',
    complicated: "haha 안녕,; :! {fdf} ' \' \" ",
    nombre: 8,
    bool: false,
    gn: null,
    oo: {
        a: [
            'coucou',
            888.3,
            false
        ]
    }
}

var str = "f";
console.log('parsing %s', str);
t.write(str);
