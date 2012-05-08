var assert = require('assert');

exports.scheem_selftest = function(scheem_parse) {
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

    console.log("----------------------------------------");
    console.log("" + num_tests + " scheem selftests PASSed");
}
