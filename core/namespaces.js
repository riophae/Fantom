
var SF = (function() {
  var empty_func = function() { }

  function pluginLoader(load_func) {
    return function() {
      if (this.loaded) return;
      this.loaded = true;
      load_func.call(this);
    }
  }

  function pluginUnloader(unload_func) {
    return function() {
      if (! this.loaded) return;
      this.loaded = false;
      unload_func.call(this);
    }
  }

  return {
    fn: { },
    pl: { },
    cb: { },
    st: { },
    version: '0.6.4.0',
    plugin: function(func) {
      if (! func) func = { };
      this.loaded = false;
      this.update = func.update || empty_func;
      this.load = pluginLoader(func.load || empty_func);
      this.unload = pluginUnloader(func.unload || empty_func);
    },
    uninstall: function() {
      var plugins = this.pl;
      for (var plugin in plugins) {
        if (! plugins.hasOwnProperty(plugin)) continue;
        plugins[plugin].unload();
      }
      jQuery('#sf_flag_libs_ok, style.space-fanfou, script.space-fanfou').remove();
    }
 }
})();

var Fantom = {
	fn: { },
	st: (function() {
    // Fantom 也会被注入到页面中, 所以需要进行很多判断以确定这个脚本是否运行在后台
		if (typeof widget == 'object' && typeof widget.preferences == 'object' && typeof pref == 'object')
			var settings = pref.getObj('fantom_settings');
			return settings ? { settings: settings } : { };
	})()
}

var namespaces = [
  { name: SF, pre: 'sf' },
  { name: Fantom, pre: 'fantom' }
];
