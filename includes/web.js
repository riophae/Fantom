
// ==UserScript==
// @include http://fanfou.com/*
// @exclude http://fanfou.com/home.2
// ==/UserScript==

waitFor(cache.ready, function() {
  insertStyle('fixes.css', 'fantom');
}, true);

// 修正页面回滚的问题
(function($stream) {
  waitFor(function() {
    return $stream = $i('stream');
  }, function() {
    $stream.addEventListener('DOMNodeRemoved', (function(t, s) {
      function delay() { t = setTimeout(scrollTo, 16); }
      function scrollTo() {
        window.scrollTo(0, s);
        if (s > docelem.scrollTop + docelem.clientHeight) {
          delay();
        } else {
          clearTimeout(t);
          t = null;
        }
      }
      return function(e) {
        // status 的操作操作按钮完全由 JavaScript 控制显示和隐藏, 鼠标滑过 status 时也会触发事件
        // 只有删除 LI 元素时才进行处理
        var target = e.target;
        if (target.nodeName != 'LI' || 
            ! target.parentNode || 
            target.parentNode.className != 'wa solo') 
            return;
            
        t ? clearTimeout(t) : (s = docelem.scrollTop);
        delay();
      }
    })(), false);
  }, true);
})();

// 修正提交按钮的黑边框问题
fixSubmit();

// 自动备份(填入)输入框内容、显示名言警句
(function(ta) {
  if (! thisUrl.test('http://fanfou.com/home', '^'))
    return;
  function verify() {
    var $sysmsg = $one('div.sysmsg');
    if ($sysmsg && $sysmsg.innerHTML == '发送成功！') {
      storage.removeItem('fantom_web_oriStatus');
    } else {
      var value = storage.getItem('fantom_web_oriStatus');
      if (value) ta.value = value;
    }
  }
  function backup() {
    storage.setItem('fantom_web_oriStatus', ta.value);
  }
  waitFor(function() {
    return ta = $('textarea')[1];
  }, function() {
    showMotto(ta);
    verify();
    ta.addEventListener('input', (function(t) {
      return function(e) {
        clearTimeout(t);
        t = setTimeout(backup, 150);
      }
    })());
    ta.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.keyCode === 13) {
        backup();
        waitFor(function() {
          return $one('div.sysmsg');
        }, backup);
      }
    });
  }, true);
})();