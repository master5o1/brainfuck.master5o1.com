(function ($) {
'use strict';

  $('.preset').on('click', function(){
    var $this = $(this);
    var $editor = $('#editor');
    var $input = $('#stdin');
    var preset = $this.data('preset');
    var $preset = $('#preset-' + preset);
    var input = $preset.data('input');
    var credit = $preset.data('credit');

    $('.validation-error').addClass('hidden');
    $('.validation-success').addClass('hidden');

    $('#credit').addClass('hidden');
    if (!!credit) {
      $('#credit-link').attr('href', credit);
      $('#credit-link').text(credit);
      $('#credit').removeClass('hidden');
    }

    $input.val(input);
    $editor.val($preset.text());
  });

  $('#validate').on('click', function(){
    var script = $('#editor').val();
    var bf = new BrainFuck(script);
    $('.validation-error').addClass('hidden');
    $('.validation-success').addClass('hidden');
    if (!bf.validate()) {
      $('.validation-error').removeClass('hidden');
    } else {
      $('.validation-success').removeClass('hidden');
    }
  });

  $('#execute').on('click', function(){
    var script = $('#editor').val();
    var input = $('#stdin').val();
    var output = '';

    $('.validation-error').addClass('hidden');
    $('.validation-success').addClass('hidden');

    var bf = new BrainFuck(script);

    output = bf.execute(input);
    console.log(output);

    $('#output').text(output);
  });

})(jQuery);

function BrainFuck(str, cells) {
  var script = str.replace(/[^<>\-\+\[\]\.\,]/g, '');
  var MAX_CELLS = cells || 30000;

  this.validate = function () {
    return validate();
  };
  this.execute = function (stdin) {
    return execute(stdin || '');
  };

  function checkBrackets() {
    var stack = [];
    var arr = script.replace(/[^\[\]]/g, '').split('');
    var openers = [],
      closers = [];
    if (arr.length === 0) {
      return true;
    }
    if (arr[0] !== '[') {
      return false;
    }
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === '[') {
        stack.push(arr[i]);
        openers.push(arr[i]);
      } else if (arr[i] === ']') {
        stack.pop();
        closers.push(arr[i]);
      }
    }
    if (stack.length > 0 || openers.length !== closers.length) {
      return false;
    }
    return true;
  }

  function bracketsPc() {
    var stack = [];
    var brackets = {};
    var arr = script.split('');
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === '[') {
        stack.push(i);
        brackets[i] = {
          '[': i,
          ']': -1
        };
      } else if (arr[i] === ']') {
        var pc = stack.pop();
        brackets[pc][']'] = i;
        brackets[i] = {
          '[': pc,
          ']': i
        };
      }
    }
    return brackets;
  }

  function validate() {
    var matchingBrackets = checkBrackets();
    return matchingBrackets;
  }

  function execute(stdin) {
    if (!validate()) {
      throw new Error("Invalid Syntax");
    }

    var index = 0;
    var arr = new Array(MAX_CELLS + 1).join('a').split('');
    var stdin_arr = stdin.split('');
    var stdout = [];
    var pc_stack = [];
    var brackets = bracketsPc();

    arr = arr.map(function () {
      return 0;
    });

    var opcodes = {};
    opcodes['<'] = function (pc) {
      index -= 1;
      if (index < 0) {
        index = arr.length - 1;
      }
      return pc;
    };
    opcodes['>'] = function (pc) {
      index += 1;
      if (index >= arr.length) {
        index = 0;
      }
      return pc;
    };
    opcodes['+'] = function (pc) {
      arr[index] += 1;
      return pc;
    };
    opcodes['-'] = function (pc) {
      arr[index] -= 1;
      return pc;
    };
    opcodes['['] = function (pc) {
      if (arr[index] === 0) {
        pc = brackets[pc][']'];
      }
      return pc;
    };
    opcodes[']'] = function (pc) {
      if (arr[index] !== 0) {
        pc = brackets[pc]['['];
      }
      return pc;
    };
    opcodes[','] = function (pc) {
      var chr = stdin_arr.shift();
      if (chr === undefined) {
        arr[index] = 0;
      } else {
        arr[index] = chr.charCodeAt(0);
      }
      return pc;
    };
    opcodes['.'] = function (pc) {
      stdout.push(String.fromCharCode(arr[index]));
      return pc;
    };

    var ops = script.split('');
    for (var pc = 0; pc < ops.length; pc++) {
      var op = ops[pc];
      pc = opcodes[op](pc);
    }

    return stdout.join('');
  }
}