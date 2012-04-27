
// ==UserScript==
// @include http://m.fanfou.com/*
// ==/UserScript==

var sessionStor = window.sessionStorage;
	fUrl = 'http://m.fanfou.com/',
	lastPage = document.referrer,
	d = document.body,
  thisUrl = thisUrl.get('before', '?') + '';

var	pageNum,
	isHome = is('home'),
	isMentions = is('mentions'),
  isMsgReply = is('msg.reply'),
  isMsgForward = is('msg.forward'),
  isSearch = is('q/') || is('search');

var firstPage = fUrl + 'home/p.1';

function noop() { }
function jumpToLink(url) {
	if (url == firstPage)
		url = fUrl + 'home';
  window.location.assign(url);
}

if (thisUrl == firstPage) {
	jumpToLink(fUrl + 'home');
}

var jumpTo = sessionStor.last_page;
if (jumpTo == firstPage) {
  jumpTo = (thisUrl == fUrl + 'home' || thisUrl == firstPage) ?
    '' : fUrl + 'home';
}
sessionStor.last_page = '';

if (isHome && jumpTo && jumpTo != thisUrl) {
	if (is(lastPage, 'home') && is(jumpTo, 'home') ||
		is(lastPage, 'msg.del') ||
		is(lastPage, 'msg.reply') ||
		is(lastPage, 'msg.forward')) {
		jumpToLink(jumpTo);
	}
}

(function() {
  var jumpTo = pref.getItem('last_page');
  pref.last_page = '';
  if (jumpTo && thisUrl == fUrl + 'home' &&
		jumpTo != firstPage && jumpTo != thisUrl) {
    jumpToLink(jumpTo);
	}
})();

function $tag(t, elem) { return (elem || document).getElementsByTagName(t); }
function tagName(elem) { return elem.tagName && elem.tagName.toLowerCase(); }
function is(url, patt) {
  if (arguments.length == 1) {
    patt = url;
    url = thisUrl;
  }
  return (url + '').test(fUrl + patt, '^');
}
var ta = $tag('textarea')[0];

