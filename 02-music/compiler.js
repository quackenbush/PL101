// #12
// Add rest support
// { tag: 'rest', dur: 100 }

var strip_rest = function(nodes) {
    if (nodes.length == 0)
        return []
    var first = nodes[0];
    var result = [];
    if (first.pitch != 0)
        result.push(first);
    return result.concat(strip_rest(nodes.slice(1)));
}

var mus2note = function(start, musexpr) {
    if (musexpr.tag == 'par' || musexpr.tag == 'seq')
    {
        var left, right;
        var last;

        left = mus2note(start,
                        musexpr.left);
        last = left[left.length - 1];

        if (musexpr.tag == 'seq')
            start = last.start + last.dur;

        right = mus2note(start,
                         musexpr.right);
        return strip_rest(left.concat(right));
    }

    var out = { tag: 'note',
                pitch: musexpr.pitch,
                start: start,
                dur: musexpr.dur};

    if (musexpr.tag == 'rest')
        out.pitch = 0;

    return [out];
};

var compile = function (musexpr) {
    return mus2note(0, musexpr);
};

var test = function() {
    var assert = require('assert');

    var test0 =
        { tag: 'par',
          left: { tag: 'note', pitch: 'c4', dur: 250 },
          right:
          { tag: 'par',
            left: { tag: 'note', pitch: 'e4', dur: 250 },
            right:
            { tag: 'seq',
              left: { tag: 'rest', dur: 100 },
              right: { tag: 'note', pitch: 'g4', dur: 250 } }
          }
        };

    var exp0 =
        [ { tag: 'note', pitch: 'c4', start: 0, dur: 250 },
          { tag: 'note', pitch: 'e4', start: 0, dur: 250 },
          { tag: 'note', pitch: 'g4', start: 100, dur: 250 } ];

    var actual0 = compile(test0);
    //console.log(actual0);
    //console.log(exp0);

    assert.deepEqual(actual0, exp0);

    console.log("PASS");
}

test();
