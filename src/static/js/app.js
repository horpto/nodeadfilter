//взято и отредактировано отсюда https://github.com/c-smile/spapp


(function($, window){
  "strict"

  var pageHandlers = {};

  var currentPageName = null;
  var $currentPage = null;

  function show(pageName, param) {
    var $page = $("section#" + pageName);
    if($page.length == 0) {
      console.warn("section with id=%s not found!", pageName);
      return;
    }

    var ph = pageHandlers[pageName];
    if(ph) {
      var that = $page.length > 0 ? $page[0] : null;
      var r = ph.call(that, param);
      if(typeof r == "function") { // it returns the function that's used for view rendering
        pageHandlers[pageName] = r;
        r.call(that, param); // call that rendering function
      }
    }
    if(currentPageName) { // "close" current page view
      $(document.body).removeClass(currentPageName); // remove old page class
      $currentPage.removeClass('active');
    }
    currentPageName = pageName;
    $currentPage = $page;
    $(document.body).addClass(pageName); // set new page class
    $page.addClass('active');
  }

  function app(pageName, param) {
    var $page = $(document.body).find("section#" + pageName);

    var src = $page.attr("src");
    if(src && $page.find(">:first-child").length == 0) { // it has src and is empty
      $.get(src, "html")
          .done(function(html){$page.html(html); show(pageName,param); })
          .fail(function(){ alert("failed to get:" + src); });
    } else
      show(pageName, param);
  }

  app.page = function(pageName, handler) {
    pageHandlers[pageName] = handler;
  }

  var re = /#([-0-9A-Za-z]+)(\:(.+))?/;
  function onhashchange() {
    var hash = location.hash || "#" + $("section[default]").attr('id');

    var match = re.exec(hash) || [];
    hash = match[1];
    var param = match[3];
    app(hash, param);
  }

  $(window).on("hashchange", onhashchange);

  window.app = app;

  $(onhashchange); // call it for the initialization

})(jQuery, this);
