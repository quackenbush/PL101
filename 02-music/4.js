// #4

var mus2note = function(start, musexpr) {
    if (musexpr.tag == 'seq') {
        var left_notes, right_notes;
        var last;

        left_notes = mus2note(start,
                              musexpr.left);
        last = left_notes[left_notes.length - 1];
        right_notes = mus2note(last.start + last.dur,
                               musexpr.right);
        return left_notes.concat(right_notes);
    }
    return [{tag: 'note', pitch: musexpr.pitch,
             start: start, dur: musexpr.dur}];
};

var compile = function (musexpr) {
    return mus2note(0, musexpr);
};
