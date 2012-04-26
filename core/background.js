
(function() {
  // Fantom ��Ҫ Opera 11.60+. ��������û���ʱ��Ͼɵİ汾, �����ʾ�û�����
  // ÿ������ Fantom ���һ��, ���������һ��
  var opera_ver = +window.opera.version();
  if (opera_ver > 11.59) return;
  pref.setItem('OPERA_VERSION_OUTDATED', opera_ver);
})();

oe.onconnect = function(e) {
  var url = e.origin;

  // ������ҳʱ����ѡ����Ϣ, �Ժ����ڱȽ�ѡ��䶯
  if (is_opt_page(url)) {
    var storage = window.sessionStorage;
    for (var i = 0; i < namespaces.length; i++)
      storage.setObj(namespaces[i].pre + '_settings', namespaces[i].name.st.settings);
    return;
  }

  // ҳ��ر�ʱ�޸��û�״̬
  e.currentTarget.onclose = [ function() {
    Fantom.user_act = { site: 'other', page: 'normal' };
  } ];

  // ����ֻ�� [m.]fanfou.com ��Ч
  if (! checkSite(url)) return;
  
  // ����ֻ�� m.fanfou.com ��Ч
  if (checkSite(url) !== 'wap') return;
  // �ر� Popup ��ˢ������
  e.currentTarget.onclose.push(function() {
    setTimeout(function() {
      // ����ոչر��� Popup
      if (Fantom.user_act.site != 'wap' && Fantom.popup_activated) {
        Fantom.checker();
        Fantom.popup_activated = false;
        // �������������ʾ��Ԥ����ͼ, ֪ͨ��������
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
  // ����ҳ��رպ���ѡ��仯
  if (is_opt_page(url)) onSetChange();
}

var onmsg_handlers = {
  create_tab: function(msg) {
    createTab(msg.url);
  },
  update_cache: function(msg, e) {
    // �����������»���
    cache.load(e);
  },
  cache_updated: function(msg) {
    // ������д��, ����ȷ��
    cache.reset(msg.sign);
  },
  recache_files: function(msg, e) {
    // �������»����ļ�
    cache.loadFiles(msg.fName, e);
  }
}
oe.onmessage = function(e) {
  var msg = e.data;
  var act = msg.act;
  if (onmsg_handlers.hasOwnProperty(act))
    onmsg_handlers[act](msg, e);
}
