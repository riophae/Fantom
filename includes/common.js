
// ==UserScript==
// @include *
// ==/UserScript==

var pref = widget.preferences,
  thisUrl = window.location.href + '',
  domain = document.domain,
  storage = window.localStorage,
  oe = opera.extension;
  
(function() {
  var opera_ver = pref.getItem('OPERA_VERSION_OUTDATED');
  if (! opera_ver) return;
  pref.removeItem('OPERA_VERSION_OUTDATED');
  alert('您正在用的是 Opera ' + opera_ver + ', 傲娇的饭兜表示 11.60+ 是很有必要的哦~');
  createTab('http://opera.com/download');
})();

var docelem, now = new Date();
// 有时报 docelem 为 undefined, 所以重复读取以避免这一问题
do {
  docelem = document.documentElement;
} while (! docelem && (new Date() - now <= 1000));

function opE(err) { opera.postError('Fantom Content: ' + err); }
function $(rule, elem) { return (elem || document).querySelectorAll(rule); }
function $i(id) { return document.getElementById(id); }
function $c(tagName) { return document.createElement(tagName); }
function $t(text) { return document.createTextNode(text); }
function $one(rule, elem) { return (elem || document).querySelector(rule); }

// 声明自定义标签命名空间
$c('fantom');

function $Elem(func, lazy) {

  this.cacheElem = func;
  this.lazyReset = lazy;
  lazy || this.reset();

}

