(function(window) {

  var UNDEFINED = 'undefined';
  var fgo = window['fgo'];

  if (typeof fgo.master !== UNDEFINED) return;

  function init() {

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

    window.requestAds = fgo.master.requestAds;
    window.jsShowBanner = fgo.master.requestAds;

  }

  init();

  function FgoAd(game) {
    var _self = this;
    var _game = game;
    var _gamejq = $(_game);
    var _gameId = fgo.q[0][0];
    var _userId = fgo.q[0][1];

    if (_gameId.length === 32) {
      var gid = _gameId.substr(0, 8) + '-' + _gameId.substring(8, 12) + '-' +
          _gameId.substring(12, 16) + '-' + _gameId.substring(16, 20) + '-' +
          _gameId.substring(20, 32);
      _gameId = gid;
    }

    var position = _gamejq.offset();
    _self._container = document.createElement('div');
    _self._container.id = "adContainer_"+_gameId;
    _self._container.style.position = 'absolute';
    _self._container.style['width'] = width() + 'px';
    _self._container.style['height'] = height() + 'px';
    _self._container.style['top'] = position.top + 'px';
    _self._container.style['left'] = position.left + 'px';
    _self._containerjq = $(_self._container);
    document.body.appendChild(_self._container);

    window.GD_OPTIONS = {
      gameId: _gameId,
      userId: _userId,
      advertisementSettings: {
          containerId: ''+_self._container.id,
          autoPlay: true
      },
      onEvent: function(event) {
          switch (event.name) {
            case 'STARTED':
              jsOnAdsStarted();
              break;
            case 'LOADED':
              jsOnAdsLoaded();
              break;
            case 'USER_CLOSE':
              jsOnAdsClosed();
              break;
            case 'AD_ERROR':
              jsOnAdsError();
              break;
            case 'API_READY':
              console.log("Api is ready");
              break;
          }
      }
    };

     // HTML5 SDK
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = '//html5.api.gamedistribution.com/main.js';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'gamedistribution-jssdk'));


    function width() {
      return _gamejq.innerWidth();
    }

    function height() {
      return _gamejq.innerHeight();
    }

    function requestAds() {
      gdApi.showBanner(); 
    }

    function jsOnAdsStarted() {
      // _self._container.style['display'] = 'block';
      _game.jsOnAdsStarted();
    }

    function jsOnAdsClosed() {
      // _self._container.style['display'] = 'none';
      _game.jsOnAdsClosed();
    }

    function jsOnAdsLoaded() {
      _game.jsOnAdsLoaded();
    }

    function jsOnAdsError() {
      // _self._container.style['display'] = 'none';
      _game.jsOnAdsError();
    }
    
    return {
      requestAds: requestAds
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

})(window);