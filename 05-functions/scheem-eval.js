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
        throw new Error(symbol + " unknown");

    if (symbol in env.bindings || do_define)
    {
        if (typeof symbol !== 'string')
            throw new Error("Symbol must be a string (" + symbol + ")");

        env.bindings[symbol] = scheem_eval(value, env);
        return 0;
    }

    return scheem_update(env.outer, symbol, value, false);
};

var scheem_let_one = function(expr, env) {
    scheem_check_size(expr, 4, 4);
    var symbol = expr[1];
    var bindings = {};
    var new_env = {outer : env,
                   bindings : bindings};

    bindings[symbol] = scheem_eval(expr[2], new_env);
    return scheem_eval(expr[3], new_env);
};

var scheem_lookup = function(env, v) {
    if (env.length == 0)
        throw new Error("symbol " + v + " unknown");

    if (v in env.bindings)
        return env.bindings[v];

    return scheem_lookup(env.outer, v);
};

var scheem_defun = function(expr, env) {
    var function_name;

    scheem_check_size(expr, 4, 4);
    function_name = expr[1];

    if (typeof function_name !== 'string')
        throw new Error("Function must be a string (" + function_name + ")");

    env.bindings[function_name] = [expr[2], expr[3]];
    //console.log(env.bindings);
    return 0;
};

var scheem_eval_defun = function(expr, env) {
    var func = scheem_lookup(env, expr[0]);
    var args = func[0];
    var body = func[1];
    var expr_args = expr.slice(1);
    var bindings = {}
    var new_env = {bindings: bindings,
                   outer: env};
    var i;
    //scheem_check_size(expr, args.) {
    if (args.length != expr_args.length) {
        throw new Error('Invalid number of args (' + expr_args + ') for function ' + expr[0] + ' (expected ' + args.length + ' )');
    }
    // Bind function arguments
    for (i = 0; i < args.length; i++) {
        bindings[args[i]] = scheem_eval(expr_args[i], new_env);
        //console.log('' + args[i] + ' => ' + new_env[args[i]]);
    }
    //console.log(bindings);
    return scheem_eval(body, new_env);
};

var scheem_eval = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number')
        return expr;

    if (typeof expr === 'string') {
        return scheem_lookup(env, expr);
    }

    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) + scheem_eval(expr[2], env);

        case '-':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) - scheem_eval(expr[2], env);

        case '*':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) * scheem_eval(expr[2], env);

        case '/':
            scheem_check_size(expr, 3, 3);
            return scheem_eval(expr[1], env) / scheem_eval(expr[2], env);

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

        case 'lambda-one':
            var newfunc = function(arg) {
                var bindings = {};
                var newenv = {bindings: bindings,
                              outer: env};
                bindings[expr[1]] = arg;
                return evalScheem(expr[2], newenv);
            };
            return newfunc;

        case 'defun':
            return scheem_defun(expr, env);

        default:
            return scheem_eval_defun(expr, env);
    }
};

exports.eval = scheem_eval;
