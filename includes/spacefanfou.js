
// ==UserScript==
// @include http://fanfou.com/*
// @exclude http://fanfou.com/home.2
// ==/UserScript==

function push(array, value) { array[array.length] = value; }
function recache() {
	oe.postMessage({ act: 'update_cache' });
}

var cache = {
  debug: function(fName) {
    /*setInterval(function() {
      oe.postMessage({ act: 'recache_files', fName: fName });
    }, 500);*/
    setInterval(recache, 1500);
  },
  clear: function(filter) { // 清空缓存
    filter = filter ? [filter] : [ ['.css', '$'], ['.js', '$'] ];
    filter.forEach(function(patt) {
      var items = [];
      forEach.call(storage, function(item, i) {
        var itemName = storage.key(i);
        if (itemName.test.apply(itemName, patt))
          push(items, itemName);
      });
      items.forEach(function(item) {
        storage.removeItem(item);
      });
    });
  },
  writeFiles: function(files) {
    for (var fName in files) {
      if (! files.hasOwnProperty(fName)) continue;
      storage.setItem(fName, files[fName]);
      
      if (this.err_files[fName]) { // 当发现这个文件曾不能正常读取时
        var file = this.err_files[fName]; // 重新插入这个文件的代码
        insertCode(file.tagName, fName, file.type, files[fName]);
        delete this.err_files[fName]; // 从错误列表中删除
      }
    }
  },
  writeData: function(data) {
    storage.setObj('SPACEFANFOU_PAGECACHE', data);
  },
  signature: function(sign) {
    if (! arguments.length) // 读取签名
      return storage.getItem('updated_signature');
    else // 设置签名
      storage.setItem('updated_signature', sign);
  },
  read: function(fileList) {
    var cachedFiles = {}; // 临时储存已读取的文件
    if (typeof fileList == 'string')
      fileList = fileList.split('|');
    // fileList 也可以为数组, 格式为: ['a.css', 'b.js']
    // fileList 有可能为 "读取失败" 对象, 格式为 { fName: 'abc.css', err_count: 2, time_before_retry: 100 }
    if (isObject(fileList) && fileList.fName) {
      var errFile = fileList;
      // 格式化为 "读取错误" 对象(只需要保留 err_count 属性)
      cachedFiles[errFile.fName] = { err_count: errFile.err_count };
      // 重新设定文件列表
      fileList = [ errFile.fName ];
    }
    fileList.forEach(function(fName) {
      var content = storage.getItem(fName);
      // 读取出错则格式化为 "读取错误" 对象
      content = content || this.get_err_count(fName, cachedFiles[fName]);
      cachedFiles[fName] = content;
    }, this);
    // 只有一个文件时, 直接返回文件内容; 否则返回文件库
    return fileList.length > 1 ? cachedFiles : cachedFiles[fileList[0]];
  },
  err_limit: 10, // 最大允许错误次数
  time_before_retry: 16, // 重新读取缓存前等待的时间(ms)
  get_err_count: function(fName, errFile) { // 返回读取错误次数
    errFile = errFile || {}; // 第一次读取出错时, 属性为 null, 重置为 {}
    var count = errFile.err_count || 0; // 开始时没有值, 手动加上 0
    count++;
    if (count > this.err_limit) count = -1; // 超过限定次数则不允许再次重试
    // 将文件内容格式化为 "读取错误" 对象
    return { fName: fName, err_count: count, time_before_retry: this.time_before_retry };
  },
  // 多次重试仍然失败的文件列表, 格式为 { fName: { type: 'web', tagName: 'style' } }.
  // 当有新的缓存推送之后, 将尝试重新插入这些文件的代码
  err_files: {},
  check_err_files: (function() {
    // 每秒检查一次是否有读取错误的文件
    var check = setInterval(function() { cache.check_err_files(); }, 1000);
    // 10 秒后不再检查
    setTimeout(function() { clearInterval(check); }, 10000);
    return function() {
      var err_files = [];
      for (var fName in this.err_files) {
        if (! this.err_files.hasOwnProperty(fName)) continue;
        push(err_files, fName);
      }
      err_files = err_files.join('|');
      if (err_files)
        oe.postMessage({ act: 'recache_files', fName: err_files });
    }
  })(),
  ready: function() {
    return storage.getItem('CACHE_VERSION') === pref.getItem('CACHE_VERSION');
  }
}

