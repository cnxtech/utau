/* jshint devel:true */
(function (run) {
  'use strict';
  run(window.jQuery, window._, window, document);
}(function($, _, window, document) {
  'use strict';

  $(function() {
    $(window).scroll(_.throttle(onScroll, 100));

    if ($sidebar.length && $posts.length) {
      $sidebar.sticky({
        offset: 90,
        context: $posts
      });
    }

    if ($post.length) {
      $postContent.readingTime({
        lessThanAMinuteString: 'less than a min'
      });
    }

    if ($unveil.length) {
      $unveil.unveil(0, removeLoader);
    }

    if ($disqus.length) { disqus(); }
  });

  var $header = $('header.main'),
    $posts = $('#posts'),
    $post = $('body.post-template'),
    $postContent = $('.post main.content'),
    $sidebar = $('#sidebar'),
    $unveil = $('img[data-src]'),
    $disqus = $('#disqus_thread'),
    disqusShortname = 'utau-blog';

  function disqus() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  }

  function onScroll() {
    if (window.pageYOffset > 0)  {
      $header.addClass('not-at-top');
    } else {
      $header.removeClass('not-at-top');
    }
  }

  function removeLoader() {
    /*jshint validthis:true */
    $(this).prev().removeClass('active');
  }

}));

