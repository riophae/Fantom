
// ==UserScript==
// @include *
// @exclude http://fanfou.com/*
// @exclude http://*.fanfou.com/*
// ==/UserScript==

if (window.top === window.self) {
  (onset_handlers.web_helper = function() {
    if (pref.getObj('fantom_settings').web_helper && fantom_switch()) {
      onset_handlers.showNotification();
      onset_handlers.show_icons();
    } else {
      onmsg_handlers.stop_notifying();
      onset_handlers.hide_icons();
    }
  })();
}
