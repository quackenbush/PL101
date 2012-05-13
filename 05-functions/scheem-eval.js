var SCHEEM_T = '#t';
var SCHEEM_F = '#f';

var scheem_check_size = function(expr, min_size, max_size) {
    if ((expr.length < min_size) ||
        (expr.length > max_size))
        throw new Error("Invalid number of args (" + expr.length + ") for " + expr[0] + ": " + expr.slice(1));
};

var scheem_update = function(env, symbol, value, do_define) {
    // set! function
    if (! ('bindings' in env))
        throw new Error('symbol ' + symbol + " unknown");

    if (symbol in env.bindings || do_define)
    {
        if (typeof symbol !== 'string')
            throw new Error("Symbol must be a string (" + symbol + ")");

        env.bindings[symbol] = scheem_eval(value, env);
        return 0;
    }

    return scheem_update(env.outer, symbol, value, false);
};

function scheem_let_one (expr, env) {
    scheem_check_size(expr, 4, 4);
    var symbol = expr[1];
    var bindings = {};
    var new_env = {outer : env,
                   bindings : bindings};

    bindings[symbol] = scheem_eval(expr[2], new_env);
    return scheem_eval(expr[3], new_env);
};

function scheem_lookup (env, v) {
    if (! ('bindings' in env))
        throw new Error("symbol " + v + " unknown");

    if (v in env.bindings)
        return env.bindings[v];

    return scheem_lookup(env.outer, v);
};

function scheem_defun (expr, env) {
    var function_name;

    scheem_check_size(expr, 4, 4);
    function_name = expr[1];

    if (typeof function_name !== 'string')
        throw new Error("Function must be a string (" + function_name + ")");

    env.bindings[function_name] = [expr[2], expr[3]];
    return 0;
};

function bind_env (env, v, val) {
    env.bindings[v] = val;
};

function gen_lambda (env, syms, body) {
    var newfunc = function(args) {
        var bindings = {};
        var i = 0;
        var newenv = {bindings: bindings,
                      outer: env};
        //console.log('syms: ' + syms + ', args: ' + args + ', expr: ' + body);
        // NOTE: the hack here:  applying to the current environment, not the sub-environment
        for (i = 0; i < syms.length; i++) {
            bind_env(env, syms[i], scheem_eval(args[i], newenv));
        }
        return scheem_eval(body, env);
    };
    return newfunc;
}

function scheem_eval (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number')
        return expr;

    if (typeof expr === 'string') {
        return scheem_lookup(env, expr);
    }

    // Look at head of list for operation
    switch (expr[0]) {
        case '!': // boolean 'not' operator
            scheem_check_size(expr, 2, 2);
            result = scheem_eval(expr[1], env);
            if (result == 0 || result === SCHEEM_F)
                return SCHEEM_T;
            else
                return SCHEEM_F;

        case '=':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) === scheem_eval(expr[2], env) ? SCHEEM_T : SCHEEM_F;

        case '>':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) > scheem_eval(expr[2], env) ? SCHEEM_T : SCHEEM_F;

        case '<':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) < scheem_eval(expr[2], env) ? SCHEEM_T : SCHEEM_F;

        case 'begin':
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
            scheem_check_size(expr, 3, 3);
            return [scheem_eval(expr[1])].concat(scheem_eval(expr[2]));

        case 'define':
            scheem_check_size(expr, 3, 3);
            return scheem_update(env, expr[1], expr[2], true);

        case 'set!':
            scheem_check_size(expr, 3, 3);
            return scheem_update(env, expr[1], expr[2], false);

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

        case 'let-one':
            return scheem_let_one(expr, env);

        case 'print':
            console.log(scheem_eval(expr[1], env));
            return 0;

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
            // Assume lambda
            // HACK: this is probably a let() or apply() func
            var func = scheem_lookup(env, expr[0]);
            var args = expr.slice(1);
            var a = [];
            var i;
            for (i = 0; i < args.length; i++)
            {
                a.push(scheem_eval(args[i], env));
            }
            return func(a);
    }
};

function scheem_eval_global (expr, env) {
    default_bindings = {'+': function(x) { return x[0] + x[1]; },
                        '-': function(x) { return x[0] - x[1]; },
                        '*': function(x) { return x[0] * x[1]; },
                        '/': function(x) { return x[0] / x[1]; },
                       };
    default_env = {bindings: default_bindings,
                   outer: {}};
    e = {bindings: env,
         outer: default_env};
    return scheem_eval(expr, e);
};

exports.eval = scheem_eval_global;
