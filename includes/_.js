
// ==UserScript==
// @include *
// ==/UserScript==

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
        structure.push(this[key].check(prefix + key + ' '));
    }
    if (prefix != '- ')
      return structure.join('\n');
    else
      opera.postError('Object Structure: \n' + structure.join('\n'));
  });
  defineProperty(Object, 'keys', function() {
    return Object.keys(this);
  });

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
function isObject(o) {
	return Object.prototype.toString.call(o) === '[object Object]';
}

var forEach = window.NodeList.prototype.forEach = Array.prototype.forEach;