function insertCSS() {
  var style = '* {font-family: "微软雅黑", "Hiragino Sans GB W3", Helvetica, Verdana, sans-serif !important;}' +
  '::selection {background: #EFF9FA;}' +
  '.hide {display: none !important;}' +
  'body, #statusBox {padding: 0 5px;font-size: 13px;max-width: 480px;margin: 0 auto;background: #EFF9FA;}' +
  '#goTopIcon {position: fixed;z-index: 9999;right: 0;top: 0;width: 15px;height: 17px;background: #FFF url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAPCAYAAAA/I0V3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAHVJREFUOE/Nj8kNgDAMBE3/DQANAB0AbeXOZ5EfRlEwR35Yms96x0q6nDOodVJKaIVYGJf9M9ynGCNaoRACWiHvPTSGeVNz7pJzDjUsCNr+IpXCnUjWWgj9tOKOskfGGDBPguyke0oS1AfK/CeS9qQyU//0Jh0aQZuX+U2CsQAAAABJRU5ErkJggg==") center center no-repeat;border: 1px solid #BDC3C8;border-top: 0;border-right: 0;border-radius: 0 0 0 3px;display: block;}' +
  'h1, p.n {text-align: center;}' +
  'h2 {text-align: center;background: #D4FEF5;font-size: 16px;}' +
  'a, a:hover, a:visited, a:active, a:focus {color: #049DD9;background: none;text-shadow: 0 1px 1px rgba(88, 88, 88, 0.15);border: 0;}' +
  'a:hover {color: #0AB6FA;}' +
  'input.i {font: 12px "微软雅黑", Verdana;padding: 3px 5px;margin: -5px 0 -5px 0;width: 420px;}' +
  'p {padding: 5px 0 2px 2px;font-size: 13px;}' +
  'p.n {overflow: hidden;-o-transition: height .3s linear;transition: height .3s linear;height: 20px;}' +
  'p.item, #statusBoxInner {box-sizing: border-box; background: #fff; border-width: 1px; border-style: solid; border-color: #DDD #BDC3C8 #A5A5A5 #BDC3C8;border-radius: 5px;padding: 5px 8px;margin: 5px 0;font-size: 13px;}' +
  'p.item:hover {border-color: #E5E5E5 #CCC #BBB #CCC;}' +
  '.slideUp {overflow: hidden; -o-transition-duration: .5s;-o-transition-timing-function: ease-out;-o-transition-property: height, padding-top, padding-bottom;transition-duration: .5s;transition-timing-function: ease-out;transition-property: height, padding-top, padding-bottom;height:0;padding:0;}' +
  '[type="submit"] {font: 11px "微软雅黑";width: 75px;height: 22px;color: #fff;margin: 2px 0 10px;padding: 0;outline: 0;background-image: -o-linear-gradient(top, #18D8F2 20%, #73CCE7);border-radius: 2px;border: 1px solid rgba(115, 204, 231, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);}' +
  'textarea {font-size: 12px;color: #888;word-wrap: break-word;padding: 3px 5px !important;margin: 10px 0 3px !important;width: 420px;border: 1px solid #ddd;box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);border-radius: 4px;}' +
  'textarea:focus {color: #000;}' +
  'textarea[disabled="true"] {color: #777; background: #fff;}' +
  'input[type="text"]:focus, textarea:focus, select:focus{ box-shadow: 0px 0px 5px #0099FF; }' +
  '#submitBar {width: 430px;margin: 0 auto;padding: 0;}' +
  '#counter {width: 25px;height: 12px;overflow: hidden;text-align: center;float: left;clear: left;font-size: 11px;color: #555;-o-transition: opacity .3s ease-in;transition: opacity .3s ease-in;}' +
  '#uploadPhoto {float: right;clear: right;font-size: 11px;color: #555;width: 25px;}' +
  '#uploadIcon {content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGoSURBVDhPxVPfK4NRGN6fwP4Csh8uJFtTYijNhVgpF3KBD7Vvmw2bpXazyC4kC/thCWVLuEFLKDGzFpGyXSv7NlO2/2BXj+986ztaXEwpbz29p9P7PO9z3nOORPLv4XA4YDabYTKZKgKpJRxqnGxUGnq9HiKogNFoFPjseQaWCw5WHvZLDnNXWZgvMjDw++NnHJjTtEC23AwLmQoQ6yQcV2m4btJYvOXg5LM7kYHzNovZaJZ2HXUNoftYDZ1d++VEFPAkXuG7S2PzgcNygsf9GzyPOfieckJxX6QVLYcy1IekUO5IIQ9Wl5yIAnvJd+yncjhI5hBOfSD0/ILFiBeuo3nard2qgWKrGlpW892BNxpFMB5HIBaD7zoG94kfgwsdPNrQM6MF6x0QSLK1qvIZiEM0LHeCXdJharULk+vNsHpVGLDXon9ahl5LDZgVBe1aNkTxGic26jDmV4IJ8NiWY2y3HkyoASO7jRgPq8CEmzAaVgsDJxx6CyzLVvoMaB3hfBOI8WcnKBQKQhZRLBbpOp/Pl97MTwK/sVEmYLPZBMXfgHD+7BN/AqbEDh5XFNtYAAAAAElFTkSuQmCC");}' +
  'p:not(#statusBoxInner) > span.t::before {content: "\\A"; white-space: pre;}' +
  'span.t, span.a {font-size: 11px;}' +
  'ol li a, p.a {font-size: 13px;}' +
  'p.a {text-align: center;padding-bottom: 10px;}' +
  'span.right {float: right;clear: right;padding-top: 7px;display: none;}' +
  'span.right sua {font-size: 10px;}' +
  'p#pageNum, p.visitedPage {text-align: center;}' +
  'p.loading span.loading {background: url("data:image/png;base64,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") left center no-repeat; padding-left: 32px;}' +
  'p#pageNum span.error {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAwBJREFUWEftll1Ik1EYxyVCdM6PLVe5iViUkSRkindedRGkhFjkTXRRFyHRx4UVRFBGJiUy+1CjXVhp2BeCdZGhQd5kSBaKRZZWGmU6xUy3vXPR0/M/+MKQOucIu8vBjz3j/b+/83/PNjhRUUuvpR1YsAP99zKje5qcFS+bnF97brsoEggXO+FWbjgHK0e6yyj4s5d+h0YjAlxwwq1RwOU1JltpbuwsBUdKIgJccPY0ubzqArztocn6iCwc/gBw4uvUKzBRR8bwbinu8mw6vD9DgFmVD7FzEQVqWbhLyvmT+XSidIMAsyofmqhdRAHvVTI+FUu5Xr2dGt25AsyqfIid+jvgvULGxyIpDTUF9KAuT4BZlQ+xU7/A+CUyhnZIab62k+7X5gowq/IhdmoXmBurocBgoZSOlgN05/IWAWZVHk79At/dFHhfIKWtuYQaqzcLMKvyc+zULhAcrSb/wDYpfc9KqeFilgCzKg+nfoFvVeR/u1XK67Zi8pzbKMCsygfZqV/gSyX5+vKlBD7so/rT6wWYVfkgO7ULGMPlNPsqV8mv6ecEdLJw6hcYPEUzXZukHN3joL2FdgFmVd5gp3YB/8Axmu5cI6XqeA5VlCYLMKvycOoXeHOEfrSvkuI5k03N5SsEmFV5Pzu1C/j6DtLU4yQpgSE3hbwdAsyqPJz6BfoP0dST5IjiY6deAT61zL4r479VMc284B9iBPD1FhGcshPRMj6pgOium66qz52F5Bu5QMExDwXHG8nw3iVjooVpZR4yj/4BriHDWb4H98IBF5xdN5xuXmP5/FpYT7zEwg6Hw5qQkGDPybSltdc7Pd23XN5InIjhgOspO/Oy7KmJiYlJKSkpFqw5v7ZoFGO32xOsVmtybGys02azpXEwnVkLuNi6hcTHx2eEs/C6ee/8ezqcFotlNR4SDxtewNwFUQTtUAZNUSguLm4lbgQox9dS+T0VQhN8DsNp5nEvHHDBGfbk5tfw1zOq+XtACGCrwolBUQnhWdNhOpWH4v8v8AdthWhMkblBZAAAAABJRU5ErkJggg==") left center no-repeat; padding: 5px 0 5px 32px;}' +
  'p.s br, div.b {display: none;}' +
  '#statusBox {padding: 0;margin: 0;top: 0;left: 0;position: fixed;z-index: 99999;width: 100%;max-width: none !important;height: 100%;background: rgba(0, 0, 0, 0.75);display: none;}' +
  '#statusBoxInner {position: fixed;top: 50%;left: 50%;width: 400px;margin-left: -200px;margin-top: -50px;z-index: 9999;border: 1px solid #EEE;box-shadow: 0 0 20px rgba(0, 180, 255, 0.8);}' +
  '#statusBoxInner p {text-align: center;line-height: 30px;}' +
  '#statusBoxInner p img, .visitedPage img, #pageNum img {margin: 11px 2px -11px 0;}' +
  '#statusBoxInner span.loading {background: url("data:image/png;base64,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") left center no-repeat; padding-left: 32px;)}' +
  '#statusBoxInner span.error {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAwBJREFUWEftll1Ik1EYxyVCdM6PLVe5iViUkSRkindedRGkhFjkTXRRFyHRx4UVRFBGJiUy+1CjXVhp2BeCdZGhQd5kSBaKRZZWGmU6xUy3vXPR0/M/+MKQOucIu8vBjz3j/b+/83/PNjhRUUuvpR1YsAP99zKje5qcFS+bnF97brsoEggXO+FWbjgHK0e6yyj4s5d+h0YjAlxwwq1RwOU1JltpbuwsBUdKIgJccPY0ubzqArztocn6iCwc/gBw4uvUKzBRR8bwbinu8mw6vD9DgFmVD7FzEQVqWbhLyvmT+XSidIMAsyofmqhdRAHvVTI+FUu5Xr2dGt25AsyqfIid+jvgvULGxyIpDTUF9KAuT4BZlQ+xU7/A+CUyhnZIab62k+7X5gowq/IhdmoXmBurocBgoZSOlgN05/IWAWZVHk79At/dFHhfIKWtuYQaqzcLMKvyc+zULhAcrSb/wDYpfc9KqeFilgCzKg+nfoFvVeR/u1XK67Zi8pzbKMCsygfZqV/gSyX5+vKlBD7so/rT6wWYVfkgO7ULGMPlNPsqV8mv6ecEdLJw6hcYPEUzXZukHN3joL2FdgFmVd5gp3YB/8Axmu5cI6XqeA5VlCYLMKvycOoXeHOEfrSvkuI5k03N5SsEmFV5Pzu1C/j6DtLU4yQpgSE3hbwdAsyqPJz6BfoP0dST5IjiY6deAT61zL4r479VMc284B9iBPD1FhGcshPRMj6pgOium66qz52F5Bu5QMExDwXHG8nw3iVjooVpZR4yj/4BriHDWb4H98IBF5xdN5xuXmP5/FpYT7zEwg6Hw5qQkGDPybSltdc7Pd23XN5InIjhgOspO/Oy7KmJiYlJKSkpFqw5v7ZoFGO32xOsVmtybGys02azpXEwnVkLuNi6hcTHx2eEs/C6ee/8ezqcFotlNR4SDxtewNwFUQTtUAZNUSguLm4lbgQox9dS+T0VQhN8DsNp5nEvHHDBGfbk5tfw1zOq+XtACGCrwolBUQnhWdNhOpWH4v8v8AdthWhMkblBZAAAAABJRU5ErkJggg==") left center no-repeat; padding: 5px 0 5px 32px;}' +
  '#form {display: none;}' +
  'form[submitting="true"] {opacity: .5;}' +
  'form.onsuccess { opacity: .9; }' +
  'form.onerror textarea { color: #000 !important; box-shadow: 0px 0px 5px red !important; }' +
  'form.onerror [type="submit"] { content: "失败, 请重试"; line-height: 21px;}';
  insertStyle('wap', 'wap', style);
  style = null;
}

