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
            var newfunc = function(arg) {
                var bindings = {};
                var newenv = {bindings: bindings,
                              outer: env};
                bindings[expr[1]] = arg;
                return evalScheem(expr[2], newenv);
            };
            return newfunc;
        default:
            // Simple application
            var func = evalScheem(expr[0], env);
            var arg = evalScheem(expr[1], env);
            return func(arg);
    }
};
