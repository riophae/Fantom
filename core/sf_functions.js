SF.fn.waitFor = (function() {
  var waiting_list = [];
  var interval, lock;
  
  function setWaiting(task) {
    if (task) waiting_list[waiting_list.length] = task;
    if (interval) return;
    interval = setInterval(function() {
      if (lock) return;
      lock = true;

      var not_avail = 0;
      for (var i = 0; i < waiting_list.length; ++i) {
        var item = waiting_list[i];
        if (! item) continue;
        if (item.checker()) {
          item.worker();
          waiting_list[i] = null;
        } else ++not_avail;
      }

      if (! not_avail || document.readyState == 'complete')
        interval = 0 * clearInterval(interval);

      lock = false;
    }, 40);
  }

  return function(checker, worker, async) {
    var _worker = async ?
      (function() { setTimeout(worker, 0); }) : worker;
    if (checker())
      _worker();
    else
      setWaiting({ checker: checker, worker: _worker });
  }
})();

SF.fn.fixNumber = function(num, width) {
  var num = num.toString();
  var delta = width - num.length;
  while (delta > 0) {
    num = '0' + num;
    --delta;
  }
  return num;
}

SF.fn.formatDate = function(date) {
  var datestr = SF.fn.fixNumber(date.getFullYear(), 4) + '-' +
                SF.fn.fixNumber(date.getMonth() + 1, 2) + '-' +
                SF.fn.fixNumber(date.getDate(), 2);
  return datestr;
}

SF.fn.isUserPage = function() {
  return !! document.getElementById('overlay-report');
}

SF.fn.goTop = (function(docelem, s, current) {
  return function(e) {
    if (e) {
      e.preventDefault();
      s = docelem.scrollTop;
    }
    current = docelem.scrollTop;
    if (s != current) return;
    var to = Math.floor(s / 1.15);
    window.scrollTo(0, (s = to));
    if (s >= 1) setTimeout(SF.fn.goTop, 24);
  }
})(document.documentElement, 0);

(function() {
  
  function $i(id) { return document.getElementById(id); }
  function $t(elem, tagName) {
    return elem ? elem.getElementsByTagName(tagName) : null;
  }
  function $cn(elem, className) {
    return elem ? elem.getElementsByClassName(className) : null;
  }
  function $c(tagname) { return document.createElement(tagname); }

  function removeBrackets(elems) {
    if (! elems) return;
    for (var i = 0, len = elems.length; i < len; ++i) {
      if (elems[i].innerHTML[0] != '(') continue;
      elems[i].innerHTML = elems[i].innerHTML.slice(1, -1);
    }
  }
  
  SF.fn.waitFor(function() {
    var $li = $t($i('navigation'), 'li');
    return $li && $li[3];
  }, function() {
    removeBrackets($cn($i('navigation'), 'count'));
  }, true);

  SF.fn.waitFor(function() {
    var $li = $t($i('navtabs'), 'li');
    return $li && $li[3];
  }, function() {
    removeBrackets($cn($i('navtabs'), 'count'));
  }, true);
  
  var $totop;
  SF.fn.waitFor(function() {
    return $totop = $i('pagination-totop');
  }, function() {
    $totop.addEventListener('click', SF.fn.goTop, false);
  }, true);

  /* 全局支持回复全部 */

  SF.fn.waitFor(function() {
    return $i('sf_flag_libs_ok');
  }, function() {
    var $ = jQuery;

    /* 自动选择 */

    var $msg = $('#update textarea');
    if ($msg.length && location.search.match(/\bstatus=/)) {
      var text = $msg.val();
      var msg = $msg[0];
      if (text[0] == '转') {
        msg.setSelectionRange(0, 0);
      } else if (text[0] != '@') {
        msg.setSelectionRange(text.length, text.length);
      } else {
        var at_names = text.split(' ');
        if (at_names.length > 1) {
          var start_pos = at_names[0].length + 1;
          var end_pos = start_pos;
          for (var i = 1; i < at_names.length; ++i) {
            if (at_names[i][0] != '@')
              break;
            end_pos += at_names[i].length + 1;
          }
          msg.setSelectionRange(start_pos, end_pos);
        }
      }
    }
    
    /* 将回复链接全部处理为回复到所有 */
    
    function changeHref($item) {
      if (! $item.is('li')) return;
      if ($item.attr('replytoall')) return;
      var $formers = $('>.content>a.former', $item);
      if (! $formers.length) return;

      var myurl = $('#navigation li>a').eq(1).attr('href');
      var $reply = $('>.op>a.reply', $item);
      var ffname = $reply.attr('ffname');
      var msg = '@' + ffname + ' ';
      var at_ed = { };
      at_ed[ffname] = true;
      $formers.each(function() {
        if ($(this).attr('href') == myurl) return;
        var name = $(this).text();
        if (at_ed[name] !== true) {
          msg += '@' + name + ' ';
          at_ed[name] = true;
        }
      });
      $reply.attr('href', '/home?' + $.param({
        status: msg,
        in_reply_to_status_id: $reply.attr('ffid')
      }));
      $item.attr('replytoall', true);
    }
    function processStream($ol) {
      $ol.bind('DOMNodeInserted',
          function(e) { changeHref($(e.target)); });
      $('>li', $ol).each(function() { changeHref($(this)); });
    }
    $('#stream').bind('DOMNodeInserted',
        function(e) { processStream($(e.target)); });
    processStream($('#stream>ol'));

  });

})();