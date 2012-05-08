var assert = require('assert');

var evalScheem = function (expr) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1]) + evalScheem(expr[2]);
        case '-':
            return evalScheem(expr[1]) - evalScheem(expr[2]);
        case '*':
            return evalScheem(expr[1]) * evalScheem(expr[2]);
        case '/':
            return evalScheem(expr[1]) / evalScheem(expr[2]);
    }
};

var TESTS = [
    [['+', 12, 24],  36],
    [['/', 64, 4],   16],
    [['-', 12, 24],  -12],
    [['*', 8, -3],   -24],
    ];

var i;
var num_tests = TESTS.length;
for (i = 0; i < num_tests; i++)
{
    var test = TESTS[i];
    console.log("Test " + (i + 1) + " / " + num_tests + ": " + test[0]);
    var actual = evalScheem(test[0]);
    var expected = test[1];
    assert.deepEqual(actual, expected);
}

console.log("" + num_tests + " tests PASSed");
