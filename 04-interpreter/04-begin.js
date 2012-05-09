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

        case 'begin':
            //newEnv = env.slice();
            var i;
            var result;

            for (i = 1; i < expr.length; i++)
            {
                result = evalScheem(expr[i], env);
            }
            return result;

        default:
            assert.fail("Op [" + expr[0] + "] not implemented");
    }
};

var ENV = {x: 42,
           y: 2};

var prg = ['begin',
           ['define', 'x', 5],
           ['set!', 'x', ['+', 'x', 1]],
           ['+', 2, 'x']];

var TESTS = [
    [ENV,
     prg,
     8],

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
