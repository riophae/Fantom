
// ==UserScript==
// @include *
// ==/UserScript==

(function() {

	// 监视和记录用户状态
	// 当 Popup 处于激活态时阻止 Fantom 修改 Popup.href; 浏览关键页面后刷新数据

  var page;
  
  (function() {
    if (! siteType) return;
    function inform() {
      oe.postMessage({ act: 'user_changed' });
    }
    var user_id = pref.getItem('CURRENT_USER_ID');
    var cookie_strs = document.cookie.split(/\s*;\s*/);
    for (var i = 0, len = cookie_strs.length; i < len; i++) {
      var cookie = cookie_strs[i];
      if (cookie.test('u=', '^')) {
        var current_user = cookie.get('after', 'u=');
        if (current_user != user_id) {
          pref.setItem('CURRENT_USER_ID', current_user);
          inform();
        }
        return;
      }
    }
    if (user_id) {
      pref.removeItem('CURRENT_USER_ID');
      inform();
    }
  })();

  if (siteType) {
    if (thisUrl.test('http://fanfou.com/home', '^')) {
      page = 'timeline';
    } else {
      var keywords = 'mentions|privatemsg|friend.add|notice.hideall|notice.ignore|friend.request|ruif'.split('|');
      for (var i = 0, k; k = keywords[i]; i++) {
        if (thisUrl.test('fanfou.com/' + k)) {
          page = 'key';
          break;
        }
      }
    }
    if (thisUrl.test('?from=fantom', '$')) page = 'key';
  }

	var status = {
		site: siteType || 'other',
		page: page || 'normal',
    focus: true
	};

	function post(msg, first) { oe.postMessage({ act: 'status_changed', status: msg, first: first }); }

	function listen(ev_type, status) {
		window.addEventListener(ev_type, function(e) { post(status); }, false);
	}

	listen('focus', status);
	listen('blur', { site: 'other', page: 'normal' });
  post(status, true);

})();