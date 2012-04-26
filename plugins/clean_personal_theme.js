SF.pl.clean_personal_theme = new SF.plugin((function($) {
  if (! SF.fn.isUserPage()) return;

  var $win = $(window);
  var $clean;
  var default_style = 
    'body{background-color:#acdae5;' + 
    'background-image:url(http://static.fanfou.com/img/bg/0.png);' +
    'background-repeat:no-repeat;background-attachment:fixed;' +
    'background-position:top left;color:#222222}' +
    'a,#sidebar a:hover,.pagination .more:hover,.stamp a:hover,' +
    '.light .stamp a{color:#0066cc}' +
    'a:hover,.light .stamp .reply a{background-color:#0066cc}' +
    'a:hover .label,a.photo:hover img,.stamp a:hover,.light .stamp a' +
    '{border-color:#0066cc}.actions .open-notice:hover{color:#0066cc}' +
    '#sidebar{background-color:#e2f2da;border-left:1px solid #b2d1a3}' +
    '#sidebar .sect{border-top-color:#b2d1a3}' +
    '#sidebar .stabs{border-bottom-color:#b2d1a3}' +
    '#sidebar .stabs li.current a{color:#222222}' +
    '#user_stats li{border-left-color:#b2d1a3}' +
    '#user_stats .count{color:#222222}' +
    '#user_stats a:hover .count{color:#0066cc}' +
    '#goodapp span{color:#222222}';
  
  function onScroll(e) {
    $clean.addClass('hide');
    setTimeout(function() {
      $clean.removeClass('hide');
    }, 300);
  }

  return {
    load: function() {
      $clean =
        $('<a />').attr('id', 'sf_clean_personal_theme')
        .attr('title', '切换饭否默认模板 / 用户自定义模板')
        .attr('href', '#').text('使用饭否默认模板')
        .click(function(e) {
          e.preventDefault();
          if ($('#sf_default_theme').length) {
            $('#sf_default_theme').remove();
            $(this).text('使用饭否默认模板').removeClass('sf_default_theme');
          } else {
            $('<style />').attr('id', 'sf_default_theme')
              .html(default_style).insertAfter('head style');
            $(this).text('使用用户自定义模板').addClass('sf_default_theme');
          }
        })
        .appendTo('body');
      $win.bind('scroll', onScroll);
    },
    unload: function() {
      $win.unbind('scroll', onScroll);
      $('#sf_default_theme').add('#sf_default_theme').remove();
      $clean = null;
    }
  };
})(jQuery));
