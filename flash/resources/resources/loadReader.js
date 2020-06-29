/*
  Preconditions:

    Loaded JS:
      swfobject.js

    Elements present in page:
      #yuduReader
      a#tryAnywayLink
      input#ignoreFlashCheck
      span.requiredFlashPlayerVersion

    Browser one of:
      IE7+
      Any standards-compliant browser
*/

/**
 * @param {{ startPage:                       !string
 *         , bookLoaderBarColour:             !string
 *         , bookLoaderBGColour:              !string
 *         , redirectURLsForNonFlashBrowsers: Object.<string, string>
 *         }} options
 */
function loadReader(options)
{
  // Detect browser and redirect if appropriate.
  var platforms = [
    { name: "ios",     regex: /iphone|ipad|ipod/i },
    { name: "android", regex: /android/i },
    { name: "other",   regex: /blackberry|mini|windows\sce|palm/i }
    ];
  for (var i = 0; i < platforms.length; i++)
  {
    var platform = platforms[i];
    if (options.redirectURLsForNonFlashBrowsers[platform.name] && platform.regex.test(navigator.userAgent.toLowerCase()))
    {
      window.location.href = options.redirectURLsForNonFlashBrowsers[platform.name];
      return;
    }
  }

  // If we got here, we didn't redirect; continue setting up the Flash player.

  // Parse the query string into an args object:
  var args = (function () {
      var args = new Object();
      var queryString = window.location.search.substring(1);
      var pairs = queryString.split("&");

      for(var i = 0; i < pairs.length; i++)
      {
          // Try to parse this as name=value
          var pos = pairs[i].indexOf('=');
          if (pos == -1) continue;
          var argname = pairs[i].substring(0,pos);
          var value = pairs[i].substring(pos+1);
          args[argname] = unescape(value);
      }
      return args;
  })();

  // If the user wishes it we want to skip the flash check try to display the swf anyway.
  var reqVersion =
    args.skipFlashCheck || 0 <= document.cookie.indexOf("skipFlashCheck=true")
    ? "0"
    : "10" // Minimum for AS3
    ;

  var skipCheckURL =
    document.URL +
      (0 <= document.URL.indexOf('skipFlashCheck=') ? ""
      : ((document.URL.indexOf("?") > 0 ? '&' : '?') + "skipFlashCheck=true"));

  document.getElementById("scriptEnabled").style.display = "block";

  document.getElementById("tryAnywayLink").setAttribute("href", skipCheckURL);
  document.getElementById("tryAnywayLink").onclick = function () {
      var c = document.getElementById('ignoreFlashCheck');
      if (c && c.checked)
      {
          var expiresDate = new Date();
          expiresDate.setDate(expiresDate.getDate() + 90);
          document.cookie = 'skipFlashCheck=true; expires=' + expiresDate.toGMTString() + '; path=/';
      }

      window.location.href = skipCheckURL;
      return false;
    };

  document.getElementById("requiredFlashPlayerVersion").innerHTML = reqVersion;

  var flashVars =
  {
      startPage:           options.startPage,
      userAgent:           encodeURIComponent(navigator.userAgent),
      url:                 encodeURIComponent(document.URL),
      referrer:            encodeURIComponent(args.referrerUrl || document.referrer),
      bookLoaderBarColour: options.bookLoaderBarColour,
      bookLoaderBGColour:  options.bookLoaderBGColour,
      fullscreenEnabled:   true
  };

  // Pass some query string arguments to Flash as flash vars
  for (var key in args)
  {
    if (({searchQuery:true, Cust_ID:true, sessionID:true})[key] || /^subst_\w+$/.test(key))
    {
      flashVars[key] = encodeURIComponent(args[key]);
    }
  }

  // Dynamically embed the flash player using swfobject.
  swfobject.embedSWF(
    "loader.swf",                   // URL of the SWF
    "yuduReader",                   // id of the HTML element
    "100%", "100%",                 // width, height of the SWF
    reqVersion,                     // Flash player version the SWF is published for
    "resources/expressInstall.swf", // URL of the express install SWF; activates Adobe express install
    flashVars,
    {                               // nested <object> element <param>s
      quality:           "high",
      bgcolor:           "#ffffff",
      scale:             "noscale",
      menu:              "false",
      play:              "true",
      loop:              "false",
      align:             "middle",
      codebase:          "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab",
      type:              "application/x-shockwave-flash",

      /* If content is embedded, set wmode opaque to fix DHTML content unable to
       * be rendered in front of it in some browsers (e.g. webkit).
       *
       * Otherwise, set wmode to window (default) to fix key mapping bug on some
       * browsers (e.g. webkit, presto).
       */
      wmode:             args.embedded ? "opaque" : "window",

      allowScriptAccess: "sameDomain",
      allowFullScreen:   "true",
      pluginspage:       "http://get.adobe.com/flashplayer"
    },
    { // nested <object> element attributes
      id:    "ReaderSWF",
      align: "middle"
    },
    function (e) {
      console.log("swfobject.embedSWF callback fired with event object ", e, " where");
      console.log("  success = ", e.success);
      console.log("  id = ", e.id);
      console.log("  ref = ", e.ref);
    }
  );
};
