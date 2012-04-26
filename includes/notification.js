
// ==UserScript==
// @include *
// @exclude http://fanfou.com/*
// @exclude http://*.fanfou.com/*
// ==/UserScript==

(function() {
	if (window.top !== window.self) return;
	function $t(t) { return document.getElementsByTagName(t); }

	var period = 33; // 动画周期, 大约等于 30fps
	var single = 380; // 单个消息的宽度
  var count; // 消息数量
	var total; // 列表总宽度 (负值)
	var bar_length = single - 30; // 滚动条的总长度
	var scrollHandle_length; // 滚动条滑块的长度
	var $notification, $content, $msg_list; // 消息列表
	var $scrollHandle; // 滚动条滑块
	var track; // 记录拖拽轨迹
	var currentItem = 0; // 当前显示的项目
	var activeItem = 0; // 当前激活的项目 (鼠标选中)

	var lock, displacement;
  var autoHide;

	var speed = 0; // 滚动速度
	var currentPos = 0; // 列表左端当前的坐标
	var currentProcess = 0; // 滚动条的进度

  $notification = new $Elem(function() {
    var elem = $t('fantom:notification')[0];
    if (! elem) return;

    var self = this;
    self.elem = elem;

    $content = new $Elem(function() {
      return self.child('fantom\\:content');
    });

    $msg_list = new $Elem(function() {
      return self.child('fantom\\:content fantom\\:ul');
    });

    $scrollHandle = new $Elem(function() {
      return self.child('fantom\\:scrollhandle');
    });

    return elem;
  }, true);

  window.addEventListener('scroll', (function(t) {
		return function(e) {
			$notification.addClass('onscroll');
			clearTimeout(t);
			t = setTimeout(function() {
        $notification.removeClass('onscroll');
			}, 300);
		}
	})(), false);

  // 延时递归
	var processQueue = (function(t, func) {
		return func = function(handler, parameter) {
			clearTimeout(t);
			if (! arguments.length) return;

			if (parameter = handler.apply(this, parameter)) {
				t = setTimeout(function() {
					func(handler, parameter);
				}, period);
			}
		}
	})();

  function getDirection(x) { return x ? ( x > 0 ? 1 : -1 ) : 0; }
	function getPos(e) { return parseInt(e.clientX); }
  function min(a, b) { return a > b ? b : a; }
  function max(a, b) { return a > b ? a : b; }

	// 计算与坐标对应的消息的序数
	function computeItem(pos) { return Math.floor(pos / single); }

  // 去掉 "拖拽" "滑动" 标记
  function resetStatus() {
    $content.removeClass('ondrag onslide');
  }

  // 判断是否滑动到边界外
  function isOverslid() {
		return currentPos > 0 || currentPos < -total;
	}

	function record(e) {
		track[track.length] = ({ pos: getPos(e), time: new Date() });
		if (track.length == 4)
			track.shift(); // 最多记录 3 组数据
	}

	var slide = (function(destination, direction) {

		return {

			// 滑动至
			to: function(x, onscroll) {
				currentPos = Math.floor(x);
				currentItem = computeItem(currentPos);

				$msg_list.css('left', currentPos + 'px');

				if (! onscroll)
					scrollTo(-currentPos / total * (bar_length - scrollHandle_length));
			},

			// 滑动指定位移
			by: function(x) { slide.to(currentPos + x); },

			// 精确滑动 (不会过度滑动)
			accurately: function(step) {
				if ((destination - currentPos - step) * direction <= 0)
					return slide.to(destination);
				else
					return ! slide.to(currentPos + step);
			},

            // 滑动列表使当前消息完整显示
			fix: function(target) {

        $content.addClass('onslide'); // 设置状态

				// 重置速度避免出现错误
				speed = 0;

				destination = target;

        // 避免滑动到边界外
				destination > 0 && (destination = 0);
				destination < -total && (destination = -total);

        // 还需要滑动的距离
				var remain = destination - currentPos;

        // 如果已滑动到恰当的位置 (不需要再滑动) 则结束
				if (! remain)
          return resetStatus();

				direction = getDirection(remain);

				processQueue(function(step) {

					step = remain / 10;

          // 限制最小滑动距离 (避免滑动过慢)
					if (step < 0)
						step > -5 && (step = -5);
					else
						step < 5 && (step = 5);

          // 使用精确滑动, 避免滑出边界
					slide.accurately(step);

          // 判断滑动是否完成
					if (Math.abs(remain = destination - currentPos) >= 1)
						return arguments;

          // 结束滑动并重置状态
          resetStatus();

          // 设置 "…" 按钮链接
          var url = $msg_list.children('fantom\\:li')[-currentItem].getAttribute('data-url');
          $content.child('fantom\\:more').setAttribute('href', url);

        }, []);

			},

			// 自动减速的平滑滚动
			bySpeed: function(factor) {

        $content.addClass('onslide');
        $msg_list.addClass('fix');

				processQueue(function() {
					slide.by(speed * period);

					direction = getDirection(speed); // 确定滑动方向
					speed = Math.abs(speed) - factor; // 减速
					speed = (speed < 0 ? 0 : speed) * direction; // 速度不允许小于 0

					if (Math.abs(speed) > 0.5 && ! isOverslid())
						return arguments;

          // 减速到 0.5 或滑动出界则尝试修正
          // 根据滑动方向确定终点
					var targetItem = currentItem;
					if (speed > 0) targetItem++;

					slide.fix(targetItem * single);
				}, []);

			}
		}
	})(0, 1);

	// 滚动滚动条
	function scrollTo(x) {
		x = max(x, 0);
		x = min(x, bar_length - scrollHandle_length);

		currentProcess = x;
		$scrollHandle.css('left', x + 'px');
	}

  // 拖拽消息列表
	function ondrag(e) {
		// 垂直方向拖拽无效
		if (track[track.length-1] == getPos(e))
			return;

		if (lock = ! lock) return; // 大约 50% 的拖拽无效
		record(e); // 记录拖拽轨迹
		if (track.length < 3) return; // 前两次有效拖拽不会导致滚动

    // 计算位移
		displacement = track[2].pos - track[1].pos;

    // 拖拽速度过慢不会使列表跟随滚动
		if (track[2].time - track[1].time < 100)
			slide.by(displacement);
	}

  // 拖拽消息列表结束 (鼠标按键松开或鼠标移出边界)
	function ondragstop(e) {
		$msg_list.unbind('mousemove', ondrag);
		$msg_list.unbind('mouseup mouseleave', ondragstop);

		resetStatus();
		if (currentPos % single == 0) return; // 没有滚动
		var dragSpeed = 0;

    // 如果拖拽结束前鼠标停滞超过 0.1s 则视为放弃拖拽
		if (track.length == 3 && new Date() - track[2].time < 100)
			dragSpeed = (track[2].pos - track[0].pos) / (track[2].time - track[0].time);

    // 增加初始速度, 帮助用户更容易地滚动
    dragSpeed = dragSpeed + getDirection(dragSpeed) * 0.6;

		if (Math.abs(dragSpeed) > 1.3) {
			speed = dragSpeed;
			slide.bySpeed(.35);
		} else slide.fix(activeItem * single);
	}
  
  function append() {
    var code = '<notification><header><ul><li><title><strong>Fantom</strong></title></li><li><hide>隐藏</hide></li><li><stop>重启前不要再通知我</stop></li></ul></header><bar><line></line><processBar><scrollArea><scrollHandle /></scrollArea><barbg /></processBar></bar><content><ul /><more><dot /><dot /><dot /></more></content></notification>';
    var $$notification = parseDom(prefix(code))[0];
    docelem.appendChild($$notification);

    $notification.reset();

    var style = 'fantom\\:notification.onscroll{display:none !important;}' +
      '@media (max-height: 400px) { fantom\\:notification { display: none; } }' +
      '@media (max-width: 800px) { fantom\\:notification { display: none; } }' +
      'fantom\\:notification{z-index:1000000000000000000009999;position:fixed;top:30px;right:30px;width:380px;height:200px;background-color:#c5c5c5;background-image:-o-linear-gradient(top,rgba(255,255,255,.75) 0,rgba(255,255,255,.05) 45%);box-shadow:0 0 1px rgba(0,0,0,.25) inset,0 0 9px rgba(255,255,255,.25) inset,1px 1px 0 rgba(0,0,0,.35);border-radius:5px;overflow:hidden !important;-o-transition:background-color .3s linear;transition:background-color .3s linear;}' +
      'fantom\\:notification.hide{display:none;}' +
      'fantom\\:notification:hover{background-color:#ddd;box-shadow:0 0 1px rgba(0,0,0,.25) inset,0 0 30px rgba(255,255,255,.5) inset,1px 1px 0 rgba(0,0,0,.25);}' +
      'fantom\\:notification,fantom\\:notification *{margin:0;padding:0;display:block;}' +
      'fantom\\:notification::selection{background:rgba(70,180,220,.4);color:rgba(0,0,0,.75);}' +
      'fantom\\:notification >*{width:380px;overflow:hidden;}' +
      'fantom\\:notification *{text-align:left;font-size:13px !important;font-family:"trebuchet ms","cambria","\5fae\x8f6f\6b63\9ed1\4f53","lucida sans unicode",arial,tahoma,verdana,"\65b0\5b8b\4f53" !important;line-height:16px !important;word-spacing:1px;text-shadow:0 1px 0 rgba(255,255,255,.75);color:#555;}' +
      'fantom\\:ul,fantom\\:li{position:static;}' +
      'fantom\\:li *{display:inline;}' +
      'fantom\\:strong{font-weight:bold;}' +
      'fantom\\:br{display:run-in;width:0;height:0;}' +
      'fantom\\:a{color:#777;text-decoration:underline;cursor:pointer;}' +
      'fantom\\:a.photo{float:right;margin:0 5px 5px 5px;}' +
      'fantom\\:img{margin:3px;}' +
      'fantom\\:a.photo fantom\\:img{position:relative;background:#fff;box-shadow:0 1px 4px rgba(0, 0, 0, 0.27),0 0 12px rgba(0, 0, 0, 0.06) inset;padding:3px 3px 0 3px !important;margin:0 !important;display:inline-block;}' +
      'fantom\\:a.photo fantom\\:img::before {-o-transform:skew(-15deg) rotate(-6deg);transform:skew(-15deg) rotate(-6deg);left:4px;}' +
      'fantom\\:a.photo fantom\\:img::after {-o-transform:skew(15deg) rotate(6deg);transform:skew(15deg) rotate(6deg);right:4px;}' +
      'fantom\\:a.photo fantom\\:img::before,fantom\\:a.photo fantom\\:img::after {width:70%;height:55%;content:" ";box-shadow:0 2px 8px rgba(0, 0, 0, 0.3);position:absolute;bottom:4px;z-index:-1;}' +
      'fantom\\:header{margin:5px 0 0 0;padding:0;height:25px;width:100%;cursor:pointer;}' +
      'fantom\\:header fantom\\:li{text-align:center;height:25px;display:block;}' +
      'fantom\\:header fantom\\:li *{line-height:25px !important;}' +
      'fantom\\:header fantom\\:li >*{padding:3px 0 3px 16px;background-position:center left;background-repeat:no-repeat;}' +
      'fantom\\:header:hover fantom\\:ul{margin-top:-25px;}' +
      'fantom\\:header.stopNotifying:hover fantom\\:ul{margin-top:-50px;}' +
      'fantom\\:title{padding-left:20px !important;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOtSURBVDhPjZIPTBNXHMevpP9AgaLyrxRooQwok2hlkGkWZTKhrPwRik2BoEaUDbewLNvItg6QzcEgcit3dS1TCBKTYbKRaXRqTEi2ODKRITFiRmakxk0SM9ySZtBee9+93kHCFrN4ySfvvd+fz3vv8ihqzfc3nWhbotVTS31qz1NxJHuWnFme5cECz/Joqcd/pXGem2k7jfvtSkED9zaZ79z2bv/5l+E/X/h0LhSB+84M7loNuOtHEPi5A8G5HgTv9cJ3pzNHEPGzbxzGnULg7jMwuwuYfQm4d4iITsD/4zsB37XXc0XRTSODm/l4dvKA6R3gb7SAv2gN+EZNm0XRVAGNqQJgisiE8f8I1RBu74T/kg391VmBu52Zoujz3Rr6ZKkOTHEKIRWsSQsnWa+FNZF8SapQwxIGKjJQadCAtAcm34sTRa3bt9DW2I14+8UtaM5JR11MFGqUSlTL5QQFqhUKWMOVOKCOxVvbDDhqNJAaFWKoMFASIrKviM7aG+jDZbvhXXqA3+d/wuWzfTiUlYK6SAXqopSwkbHdWozbE2P4a3EOk9NXYdUnQS2V/lvU+kImXauNw7mRfnj9TzDz6wSqcvWoXy9HPRFZ1snQ2nIAXm4RDxfm0PGaDQdjo5Agk4lXWz1RMSWhy2UKvKqKxt58I17Rp6NUGY4yqRxmQplUgaLoaJjztqLC8BzM5KpV8nCoJFJUZMsDf3RpxH/Ub42lCWD2bQJj2QDWshGnGuLxxf4EgS/J3Fkj5hiSE+pqkzBap4G3SQlfT9zKOxrLZDCWBYFvMoGrObj4WRr2FqpQuUuFC91pJPa8mBtb4XIegscNWCimJh+XU5HiOxrR7udH0jmc0UPg62zccmbgeq9O4BarB09iYj4DGElDcDAdv1nj8bBxaxd/6U2FIHrUW79u8WjyNFxkZ6cWYAkuHTCgAz+gC/IuLcezqRzvJLApXHAgl3/8QSEW7CVY/vYg+F9YmyAKDte40JMEMKlAP5GshfnP2kFqWLLJVyUITrwf8N745OSfnh9iBNH9waraR0ze9wGXdhlu0rjKKdIQmodG12qczJ0aoGMTeht22AVB6AMgEUaKkswc23wFQ6ToNGka1mG+Re1tzY50ej5NfhBaC/EzaXjyrg59RvVwk8WS5Ha7ZcQRFhKFjQ8NKdubm9c37clp+KhS13msXNNtNyV05W+I2JNIURE7NVElbaXxxztMiR9/aE5paywy7jtiNkc4HA7F+Pi4NHSQfwBRWL/wjrJG9AAAAABJRU5ErkJggg==");}' +
      'fantom\\:title fantom\\:strong{font-family:Cambria, "Book Antiqua", Garamond, serif !important;}' +
      'fantom\\:stop{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAICSURBVDhPTZK7ixpRFMaHTYolsM0mW+UB2SJF6qRJkTZsUgVCyGP/gl0C6vhgNPE9Kjo+sBD/AEUFtdIiGNiFWFkZWRArLTKwkhD2BRFWvfk+ycgdOPO4c373O+c7V1GkSwhxc7lc3s7lcna32206HI5zm81Wttvtd+W89TuADQBbrVbrla7rJ36/XwQCAeHz+YTL5RIALxAa1jZk6AbAO4AOgsHg30gkImKxmIjH4wKbCKyJUChkqqp6CfX6GobS9mQyeYPkKyYSSCQSazCdTv+eTqfRbrcbQOlU9q9UAT6p1WpHVCEgQ8lk8nQ8Hr9HzjvCUP8J1SuUv0VwP5/P/7EgPqmMOBuNRi/RxgPCmUzmF/t2Op0C8FtlPp9/htrSAqnMhHq9rmLTe4SpzM3Yv8fjEXBcVxaLhSH3xZ9I/A7oPuJpsVj8YfUejUaF1+ul2wZLzcCAa8tFJJm9Xu8Z1h83Go2abJgFYlxfCOrlcnlVCksaDocvsPao0+kkqG5Vw1YIapomstnsc4Kf+v3+N/ZVqVQ8+H6I8eynUqkLGeJ7OBxm/ycw7BbBPUS4UCh0YfNltVrVDMOYyuOh2n/TZs1mc48nTcFtF+DH2WymEqYyy5bHQ4gHpN1uH/Jorg4AwE0agfiACA0Gg6+lUukUqteAF5wxqjg2TfM1/u+s1HD9Ax1g38HEGEH7AAAAAElFTkSuQmCC");}' +
      'fantom\\:hide{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHKSURBVDhPpZK9S0JhFMaNKEuDtmhpiQIhKYegpoKgP8G9ySUHv6hAuQqKGjSIGuggkR/olaIpxzaR4NZQLg0ulgkOiiIIfr2d5+J7kRoTDl7e8/7e55znHJXqPz/G2HylUlm22WwXDodjlb9F5zPj8VidSCTWrVbrudFonFV0kKhWq/pQKHRjt9uZxWK5M5lMc7hAoKbZbO74fL4nehQ5r9vt1sgwgZupVCrn8XiYy+ViEzhfLpeXut2uIRKJSMg5nU42gc84eFiv168zmUyNXpZhKpd5vd7HaDT6jDO/388AQzkej+s4qCdVc7/fz+RyuW9cFARBDnwHAgH5H8qtVstA5S9wUEvgNsXpaDRKi6L4BQUEh6CMsumOFoZNG7RIh7vD4VAg1c9gMMgQgKGMstHzn8lBvt1u78VisTdc/g2iZ3I0z91WSi2VSsfhcPiF9wQYylS2Yhjcplnek7NrijnZbPZh2ghy7n0wGHjQM+Vkw/iosCTKOHq93lWhUPiYuPdKZe+jZ+52Op2uYRy0JLfFYnFFWQDq8YQULqEsSdIRATALAbfNjUYjkkwmxU6no8N6clBNyQ2KA4otrNnUrmpwNsnhjpqP4wfeA6ToO2r0agAAAABJRU5ErkJggg==");}' +
      'fantom\\:bar,fantom\\:bar >*{width:100%;height:10px;}' +
      'fantom\\:bar.scroll fantom\\:line{display:none;}' +
      'fantom\\:bar.scroll fantom\\:processbar {display:block;}' +
      'fantom\\:processbar {display:none;}' +
      'fantom\\:bar{position:relative;}' +
      'fantom\\:line{height:2px !important;margin:4px 0;background-image:-o-linear-gradient(top,rgba(0,0,0,.15),#fff);}' +
      'fantom\\:processbar *{position:absolute;top:0;}' +
      'fantom\\:barbg{z-index:1;left:0;width:360px;height:4px;margin:3px 10px;background:rgba(0,0,0,.3);display:block;border-radius:2px;box-shadow:1px 1px 0 rgba(0,0,0,.15) inset,1px 1px 0 rgba(255,255,255,.15);}' +
      'fantom\\:scrollarea{left:15px;width: 350px;}' +
      'fantom\\:scrollhandle{z-index:10;display:block;left:0;border:1px solid rgba(0,0,0,.3);border-radius:2px;height:8px;box-shadow:0 -1px 0 rgba(255,255,255,.75) inset;background:rgba(255,255,255,.1) -o-linear-gradient(top,rgba(255,255,255,.6),rgba(255,255,255,.1));-o-transition-property:border-color,background-color;-o-transition-duration:.2s;transition-property:border-color,background-color;transition-duration:.2s;}' +
      'fantom\\:scrollhandle:hover{background-color:rgba(255,255,255,.3);border-color:rgba(0,0,0,.4);}' +
      'fantom\\:content{position:relative;background:-o-radial-gradient(190px 150px,circle,rgba(255,255,255,.8),rgba(255,255,255,0) 150px);}' +
      'fantom\\:content:hover{background:-o-radial-gradient(190px 150px,circle,rgba(255,255,255,.85),rgba(255,255,255,0) 165px);}' +
      'fantom\\:content,fantom\\:content fantom\\:ul,fantom\\:content fantom\\:li{border-radius:0 0 5px 5px;height:160px;}' +
      'fantom\\:content fantom\\:ul{position:absolute;top:0;left:0;width:9999999999999999999999999999px;}' +
      'fantom\\:content fantom\\:ul.fix{-o-transition: margin-left 33ms linear;transition: margin-left 33ms linear;}' +
      'fantom\\:content fantom\\:li{float:left;clear:none;display:inline-block;width:350px;margin:2px 15px;}' +
      'fantom\\:content fantom\\:li:first-line{line-height:20px;}' +
      'fantom\\:more{clear:both;position:absolute;top:135px;left:50%;width:36px;height:12px;padding:4px;margin-left:-21px;display:inline-block;opacity:.4;-o-transition:opacity .5s linear;transition:opacity .5s linear;border-radius:3px;border:1px solid transparent;}' +
      'fantom\\:dot{float:left;content:"";width:6px;height:6px;border-radius:3px;background:#555;box-shadow:0 1px 0 #000 inset,0 1px 0 rgba(255,255,255,.75);margin:3px;}' +
      'fantom\\:notification:hover fantom\\:more{opacity:.75;}' +
      'fantom\\:content.ondrag fantom\\:more,fantom\\:content.onslide fantom\\:more{display:none;opacity:0;}' +
      'fantom\\:more:hover{cursor:pointer;border:1px solid #ccc;box-shadow:0 1px 0 rgba(0,0,0,.05) inset,0 1px 0 #fff;background:rgba(0,0,0,.15) -o-linear-gradient(top,rgba(255,255,255,.9) 0%,rgba(255,255,255,.2) 50%,rgba(255,255,255,0) 50%,rgba(255,255,255,0) 75%,rgba(255,255,255,.5) 100%);}';

    insertStyle('notification', 'fantom', style);
  }
  
  function bindEvents() {
    // 拖拽滑动支持
    $msg_list.bind('mousedown', function(e) {

      e.stopPropagation();
      e.preventDefault();
      clearTimeout(autoHide);
      processQueue(); // 停止队列
      speed = 0;
      track = [ getPos(e) ]; // 初始化

      activeItem = computeItem(currentPos - getPos(e) + $notification.elem.offsetLeft) + 1;
      $content.addClass('ondrag');

      $msg_list.bind('mousemove', ondrag)
                          .bind('mouseup mouseleave', ondragstop)
                          .removeClass('fix');
    });

    // 滚动滑动支持
    $msg_list.bind('mousewheel', (function(factor, direction) {

      return function(e) {

        e.preventDefault();
        e.stopPropagation();

        clearTimeout(autoHide);

        if (isOverslid()) return;

        $content.addClass('onslide');
        $msg_list.addClass('fix');

        direction = e.wheelDelta > 0 ? 1 : -1;
        speed = speed + direction * 1.4; // 每次滚动滚轮都要加速

        // 速度限制在 [-3, 3] 范围
        speed > 3 && (speed = 3);
        speed < -3 && (speed = -3);

        slide.bySpeed(factor);

      }

    })(.2, 1));


    // 隐藏操作
    $header = new $Elem(function() {
      return $notification.child('fantom\\:header');
    });
    (function() {

      $header.bind('mouseleave', function(e) {
        $header.toggleClass('stopNotifying');
      });

      $header.bind('click', function(e) {
        if ($header.hasClass('stopNotifying'))
          oe.postMessage({ act: 'stop_notifying' });
        else
          oe.postMessage({ act: 'hide_notification' });
      });

      // 滚动条操作
      (function(base, initial) {

        function onscrollstart(e) {
          if (e.target !== $scrollHandle.elem) return;
          processQueue();

          base = getPos(e);
          initial = currentProcess;
          $msg_list.removeClass('fix');
          $notification.bind('mousemove', onscroll);
          $notification.bind('mouseup mouseleave', onscrollend, false);
        }

        function onscroll(e) {
          scrollTo(initial + getPos(e) - base);
          if (getPos(e) % 2) return;
          slide.to(-currentProcess / (bar_length - scrollHandle_length) * total, true);
        }

        function onscrollend(e) {
          $notification.unbind('mousemove', onscroll);
          $notification.unbind('mouseup mouseleave', onscrollend, false);
          slide.fix(Math.round(currentPos / single) * single);
        }

        docelem.addEventListener('mousedown', onscrollstart, false);

      })();

    })();
  }

  function initialize() {
    append();
    bindEvents();
  }

	function showNotification() {
		if ('notify' in onmsg_handlers) return;

		onmsg_handlers.notify = function(msg) {

			if (! $notification.elem) initialize();

			clearTimeout(autoHide);

			autoHide = setTimeout(function() {
				$notification.addClass('hide');
			}, 30000);
			$notification.removeClass('hide');

			processQueue();

			var messages = msg.msg;

			count = messages.length;
			total = single * (count - 1);
			scrollHandle_length = bar_length / count;
			$scrollHandle.css('width', scrollHandle_length + 'px');

      var $bar = new $Elem(function() {
        return $notification.child('fantom\\:bar');
      });
      $bar[count > 1 ? 'addClass' : 'removeClass']('scroll');

      var code = [];
			messages.forEach(function(message) {
				code.push('<li data-url="' + message.url + '">');
        code.push(message.img || '');
				code.push(message.title);
				code.push('<br />');
				code.push(message.content || '');
				code.push('</li>');
			});
			$msg_list.html(prefix(code.join('')));
      code = null;

      $t('fantom:img').forEach(function(elem) {
				elem.style.content = 'url("' + elem.getAttribute('src') + '")';
      });

			$notification.children('fantom\\:a, fantom\\:more', function($link) {
				$link.onclick = function(e) { 
          oe.postMessage({ act: 'create_tab', url: this.getAttribute('href') });
        }
			});

			slide.to(single);
			slide.fix(0);

    }
	}

	var hideNotification = onmsg_handlers.hide_notification = function() {
		$notification.addClass('hide');
	}
	var stopNotifying = onmsg_handlers.stop_notifying = function() {
		$msg_list && $msg_list.remove();
		$notification.remove();
		delete onmsg_handlers.notify;
	}

  onset_handlers.showNotification = showNotification;

})();