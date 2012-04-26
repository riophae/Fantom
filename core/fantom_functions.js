
Fantom.fn.check_logged = function() {
	// 检查是否登录
	return Fantom.logged = /<a href=\"http:\/\/fanfou.com\/home\?v=[0-9]*\">刷新<\/a>/.test(Fantom.source());
}

Fantom.fn.get_id = function() {
	// 获取当前用户ID
	/<title> 饭否 \| 欢迎你，(.+)<\/title>/.exec(Fantom.source());
	return RegExp.$1;
}

Fantom.fn.parseNum = function(d) {
	return parseInt(d, 10) || 0;
}

Fantom.fn.check_mentions = function() {
	// 检查@提醒数量
	/<a href=\"http:\/\/fanfou.com\/mentions\">@我的\((\w*)\)<\/a>(\w*)/.exec(Fantom.source());
	var count = Fantom.fn.parseNum(RegExp.$1);
	Fantom.count.mentions(count);
}

Fantom.fn.check_new_fo = function() {
	// 检查新关注者数量
	if (! Fantom.st.settings.check_fo && ! Fantom.st.settings.notify_fo)
		return Fantom.count.new_fo('reset');

	var source = Fantom.source();

	if (source.test('个人关注了你</p><p><span><a href='))
		Fantom.fn.get_fo_mode1(source);
	else if (source.test(' 个人申请关注你，<a href="http:\/\/fanfou.com/friend.request">去看看是谁</a></p>'))
		Fantom.fn.get_fo_mode2(source);
	else
		return Fantom.count.new_fo({ c: 0, list: '', content: '' });
}

Fantom.fn.get_fo_mode1 = function(source) {
	/<p>(\d+) 个人关注了你<\/p><p><span><a href=/.exec(source);
	var count = Fantom.fn.parseNum(RegExp.$1);

	var full_namelist_code;
	if (count > 3)
		full_namelist_code = XHR('http://m.fanfou.com/notifications');

	var max, s;
	if (full_namelist_code) {
		max = count;

		s = full_namelist_code.get('after', '<h2>'+ count + ' 个人关注了你</h2>');
		s = s.get('before', '<p><a href="/notice.hideall">隐藏以上所有通知</a></p><div id="nav">');
		s = s.split('隐藏</a></p><p><span>');
	} else {
		max = count > 3 ? 3 : count;

		s = source.get('after', '<p>'+ count + ' 个人关注了你</p>');
		s = s.get('before', '<h2>你在做什么？</h2><form method="post" action="/home"><p>');
		s = s.split('隐藏</a></span></p><p><span>');
	}

	var name_list = count == 1 ? [ '据猫仔队提供的可靠情报, TA的名字叫 ' ] : [ '好在我偷偷记下了他们的名字.. 好像是 ' ];

	var ss;
	for (var i = 0; i < count; i++) {
		ss = full_namelist_code ? s[i].get('before', '</a></span>开始关注你了 - <a href') : s[i].get('before', '</a></span>开始关注你了 <span class="a">');
		ss = ss.get('between', '">');

		if (max == 1) {
			name_list.push(ss + ' ..');
		} else {
			if (i < max-2 && max > 2)
				name_list.push(ss + ', ');
			else if (i == max - 1)
				name_list.push(ss + ' ..');
			else
				name_list.push(ss + ' 和 ');
		}

		if (i == 2 && ! full_namelist_code && count > 3) {
			name_list.push(' 咦, 好像没记全啊?')
			break;
		}
	}

	name_list = Fantom.fn.process_name_list(name_list);

	var title = '大事不妙, 又有 ' + count + ' 个坏蛋跟踪了你!';


	Fantom.count.new_fo({
		c: count,
		list: name_list,
		title: title,
		content: title + '\n' + name_list
	});
}