onmsg_handlers.setProp({
  update_cache: function(msg, e) {
    if (msg.sign === cache.signature()) return;
    
    cache.signature(msg.sign); // 写入签名
    oe.postMessage({ act: 'cache_updated', sign: msg.sign }); // 回复确认消息
    
    // 需要完整更新缓存时, 先清空缓存
    if (msg.clear_before_update)
      cache.clear(); 
    
    var files = msg.files;
    var data = msg.data;
    
    files && cache.writeFiles(files);
    data && cache.writeData(data);
    
    storage.setItem('CACHE_VERSION', pref.getItem('CACHE_VERSION'));
  },
  sf_settings_changed: function(msg) {
    var is_loaded = !! $i('sf_flag_libs_ok');
    if (! pref.getObj('sf_settings').spacefanfou)
      return is_loaded && insertScript('uninstall', 'sf', 'SF.uninstall(); SF = null;');
    else if (! is_loaded)
      return initialize();
    
    var data = msg.data;
    data.forEach(function(item) {
      var plugin = 'SF.pl.' + item.name;
      var updates = [];
      switch (item.type) {
        case 'update':
          push(updates, 'if (' + plugin + ') { ');
          push(updates,
              plugin + '.update.apply(' + plugin + ',' +
              JSON.stringify(item.options) + ');');
          push(updates, ' };');
          break;
        case 'enable':
          if (item.style)
            insertStyle(item.style);
          if (item.script) {
            insertScript(item.script);
            if (item.options) {
              push(updates,
                  plugin + '.update.apply(' + plugin + ',' +
                  JSON.stringify(item.options) + ');');
            }
            push(updates, plugin + '.load();');
          }
          break;
        case 'disable':
          push(updates, 'if (' + plugin + ') { ' + plugin + '.unload(); }\n');
          push(updates, 'jQuery(' + 
                 '"#sf_script_' + item.name + '").remove();');
          push(updates, 'jQuery(' +
                 '"#sf_style_' + item.name + '").remove();');
          break;
      }
      // 对每个插件单独执行可以防止一个更新错误影响后面的更新
      insertScript('update_' + Math.floor(new Date() * Math.random()), 'sf', updates.join(''));
    });
    insertScript('update_clean', 'sf', 
      'jQuery("script[id^=\'sf_script_update_\']").remove();');
  }
});

function initialize() {
  
  if (! cache.ready()) recache();
  
  waitFor(cache.ready, function() {
    
    if (! pref.getObj('sf_settings').spacefanfou) return;
    
    var data = storage.getObj('SPACEFANFOU_PAGECACHE');
    if (! data) return oe.postMessage({ act: 'recache_data' });
    
    var required_files = [ 'fixes.css', 'namespaces.js', 'sf_probe.js', 'spacefanfou.css', 'sf_functions.js' ];
    for (var i = 0; i < required_files.length; i++) {
      if (! storage.getItem(required_files[i]))
        return oe.postMessage({ act: 'recache_files' });
    }
    
    insertStyle('fixes.css', 'fantom');
    insertStyle('spacefanfou.css');
    
    [ 'namespaces', 'sf_functions' ].forEach(function(script) {
      insertScript(script + '.js');
    });
    
    var scripts = [];
    var load_plugins = [];
    
    data.forEach(function(item) {
      if (item.style) 
        insertStyle(item.style);
        
      if (item.script) {
        push(scripts, [ item.script, 'sf' ]);
        push(load_plugins, 'setTimeout(function() {');
        
        var plugin = 'SF.pl.' + item.name;
        if (item.options)
          push(load_plugins, plugin + '.update.apply(' + plugin + ', ' + JSON.stringify(item.options) + ');');

        push(load_plugins, plugin + '.load();');
        push(load_plugins, '}, 0);');
      }
    });
    push(scripts, [ 'load_plugin', 'sf', load_plugins.join('\n') ]);
    insertScript('sf_probe.js');
    
    waitFor(function() {
      return $i('sf_flag_libs_ok');
    }, function() {
      scripts.forEach(function(script) {
        insertScript.apply(insertScript, script);
      });
      delete scripts;
      delete load_plugins;
    }, true);
    
  }, true);
  
    // 实现分别定义中文和英文字体
    var reg = new RegExp, count = 0, $elems, content;
    reg.compile('[\u4E00-\u9FA5\uf900-\ufa2d]+', 'g');

    waitFor(function() {
      $elems = $('#panel h1, #user_top h3');
      return $elems.length;
    }, function() {
        var fragment = document.createDocumentFragment();
        var $new;
        var slice = Array.prototype.slice;
        forEach.call($elems, function($elem) {
          if ($elem.hasAttribute('data-chinese-separated')) return;
          $elem.setAttribute('data-chinese-separated', 'true');
          slice.call($elem.childNodes, 0).forEach(function($child) {
            if ($child.nodeType !== 3) {
              if ($child.nodeType === 1 && $child.className != 'chs' && $child.childNodes) {
                $child.childNodes.forEach(arguments.callee);
              }
              return;
            }
            
            $new = slice.call(parseDom($child.textContent.replace(reg, function($) {
							return '<font class="chs">' + $ + '</font>';
            })), 0);
            while ($new[0])
              fragment.appendChild($new.shift());
            
            $child.parentNode.replaceChild(fragment, $child);
          });
        });
        if (count++ < 10) {
					var func = arguments.callee;
					setTimeout(function() {
						waitFor(function() {
							$elems = $('#user_switcher h3');
							return $elems.length;
						}, func, true);
					}, 250);
				}
    }, true);
}

initialize();
//cache.debug();
