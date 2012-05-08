// Basic Scheem parser, using PEG.js

var DEBUG = false;

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

var scheem_selftest = function() {
    var TESTS = [
        ["(a b c)", ["a", "b", "c"] ],
        ["(* b (+ 3 99 ) )", ["*", "b", ["+", "3", "99"]] ],
        ["nizzleDizzle", "nizzleDizzle"],
        ["(naz)", ["naz"] ],

        // Comment
        ["((naz) ;; (blah)\n(foo bar))", [["naz"], ["foo", "bar"]] ],

        // Quote
        ["'blah", ["quote", "blah"] ],
        ["'(hello world 123)", ["quote", "hello", "world", "123"] ],
        ["'x", scheem_parse("(quote x)") ],

        // Functions
        ["(def x\n\t(lambda (x) (+ 1 x)))", ["def", "x", ["lambda", ["x"], ["+", "1", "x"]]] ],
    ];

    var i;
    var num_tests = TESTS.length;
    for (i = 0; i < num_tests; i++)
    {
        var test = TESTS[i];
        console.log("Test " + (i + 1) + " / " + num_tests + ": " + test[0]);
        var actual = scheem_parse(test[0]);
        var expected = test[1];
        assert.deepEqual(actual, expected);
    }

    console.log("Scheem OK");
}

scheem_selftest();
