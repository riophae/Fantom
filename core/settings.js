
/* 太空饭否选项 */

SF.st.default_settings = {
  spacefanfou: true,
  translucent_interface: true,
  box_shadows: false,
  logo_remove_beta: true,
  remove_app_recom: true,
  expanding_replies: true,
  'expanding_replies.number': 3,
  'expanding_replies.auto_expand': false,
  user_switcher: false,
  float_message: false,
  'float_message.noajaxattop': false,
  'float_message.notlostfocus': false,
  'float_message.keepmentions': false,
  disable_autocomplete: false,
  privatemsg_manage: true,
  friend_manage: true,
  clean_personal_theme: false,
  advanced_sidebar: true,
  auto_pager: false
};

/* 饭兜选项 */

Fantom.st.default_settings = {
  enable_button: true,
	enable_popup: false,
	check_fo: true,
	play_snd: true,
	web_helper: true,
	dis_motto: false,
	notify_status: true,
	notify_mentions: true,
	notify_pm: true,
	notify_fo: true
};

/* 读取选项 */

(function() {
	for (var i = 0; i < namespaces.length; i++) {
		var name = namespaces[i].name;
		var pre = namespaces[i].pre;

		var storage_settings = pref.getObj(pre + '_settings') || {};
    var settings = {};

		for (var key in name.st.default_settings) {
			if (! name.st.default_settings.hasOwnProperty(key)) continue;
			if ((settings[key] = storage_settings[key]) === undefined)
				settings[key] = name.st.default_settings[key];
		}

		name.st.settings = settings;
		pref.setObj(pre + '_settings', settings);
	}
})();

function onSetChange() {
	var storage = window.sessionStorage;

	for (var i = 0; i < namespaces.length; i++) {
		var name = namespaces[i].name;
		var pre = namespaces[i].pre;

		var old_st = storage.getObj(pre + '_settings');
		name.st.settings = pref.getObj(pre + '_settings');

		name.st.diff = compareObj(old_st, name.st.settings);

		if (name.st.diff.length)
			name.onset_change();
	}
}
