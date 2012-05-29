function Con(id, mode) {
  this.console = CodeMirror(document.getElementById(id), {
    mode: mode,
    lineNumbers: true,
    readOnly: true
  });

  this.content = "";

  this.log = function(msg) {
    this.content = this.content + "\n" + msg;
    this.console.setValue(this.content);
    var line = this.console.lineCount();
    this.console.setCursor({line: line, ch: 0})
  }

  this.clear = function() {
    this.content = "";
    this.console.setValue(this.content);
  }
}

// After page load
$(function() {

  var editor = CodeMirror(document.getElementById("editor"), {
    value: "(* 2 3)",
    mode: "scheme",
    theme: "ambiance",
    indentUnit: 2,
    tabSize: 2,
    matchBrackets: true
  });

  var con = new Con("console", "diff");
  var envCon = new Con("environment", "javascript");

  editor.setValue("; type Scheem code into this box and press run\n\
; or press one of the three example buttons\n\n");



  var scheemParser = scheem_peg.parse;//parser.buildParser();
  var evalScheem = scheem_eval_global;

  var env = {bindings:{},outer:{}};

  $('#run').click(function() {
    var user_text = editor.getValue();
//    con.log('\n' + user_text.trim());
    try {
      var parsed = scheemParser(user_text);
      try {
        var result = evalScheem(parsed, env);

        con.log('> ' + JSON.stringify(result));
        envCon.clear();
        envCon.log(JSON.stringify(env, null, '\t'));
      }
      catch(e) {
        con.log('- Eval Error: ' + e);
      }
    }
    catch(e) {
      con.log('- Parse Error: ' + e);
    }
  });

  function allClear() {
    con.clear();
    env = {bindings:{},outer:{}};
    envCon.clear();
  }

  $('#clear-output').click(function() {
    con.clear();
  });
  $('#clear-environment').click(function() {
    env = {};
    envCon.clear();
  });

  $('#ex-1').click(function() {
    allClear();
    editor.setValue(
      ["",
       "",
       "; here's a simple factorial function declaration",
       ";",
       "(begin",
       "  (define factorial ",
       "  (lambda (x)",
       "    (if (= x 1)",
       "      1",
       "      (* x (factorial (- x 1))))))",
       "",
       "",
       "; compute the factorial of 5",
       ";",
       "(factorial 5)",
       ")",
       ""].join("\n"));
  })

  $('#ex-2').click(function() {
    allClear();
    editor.setValue(
["",
"",
"; a terrible 'map' function",
"; ",
"; not the most efficient map implementation since calling it once results",
"; in a backward list. Rather than write a 'reverse' function I'm calling ",
"; map twice (using an identity function the second time around) to get ",
"; the results in the right order.",
"; ",
"(begin (define map ",
"  (lambda (fn lst)",
"    (let ((identity (lambda (x) x))",
"          (mapres (lambda (fn2 lst2 res)",
"                 (if (empty? lst2)",
"                     res",
"                   (mapres fn2 (cdr lst2) (cons (fn2 (car lst2)) res)))))) ",
"      (mapres identity (mapres fn lst '()) '()))))",
"",
"; double the numbers in the list",
";",
"(map (lambda (x) (+ x x)) '(1 2 3 4 5 6 7 8 9))",
")",
"",
"",
""].join("\n"));
  });


  $('#ex-3').click(function() {
    allClear();
    editor.setValue(
      ["; here are some examples of the '.' special form which invokes ",
       "; functions defined in the outer javascript environment",
       "",
       "; bring up the alert box",
       ";",
       "(. (alert) 'hi)",
       "; equivalent to:  alert('hi');",
       "",
       "; log a messge to the console",
       "; ",
       "(. (console log) \"hello from the console\")",
       "; equivalent to: console.log('hello from the console');",
       "",
       "; invoke the evalScheem function, passing in a set of s-expressions",
       "; for calculating the 10th Fibonacci number",
       ";",
       "(. (Scheem interpreter evalScheem)",
       "   '((define fib (lambda (n)",
       "                   (if (< n 2) n",
       "                       (+ (fib (- n 1)) (fib (- n 2))))))",
       "     (fib 10)))",
       "",
       "",
       ""
      ].join("\n"));
  });





});
