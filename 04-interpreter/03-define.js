var assert = require('assert');

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
        case '-':
            return evalScheem(expr[1], env) - evalScheem(expr[2], env);
        case '*':
            return evalScheem(expr[1], env) * evalScheem(expr[2], env);
        case '/':
            return evalScheem(expr[1], env) / evalScheem(expr[2], env);
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

var TESTS = [
    [ENV,
     ['+', 'x', 18],
     60],

    [ENV,
     ['/', 'x', 2],
     21],

    [ENV,
     ['-', 12, 'x'],
     -30],

    [ENV,
     ['*', 'y', 'x'],
     84],

    [ENV,
     ['define', 'nizzle', ['*', 42, 6]],
     0],

    [ENV,
     ['+', 'nizzle', 'nizzle'],
     42*6*2],

    [ENV,
     ['set!', 'nizzle', 9],
     0],

    [ENV,
     ['+', 'nizzle', 0],
     9],

    ];

var i;
var num_tests = TESTS.length;
for (i = 0; i < num_tests; i++)
{
    var test = TESTS[i];
    console.log("Test " + (i + 1) + " / " + num_tests + ": " + test[1]);
    var actual = evalScheem(test[1], test[0]);
    var expected = test[2];
    assert.deepEqual(actual, expected);
}

console.log("" + num_tests + " tests PASSed");
