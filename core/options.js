function $(rule, elem) { return (elem || document).querySelectorAll(rule); }
function $i(id) { return document.getElementById(id); }
function $one(rule, elem) { return (elem || document).querySelector(rule); }
function getValue($elem) {
	if ($elem.type == 'checkbox')
		return $elem.checked;
	else
		return eval($elem.value);
}
function setValue($elem, value) {
	if ($elem.type == 'checkbox') {
    if ($elem.checked !== value)
      $elem.click();
	} else $elem.value = value;
}
function hasClass(el, className) {
	if (! el) return;
	return className && (' ' + el.className + ' ').test(' ' + className + ' ');
}
function addClass(el, className) {
	if (! el) return;
	if (el.className === '')
		el.className = className;
	else if (el.className !== '' && ! hasClass(el, className))
		el.className = el.className + ' ' + className;
}
function removeClass(el, className) {
	if (! el) return;
	if (hasClass(el, className))
		el.className = (' ' + el.className + ' ').replace(' ' + className + ' ', ' ').replace(/^ | $/g, '');
}


window.addEventListener('DOMContentLoaded', function() {

  // 折叠子选项
  var $foldables = $('[foldable]');
  for (var i = 0; i < $foldables.length; i++) {
    (function() {
      var $foldable = $foldables[i];
      var $foldable_src = $one('[foldable_src]', $foldable);
      setValue($foldable_src, true);
      
      $foldable_src.addEventListener('change', function(e) {
        if (getValue(this))
          removeClass($foldable, 'folded');
        else
          addClass($foldable, 'folded');
      }, false);
    })();
  }
  
  // 获取选项信息
	var items = $('[sf_key], [fantom_key]');
	for (var i = 0; i < items.length; ++i) {
		var $t = items[i];
		var name = $t.getAttribute('sf_key') ? SF : Fantom;
 		var $key = $t.getAttribute('sf_key') || $t.getAttribute('fantom_key');
		setValue($t, name.st.settings[$key]);
	}

	// 保存选项信息
	var $wrap = document.getElementById('wrapper');
	$wrap.addEventListener('change', function(e) {
    var target = e.target;
    
    var type;
    if (target.hasAttribute('fantom_key'))
      type = 'fantom';
    else if (target.hasAttribute('sf_key'))
      type = 'sf';
    else return;
    
    var key = target.getAttribute(type + '_key');
    var settings = (type == 'fantom' ? Fantom : SF).st.settings;
    settings[key] = getValue(target);
    pref.setObj(type + '_settings', settings)
	}, false);
  
  // 功能/样式预览
  var $screenshots = $('.screenshot');
  var $tabs = $i('tabs');
  var $div = document.createElement('div');
  
  $div.innerHTML = '<p id="screenshot" class="hide"><img id="preview_img" src="" alt="预览" /><br /><span id="preview_des" /></p>';
  var $screenshot = $div.firstChild;
  $tabs.appendChild($screenshot);
  var $preview_img = $i('preview_img');
  var $preview_des = $i('preview_des');

  var timeout;
  for (var i = 0; i < $screenshots.length; i++) {
    var $ss = $screenshots[i];
    $ss.description = $ss.title;
    $ss.title = '';
    $ss.addEventListener('mouseenter', function(e) {
      $preview_img.src = this.rel;
      $preview_des.textContent = this.description;
      clearTimeout(timeout);
      removeClass($screenshot, 'hide');
      removeClass($screenshot, 'fadeOut');
    }, false);
    $ss.addEventListener('mousemove', function(e) {
      posPreview(e.pageX, e.pageY);
    }, false);
    $ss.addEventListener('mouseleave', function(e) {
      addClass($screenshot, 'fadeOut');
      timeout = setTimeout(function() {
        addClass($screenshot, 'hide');
      }, 250)
    }, false);
  }
  
  var oY = $wrap.offsetTop,
      oX = $wrap.offsetLeft,
      oH = $wrap.offsetHeight;
  function posPreview(x, y) {
    var targetX = x + 30 - oX,
        targetY = y - 10 - oY;
        
    var height = $screenshot.clientHeight;
    if (targetY + height > oH)
        targetY = oH - height - 10;
        
    $screenshot.style.left = targetX + 'px';
    $screenshot.style.top = targetY + 'px';
  }

}, false);