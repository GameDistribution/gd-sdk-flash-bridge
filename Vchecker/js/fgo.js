(function(window) {

  var UNDEFINED = 'undefined';
  var fgo = window['fgo'];

  if (typeof fgo.master !== UNDEFINED) return;

  function init() {

    // IMA SDK
    if (typeof google === UNDEFINED || typeof google.ima === UNDEFINED) {
      loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js', function() {
        init();
      });
      return;
    }

    // JQUERY
    if (typeof $ === UNDEFINED) {
      loadScript('//code.jquery.com/jquery-2.1.4.min.js', function() {
        init();
      });

      return;
    }

    var objects = document.getElementsByTagName('object');
    var embeds = document.getElementsByTagName('embed');

    for (var i = 0; i < objects.length; i++) {
      var temp = objects[i];
      if (typeof temp.jsGDO !== UNDEFINED) {
        fgo.master = new FgoAd(temp);
      }
    }
    for (var i = 0; i < embeds.length; i++) {
      var tmp = embeds[i];
      if (typeof tmp.jsGDO !== UNDEFINED) {
        fgo.master = new FgoAd(tmp);
      }
    }

    if (typeof fgo.master === UNDEFINED) return;


    window.pauseGame = fgo.master.pauseGame;
    window.resumeGame = fgo.master.resumeGame;
    window.requestAds = fgo.master.requestAds;
    window.jsShowBanner = fgo.master.requestAds;

    fgo.master.jsOnAdsReady();
  }

  init();

  function FgoAd(game) {
    var _self = this;
    var _game = game;
    var _publisherId = fgo.q[0][0];
    var _gameId = fgo.q[0][1];
    var _gamejq = $(_game);
    var _info = _game.jsGDO();
    var _adsLoader;
    var _adDisplayContainer;
    var _intervalTimer;
    var _closeTimeout;
    var _affialateId = fgo.q[0][2];
    var domain,tagUrl,adTagId;

    Date.prototype.getUnixTime = function() {
      return this.getTime() / 1000 | 0;
    };

    if (_gameId.length === 32) {
      var gid = _gameId.substr(0, 8) + '-' + _gameId.substring(8, 12) + '-' +
          _gameId.substring(12, 16) + '-' + _gameId.substring(16, 20) + '-' +
          _gameId.substring(20, 32);
      _gameId = gid;
    }

    domain = getParentDomain();
    tagUrl = 'https://pub.tunnl.com/at?id='+_gameId+'&pageurl='+domain+'&type=1&time='+new Date().toDateString();
    makeHttpRequest('GET', tagUrl, null, function(_data) {
      if (_data) {
        _data = JSON.parse(_data);
        adTagId = _data.AdTagId;
        // Send out a game play to new Tunnl.
        (new Image()).src = 'https://pub.tunnl.com/DistEvent?tid=' +
            adTagId + '&game_id=' + _gameId + '&disttype=1&eventtype=1';
      }
    });

    (new Image()).src = 'https://analytics.tunnl.com/collect?type=flash&evt=game.play&uuid=' +
        _gameId + '&aid=' + _affialateId + '&c=' + new Date().getUnixTime();

    function width() {
      return _gamejq.innerWidth();
    }

    function height() {
      return _gamejq.innerHeight();
    }

    function requestAds() {

      destroyAds();

      var position = _gamejq.offset();
      _self._container = document.createElement('div');
      _self._container.style.position = 'absolute';
      _self._container.style['width'] = width() + 'px';
      _self._container.style['height'] = height() + 'px';
      _self._container.style['top'] = position.top + 'px';
      _self._container.style['left'] = position.left + 'px';
      _self._container.style.zIndex = 9999;
      _self._containerjq = $(_self._container);

      document.body.appendChild(_self._container);

      _adDisplayContainer = new google.ima.AdDisplayContainer(_self._container);

      _adDisplayContainer.initialize();

      _adsLoader = new google.ima.AdsLoader(_adDisplayContainer);

      // Listen and respond to ads loaded and error events.
      _adsLoader.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded,
          false);
      _adsLoader.addEventListener(
          google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError,
          false);
      // Request video ads.
      var adsRequest = new google.ima.AdsRequest();
      var w = width();
      var h = height();
      var curDim = {w: 0, h: 0};

      var dims = [
        {
          w: 728,
          h: 480,
        },
        {
          w: 728,
          h: 90,
        },
        {
          w: 640,
          h: 480,
        },
        {
          w: 336,
          h: 280,
        },
        {
          w: 300,
          h: 250,
        },
        {
          w: 250,
          h: 250,
        },
        {
          w: 200,
          h: 200,
        }];
      for (var i = 0; i < dims.length; i++) {
        var dim = dims[i];
        if (w >= dim.w && h >= dim.h && dim.w >= curDim.w &&
            dim.h >= curDim.h) {
          curDim = dim;
        }
      }

      if (curDim.w == 0) return;

      var dimText = curDim.w + 'x' + curDim.h;
      var adTagUrl = 'https://pub.tunnl.com/opp?tid=' + adTagId +
          '&player_width=640&player_height=480&page_url=' +
          encodeURIComponent(domain) + '&game_id=' + _gameId;

      adsRequest.adTagUrl = adTagUrl;
      adsRequest.linearAdSlotWidth = width();
      adsRequest.linearAdSlotHeight = height();
      adsRequest.nonLinearAdSlotWidth = width();
      adsRequest.nonLinearAdSlotHeight = height();
      adsRequest.forceNonLinearFullSlot = true;
      adsRequest.disableCompanionAds = true;
      _adsLoader.requestAds(adsRequest);
    }

    function onAdsManagerLoaded(adsManagerLoadedEvent) {

      //var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      //adsRenderingSettings.AUTO_SCALE=1;
      //adsRenderingSettings.useStyledNonLinearAds=false;

      // Get the ads manager.
      _self._adsManager = adsManagerLoadedEvent.getAdsManager(_game);  // should be set to the content video element

      // Add listeners to the required events.
      _self._adsManager.addEventListener(
          google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError);

      //_adsManager.addEventListener(
      //    google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      //    onContentPauseRequested);
      //_adsManager.addEventListener(
      //    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      //    onContentResumeRequested);

      // Listen to any additional events, if necessary.
      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.LOADED,
          onAdLoaded);

      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.STARTED,
          onAdStarted);

      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.PAUSED,
          onAdPaused);

      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.USER_CLOSE,
          onAdUserClose);

      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.COMPLETE,
          onAdComplete);

      _self._adsManager.addEventListener(
          google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
          onAdAllAdssComplete);

      try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        _self._adsManager.init(width(), height(), google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        _self._adsManager.start();
      } catch (adError) {
        // An error may be thrown if there was a problem with the VAST response.
        //videoContent.play();
        resumeGame();
      }
    }

    function onAdLoaded(adEvent) {
      var ad = adEvent.getAd();

      jsOnAdsLoaded(ad.getContentType());
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        _self._container.firstChild.style['top'] = '-' +
            ((height() - ad.getHeight()) / 2) + 'px';
        _self._container.style['background-color'] = '#f0f0f0';
        _closeTimeout = setTimeout(destroyAds, 15000);
      }
    }

    function onAdStarted(adEvent) {
      var ad = adEvent.getAd();

      jsOnAdsStarted();
      pauseGame();

      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        _intervalTimer = setInterval(
            function() {
              //var remainingTime = _adsManager.getRemainingTime();
            },
            300); // every 300ms
      }
    }

    function onAdPaused(adEvent) {
      var ad = adEvent.getAd();
    }

    function onAdUserClose(adEvent) {
      var ad = adEvent.getAd();

      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(_intervalTimer);
      }

      destroyAds();
    }

    function onAdComplete(adEvent) {
      var ad = adEvent.getAd();

      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(_intervalTimer);
      }

      destroyAds();
    }

    function onAdAllAdssComplete(adEvent) {
      var ad = adEvent.getAd();

      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(_intervalTimer);
      }

      destroyAds();
    }

    function onAdError(adErrorEvent) {

      console.log(adErrorEvent.getError());
      destroyAds();

      jsOnAdsError();
    }

    function destroyAds() {
      if (typeof _self._adsManager !== UNDEFINED) {

        jsOnAdsClosed();

        try {
          _self._adsManager.destroy();
          resumeGame();
        }
        catch (e) {
        }

        delete _self['_adsManager'];
      }

      if (typeof _self._container !== UNDEFINED) {
        document.body.removeChild(_self._container);
        delete _self['_container'];
      }

      clearTimeout(_closeTimeout);
    }

    function pauseGame() {
      _game.jsPauseGame();
    }

    function resumeGame() {
      _game.jsResumeGame();
    }

    function jsOnAdsStarted() {
      _game.jsOnAdsStarted();
    }

    function jsOnAdsClosed() {
      _game.jsOnAdsClosed();
    }

    function jsOnAdsLoaded(contentType) {
      _game.jsOnAdsLoaded(contentType);
    }

    function jsOnAdsError() {
      _game.jsOnAdsError();
    }

    function jsOnAdsReady() {
      _game.jsOnAdsReady();
    }

    function getParentUrl() {
      return (window.location != window.parent.location)
          ? document.referrer
          : document.location.href;
    }

    return {
      requestAds: requestAds,
      pauseGame: pauseGame,
      resumeGame: resumeGame,
      jsOnAdsReady: jsOnAdsReady,
    };
  };
  function loadScript(url, callback) {

    var script = document.createElement('script');
    script.type = 'text/javascript';

    if (script.readyState) {  //IE
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded' ||
            script.readyState == 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  //Others
      script.onload = function() {
        callback();
      };
    }

    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  function makeHttpRequest(method, url, data, callback) {
    // Attempt to creat the XHR2 object
    var xhr;
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {
      try {
        xhr = new XDomainRequest();
      } catch (e) {
        try {
          xhr = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
          try {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
          } catch (e) {
            console.log('\nThe browser is not compatible with XHR2');
          }
        }
      }
    }

    xhr.open(method, url, true);
    if(method === 'POST')
      xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function(e) {
      // Response handlers.
      if (xhr.readyState == 4 && xhr.status == 200) {
        var text = xhr.responseText;
        callback(text);
      }
    };
    xhr.onerror = function(data) {
      callback();
    };

    if(method === 'POST')
      xhr.send(JSON.stringify(data));
    else
      xhr.send();

  }
  function getParentDomain() {
    var referrer = (window.location !== window.parent.location)
        ? (document.referrer && document.referrer !== '')
            ? document.referrer.split('/')[2]
            : document.location.host
        : document.location.host;
    var domain = referrer.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').
        split('/')[0];
    console.info('Referrer domain: ' + domain);
    // If the referrer is gameplayer.io. (Spil Games)
    if (document.referrer.indexOf('gameplayer.io') !== -1) {
      domain = 'gamedistribution.com';
      // Now check if they provide us with a referrer URL.
      if (document.referrer.indexOf('?ref=') !== -1) {
        var returnedResult = document.referrer.substr(document.referrer.indexOf(
            '?ref=') + 5);
        // Guess sometimes they can give us empty or wrong values.
        if (returnedResult !== '' &&
            returnedResult !== '{portal%20name}' &&
            returnedResult !== '{portal name}') {
          domain = returnedResult.replace(
              /^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
          console.info('Spil referrer domain: ' + domain);
        }
      }
    }
    return domain;
  }
})(window);