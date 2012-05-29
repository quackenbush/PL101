var SCHEEM_T = '#t';
var SCHEEM_F = '#f';

function scheem_check_size (expr, min_size, max_size) {
    if ((expr.length < min_size) ||
        (expr.length > max_size))
        throw new Error("Invalid number of args (" + expr.length + ") for " + expr[0] + ": " + expr.slice(1));
}

function scheem_update (env, symbol, value, do_define) {
    if (env === {})
        throw new Error('symbol ' + symbol + " unknown");

    if ((symbol in env.bindings) || do_define)
    {
        if (typeof symbol !== 'string')
            throw new Error("Symbol must be a string (" + symbol + ")");

        env.bindings[symbol] = value;
        return 0;
    }

    return scheem_update(env.outer, symbol, value, false);
}

function new_env (env, bindings) {
    return { bindings : bindings,
             outer : env };
}

function scheem_let (expr, env) {
    scheem_check_size(expr, 3, 3);
    var args = expr[1];
    var body = expr[2];
    var bindings = {};
    var newenv = new_env(env, bindings);
    var i;
    for (i = 0; i < args.length; i++) {
        bindings[args[i][0]] = scheem_eval(args[i][1], newenv);
    }
    return scheem_eval(body, newenv);
}

function scheem_lookup (env, symbol) {
    if (env === {} || ! ('bindings' in env))
        throw new Error("symbol '" + symbol + "' unknown");

    if (symbol in env.bindings)
        return env.bindings[symbol];

    return scheem_lookup(env.outer, symbol);
}

function scheem_defun (expr, env) {
    var function_name;

    scheem_check_size(expr, 4, 4);
    function_name = expr[1];

    if (typeof function_name !== 'string')
        throw new Error("Function must be a string (" + function_name + ")");

    env.bindings[function_name] = [expr[2], expr[3]];
    return 0;
}

function bind_env (env, v, val) {
    env.bindings[v] = val;
}

function gen_lambda (env, formals, body) {
    var lambda = function(args) {
        var newenv = new_env(env, {});
        var i;
        for (i = 0; i < formals.length; i++) {
            var arg = args[i];
            bind_env(newenv, formals[i], arg);
        }
        var result = scheem_eval(body, newenv);
        return result;
    };
    return lambda;
}

function scheem_eval (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number')
        return expr;

    // Symbol lookup
    if (typeof expr === 'string')
        return scheem_lookup(env, expr);

    // Scheem special forms
    switch (expr[0]) {
        case 'begin':
            var i;
            var result;

            for (i = 1; i < expr.length; i++)
                result = scheem_eval(expr[i], env);

            return result;

        case 'define':
            scheem_check_size(expr, 3, 3);
            return scheem_update(env, expr[1], scheem_eval(expr[2], env), true);

        case 'set!':
            scheem_check_size(expr, 3, 3);
            return scheem_update(env, expr[1], scheem_eval(expr[2], env), false);

        case 'if':
            scheem_check_size(expr, 4, 4);
            var term = scheem_eval(expr[1], env);
            if (term === SCHEEM_T)
                return scheem_eval(expr[2], env);
            else
                return scheem_eval(expr[3], env);

        case 'quote':
            scheem_check_size(expr, 2, 2);
            return expr[1];

        case 'let':
            return scheem_let(expr, env);

        case 'lambda-one':
            var sym = expr[1];
            var body = expr[2];
            return gen_lambda(env, [sym], body);

        case 'lambda':
            var syms = expr[1];
            var body = expr[2];
            return gen_lambda(env, syms, body);

        case 'defun':
            return scheem_defun(expr, env);

        default:
            // Function evaluation
            var func = scheem_eval(expr[0], env); // eval(), so we can have a dynamic func name
            var args = expr.slice(1);
            var a = [];
            var i;
            for (i = 0; i < args.length; i++)
            {
                a.push(scheem_eval(args[i], env));
            }
            return func(a);
    }
}

function scheem_eval_global (expr, bindings) {
    function scheem_bool(x) { return x ? SCHEEM_T : SCHEEM_F; };

    BUILTIN_BINDINGS = {
        '+':  function(x) { return x[0] + x[1]; },
        '-':  function(x) { return x[0] - x[1]; },
        '*':  function(x) { return x[0] * x[1]; },
        '/':  function(x) { return x[0] / x[1]; },
        '!':  function(x) { return scheem_bool( x[0] == 0 || x[0] == SCHEEM_F ); },

        '=':  function(x) { return scheem_bool( x[0] == x[1] ); },
        '<':  function(x) { return scheem_bool( x[0] <  x[1] ); },
        '<=': function(x) { return scheem_bool( x[0] <= x[1] ); },
        '>':  function(x) { return scheem_bool( x[0] >  x[1] ); },
        '>=': function(x) { return scheem_bool( x[0] >= x[1] ); },

        'empty?': function(x) { return (x[0].length == 0) ? SCHEEM_T : SCHEEM_F; },
        'car':    function(x) { return x[0][0]; },
        'cdr':    function(x) { return x[0].slice(1); },
        'cons':   function(x) { return [x[0]].concat(x[1]); },
        'print':  function(x) { console.log(x[0]); return 0; },
    };

    var default_env = new_env({}, BUILTIN_BINDINGS);
    var e = new_env(default_env, bindings);
    return scheem_eval(expr, e);
}

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.eval = scheem_eval_global;
//exports.eval = scheem_eval_global;
}