var process_page_num;
if (! isSearch && ! is('photo/') && ! is('photo.normal/')) {
  process_page_num = true;
  pageNum = parseInt(((/\/p\.(\d+)$/i).exec(thisUrl) || [])[1]) || 1;
}

function AJAX(action, callback, extra) {
  extra = extra || {};
  var responseRequried = extra.responseRequried !== false;
  var method = (extra.method || 'GET').toUpperCase();

  var req = new window.XMLHttpRequest;
  req.onreadystatechange = function(e) {
    if (req.readyState !== 4) return;
    clearTimeout(timeout);

    var resp = req.responseText;
    (callback.onrequestend || noop)(resp);
    if (req.status !== 200) {
      if (resp || ! responseRequried) {
        callback.onerror(resp);
      } else {
        callback.onerror();
      }
    } else {
      callback.onsuccess(resp);
    }
  }
  req.open(method, action, ! extra.sync);

  var timeout = setTimeout(function() {
    req.abort();
    callback.onerror(req.responseText);
    (callback.onrequestend || noop)(req.responseText);
  }, 10000);

	try {
    if (method === 'POST') {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send((extra.param + '').replace(/%20/g, '+'));
    } else {
      req.send(null);
    }
	}
	catch (err) {
    clearTimeout(timeout);
    callback.onerror(req.responseText);
    (callback.onrequestend || noop)(req.responseText);
	}
}

