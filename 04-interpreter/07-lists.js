var assert = require('assert');
var SCHEEM_T = '#t';
var SCHEEM_F = '#f';

var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1], env) + evalScheem(expr[2], env);

        case 'cons':
            return [evalScheem(expr[1])].concat(evalScheem(expr[2]));

        case 'car':
            return evalScheem(expr[1])[0];

        case 'cdr':
            return evalScheem(expr[1]).slice(1);

        case 'quote':
            return expr[1];

        case 'define':
        case 'set!':
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;

        default:
            assert.fail("Op [" + expr[0] + "] not implemented");
    }
};

var ENV = {x: 42,
           y: 2};

var prg = ['car',
           ['quote', ['+', '1', '2']]];

var prg2 = ['car', ['cdr',
                    ['quote', ['+', '1', '2']]]];

var prg3 = ['cons', 1, ['quote', [2, 3]]];

var prg4 = ['cons', ['quote', ['1', '2']], ['quote', ['3', '4']]];

console.log("Result: " + evalScheem(prg, ENV));
console.log("Result2: " + evalScheem(prg2, ENV));
console.log("Result3: " + evalScheem(prg3, ENV));
console.log("Result4: " + evalScheem(prg4, ENV));
