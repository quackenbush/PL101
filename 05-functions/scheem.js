// Basic Scheem parser, using PEG.js

var DEBUG    = false;
var SELFTEST = true;

var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');
if (DEBUG)
{
    // Print the PEG grammar
    console.log(data);
}

// Scheem parser
var scheem_parse = PEG.buildParser(data).parse;

if (SELFTEST)
{
    var selftest = require('./scheem-selftest.js');
    selftest.scheem_selftest(scheem_parse);
}

var scheem_eval = require('./scheem-eval.js');
var scheem_eval_string = function(str, env) {
    return scheem_eval.eval(scheem_parse(str), env);
};

console.log(scheem_eval.eval(['+', 101, 42], {}));

var scheem_test = function() {
    var TESTS = [
        // Arithmetic
        ["(+ 4 2)",
         6],

        ["(- (* 3 7) 6)",
         (7 * 3) - 6],

        // Conditionals
        ["(if (> 3 4) 9 5)",
         5],

        ["(if (> 4 3) 9 5)",
         9],

        // Variables
        ["'foo",
         "foo"],

        ["(define foo 3)",
         0],

        // begin
        ["(begin (define foo 3) (set! foo (* foo 2)) (+ foo 4))",
         (3*2)+4],

        ["(begin (define bar '(+ 3 4)) bar)",
         ['+', 3, 4]],

        ["(begin (defun double (x) (* 2 x)) (double 4))",
         8],

        ["(begin (defun square (x) (* x x)) (square (square 4)))",
         (4*4)*(4*4)],

        ["(begin (defun abs (x) (if (> x 0) x (- 0 x))) (abs -123))",
         123],

        ["(begin (defun abs (x) (if (> x 0) x (- 0 x))) (abs 234))",
         234],

        ];

    var i;
    var num_tests = TESTS.length;
    for (i = 0; i < num_tests; i++)
    {
        var test = TESTS[i];
        var input = test[0];
        var expected = test[1];
        var actual;

        console.log("Test " + (i + 1) + " / " + num_tests + ": " + input);
        actual = scheem_eval_string(input, {});
        assert.deepEqual(actual, expected);
    }

    console.log("----------------------------------------");
    console.log("" + num_tests + " scheem tests PASSed");
};

scheem_test();

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.scheem_eval_string = scheem_eval_string;
    module.exports.scheem_eval = scheem_eval;
}