function getForm(url, callback, onerror) {
  AJAX(url, {
    onsuccess: function(source) {
      var $form = $i('form');
      $form.innerHTML = '<form' + source.get('after', '<form').get('before', '</form>') + '</form>';
      postForm($form, callback);
    },
    onerror: onerror
  });
}

function postForm(form, callback) {
  if (tagName(form) !== 'form')
    return postForm($tag('form', form)[0], callback);

  if (form.getAttribute('submitting')) return;
  form.setAttribute('submitting', true);

  var items = [];
  forEach.call($('[name]', form), function(item) {
    items.push(encodeURIComponent(item.name)
			 + '=' + encodeURIComponent(item.value));
  });

  callback.onrequestend = function() {
    setTimeout(function() {
      form.removeAttribute('submitting');
      ta && (ta.disabled = false);
    }, 1500);
  }

  var extra = {
    method: 'POST',
    param: items.join('&')
  };

  AJAX(form.getAttribute('action'), callback, extra);
}

function submitForm(form) {
  if (is('photo.upload') || isSearch || form.action.value === 'friend.add' || form.action.value ==='login') {
    return form.submit();
  }

  if (! (ta && ta.value))
    return;

  if (form.className.test('onerror'))
    return;

  ta.disabled = true;

  postForm(form, {
    onsuccess: function() {
      form.className = 'onsuccess';
      setTimeout(function() {
        form.className = '';
      }, 1500);
      ta.disabled = false;
      ta.blur();
      var _ph = ta.placeholder;
      ta.value = '';
      ta.placeholder = '(发送成功)';
      storage.removeItem(ta.id);
      var counter = $i('counter');
      counter && (counter.innerHTML = '140');

			if (thisUrl == fUrl + 'home' && pageNum === 1) {
				window.location.reload();
			}
      setTimeout(function() {
        ta.placeholder = _ph;
        if (isMsgForward || isMsgReply) {
          jumpToLink(jumpTo || lastPage);
        }
        if (is('privatemsg.create') || is('privatemsg.reply/')) {
          window.history.go(-1);
        }
      }, 1000);
    },
    onerror: function() {
      form.className = 'onerror';
      setTimeout(function() {
        form.className = '';
      }, 1500);
    }
  });
}

