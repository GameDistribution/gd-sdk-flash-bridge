(function(window) {

  var UNDEFINED = 'undefined';
  var fgo = window['fgo'];

  if (typeof fgo.master !== UNDEFINED) return;

  function init() {
    
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
    var _gameId = fgo.q[0][1];
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


    function requestAds() {

     
    }
  
    function onAdLoaded(adEvent) {
      var ad = adEvent.getAd();

      jsOnAdsLoaded(ad.getContentType());
    }

    function onAdStarted(adEvent) {
      var ad = adEvent.getAd();

      jsOnAdsStarted();
      pauseGame();
      
    }

    function onAdPaused(adEvent) {
      var ad = adEvent.getAd();
    }

   
    function onAdError(adErrorEvent) {

      console.log(adErrorEvent.getError());
      jsOnAdsError();
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

})(window);