(function ($) {
  $(document).ready(function () {
    console.log('ready');
    $('.dismiss-extended-bar').click(function () {
      $(this).parents('.extended-bar').remove();
    });
  });
})(jQuery);
