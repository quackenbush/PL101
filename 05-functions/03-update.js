// set! implementation
var update = function (env, v, val) {
    if (v in env.bindings) {
        env.bindings[v] = evalScheem(val);
        return 0;
    }
    return update(env.outer, v, val);
};
