
Fantom.setProp({
	version: (function() {
		var ver = widget.version;
    // 是否刚刚升级了 Fantom ?
		if (ver != pref.version) {
			// createTab(widget.id, true);
			// createTab('options.html', false);
      // 创建一个缓存签名, 注入脚本会据此初始化缓存
      cache.create();
		}
		pref.version = ver;
		return ver;
	})(),
	timer: {
		stop: function() {
			clearInterval(this.IDInterval);
		},
		reset: function() {
			this.stop();
			this.IDInterval = setInterval(function() {
				Fantom.checker(true);
			}, 60000);
		}
	},
	checker: (function() {
		var t;
		return function(timed_check) {
      if (Fantom.busy) return;
			// 如果是周期外的检查, 重置定时器
			if (! timed_check) Fantom.timer.reset();
			clearTimeout(t);
			t = setTimeout(function() {
				Fantom.button.update({
					title: '啊噢, 饭兜竟然出错了.. > <..',
					icon: 'icons/icon-6.png',
					badge: {
						textContent: 'ERR',
						backgroundColor: 'rgba(211, 0, 4, .8)'
					}
				}, '');
			}, 7500);

			Fantom.button.update({
				title: '加载..',
				icon: 'icons/icon-1.png',
			}, '');
      
      Fantom.busy = true;

			// 更新源码缓存, 并检查是否正常
			if (! Fantom.source('update')) {
				Fantom.button.update({
					title: '糟糕! 与饭否大本营失去联络!',
					icon: 'icons/icon-0.png',
					badge: {
						textContent: 'ERR',
						backgroundColor: 'rgba(211, 0, 4, .8)'
					}
				}, 'http://fanfou.com/');
				new Fantom.data;
				clearTimeout(t);
				return;
			}
			if (! Fantom.fn.check_logged()) {
				Fantom.button.update({
					title: '你好像还没有登录饭否吧? 点击这里就能登录..',
					icon: 'icons/icon-7.png',
				}, 'http://fanfou.com/');
				new Fantom.data;
				clearTimeout(t);
				return;
			}

			// 与服务器连接正常且用户已登录则读取数据并广播
			Fantom.counter();
			Fantom.notify();
			clearTimeout(t);
		}
	})(),
	source: (function() {
		// 缓存 http://m.fanfou.com/home 的源码
		var source = '';
		var url = 'http://m.fanfou.com/home';
		return function(value) {
			if (value == 'update') {
				// 更新源码缓存
				source = XHR(url, true) || '';
				source = source.replace(/http:\/\/m\.fanfou\.com/g, 'http://fanfou.com');
        source = source.replace(/href="([^"]+)"/ig, function(str, $1) {
          if (! $1.test('http://', '^'))
            str = str.replace($1, 'http://fanfou.com' + ($1.test('/', '^') ? '' : '/home') + $1);
          return str;
        });
				return !! source.length;
			} else {
				return source;
			}
		}
	})(),
	counter: function() {
		// 统计 新提醒 / 新关注者 / 新私信 数量
		Fantom.fn.check_mentions();
		Fantom.fn.check_new_fo();
		Fantom.fn.check_new_pm();
	},
	notify: function() {
		var enable_popup = !! Fantom.st.settings.enable_popup;

		var currentID = Fantom.fn.get_id(); // 获得当前登录者ID
		Fantom.fn.get_statuses('latest'); // 获得 timeline 上的最后一条消息

		var title_msg = []; // 将要显示为按钮标题的消息
		var bc_msg = []; // 将要向所有标签广播的消息

		var url = enable_popup ? 'http://m.fanfou.com' : 'http://fanfou.com';
		var prop = { icon: 'icons/icon-0.png' }
		var total = Fantom.count.total();
		if (total > 0) {
			if (Fantom.count.isChanged()) sound();
			prop.badge = {
				textContent: total,
				backgroundColor: total > 3 ? 'rgba(211, 0, 4, .8)' : 'rgba(113, 202, 224, .8)'
			}
		} else {
			title_msg.push('没人理你? 去看看大家都在做什么..');
		}


		var id = Fantom.latest_status().id;
		id = id == currentID ? '您' : id;
		if (/[A-Za-z0-9]$/.test(id))
      id += ' ';

		var detail = Fantom.latest_status().detail;
		if (/^[0-9]/.test(detail))
      detail = ' ' + detail;
		if (/[A-Za-z0-9]$/.test(detail))
      detail = detail + ' ';

		title_msg.push(id + '于' + detail + '发送了最后一条消息:' + '\n' + Fantom.latest_status().content);

		if (Fantom.st.settings.notify_status && id != '您' && Fantom.latest_status('isChanged')) {
			bc_msg.push({
				title: '<strong>' + id + '</strong>于' + detail.get('before', '通过') + ':',
				content: Fantom.latest_status().code,
				url: 'http://fanfou.com/home',
        img: Fantom.latest_status().img
			});
		}


		var mentions = Fantom.count.mentions('count');
		if (mentions) {
			url = mentions > 2 ? 'http://fanfou.com/mentions' : 'http://m.fanfou.com/mentions';
			prop.icon = 'icons/icon-2.png';
			var mentions_title = '快去看看, 你又被召唤了 ' + mentions + ' 次..';
			title_msg.push(mentions_title);
			if (Fantom.st.settings.notify_mentions)
				bc_msg.push({ title: mentions_title, url: 'http://fanfou.com/mentions' });
		}


		var new_fo = Fantom.count.new_fo('count');
		if (Fantom.count.new_fo('count')) {
			if (Fantom.st.settings.check_fo) {
				url = new_fo > 3 ? 'http://fanfou.com/home' : 'http://m.fanfou.com/home';
				prop.icon = 'icons/icon-3.png';
				title_msg.push(Fantom.count.new_fo().content);
			}
			if (Fantom.st.settings.notify_fo) {
				bc_msg.push({
					title: Fantom.latest_status().title,
					content: Fantom.latest_status().list,
					url: 'http://fanfou.com/home'
				});
			}
		}


		var new_pm = Fantom.count.new_pm('count');
		if (new_pm) {
			prop.icon = 'icons/icon-4.png';
			url = new_pm > 2 ?
        'http://fanfou.com/privatemsg' :
        'http://m.fanfou.com/privatemsg';

			var pm_title = new_pm > 2 ?
        '你最近人品爆发了? 竟然一口气收到了 ' + new_pm + ' 条私信! 快去看看吧..' :
				'有人偷偷给你写了封信.. 肯定是有见不得人的事吧?';

			title_msg.push(pm_title);
			if (Fantom.st.settings.notify_pm)
				bc_msg.push({ title: pm_title, url: 'http://fanfou.com/privatemsg' });
		}


		// 仅在用户没有使用饭否时广播消息
		if (bc_msg.length > 0 && Fantom.user_act.site == 'other' && ! Fantom.notify.stop_notifying)
			oe.broadcastMessage({ act: 'notify', msg: bc_msg });

		if (total > 0) title_msg.reverse();
		if (total > 5) prop.icon = 'icons/icon-5.png';
		prop.title = title_msg.join('\n\n');
		Fantom.button.update(prop, url);
	},
	button: (function() {
		var UIItem;
		var toolbar = opera.contexts.toolbar;
		var enable_popup; // 用户设定的值
		var popup_enabled; // Popup 是否已启用
		var enqueue = function(type, color, time) {
			// badge 颜色队列
			type = type == 'bgColor' ? 'backgroundColor' : 'color';
			setTimeout(function() { if (UIItem) UIItem.badge[type] = color; }, time);
		}
		return {
			no_popup: false, // 临时禁用 Popup 开关
			update: function(prop, url) {
        Fantom.busy = false;
        if (! Fantom.st.settings.enable_button)
          return this.remove();

        if (! UIItem) this.reset();
        

				// 网页版的 URL 将在新标签页中打开
				this.no_popup = url.test('http://fanfou.com', '^');
				this.makeProperties(prop);

				var fn = function() { }
				if (Fantom.user_act.site !== 'wap') {
					// 当用户使用 Popup 时禁止修改 Popup 地址
					if (! enable_popup || this.no_popup) {
						if (popup_enabled) this.reset();
						url = url.replace('http://m.fanfou.com', 'http://fanfou.com');
						url += '?from=fantom';
						fn = function() { createTab(url); }
					} else if (url) {
            fn = function() {
              Fantom.popup_activated = true;
            }
						popup_enabled = true;
						copyProp(prop, {
							popup: {
								href: url,
								width: 480,
								height: 620
							}
						});
					}
				}
        
				UIItem.onclick = fn;
				copyProp(UIItem, prop);
			},
			blink: function(color) {
				// 按钮的 badge 闪烁
				var colors = ['rgba(1, 1, 1, 0)', color, 'rgba(255, 255, 255, .95)']
				for (var i = 1; i <= 6; i++) {
					enqueue('bgColor', colors[(i+1)%2], i*150);
					enqueue('color', colors[(i+1)%2+1], i*150);
				}
			},
			add: function() {
        if (! Fantom.st.settings.enable_button)
          return this.remove();

				// 初始化时添加按钮
				var properties = {
					icon: 'icons/icon-0.png',
					title: '启动..',
					badge: {
						textContent: '?',
						backgroundColor: 'rgba(113, 202, 224, .8)'
					},
					popup: { }
				}
				this.makeProperties(properties, true);

				UIItem = opera.contexts.toolbar.createItem(properties);
				toolbar.addItem(UIItem);
			},
			makeProperties: function(prop, no_blinking) {
				// 补全按钮属性
				if ('badge' in prop) {
					copyProp(prop.badge, {
						color: 'white',
						display: 'block'
					});
					if (! no_blinking)
						this.blink(prop.badge.backgroundColor);
				} else {
					prop.badge = {
						textContent: ''
					}
				}
				prop.disabled = false;

				return prop;
			},
      remove: function() {
				if (! UIItem) return;
        UIItem = toolbar.removeItem(UIItem);
      },
			reset: function() {
				// Opera 的 Bug: Popup 一但被设定就无法取消; 必须重新添加按钮来取消 Popup
				enable_popup = !! Fantom.st.settings.enable_popup;
				popup_enabled = false; // 按钮刚刚加载时是没有启用 Popup 的
				this.remove(); // 添加按钮前先尝试删除已存在的按钮
				this.add();
        Fantom.popup_activated = false;
			}
		}
	})(),
	count: {
		total: function() {
			return this.mentions('count') +
        this.new_fo('count') +
        this.new_pm('count');
		},
		isChanged: function() {
			return this.mentions('isChanged') +
       this.new_fo('isChanged') +
       this.new_pm('isChanged');
		}
	},
	data: function() {
		var count_data = function(defaultValue, comparer) {
			return (function() {
				var value = { }
				// value 的两个属性 n, o 分别存储旧值和新值
				return function(newValue) {
					switch (newValue) {
						case undefined:
							return value.n;
						case 'isChanged':
							// comparer 指需要比较的属性名; 没有指定则直接比较整体
							var n = comparer ? value.n[comparer] : value.n;
							var o = comparer ? value.o[comparer] : value.o;
							if (typeof n == 'number' && typeof o == 'number')
								return n > o;
							else
								return n !== o;
						case 'count':
							// 获得计数
							return typeof value.n == 'object' ? value.n.c : value.n;
						case 'reset':
							// 初始化对象, 并写入默认值
							value.n = copyProp({ }, defaultValue);
							value.o = copyProp({ }, defaultValue);
							break;
						default:
							// 将老的 value.n 写入 value.o, 再把刚得到的值写入 value.n
							if (typeof newValue == 'number') {
								value.o = value.n + 0;
								value.n = newValue + 0;
							} else {
								copyProp(value.o, value.n);
								copyProp(value.n, newValue);
							}
					}
				}
			})();
		}
		// id 为消息的发送者; content 将显示在按钮标题; detail 含有客户端和时间信息; code 为 HTML 格式的消息内容(用于广播)
		Fantom.latest_status = new count_data({ id: '', content: '', detail: '', code: '', img: '' }, 'content');
		Fantom.latest_status('reset');
		var count_details = [
		  { name: 'mentions', defaultValue: 0 },
		  // c = 计数; list = ID列表; title 和 content 都将显示在按钮标题和广播信息中
		  { name: 'new_fo', defaultValue: { c: 0, list: '', title: '', content: '' }, comparer: 'c' },
		  { name: 'new_pm', defaultValue: 0 }
		];
		for (var i = 0; i < count_details.length; i++) {
			var detail = count_details[i];
			Fantom.count[detail.name] = new count_data(detail.defaultValue, detail.comparer);
			Fantom.count[detail.name]('reset');
		}
	},
	reset: function() {
		new Fantom.data;
		Fantom.button.reset();
		// 初始化用户状态
		Fantom.user_act = { site: 'other', page: 'normal' }
		Fantom.checker();
	},
  onset_change: function() {
    var diff = Fantom.st.diff;
    oe.broadcastMessage({ act: 'fantom_settings_changed', diff: diff });

    // 如果改变了按钮或 Popup 选项, 则需要初始化
    if (/enable_popup|enable_button/.test(diff.join('|'))) {
      Fantom.button.reset();
      Fantom.checker();
    }
  }
});

