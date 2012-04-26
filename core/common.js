
(function() {
  function defineProperty(target, methodName, method) {
    Object.defineProperty(target.prototype, methodName, {
      value: method,
      configurable: true
    });
  }
  
  // 向对象追加属性
  defineProperty(Object, 'setProp', function(obj) {
    for (var key in obj) {
      if (! obj.hasOwnProperty(key)) continue;
      this[key] = obj[key];
    }
    return this;
  });
  // 显示 JSON 对象完整结构
  defineProperty(Object, 'check', function(prefix) {
    var structure = [];
    prefix = prefix || '';
    prefix += '- ';
    for (var key in this) {
      if (! this.hasOwnProperty(key)) continue;
      structure.push(prefix + key + '(' + typeof this[key] + '): ' + this[key]);
      if (typeof this[key] == 'object' && ! Array.isArray(this[key]))
        structure.push(Object.prototype.check.call(this[key], prefix + key + ' '));
    }
    if (prefix != '- ')
      return structure.join('\n');
    else
      opera.postError('Object Structure: \n' + structure.join('\n'));
  });
  defineProperty(Object, 'keys', function() {
    return Object.keys(this);
  });
  
  Object.checkKeys = function(obj) {
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    opE(keys.join('\n'));
  }

  // 检查是否含有字符串
  defineProperty(String, 'test', function(patt, mode) {
    if (! patt) return false;
    var str;
    switch (mode) {
      case '^': // 从开头匹配
        str = this.slice(0, patt.length);
        break;
      case '$': // 从结尾匹配
        str = this.slice(-patt.length);
        break;
      default:
        str = this;
    }
    return str.indexOf(patt) > -1;
  });
  // 返回字符串指定位置前后的部分
  defineProperty(String, 'get', function(mode, patt) {
    var index = this.indexOf(patt);
    if (index < 0) return this;
    switch (mode) {
      case 'before':
        return this.substring(0, index);
      case 'after':
        return this.substr(index + patt.length);
      case 'between':
        return this.get('after', patt).get('before', patt);
    }
  });
  
  function JSONStorage(storage) {
    defineProperty(storage, 'setObj', function(key, value) {
      this.setItem(key, JSON.stringify(value));
    });
    defineProperty(storage, 'getObj', function(key) {
      try {
        return JSON.parse(this.getItem(key));
      } catch (e) {
        return null;
      }
    });
  }
  JSONStorage(window.Storage);
  JSONStorage(widget.preferences.constructor);
})();

var pref = widget.preferences;
var storage = window.localStorage;
var oe = opera.extension;

function opE(err) { opera.postError('Fantom Background: ' + err); }

function copyProp(into, from) {
  for (var key in from) {
    if (! from.hasOwnProperty(key)) continue;
    if (from[key] && typeof from[key] == 'object' && ! Array.isArray(from[key])) {
      if (typeof into[key] != 'object') into[key] = { };
      copyProp(into[key], from[key]);
    } else {
      into[key] = from[key];
    }
  }
  return into;
}
function compareObj(x, y) {
  var diff = [];
  if (x !== y) {
    for (var key in x) {
      if (! x.hasOwnProperty(key) || ! y.hasOwnProperty(key)) continue;
      if (x[key] !== y[key])
        diff.push(key);
    }
  }
  return diff;
}

var sound = (function() {
  var audioObj = new Audio;
  audioObj.src = 'notify.ogg';
  return function() {
    if (Fantom.st.settings.play_snd)
      audioObj.play();
  }
})();

function XHR(url, notCache) {
  if (notCache) url += '?unique=' + ((new Date)*1);
  var req = new XMLHttpRequest;
  req.open('GET', url, false); // 非异步拉取数据
  try {
    req.send();
  }
  catch (err) {
    return null; // 网络连接错误
  }
  return req.responseText; // 拉取数据成功并返回数据
}

function createTab(url, in_bg_tab) {
  oe.tabs.create({ url: url, focused: ! in_bg_tab });
}

function checkSite(url) {
  var type;
  if (url.test('fanfou.com')) {
    if (url.test('http://fanfou.com/', '^'))
      type = 'web'
    else if (url.test('http://m.fanfou.com/', '^'))
      type = 'wap'
  }
  return type;
}
function is_opt_page(url) {
  return url == 'widget://' + document.domain + '/options.html';
}