function loadNextPage(e) {
  e && e.preventDefault();

  var nextPageLink = $i('pageNum');
  nextPageLink.innerHTML = '<span class="loading">看看第 ' + (pageNum+1) + ' 页有什么..</span>';

  var loading = nextPageLink;
  loading.className = 'visitedPage loading';
	loading.removeAttribute('id');

  var action = fUrl + 'home/p.' + (pageNum+1);

  var callback = {};

  callback.onsuccess = function(source) {
    pageNum++;
    source = source.replace(/<a href="\/mentions">@我的\(\d+\)<\/a><\/h2>/, '<a href="/mentions">@我的</a></h2>')
             .get('after', '<a href="/mentions">@我的</a></h2>')
             .get('before', '<p>热门话题： <a href="');

    var pastPageNum = parseDom('<p class="visitedPage"><第 ' + (pageNum-1) + ' 页><p>')[0];
    var parent = loading.parentNode;
    parent.insertBefore(pastPageNum, loading);

    var newPageItems = parseDom('<div>' + source + '</div>')[0];
    var newPage = document.createDocumentFragment();
    while (newPageItems.firstChild)
      newPage.appendChild(newPageItems.firstChild);

    parent.insertBefore(newPage, loading);

    processParagraphs($('p:not(.item)'));

    var newPageBar = $one('[accesskey="4"]').parentNode;
    fixAccessKey(newPageBar);
    pageNumHandler(newPageBar);

    loading.parentNode.removeChild(loading);

    var pageNumPos = docelem.scrollTop +
      pastPageNum.getBoundingClientRect().top +
      pastPageNum.clientHeight;

    hideGoTopIcon();
    scrollTo(pageNumPos);
  }

  callback.onerror = function() {
    loading.id = 'pageNum';
    loading.className = '';
    loading.innerHTML =  '<span class="error">加载第 ' + pageNum + ' 页失败. 请<a id="nextPage" href="javascript:void(0);" title="重新加载"">重试</a>.</span>';
    $i('nextPage').onclick = loadNextPage;
  }

  AJAX(action, callback);
}

function showStatus(status_add) {
	var status_id = status_add.get('after', fUrl + 'statuses/').get('before', '?');
  var box = $i('statusBoxInner');

  var callback = {
    onsuccess: function(source) {
      var keywords = '/msg.reply/|/msg.forward/|/msg.favorite.add/|msg.favorite.del|/msg.del/'.split('|');
      var key, count = 0;

      for (var i = 0; key = keywords[i]; i++) {
        if (source.test(key + status_id)) count++;
      }

      if (source.test('="/photo.del/')) count++;

      if (count >= 2) {
        var s =
          source.get('after', '"><img src="http://static.fanfou.com/i/fanfou.gif" alt="饭否" /></a></h1>')
                .get('before', '<div id="nav">')
                .replace(/<span class="stamp"><span class="t">(.+)<\/span><\/span>/, '<span class="t">$1<\/span>');

        box.innerHTML = s;
      } else {
        box.innerHTML = '<p><span class="error">啊哦, 这条消息好像已经被删掉了? (也可能是不公开..)</span></p>';
      }
    },
    onerror: function() {
      box.innerHTML = '<p><span class="error">请检查网络连接..</span></p>';
    }
  };

  AJAX(status_add, callback);
}

function favourite(link) {
	var act_name = link.innerHTML;
	var act = (act_name == '收藏');
	link.innerHTML = '...';

  var callback = {
    onsuccess: function(result) {
      link.innerHTML = act ? '取消' : '收藏';
      link.href = fUrl +
        'msg.favorite.' +
        (act ? 'del' : 'add') +
        link.href.substr(36);
    },
    onerror: function() {
      link.innerHTML = act_name;
    },
    onrequestend: function() {
      callback.onerror();
    }
  };

  AJAX(link.href, callback);
}

function AJAXPost(link) {
  var text = link.innerHTML;
  if (text != '确定?') {
    link._text = text;
    link.innerHTML = '确定?';
    var t = setTimeout(function() {
      link.innerHTML = '删除';
      t = null;
    }, 2500);
    link.addEventListener('click', function() {
      link.removeEventListener('click', arguments.callee);
      t && clearTimeout(t);
    });
    return;
  }

  link.innerHTML = '...';

  var callback = {
    onerror: function() {
      link.innerHTML = link._text;
    },
    onsuccess: function() {
      if (is('statuses/')) {
        window.history.go(-1);
      } else if (is(link.href, 'friend.remove/')) {
        link.innerHTML = '已取消关注';
        link.href = 'javascript:void(0)';
      } else {
        slideUp(searchItem(link));
      }
    }
  };

  getForm(link.href, callback, function() {
    callback.onerror();
  });
}