$Elem.prototype = (function(undefined) {

  function DOMHandler(handler, chainable) {
    return function() {
      if (! this.elem) {
        if (this.lazyReset)
          return;
        else
          this.reset();
      }

      if (! this.elem) return;

      var ret = handler.apply(this, arguments);
      return chainable ? this : ret;
    }
  }

  function _hasClass(className, $) {
    return $.className && (' ' + $.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

  function _setClass($) {
    $.elem.className = $.className = $.className.replace(/^ +| +$/g, '');
  }

  function _eventsHandler(act, types, handler, useCapture) {
    act = act ? 'addEventListener' : 'removeEventListener';

    _forEvery(types, function(type) {
      this.elem[act](type, handler, !! useCapture);
    }, this);
  }

  function _forEvery(all, callback, context) {
    if (typeof all === 'string') {
      all = all.indexOf(' ') > -1 ?
        all.split(' ') : [ all ];
    }

    all.forEach(function(item, index, array) {
      callback.call(context, item, index, array);
    });
  }

  var _slice = Array.prototype.slice;
  var _forEach = Array.prototype.forEach;

  return {

    html: new DOMHandler(function(code) {
      return arguments.length ?
        (this.elem.innerHTML = code) : this.elem.innerHTML;
    }),

    child: new DOMHandler(function(rule) {
      return this.elem.querySelector(rule);
    }),

    children: new DOMHandler(function(rule, callback) {
      var children = this.elem.querySelectorAll(rule);

      if (arguments.length === 2)
        _forEach.call(children, callback, this);

      return children;
    }),

    hasClass: new DOMHandler(function(classNames) {
      if (! this.className) return;

      var length = 0;
      var count = 0;

      _forEvery(classNames, function(className) {
        length++;
        _hasClass(className, this) && count++;
      }, this);

      return length === count;
    }),

    addClass: new DOMHandler(function(classNames) {
      if (! this.className && typeof classNames === 'string')
        this.className = classNames;
      else
        _forEvery(classNames, function(className) {
          _hasClass(className, this) || (this.className += ' ' + className);
        }, this);

      _setClass(this);
    }, true),

    removeClass: new DOMHandler(function(classNames, skipCheck) {
      _forEvery(classNames, function(className) {
        if (skipCheck || _hasClass(className, this))
          this.className = (' ' + this.className + ' ').replace(' ' + className + ' ', ' ');
      }, this);

      _setClass(this);
    }, true),

    toggleClass: new DOMHandler(function(classNames) {

      var classToAdd = [];
      var classToRemove = [];

      _forEvery(classNames, function(className) {
        _hasClass(className, this) ?
          classToRemove.push(className) : classToAdd.push(className);
      }, this);

      classToAdd.length && (this.className += ' ' + classToAdd.join(' '));
      if (classToRemove.length)
        this.removeClass(classToRemove, true);
      else
        classToAdd.length && _setClass(this);

    }, true),

    css: new DOMHandler(function(property, value) {
      if (arguments.length === 2)
        this.elem.style[property] = value;
      else
        return this.elem.currentStyle[property];
    }),

    bind: new DOMHandler(function() {
      _eventsHandler.apply(this, [true].concat(_slice.call(arguments)));
    }, true),

    unbind: new DOMHandler(function() {
      _eventsHandler.apply(this, [false].concat(_slice.call(arguments)));
    }, true),

    remove: function() {
      if (! this.elem) return;
      this.elem.parentNode.removeChild(this.elem);
      this.elem = null;
      this.className = null;
    },

    reset: function() {
      if (this.elem) return;
      this.elem = this.cacheElem();
      this.elem && (this.className = this.elem.className);
    }

  }

})();


function prefix(code) {
  code = code.replace(/<([^\/> ]+)([^\/>]*)\/>/g, function($, $1, $2) {
    return '<' + $1 + $2.replace(/ $/, '') + '></' + $1 + '>';
  });
  code = code.replace(/<\/([^>]+)>/g, '</fantom:$1>');
  code = code.replace(/<([^\/>][^>]+)>/g, '<fantom:$1>');
  return code;
}

var siteType = (function() {
  if (domain.test('fanfou.com', '$'))
    return domain == 'fanfou.com' ? 'web': 'wap';
})();

function createTab(url) {
  oe.postMessage({ act: 'create_tab', url: url });
}

function insertExternalScript(script_url, type) {
  var $script = $c('script');
  $script.setAttribute('src', script_url);
  $script.className = type || 'space-fanfou';
  docelem.appendChild($script);
}

function insertCode(tagName, name, type, code) {
  type = type || 'sf'; // type 的可能值: 'sf', 'fantom'

  var fName;
  name = name || '';
  if (name.test('.')) { // name 实际为文件名, 非扩展名
    fName = name;
    name = fName.get('before', '.');
    tagName = tagName || (fName.split('.').reverse()[0] == 'css' ? 'style' : 'script');
  } else {
    var ext = tagName == 'style' ? '.css' : '.js';
    fName = name + ext;
  }

  var id = type + '_' + tagName + '_' + name;
  if ($i(id)) return; // 避免重复添加

  var $code = $c(tagName); // tagName 可能值: 'style', 'script'
  if (! code || isObject(code)) {
    // 读取代码
    code = cache.read(code || fName);
    if (isObject(code)) {
      // 读取失败
      if (code.err_count > 0) {
        // 延时重试
        (function(arg) {
          setTimeout(function() {
            insertCode.apply(this, arg);
          }, code.time_before_retry)
        })(arguments);
      } else {
        // 超过读取次数限制, 加入错误文件列表, 请求重新建立缓存
        cache.err_files[fName] = { type: type, tagName: tagName }
      }
      return; // 读取失败则不再写入代码(延时后重试或者放弃)
    }
  }

  $code.appendChild($t(code));
  $code.id = id;
  $code.className = type == 'sf' ? 'space-fanfou' : 'fantom';
  docelem.appendChild($code);
}

function insertStyle() {
  insertCode.apply(this, [ 'style' ].concat(Array.prototype.slice.call(arguments)));
}

function insertScript() {
  insertCode.apply(this, [ 'script' ].concat(Array.prototype.slice.call(arguments)));
}

function removeElem(elem) {
  if (typeof elem == 'string')
    elem = $i(elem);
  if (elem)
    docelem.removeChild(elem);
}

function fantom_switch(value) {
  // 各个域名下 Fantom 的开关
  if (! arguments.length) {
    if (storage.getItem('ENABLE_FANTOM') === null)
      storage.setItem('ENABLE_FANTOM', 'on');
    return storage.getItem('ENABLE_FANTOM') === 'on';
  } else storage.setItem('ENABLE_FANTOM', value);
}

var waitFor = (function() {
  var waiting_list = [];
  var interval, lock;
  
  function setWaiting(task) {
    if (task) waiting_list[waiting_list.length] = task;
    if (interval) return;
    interval = setInterval(function() {
      if (lock) return;
      lock = true;

      var not_avail = 0;
      for (var i = 0; i < waiting_list.length; ++i) {
        var item = waiting_list[i];
        if (! item) continue;
        if (item.checker()) {
          item.worker();
          waiting_list[i] = null;
        } else ++not_avail;
      }

      if (! not_avail || (document.readyState == 'complete' && ! (siteType || cache.ready())))
        interval = 0 * clearInterval(interval);

      lock = false;
    }, 40);
  }

  return function(checker, worker, async) {
    var _worker = async ?
      (function() { setTimeout(worker, 0); }) : worker;
    if (checker())
      _worker();
    else
      setWaiting({ checker: checker, worker: _worker });
  }
})();

function parseDom(code) {
  var objE = document.createElement('div');
  objE.innerHTML = code;
  return objE.childNodes;
}

// 修正提交按钮黑边框问题
function fixSubmit() {
  var btn, newBtn;
  waitFor(function() {
    return document.forms.length;
  }, function() {
    forEach.call(document.forms, function(form) {
      btn = $one('input[type="submit"]', form);
      newBtn = parseDom(btn.outerHTML.replace(/^<input/, '<button') + btn.value + '</button>')[0];
      btn.parentNode.replaceChild(newBtn, btn);
    });
  }, true);
}

// 当设置发生变动时需要处理的项目
var onset_handlers = {};
var onmsg_handlers = {
  fantom_settings_changed: function(msg) {
    msg.diff.forEach(function(key) {
      if (onset_handlers.hasOwnProperty(key))
        onset_handlers[key]();
    });
  }
};

oe.addEventListener('message', function(e) {
  var msg = e.data;
  var act = msg.act;
  if (onmsg_handlers.hasOwnProperty(act))
    onmsg_handlers[act](msg, e);
}, false);