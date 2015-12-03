/* jshint devel:true */

(function (run) {
  'use strict';
  run(window.jQuery, window, document);
}(function($, window, document) {
  'use strict';

  $(function() {
    $(window).scroll(_.throttle(onScroll, 100));

    $mobileNav.on('click', toggleMobileNav);

    if ($posts.length && $sidebar.length) {
      $sidebar.sticky({
        offset: 90,
        context: $posts
      });

      $sidebar.sticky('refresh');
    }

    if ($post.length && $tableOfContents.length) {
      $tableOfContents.sticky({
        offset: 90,
        context: $postContent
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

    if ($blogSearch.length) {
      index = [];
      $blogSearch.find('input').focus(loadRSS);
    }

    if ($helpForm.length) {
      helpForm = new NaturalForm($helpForm.get(0));
    }
  });

  var _ = window._,
    moment = window.moment,
    NaturalForm = window.NaturalForm,
    $masthead = $('#masthead'),
    $mobileNav = $('#masthead .mobile.only.nav'),
    $posts = $('main .ui.posts.grid'),
    $post = $('body.post-template'),
    $postContent = $('.post main.content'),
    $tableOfContents = $('.post main.content .ui.sticky'),
    $sidebar = $('#sidebar'),
    $unveil = $('img[data-src]'),
    $disqus = $('#disqus_thread'),
    $blogSearch = $('.ui.blog.search'),
    $helpForm = $('.page-template-help .natural.form'),
    disqusShortname = 'utau-blog',
    rssLoaded = false,
    helpForm,
    index;

  function disqus() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  }

  function onScroll() {
    if (window.pageYOffset > 50)  {
      $masthead.addClass('scrolled');
    } else {
      $masthead.removeClass('scrolled');
    }
  }

  function removeLoader() {
    /*jshint validthis:true */
    $(this).prev().removeClass('active');
  }

  function toggleMobileNav(e) {
    /*jshint validthis:true */
    $(this).parents('#masthead').toggleClass('open');
    e.preventDefault();
  }

  function loadRSS() {
    if (rssLoaded) { return; }

    $.get('rss', function(data) {
      var posts = $(data).find('item');

      for (var i = 0; posts && i < posts.length; i++) {
        var post = posts.eq(i),
          parsedData = {
            id: i + 1,
            title: post.find('title').text(),
            url: post.find('link').text(),
            tags: $.map(post.find('category'), textify).join(' '),
            author: post.find('creator').text(),
            publishedAt: post.find('pubDate').text()
          };

        index.push(parsedData);
      }
      rssLoaded = true;
      initSearch();
    });
  }

  function textify(obj) { 
    return $(obj).text();
  }

  function initSearch() {
    $blogSearch.search({
      source: index,
      searchFields: [
        'title',
        'author',
        'tags'
      ],
      templates: {
        standard: function(response) {
          var html = [],
            query = $blogSearch.data('searchModule').get.value(),
            re = new RegExp('(' + query + ')', 'gi'),
            highlight = '<em>$1</em>';

          if(response.results !== undefined) {
            // each result
            $.each(response.results, function(index, result) {
              if (result.url) {
                html.push('<a class="result" href="' + result.url + '">');
              } else {
                html.push('<a class="result">');
              }
              if (result.image !== undefined) {
                html.push(
                  '<div class="image">',
                    '<img src="' + result.image + '">',
                  '</div>'
                );
              }
              html.push('<div class="content">');
              if (result.price !== undefined) {
                html.push('<div class="price">' + result.price + '</div>');
              }
              if (result.title !== undefined) {
                html.push(
                  '<div class="title">',
                    result.title.replace(re, highlight),
                  '</div>'
                );
              }
              if (result.publishedAt !== undefined && result.author !== undefined) {
                html.push(
                  '<div class="description">',
                    'by ' + result.author.replace(re, highlight) + ' ',
                     moment(new Date(result.publishedAt)).fromNow(),
                  '</div>'
                );
              }
              if (result.tags !== undefined) {
                var tags = result.tags.split(' ');
                for (var i = 0; i < tags.length; i++) {
                  html.push('<span class="tag">' + tags[i].replace(re, highlight) + '</span>');
                }
              }
              html.push('</div>');
              html.push('</a>');
            });

            if (response.action) {
              html.push('<a href="' + response.action.url + '" class="action">' +   response.action.text + '</a>');
            }
            return html.join('');
          }
          return false;
        }
      }
    });
  }
}));