function processFollower(link) {
  var text = link.innerHTML;
  link.innerHTML = '...';
  getForm(link.href, {
    onsuccess: function() {
      link.innerHTML = '成功';
      var item = link.parentNode.parentNode;
      if (tagName(item) === 'li') {
        slideUp(item);
      }
    },
    onerror: function() {
      link.innerHTML = text;
    }
  });
}
function showPhoto(photo_link) {
  var action = fUrl + 'photo.normal/' + photo_link.href.get('before', '?').get('after', fUrl + 'photo/');
  var callback = {
    onsuccess: function(source) {
      var result = source.match(/<img src="(http:\/\/photo[^"]+)"/);
      var large_url = result && result[1];
      if (! large_url) {
        photo_link.innerHTML += '(未公开)';
        photo_link.href = 'javascript:void(0)';
        return;
      }
      if (docelem.clientHeight > 500 && docelem.clientWidth > 800) {
        fullPhoto.show(large_url, 0);
      } else {
        oe.postMessage({
          act: 'show_photo',
          img: large_url,
          link: 'http://fanfou.com/photo/' + photo_link.href.substr(26)
        });
      }
    },
    onerror: function() {
      alert('没有找到这张照片..');
    }
  };

  AJAX(action, callback, { sync: true });
}

function searchItem(link) {
  var item = link.parentNode;
  while ((item = item.parentNode) && item.className.test('item'))
    return item;
}

function isLink(elem) {
  return elem && elem.tagName && elem.tagName.toLowerCase() === 'a';
}

function processURL(url) {
  return (url + '').get('after', 'http://www.google.com.hk/gwt/n?u=');
}

function delegate(filter, type, listener, notSearch) {
  d.addEventListener(type, function(e) {
    var target = e.target;
    do {
      if (! e.cancelBubble && filter.call(target, e) === true) {
        if (listener.call(target, e) === false)
          e.preventDefault();
        return;
      }
    } while (! notSearch && (target = target.parentNode) && target.tagName);
  }, false);
}

delegate(function(e) {
  return (isLink(e.target) || tagName(e.target) === 'img') && this.className === 'item';
}, 'click', function() {
  if (isHome) {
    itemInPage = +this.getAttribute('data-page') || 1;
    pref.last_page = sessionStor.last_page = fUrl + 'home/p.' + itemInPage;
  } else {
    pref.last_page = sessionStor.last_page = thisUrl;
  }
});

var noCacheRE = /\?v=\d+/;
delegate(function() {
  return isLink(this) && noCacheRE.test(this.href);
}, 'click', function(e) {
  pref.last_page = sessionStor.last_page = '';
  jumpToLink(this.href.replace(noCacheRE, ''));
  e.preventDefault();
	e.stopPropagation();
});

delegate(function() {
  return isLink(this);
}, 'mousedown', function(e) {
	var link = this;
  var href = is(link.href, 'q/') ? link.href : processURL(link.href);
  if (href && (href != link.href)) {
    link.gwtLink = href;
		link.target = '_blank';
		link.href = decodeURIComponent(href);
  }
});

delegate(function() {
  return isLink(this);
}, 'click', function(e) {
	var link = this;
  var href = is(link.href, 'q/') ? link.href : processURL(link.href);
  if (href && (href != link.href)) {
    link.gwtLink = href;
		link.target = '_blank';
		link.href = decodeURIComponent(href);
  }
  if (! is(href, '')) return;

  if (link.innerHTML === '...') {
    return false;
  }

  if (is(href, 'statuses/')) {
    $i('statusBoxInner').innerHTML = '<p><span class="loading">加载中..</span></p>';
    $i('statusBox').style.display = 'block';
    showStatus(href);
    return false;
  }

  if (is(href, 'msg.favorite.add/') ||
      is(href, 'msg.favorite.del/')) {
    favourite(this);
    return false;
  }

  var text = this.innerHTML;
  if (/刷新|最新消息|@我的|下页|上页|^(首页|我的空间|私信)$|关注的人/.test(text))
    pref.last_page = sessionStor.last_page = jumpTo = '';

  if (/^(关注此人|隐藏|删除|取消关注|确定\?)$/.test(text)) {
    AJAXPost(this);
    return false;
  }

  if (is(href, 'friend.')) {
    processFollower(this);
    return false;
  }

  if (text === '...')
    return false;

}, true);

delegate(function() {
  return isLink(this);
}, 'click', function(e) {
  if (is(this.href, 'photo/')) {
    showPhoto(this);
    return false;
  }
});

d.addEventListener('contextmenu', function(e) {
	return;
  if (! isLink(e.target)) return;
	var link = e.target;
	if (link.processed) return;
	link.processed = true;

	var href = link.gwtLink || processURL(link.href);
	if (href != link.href) {
		link.gwtLink = href;
		link.href = decodeURIComponent(href);
	}
});