onmsg_handlers.setProp({
	status_changed: function(data, e) {
    var status = Fantom.user_act = data.status;
    // 如果刚刚打开了关键页面, 刷新数据
    if (data.first && status.page == 'key' && Fantom.count.total() > 0)
      Fantom.checker();
    if (status.site != 'wap' && status.focus) {
      Fantom.visibleTab = e.source;
    }
	},
	hide_notification: function(data) {
    // 手动隐藏通知
		oe.broadcastMessage({ act: 'hide_notification' });
	},
	stop_notifying: function(data) {
    // 手动隐藏通知, 并将不会在这些页面通知消息
		Fantom.notify.stop_notifying = true;
		oe.broadcastMessage({ act: 'stop_notifying' });
	},
  user_changed: function() {
    // 用户登录/登出/切换操作时, 初始化并刷新数据
    new Fantom.data;
    Fantom.checker();
  },
  show_photo: function(data) {
    // 显示图片预览
    var image_url = data.img; // 大图地址
    var page_url = data.link; // 图片所在页面地址
    
    // 生成唯一的请求ID, 用于回传确认
    var request_id = 'show_photo_' + (new Date() * 1);
    // 使用 Try, 避免因该端口不可用造成 Fantom 僵死
    try {
      Fantom.visibleTab.postMessage({
        act: 'show_photo',
        img: image_url,
        request_id: request_id,
        // 是否打开了 Popup
        popup_activated: Fantom.popup_activated
      });
    } catch (e) { }
    
    // 事先不能确定能否在标签中显示大图, 需要确认
    onmsg_handlers[request_id] = function(data) {
      clearTimeout(t);
      delete onmsg_handlers[request_id];
    }
    
    // 如果 500ms 后没有得到相应, 则在一个新标签内显示图片且结束请求
    var t = setTimeout(function() {
      onmsg_handlers[request_id];
      createTab(page_url);
    }, 500);
  }
});

pref.removeItem('last_page');