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

        case '<':
            return evalScheem(expr[1], env) < evalScheem(expr[2], env) ? SCHEEM_T : SCHEEM_F;

        case 'if':
            var term = evalScheem(expr[1], env);
            if (term === SCHEEM_T)
                return evalScheem(expr[2], env);
            else
                return evalScheem(expr[3], env);

        default:
            assert.fail("Op [" + expr[0] + "] not implemented");
    }
};

var ENV = {x: 42,
           y: 2};

var prog = ['if', ['<', 'x', 5], 3, 10];

console.log("Result: " + evalScheem(prog, ENV));
