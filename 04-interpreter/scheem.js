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

var scheem_eval = function (expr, env) {
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
            return scheem_eval(expr[1], env) + scheem_eval(expr[2], env);

        case '-':
            return scheem_eval(expr[1], env) - scheem_eval(expr[2], env);

        case '*':
            return scheem_eval(expr[1], env) * scheem_eval(expr[2], env);

        case '/':
            return scheem_eval(expr[1], env) / scheem_eval(expr[2], env);

        case '<':
            return scheem_eval(expr[1], env) < scheem_eval(expr[2], env) ? SCHEEM_T : SCHEEM_F;

        case 'begin':
            //newEnv = env.slice();
            var i;
            var result;

            for (i = 1; i < expr.length; i++)
            {
                result = scheem_eval(expr[i], env);
            }
            return result;

        case 'car':
            return scheem_eval(expr[1])[0];

        case 'cdr':
            return scheem_eval(expr[1]).slice(1);

        case 'cons':
            return [scheem_eval(expr[1])].concat(scheem_eval(expr[2]));

        case 'define':
        case 'set!':
            env[expr[1]] = scheem_eval(expr[2], env);
            return 0;

        case 'if':
            var term = scheem_eval(expr[1], env);
            if (term === SCHEEM_T)
                return scheem_eval(expr[2], env);
            else
                return scheem_eval(expr[3], env);

        case 'quote':
            return expr[1];

        default:
            assert.fail("Op [" + expr[0] + "] not implemented");
    }
};

console.log('hello world\n');
