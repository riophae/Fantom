
// ==UserScript==
// @include *
// ==/UserScript==

var fullPhoto = (function() {
  var $overlay, $img, $temp;
  return {
    show: function(url, excursion) {
      var style = 'fantom\\:overlay { overflow: hidden; box-sizing: border-box; position: fixed; left: 0; top: 0; background: rgba(0, 0, 0, .85); width: 100%; height: 100%; display: block; z-index: 10000999991099990; }' +
        'fantom\\:overlay img { background: transparent !important; max-width: none !important; max-height: none !important; box-shadow: 0 0 50px #000; top: 50%; left: 50%; padding: 0 !important; display: block !important; border: none !important; position: absolute !important; z-index: 10000999991099999; }' +
        'fantom\\:overlay.loading img { text-align: center; line-height: 25px; box-shadow: none !important; width: 100px !important; height: 25px !important; margin-top: 0 !important; content: "LOADING"; color: #fff; font-size: 14px; font-weight: normal; font-family: "Lucida Sans Unicode", Helvetica, Arial, sans-serif !important; }';
      var body = document.body;
      
      insertStyle('full_photo', 'fantom', style);
      style = null;
      fullPhoto.hide();
      
      if (! $overlay) {
        $overlay = parseDom(prefix('<overlay />'))[0];
        $overlay.onclick = fullPhoto.hide;
      }
      $overlay.className = 'loading';
      
      $img = $img || $c('img');
      var s = $img.style;
      s.marginLeft = -(100+excursion)/2 + 'px';
      
      $temp = $temp || $c('img');
      $img.src = $temp.src = url;
      $temp.onload = function() {
        if (! $overlay || !$img || $img.src !== $temp.src) return;
        $overlay.className = '';
        var nH = $img.naturalHeight,
            nW = $img.naturalWidth;
        var cH = docelem.clientHeight - 60,
            cW = docelem.clientWidth - excursion - 60;
        var height, width;
        if (nH / nW > cH / cW) {
          height = Math.min(nH, cH);
          width = height / nH * nW;
        } else {
          width = Math.min(nW, cW);
          height = width / nW * nH;
        }
        s.height = height + 'px';
        s.width = width + 'px';
        s.marginTop = (-height/2) + 'px';
        s.marginLeft = (-(width+excursion)/2) + 'px';
        $temp = null;
      }
      $overlay.innerHTML = '';
      $overlay.appendChild($img);
      body.appendChild($overlay);
    },
    hide: function() {
      if ($overlay) {
        document.body.removeChild($overlay);
        $overlay = null;
      }
    }
  }
})();

if (siteType != 'wap') {
  onmsg_handlers.setProp({
    show_photo: function(data) {
      oe.postMessage({
        act: data.request_id
      });
      fullPhoto.show(data.img, data.popup_activated ? 500 : 0);
    },
    hide_photo: fullPhoto.hide
  });
}