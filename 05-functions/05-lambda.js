// lambda:
// (define plusone (lambda-one x (+ x 1)))

var evalScheem = function (expr, env) {
    if (typeof expr === 'number') {
        return expr;
    }
    if (typeof expr === 'string') {
        return lookup(env, expr);
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
        case 'lambda-one':
            var lambda_one = function(arg) {
                var bindings = {};
                var newenv = {bindings: bindings,
                              outer: env};
                var varname = expr[1];
                var body = expr[2];
                bindings[varname] = arg;
                return evalScheem(body, newenv);
            };
            return lambda_one;
        default:
            // Simple application
            var func = evalScheem(expr[0], env);
            var arg = evalScheem(expr[1], env);
            return func(arg);
    }
};
