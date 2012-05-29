CodeMirror.defineMode("diff", function() {
  return {
    token: function(stream) {
      var ch = stream.next();
      stream.skipToEnd();
      if (ch == ">") return "result";
      if (ch == "+") return "plus";
      if (ch == "-") return "minus";
    }
  };
});

CodeMirror.defineMIME("text/x-diff", "diff");
