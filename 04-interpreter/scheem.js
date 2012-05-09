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

console.log(scheem_eval.eval(['+', 101, 42], {}));

var scheem_test = function() {
    var TESTS = [
        ["(+ 4 2)",
         6],

        ["(- (* 3 7) 6)",
         (7 * 3) - 6],

        ["(if (> 3 4) 9 5)",
         5],

        ["(if (> 4 3) 9 5)",
         9],

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
        actual = scheem_eval.eval(scheem_parse(input));
        assert.deepEqual(actual, expected);
    }
};

scheem_test();