d.addEventListener('submit', function(e) {
  e.preventDefault();
  submitForm(e.target);
});

function slideUp(item) {
  if (! item) {
    $i('statusBox').style.display = 'none';
    return;
  }
  item.style.height = item.clientHeight + 'px';
  setTimeout(function() {
    item.className += ' slideUp';
    item.style.height = '0';
    item.style.paddingBottom = '0';
    item.style.paddingTop = '0';
  }, 1);
  setTimeout(function() {
    item.parentNode.removeChild(item);
  }, 501);
}

function scrollTo(end) {
	var y = docelem.scrollTop;
  var direction = end - y > 0 ? 1 : -1;
	window.scrollTo(0, Math.floor(
    (end ? ((end - y) / 1.1 + y) : (y / 1.1))
  ));

	if (Math.abs(end - y) > 1)
		setTimeout(function() { scrollTo(end); }, 16);
}

function hideGoTopIcon() {
  var $icon = $i('goTopIcon');
  $icon && ($icon.className = 'hide');
}

function stylish(tagName, num, style){
	$tag(tagName)[num].style = style;
}

(function() {
  fixSubmit();
  if (! (isHome || isMentions || isMsgReply || isMsgForward))
    return;

  waitFor(function() {
    return ! $one('input[type="submit"]');
  }, function() {
    var submit = $one('[type="submit"]');
    if (! submit) return;

    var parent = submit.parentNode;
    var counter = parseDom('<span id="counter"></span>')[0];
    parent.insertBefore(counter, submit);

    if (isHome) {
      var uploadPhoto = parseDom('<span id="uploadPhoto"><a href="http://m.fanfou.com/photo.upload" title="上传照片"><img id="uploadIcon" /></a></span>')[0];
      parent.insertBefore(uploadPhoto, submit);
    } else if (isMsgReply || isMsgForward) {
      var back = parseDom('<span id="uploadPhoto"><a href="' + (jumpTo || lastPage) + '" id="cancel" title="取消">取消</a>')[0];
      parent.insertBefore(back, submit);

      $i('cancel').onclick = function() {
        pref.last_page = sessionStor.last_page = jumpTo = '';
      }
    }
  });
})();

(function() {
  var statusBox = parseDom('<div id="statusBox"><div id="statusBoxInner"></div></div>')[0];
  d.appendChild(statusBox);

  statusBox.addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  }, false);

  if (isHome || isMentions) {
    var goTopIcon = parseDom('<a id="goTopIcon" class="hide" href="javascript:void(0)"></a>')[0];
    goTopIcon.onclick = function() {
      this.className = 'hide';
      scrollTo(0);
    }
    docelem.appendChild(goTopIcon);

    $tag('h2')[0].id = 'top';

    var form = document.forms[0];
    if (form && form.childNodes.length) {
      form.childNodes[1].id = 'submitBar';
    }

    var $notification = $one('p.n');
    if ($notification && $notification.innerHTML.test('发送成功！'))
      storage.removeItem('fantom_oriMessage');
    else
      ta.value = storage.getItem('fantom_oriMessage') || '';

    if (! isHome) return;
    window.onscroll = (function(hidden, t) {
      return function(e) {
        goTopIcon.className = 'hide';
        hidden = true;
        clearTimeout(t);

        t = setTimeout(function() {
          if (docelem.scrollTop > 500) {
            goTopIcon.className = '';
            hidden = false;
          } else {
            goTopIcon.className = 'hide';
            hidden = true;
          }
        }, 300);
      }
    })(true);

  }
})();

(function() {
  if (is('userview/'))  return;
  var user_view = $one('a[href^="/userview"]');
  if (! user_view || tagName(user_view.parentNode) !== 'body') return;
  var para = $c('p');
  para.className = 'a';
  var elem = user_view, elems = [ user_view ];
  while ((elem = elem.previousSibling) && tagName(elem) !== 'form') {
    elems.push(elem);
  }
  user_view.parentNode.insertBefore(para, user_view.nextSibling);
  var len = elems.length;
  while (len--) {
    para.appendChild(elems[len]);
  }
})();

function pageNumHandler(pageBar) {
  var $prePage = $one('[accesskey="4"]', pageBar);
  var $nextPage = $one('[accesskey="6"]', pageBar);
  if (! $prePage && ! $nextPage) return;

  ($nextPage || $prePage).parentNode.id = 'pageNum';

  if (! process_page_num) return;

  if ($nextPage) {
    $nextPage.id = 'nextPage';
    if (isHome) {
      $nextPage.onclick = loadNextPage;
    }
    $nextPage.innerHTML = '下页(' + (pageNum+1) + ')';
  }
  if ($prePage) {
    $prePage.innerHTML = '上页(' + (pageNum-1) + ')';
  }
}
pageNumHandler();

