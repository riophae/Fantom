SF.setProp({
  options: (function(options) {
    SF.data.forEach(function(item) {
      if (! item.options) return;
      options[item.name] = item.options;
    });
    return options;
  })({}),
  details: (function(details) {
    SF.data.forEach(function(item) {
      var detail = {
        options: item.options,
        type: item.type
      };
      // 同步缓存样式内容
      if (item.css) {
				detail.style = item.css;
				filePath[item.css] = '/plugins/' + item.css;
			}
      if (item.js) { 
				detail.script = item.js;
				filePath[item.js] = '/plugins/' + item.js;
			}
      
      details[item.name] = detail;
    });
    delete SF.data;
    return details;
  })({}),
  getPluginOptions: function(name) {
    var option_names = SF.options[name];
    if (! option_names) return null;
    var options = [];
    option_names.forEach(function(option_name) {
      options.push(SF.st.settings[name + '.' + option_name]);
    });
    return options;
  },
  cache: function() {
    var page_cache = [];
    var details = SF.details;
    for (var name in SF.details) {
      if (! details.hasOwnProperty(name) || ! SF.st.settings[name]) continue;
      var item = details[name];
      var detail = {
        name: name,
        style: item.style,
        script: item.script,
      };
      if (item.options)
        detail.options = SF.getPluginOptions(name);
      page_cache.push(detail);
    }
    return page_cache;
  },
  onset_change: function() {
    var details = SF.details;
    var update_info = [];
    
    SF.st.diff.forEach(function(setting_name) {
      // 分离选项信息
      var main_name, option_name;
      var dot_pos = setting_name.indexOf('.');
      if (dot_pos > -1) {
        main_name = setting_name.substr(0, dot_pos);
        option_name = setting_name.substr(dot_pos + 1);
      } else {
        main_name = setting_name;
      }
      
      // 确定处理方式
      if (details[main_name]) {
        var detail = details[main_name];
        if (option_name) {
          update_info.push({
            type: 'update',
            name: main_name,
            options: SF.getPluginOptions(main_name)
          });
        } else {
          if (! SF.st.settings[main_name]) {
            update_info.push({
              type: 'disable',
              name: main_name,
            });
          } else {
            update_info.push({
              type: 'enable',
              name: main_name,
              style: detail.style,
              script: detail.script,
              options: SF.getPluginOptions(main_name)
            });
          }
        }
      }
    });

    cache.create();
    setTimeout(function() {
      oe.broadcastMessage({ 
        act: 'sf_settings_changed', 
        data: update_info 
      });
    }, 500);

  }
});

onmsg_handlers.setProp({
  recache_data: function(msg, e) {
    cache.loadData(e);
  }
});