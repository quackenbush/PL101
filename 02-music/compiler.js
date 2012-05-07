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

var pitch2midi = function(muspitch) {
    // Convert musical pitch to MIDI integer
    // 12 + 12 * octave + letterPitch. The letterPitch is 0 for C, 2 for D, up to 11 for B
    var LETTER_PITCHES = {'c': 0,
                          'd': 2,
                          'e': 4,
                          'f': 5,
                          'g': 7,
                          'a': 9,
                          'b': 11};

    var letter = muspitch[0];
    var letterPitch = LETTER_PITCHES[letter.toLowerCase()];
    var octave = parseInt(muspitch.slice(1));
    return 12 + 12 * octave + letterPitch;
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

    if (musexpr.tag == 'repeat')
    {
        var i;
        var nodes = []
        for (i = 0; i < musexpr.count; i++)
        {
            var next = mus2note(start, musexpr.section);
            var last = next[next.length - 1];
            nodes = nodes.concat(next);
            start = last.start + last.dur;
        }

        return nodes;
    }

    // Either a 'note' or a 'rest'
    var pitch;

    if (musexpr.tag == 'note')
        pitch = pitch2midi(musexpr.pitch);
    else
        // Rests have no pitch
        pitch = 0;

    return [ { tag: 'note',
               pitch: pitch,
               start: start,
               dur: musexpr.dur } ];
};

var compile = function (musexpr) {
    return mus2note(0, musexpr);
};

var test = function() {
    var assert = require('assert');

    assert.equal(pitch2midi('A0'), 21);
    assert.equal(pitch2midi('C4'), 60);
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
        [ { tag: 'note', pitch: pitch2midi('c4'), start: 0, dur: 250 },
          { tag: 'note', pitch: pitch2midi('e4'), start: 0, dur: 250 },
          { tag: 'note', pitch: pitch2midi('g4'), start: 100, dur: 250 } ];

    var test1 = { tag: 'repeat',
                  section: { tag: 'note', pitch: 'c4', dur: 250 },
                  count: 3 };
    var exp1 = [ { tag: 'note', pitch: pitch2midi('c4'), start: 0, dur: 250 },
                 { tag: 'note', pitch: pitch2midi('c4'), start: 250, dur: 250 },
                 { tag: 'note', pitch: pitch2midi('c4'), start: 500, dur: 250 } ];


    // --------------------------------------------------------------------------------

    var actual0 = compile(test0);
    var actual1 = compile(test1);

    console.log("--------------------");
    if (false) {
        console.log(actual1);
        console.log(exp1);
    }

    assert.deepEqual(actual0, exp0);
    assert.deepEqual(actual1, exp1);

    console.log("PASS");
}

test();
