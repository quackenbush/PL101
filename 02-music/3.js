// #3

var endTime = function (time, expr) {
    if (expr.tag == 'seq')
        return endTime(0, expr.left) + endTime(0, expr.right) + time;
    return expr.dur + time;
};

var endTime = function (time, expr) {
    if (expr.tag === 'note') return time + expr.dur;
    return endTime(endTime(time, expr.left), expr.right);
};
