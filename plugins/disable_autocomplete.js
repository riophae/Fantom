SF.pl.disable_autocomplete = new SF.plugin((function($) {
  var $content = $('textarea[name="content"]');
  if (! $content.length || ! $content.autocomplete) return;
  return {
    load: function() {
      SF.fn.waitFor(function() {
        return $content.autocomplete &&
					$content.autocomplete('option', 'disabled') === false;
      }, function() {
        $content.autocomplete('disable');
      });
    },
    unload: function() {
      $content.autocomplete && $content.autocomplete('enable');
    }
  };
})(jQuery));
