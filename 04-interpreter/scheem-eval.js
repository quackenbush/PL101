var SCHEEM_T = '#t';
var SCHEEM_F = '#f';

var scheem_check_size = function(expr, min_size, max_size) {
    if ((expr.length < min_size) ||
        (expr.length > max_size))
        throw new Error("Invalid number of args (" + expr.length + ") for " + expr[0] + ": " + expr.slice(1));
};

var scheem_set = function(expr, env, do_set) {
    var key;

    scheem_check_size(expr, 3, 3);
    // FIXME: when do we need to 'eval' the key?
    if (true)
        key = expr[1];
    else
        key = scheem_eval(expr[1]);

    if (typeof key !== 'string')
        throw new Error("Variable must be a string (" + key + ")");

    if (do_set)
    {
        // set! function
        if (! (key in env))
            throw new Error("Variable " + key + " unknown");
    }
    env[key] = scheem_eval(expr[2], env);
    return 0;
};

var scheem_defun = function(expr, env) {
    var function_name;

    scheem_check_size(expr, 4, 4);
    function_name = expr[1];

    if (typeof function_name !== 'string')
        throw new Error("Function must be a string (" + function_name + ")");

    env[function_name] = [expr[2], expr[3]];
    return 0;
};

var scheem_eval_defun = function(expr, env) {
    var func = env[expr[0]];
    var args = func[0];
    var body = func[1];
    var expr_args = expr.slice(1);
    var new_env = new Object(env); // Copy the array
    var i;
    //scheem_check_size(expr, args.) {
    if (args.length != expr_args.length) {
        throw new Error('Invalid number of args (' + expr_args + ') for function ' + expr[0] + ' (expected ' + args.length + ' )');
    }
    for (i = 0; i < args.length; i++) {
        new_env[args[i]] = scheem_eval(expr_args[i], new_env);
        //console.log('' + args[i] + ' => ' + new_env[args[i]]);
    }
    return scheem_eval(body, new_env);
    //throw new Error('' + args + ' => ' + expr_args);
};

var scheem_eval = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number')
        return expr;

    if (typeof expr === 'string') {
        if (! (expr in env))
            throw new Error("Variable " + expr + " unknown");
        return env[expr];
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
            return scheem_set(expr, env, false);

        case 'set!':
            return scheem_set(expr, env, true);

        case 'defun':
            return scheem_defun(expr, env, false);

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

        default:
            if (expr[0] in env) {
                return scheem_eval_defun(expr, env);
            }
            else {
                console.log("Op [" + expr[0] + "] not implemented");
                assert.fail("Op [" + expr[0] + "] not implemented");
            }
    }
};

exports.eval = scheem_eval;
