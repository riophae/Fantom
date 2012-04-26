
(function() {
  // Fantom 需要 Opera 11.60+. 如果发现用户在时候较旧的版本, 则会提示用户升级
  // 每次启动 Fantom 检查一次, 且最多提醒一次
  var opera_ver = +window.opera.version();
  if (opera_ver > 11.59) return;
  pref.setItem('OPERA_VERSION_OUTDATED', opera_ver);
})();

oe.onconnect = function(e) {
  var url = e.origin;

  // 打开设置页时备份选项信息, 稍后用于比较选项变动
  if (is_opt_page(url)) {
    var storage = window.sessionStorage;
    for (var i = 0; i < namespaces.length; i++)
      storage.setObj(namespaces[i].pre + '_settings', namespaces[i].name.st.settings);
    return;
  }

  // 页面关闭时修改用户状态
  e.currentTarget.onclose = [ function() {
    Fantom.user_act = { site: 'other', page: 'normal' };
  } ];

  // 以下只对 [m.]fanfou.com 有效
  if (! checkSite(url)) return;
  
  // 以下只对 m.fanfou.com 有效
  if (checkSite(url) !== 'wap') return;
  // 关闭 Popup 后刷新数据
  e.currentTarget.onclose.push(function() {
    setTimeout(function() {
      // 如果刚刚关闭了 Popup
      if (Fantom.user_act.site != 'wap' && Fantom.popup_activated) {
        Fantom.checker();
        Fantom.popup_activated = false;
        // 如果仍有正在显示的预览大图, 通知它们隐藏
        oe.broadcastMessage({ act: 'hide_photo' });
      }
    }, 1500);
  });
}

oe.ondisconnect = function(e) {
  var onclose_handlers = e.currentTarget.onclose || [];
  for (var i = 0; i < onclose_handlers.length; i++)
    onclose_handlers[i]();

  var url = e.origin;
  // 设置页面关闭后检查选项变化
  if (is_opt_page(url)) onSetChange();
}

var onmsg_handlers = {
  create_tab: function(msg) {
    createTab(msg.url);
  },
  update_cache: function(msg, e) {
    // 请求完整更新缓存
    cache.load(e);
  },
  cache_updated: function(msg) {
    // 缓存已写入, 请求确认
    cache.reset(msg.sign);
  },
  recache_files: function(msg, e) {
    // 请求重新缓存文件
    cache.loadFiles(msg.fName, e);
  }
}
oe.onmessage = function(e) {
  var msg = e.data;
  var act = msg.act;
  if (onmsg_handlers.hasOwnProperty(act))
    onmsg_handlers[act](msg, e);
}
