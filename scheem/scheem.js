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

function scheem_eval_string (str, env) {
    return scheem_eval.eval(scheem_parse(str), env);
}

console.log(scheem_eval.eval(['+', 101, 42], {}));

var scheem_test = function() {
    var TESTS = [
        // Dynamic function names
        ["((lambda () 10))",
         10],

        ["((if (> 3 4) + -) 20 30)",
         -10],

        ["((if (> 4 3) + -) 20 30)",
         50],

        // quote
        ["'(xx yy zz)",
         ["xx", "yy", 'zz']],

        ["(quote (1 aa 123 456))",
         [1, "aa", 123, 456]],

        // car/cdr/cons
        ["(cons 1 '(2 3 4))",
         [1, 2, 3, 4]],

        ["(cons '(aa bb) '(cc dd))",
         [['aa', 'bb'], 'cc', 'dd']],

        ["(car '(xx yy zz))",
         "xx"],

        ["(cdr '(abc def ghi))",
         ["def", "ghi"]],

        ["(cdr (cdr '(abc def ghi)))",
         ["ghi"]],

        ["(car (cdr '(abc def ghi)))",
         "def"],

        ["(car '(4 2))",
         4],

        // Arithmetic
        ["(+ 4 2)",
         6],

        ["(- (* 3 7) 6)",
         (7 * 3) - 6],

        ["(! (> 2 3))",
         '#t'],

        // Conditionals
        ["(if (> 3 4) 9 5)",
         5],

        ["(if (> 4 3) 9 5)",
         9],

        ["(if (> 4 4) 9 5)",
         5],

        ["(if (< 3 3) 7 6)",
         6],

        ["(if (< 2 3) 1 2)",
         1],

        ["(< 2 3)",
         '#t'],

        ["(< 3 2)",
         '#f'],

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

        // let
        ["(let ((x 2)) (+ x 1))",
         3],

        // lambda-one
        ["(define square (lambda-one x (* x x)))",
         0],

        ["(begin (define square (lambda-one x (* x x))) (square 12))",
         144],

        // Factorial
        ["(begin (define fact (lambda (x) (if (< x 2) x (* x (fact (- x 1)))))) (fact 12))",
         12*11*10*9*8*7*6*5*4*3*2*1],

        // Fibonacci
        ["(begin (define fibonacci (lambda (x) (if (<= x 1) x (+ (fibonacci (- x 1)) (fibonacci (- x 2)))))) (fibonacci 12))",
         144],

        ["(begin (define abs (lambda-one x (if (> x 0) x (- x)))) (abs 123))",
         123],

        ["(begin (define abs (lambda-one x (if (> x 0) x (- 0 x)))) (abs -234))",
         234],

        // (closure)
        ["(let ((xx 12)) (begin (let ((xx 13)) (+ xx xx)) (+ xx xx)))",
         24],

        ["(begin (define make-account (lambda (balance) (lambda (amt) (begin (set! balance (+ balance amt)) balance)))) (define acct (make-account 100)) (acct -20) (acct -30))",
         50],

        ["(begin (define plus (lambda (x y) (+ x y))) (plus 222 333))",
         222+333],

        ["(begin (define plus3 (lambda (x y z) (+ (+ x y) z))) (plus3 222 333 444))",
         222+333+444],

        ["(begin (define square (lambda (x) (* x x))) (square 16))",
         16*16],

        ["(begin (define square (lambda (x) (* x x))) (square (square 16)))",
         16*16*(16*16)],

        ["(begin (define a (lambda ( ) 42)) (a))",
         42],

        ["(begin (define a 10) (define test (lambda () (set! a (+ a 20)))) (test) a)",
         30],

        ["(begin (define a 10) (define test (lambda () (set! a (+ a 20)))) (test) (print 'hello) (print '(hello world)) a)",
         30],

        //// defun
        //["(begin (defun double (x) (* 2 x)) (double 4))",
        // 8],
        //
        //["(begin (defun square (x) (* x x)) (square (square 4)))",
        // (4*4)*(4*4)],
        //
        //["(begin (defun abs (x) (if (> x 0) x (- 0 x))) (abs -123))",
        // 123],
        //
        //["(begin (defun abs (x) (if (> x 0) x (- 0 x))) (abs 234))",
        // 234],

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