Fantom.fn.get_fo_mode2 = function(source) {
	var count = source.match(/\d+(?= 个人申请关注你，<a href=")/);
	count = Fantom.fn.parseNum(count);

	full_namelist_code = XHR('http://m.fanfou.com/friend.request');

	var name_list = [];
	if (full_namelist_code) {
		var s = full_namelist_code.get('between', '<ol>');
		s = s.get('before', '</ol>');
		s = s.split('</li>');

    name_list.push(count == 1 ? '据猫仔队提供的可靠情报, TA的名字叫 ' : '好在我偷偷记下了他们的名字.. 好像是 ');

		var x;
		for (var i = 0, m = s.length; i < m; i++) {
			if (! s[i].test('接受请求并关注')) continue;

			x = s[i].get('between', '</a>');
			x = x.get('between', '">');

			if (count == 1) {
				name_list.push(x + ' ..');
			} else {
				name_list.push(x);
				if (i < count-2 && count > 2)
					name_list.push(', ');
				else if (i == count - 1)
					name_list.push(' ..');
				else
					name_list.push(' 和 ');
			}

			if (i+1 == count) break;
		}
	} else {
		name_list.push('不过很遗憾, 猫仔队没能打听到这些坏蛋的消息..');
	}

	name_list = Fantom.fn.process_name_list(name_list);
	var title = '大事不妙, 又有 ' + count + ' 个坏蛋跟踪了你!';

	Fantom.count.new_fo({
		c: count,
		list: name_list,
		title: title,
		content: title + '\n' + name_list
	});
}

Fantom.fn.check_new_pm = function() {
	// 检查未读私信数量
	var source = Fantom.source();
	var count;
	if (! /<a href="http:\/\/fanfou.com\/privatemsg">你有/.test(source)) {
		count = 0;
	} else {
		/<a href="http:\/\/fanfou.com\/privatemsg">你有 (\w*) 条新私信<\/a>/.exec(source);
		count = Fantom.fn.parseNum(RegExp.$1);
	}
	Fantom.count.new_pm(count);
}

Fantom.fn.get_statuses = function(status_id) {
	var source = Fantom.source();
	if (typeof status_id == 'string') {
		// 获取最后一条消息
		if (status_id == 'latest') {
			// 消息发送者昵称
			id = source.get('between', '" class="p">').get('before', '</a>');

			// 获取消息发送时间和客户端
			var str = source.get('before', '</span>&nbsp;<span class="a"><a href="');

			str = str.get('after', '<span class="t">');
			detail = str.replace('&nbsp;', '');
			if (detail.test('span'))
				detail = detail.get('before', '</span>');

			var str = source.get('before', ' <span class="t">');
			str = str.get('between', '</a></h2><p><a href="');
			str = str.get('after', '</a> ');
      str = str.replace(/\n/g, ' ');

			// msg_a 仅仅是临时储存
			var msg_a = str.replace(/<a /g, '<a target="_blank" ');

			str = Fantom.fn.entities2instance(str); // 转换特殊字符

			// msg_b 用于 title, 没有 HTML 标签且分为多行
			var msg_b = Fantom.fn.divide(str); // 分割为多行
			// msg_c 用于广播, 含有 HTML 标签
			var msg_c = Fantom.fn.unGWT(msg_a);

            // 将消息中的图片 (指向 http://fanfou.com/photo/*) 置于消息头部
            var img = '';
            var reg = /<a target="_blank" href="http:\/\/fanfou.com\/photo\/[^">]+" class="photo"><img src="http:\/\/photo[0-9]*.fanfou.com\/[^">]+"[^>]*><\/a>/i;
            msg_c = msg_c.replace(reg, function(str) {
                img = str;
                msg_b = msg_b + ' [图片]';
               return '';
            });

			Fantom.latest_status({ id: id, content: msg_b, detail: detail, code: msg_c, img: img });
		}
	}
}

Fantom.fn.entities2instance = function(source) {
	// 转换 HTML 实体字符并移除标签
	var patterns = [ [ /<[^>]+>/g, '' ], [ /&#039;/g, "'" ], [/&nbsp;/g, ' ' ], [ /&amp;/g, '&' ], [ /&quot;/g, '"' ], [ /&lt;/g, '<' ], [ /&gt;/g, '>' ], [ /\n/g, '' ] ];
	patterns.forEach(function(p) {
		source = source.replace(p[0], p[1]);
  });
	return source;
}

Fantom.fn.divide = function(source) {
	// 分割长信息
	var divided_txt = '';
	var letter_code;
	while (source.length > 30) {
		for (var n = 0, i = 0; n < 30; n++, i++) {
			// n 表示这一行文字实际显示的宽度
			// i 表示将要在第几个字符处分割
			letter_code = source.charCodeAt(i);
			//判断是否为非中文字符
			if (letter_code > -1 && letter_code < 256)
				n -= 0.615; // 非中文字符宽度较小
			if (i == source.length && i > 30) break;
		}
		divided_txt += source.substring(0, i); // 将已分割的部分插入文本
		source = source.substr(i); // 剔除已分割的部分

		if (source) divided_txt += '\n'; // 如果还没有分割完则断行
	}

	divided_txt += source;
	return divided_txt;
}

Fantom.fn.process_name_list = function(name_list) {
	name_list = name_list.join('');
	name_list = Fantom.fn.divide(name_list);
	if (name_list.length > 300) {
		name_list = source.substring(0, 300) + '[TRUNC]';
	}
	return name_list;
}


Fantom.fn.unGWT = function(url) {
	// 屏蔽 GWT
	try {
		return url.replace(/href="http:\/\/www\.google\.com\.hk\/gwt\/n\?u=[^"]+"/g, function(s) {
			return 'href="' + decodeURIComponent(s.slice(39, -1).replace(/\+/g, '%20')) + '"';
		});
	} catch (e) {
		throw e + '\n' + url;
		return url;
	}
}