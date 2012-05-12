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
        case 'quote':
            return expr[1];
        default:
            // New stuff here
            var func = lookup(env, expr[0]);
            return func(evalScheem(expr[1], env));
    }
};