function fixAccessKey(parent) {
  var access = $('[accesskey]', parent);
  forEach.call(access, function(a) {
    [ a.previousSibling, a.nextSibling ].forEach(function(text) {
      if (! text || text.nodeName !== '#text') return;
      text.textContent = text.textContent.replace(a.getAttribute('accesskey'), '');
    });
  });
}
fixAccessKey();

(function() {
  if (isMsgReply) {
    if (is(lastPage, 'mentions') || (is(lastPage, 'home') && jumpTo == '')) {
      jumpTo = lastPage;
    } else if (! is(lastPage, 'home')) {
      jumpTo = '';
    }
    document.forms[0].childNodes[2].id = 'submitBar';
    var theReplyID = "fantom_msgReply_" + thisUrl.substr(30);
    ta.id = theReplyID;
    var value = storage.getItem(theReplyID) || '';
    if (value) {
      ta.value = value;
    }
  }

  if (isMsgForward) {
    if (is(lastPage, 'mentions')) {
      jumpTo = lastPage;
    } else if (! is(lastPage, 'home')) {
      jumpTo = '';
    }
    document.forms[0].childNodes[1].id = 'submitBar';
    var theForwardID = "fantom_msgForward_" + thisUrl.substr(32);
    ta.id = theForwardID;
    var value = storage.getItem(theForwardID) || '';
    if (value) {
      ta.value = value;
    }
  }

  var $counter;
  function textarea_bak(ta) {
    var $style = $counter.style;
    var counter;
    var timeout;
    function restore() {
      $style.opacity = 1;
      storage.setItem(ta.id, ta.value);
    }

    ta.oninput = function() {
      counter = 140 - ta.value.length;
      $counter.innerHTML = counter;
      $style.color = counter < 0 ? 'red' : '#555';
      $style.opacity = 0.3;

      clearTimeout(timeout);
      timeout = setTimeout(restore, 300);
    }
  }

  if (! (isHome || isMentions || isMsgReply || isMsgForward))
    return;

  waitFor(function() {
    return $counter = $i('counter');
  }, function() {
    $counter.innerHTML = 140 - ta.value.length;
    if (isHome || isMentions) {
      ta.id = 'fantom_oriMessage';
    }
    textarea_bak(ta);
  }, true);
})();

setTimeout(function() {
  if (isHome || isMentions) {
    showMotto(ta);
  }

	if (ta && isMsgForward) {
		ta.setSelectionRange(0, 0);
	}

  if (is(lastPage, 'search') || thisUrl == fUrl + 'q') {
    stylish('input', 0, 'margin: 10px 0 -5px 0;');
  }

  var $form = document.forms;
  for (var i = 0, form; form = $form[i]; i++) {
    form.style = thisUrl != fUrl ?
      'text-align: center' : 'line-height: 140%;';

    form.onkeydown = function(e) {
      if (! e.ctrlKey || e.keyCode !== 13)
        return;

      submitForm(this);
    }
  }

}, 0);

function processParagraphs($p) {
  forEach.call($p, function(p) {

    if ($one('span.a', p)) {
      isHome && p.setAttribute('data-page', pageNum);

      p.className = 'item';
      return;
    }

    var p_img = $tag('img', p);
    for (var j = 0, img; img = p_img[j]; j++) {
      var img_add = p_img[j].src;
      if (img_add.test('avatar') && img_add.test('.fanfou.com')) {
        p.style = 'text-align: center;';
        return;
      }
    }

    var html = p.innerHTML;
    if ((html.test('个人关注了你') || html.test('个人申请关注你')) && html.length < 15) {
      return p.className = 'n';
    }

    if (p.className == 'n' && (html.test('成功！') || html.test('已经发送给'))) {
      var s = p.style;
      setTimeout(function() {
        s.height = '0';
      }, 3000);
      setTimeout(function() {
        s.display = 'none';
      }, 3300);
    }

  });
}
processParagraphs($tag('p'));

(function() {
  var cr = $i('ft');
  if (cr) {
    var pre = cr.previousElementSibling;
    var next = cr.nextElementSibling;
    pre && d.removeChild(pre);
    next && d.removeChild(next);
  }
	if (is('photo.upload')) {
		var desc = $one('p');
		desc & d.removeChild(desc);
	}
})();

d.appendChild(parseDom('<div id="form"></div>')[0]);

ta && ta.focus();
insertCSS();