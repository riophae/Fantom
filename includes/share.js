
// ==UserScript==
// @include *
// @exclude http://fanfou.com/*
// @exclude http://*.fanfou.com/*
// ==/UserScript==

(function() {
	function $t(t) { return document.getElementsByTagName(t); }

  var $left, $top;
  var $icons = new $Elem(function() {
    $left = new $Elem(function() { return $t('fantom:share_left_icon')[0]; });
    $top = new $Elem(function() { return $t('fantom:share_top_icon')[0]; });
    return $t('fantom:share_icons')[0];
  }, true);

	var d = docelem || document.body;
  
	function append_icons() {
		if ($icons.elem) return;
		var style = '@media (max-width: 800px) { fantom\\:share_icons { display: none; } }' +
					'fantom\\:share_top_icon, fantom\\:share_left_icon { margin: 0 0 0 -62px; content: url("data:image/png;base64,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");  position: fixed; z-index: 999999; width: 124px; height: 43px; padding: 0; }' +
					'fantom\\:share_top_icon { left: 50%; top: 0; }' +
					'fantom\\:share_left_icon { left: 0; top: 50%; -o-transform-origin: center top; transform-origin: center top; -o-transform: rotate(-90deg); transform: rotate(-90deg); }' +
					'fantom\\:share_icons.onscroll { display: none; }' +
					'@media (max-height: 400px) { fantom\\:share_icons { display: none; } }' +
					'fantom\\:share_top_icon, fantom\\:share_left_icon { -o-transition: .2s opacity ease-in; transition: .2s opacity ease-in; }' +
					'fantom\\:share_icons .hide { opacity: 0; }'
		insertStyle('share-icons', 'web', style);
		style = null;

		var code = '<share_icons><share_top_icon class="hide" /><share_left_icon class="hide" /></share_icons>';
		var $code = parseDom(prefix(code))[0];
		d.appendChild($code);

    $icons.reset();

		window.addEventListener('scroll', onscroll, false);
		window.addEventListener('blur', auto_hide, false);
		d.addEventListener('mousemove', onmousemove, false);
		d.addEventListener('mouseout', auto_hide, false);
		$top.bind('click', share2fanfou);
		$left.bind('click', share2fanfou);
	}

	function onmousemove(e) {
		if (! $icons.elem) return;

		if (e.clientX < 62 && $top.hasClass('hide'))
			$left.removeClass('hide');
		else
			$left.addClass('hide');

		if (e.clientY < 43 && $left.hasClass('hide'))
			$top.removeClass('hide');
		else
			$top.addClass('hide');
	}

	function share2fanfou(e) {
		var d = document, w = window, f = 'http://fanfou.com/share',
			l = d.location, u = encodeURIComponent,
			p = '?u='+u(l.href)+'&t='+u(d.title)+'&d='+u(w.getSelection?w.getSelection().toString():d.getSelection?d.getSelection():d.selection.createRangu().text)+'&s=bm';
		w.open(f+'r'+p,'sharer','toolbar=0,status=0,width=600,height=400');
		e.preventDefault();
		e.stopPropagation();
	}

	function remove_icons() {
		if (! $icons.elem) return;
		$icons.remove();
		docelem.removeChild($i('web_style_share-icons'));
		window.removeEventListener('scroll', onscroll, false);
		window.removeEventListener('blur', auto_hide, false);
		d.removeEventListener('mousemove', onmousemove, false);
		d.removeEventListener('mouseout', auto_hide, false);
	}

	var onscroll = (function(t) {
		return function(e) {
			$icons.addClass('onscroll');
			clearTimeout(t);
			t = setTimeout(function() {
        $icons.removeClass('onscroll');
			}, 300);
		}
	})();

	function auto_hide(e) {
		// 在窗口失去焦点、鼠标移开窗口时自动隐藏按钮
		if (! $icons.elem) return;
		$top.addClass('hide');
		$left.addClass('hide');
	}

	function toggle_switch(e) {
		if (e.clientY >= 43) return;
		if (! $icons.elem) {
			fantom_switch('on');
			append_icons();
			$top.removeClass('hide');
      onset_handlers.showNotification();
		} else {
			fantom_switch('off');
			remove_icons();
			onmsg_handlers.stop_notifying();
		}
		e.stopPropagation();
	}

	// 双击页面顶部区域可以随时 开启/关闭 分享、通知功能
	d.addEventListener('dblclick', toggle_switch, false);

	function share_icons() {
		if (fantom_switch() && pref.getObj('fantom_settings').share_icons)
			append_icons();
		else
			remove_icons();
	}

	onset_handlers.setProp({
    share_icons: share_icons,
    show_icons: append_icons,
    hide_icons: remove_icons
  });

})();