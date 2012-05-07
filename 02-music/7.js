// #7

/*
{ tag: 'par',
  left: { tag: 'note', pitch: 'c4', dur: 250 },
  right:
   { tag: 'par',
     left: { tag: 'note', pitch: 'e4', dur: 250 },
     right: { tag: 'note', pitch: 'g4', dur: 250 } } }

=>

[ { tag: 'note', pitch: 'c4', start: 0, dur: 250 },
  { tag: 'note', pitch: 'e4', start: 0, dur: 250 },
  { tag: 'note', pitch: 'g4', start: 0, dur: 250 } ]

*/

var mus2notepar = function(start, musexpr) {
    var left_notes, right_notes;
    var last;

    if (musexpr.tag == 'seq') {
        left_notes = mus2notepar(start,
                                 musexpr.left);
        last = left_notes[left_notes.length - 1];
        right_notes = mus2notepar(last.start + last.dur,
                                  musexpr.right);
        return left_notes.concat(right_notes);
    }

    if (musexpr.tag == 'par') {
        // To write a compiler for the new MUS language to NOTE, I would recommend first
        // figuring out endTime like before. Then use that helper function to write the
        // compiler.

        left_notes = mus2notepar(start,
                                 musexpr.left);
        last = left_notes[left_notes.length - 1];
        right_notes = mus2notepar(start,
                                  musexpr.right);
        return left_notes.concat(right_notes);
    }

    // Cleaner implementation:
    // a = musexpr; a.start = start; return a;
    return [{tag: 'note',
             pitch: musexpr.pitch,
             start: start,
             dur: musexpr.dur}];
};

var compile = function (musexpr) {
    return mus2notepar(0, musexpr);
};

var test = function() {
console.log(compile({ tag: 'par',
  left: { tag: 'note', pitch: 'c4', dur: 250 },
  right:
   { tag: 'par',
     left: { tag: 'note', pitch: 'e4', dur: 250 },
     right: { tag: 'note', pitch: 'g4', dur: 250 } } }));
}

test();