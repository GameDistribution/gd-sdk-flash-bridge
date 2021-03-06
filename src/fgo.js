(function(window) {

    const UNDEFINED = 'undefined';
    const fgo = window['fgo'];

    if (typeof fgo.master !== UNDEFINED) return;

    function init() {

        const objects = document.getElementsByTagName('object');
        const embeds = document.getElementsByTagName('embed');

        for (let i = 0; i < objects.length; i++) {
            let temp = objects[i];
            if (typeof(temp.jsGDO) !== UNDEFINED) {
                fgo.master = new FgoAd(temp);
            }
        }
        for (let i = 0; i < embeds.length; i++) {
            let tmp = embeds[i];
            if (typeof(tmp.jsGDO) !== UNDEFINED) {
                fgo.master = new FgoAd(tmp);
            }
        }

        if (typeof(fgo.master) === UNDEFINED) return;

        window.requestAds = fgo.master.requestAds;
        window.jsShowBanner = fgo.master.requestAds;
    }

    init();

    function FgoAd(game) {
        const _self = this;
        const _game = game;
        const _userId = fgo.q[0][1];

        let _gameId = fgo.q[0][0];
        if (_gameId.length === 32) {
            _gameId = _gameId.substr(0, 8) + '-' +
                _gameId.substring(8, 12) + '-' + _gameId.substring(12, 16) +
                '-' + _gameId.substring(16, 20) + '-' +
                _gameId.substring(20, 32);
        }

        const position = getAbsoluteBoundingRect(_game);
        _self._container = document.createElement('div');
        _self._container.id = 'gdsdk_bridge__ad-container';
        _self._container.style.position = 'absolute';
        _self._container.style['width'] = width() + 'px';
        _self._container.style['height'] = height() + 'px';
        _self._container.style['top'] = position.top + 'px';
        _self._container.style['left'] = position.left + 'px';

        _self._splashContainer = document.createElement('div');
        _self._splashContainer.id = 'gdsdk_bridge__splash-container';
        _self._splashContainer.style.position = 'absolute';
        _self._splashContainer.style['width'] = width() + 'px';
        _self._splashContainer.style['height'] = height() + 'px';
        _self._splashContainer.style['top'] = position.top + 'px';
        _self._splashContainer.style['left'] = position.left + 'px';
        _self._splashContainer.style['display'] = 'none';

        // Hide the advertisement and splash container initially. We do not use
        // display: none as this causes issues with requesting offset dimensions.
        _self._container.style['transform'] = 'translate(-9999px)';

        document.body.appendChild(_self._container);
        document.body.appendChild(_self._splashContainer);

        window.addEventListener('resize', function() {
            const position = getAbsoluteBoundingRect(_game);
            _self._container.style['width'] = width() + 'px';
            _self._container.style['height'] = height() + 'px';
            _self._container.style['top'] = position.top + 'px';
            _self._container.style['left'] = position.left + 'px';

            _self._splashContainer.style['width'] = width() + 'px';
            _self._splashContainer.style['height'] = height() + 'px';
            _self._splashContainer.style['top'] = position.top + 'px';
            _self._splashContainer.style['left'] = position.left + 'px';
        });

        // HTML5 SDK settings
        window.GD_OPTIONS = {
            gameId: _gameId.replace(/-/g, ''),
            userId: _userId,
            flashSettings: {
                adContainerId: '' + _self._container.id,
                splashContainerId: '' + _self._splashContainer.id,
            },
            // We set autoplay to true, so we can force a splash screen.
            advertisementSettings: {
                autoplay: true,
            },
            onEvent: function onEvent(event) {
                switch (event.name) {
                    case 'SDK_GAME_PAUSE':
                        jsOnAdsLoaded();
                        jsOnAdsStarted();
                        break;
                    case 'SDK_GAME_START':
                        jsOnAdsClosed();
                        break;
                    case 'SDK_ERROR':
                        jsOnAdsError();
                        break;
                }
            },
        };

        // HTML5 SDK
        (function(d, s, id) {
            let js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://html5.api.gamedistribution.com/main.min.js';
            // js.src = 'http://localhost:3000/lib/main.js';
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'gamedistribution-jssdk');

        function width() {
            return parseInt(window.getComputedStyle(_game).width);
        }

        function height() {
            return parseInt(window.getComputedStyle(_game).height);
        }

        function requestAds() {
            if (gdsdk.showBanner === 'function') {
                gdsdk.showBanner();
            }
        }

        function jsOnAdsStarted() {
            if (_game.jsOnAdsStarted === 'function') {
                _game.jsOnAdsStarted();
            }
        }

        function jsOnAdsClosed() {
            if (_game.jsOnAdsClosed === 'function') {
                _game.jsOnAdsClosed();
            }
        }

        function jsOnAdsLoaded() {
            if (_game.jsOnAdsLoaded === 'function') {
                _game.jsOnAdsLoaded();
            }
        }

        function jsOnAdsError() {
            if (_game.jsOnAdsError === 'function') {
                _game.jsOnAdsError();
            }
        }

        return {
            requestAds: requestAds,
        };
    }

    function getAbsoluteBoundingRect(el) {
        const doc = document;
        const win = window;
        const body = doc.body;

        // pageXOffset and pageYOffset work everywhere except IE <9.
        let offsetX = win.pageXOffset !== undefined
            ? win.pageXOffset
            : (doc.documentElement || body.parentNode ||
                body).scrollLeft;
        let offsetY = win.pageYOffset !== undefined
            ? win.pageYOffset
            : (doc.documentElement || body.parentNode ||
                body).scrollTop;

        const rect = el.getBoundingClientRect();

        if (el !== body) {
            let parent = el.parentNode;

            // The element's rect will be affected by the scroll
            // positions of *all* of its scrollable parents, not just
            // the window, so we have to walk up the tree and collect
            // every scroll offset. Good times.
            while (parent !== body) {
                offsetX += parent.scrollLeft;
                offsetY += parent.scrollTop;
                parent = parent.parentNode;
            }
        }

        return {
            bottom: rect.bottom + offsetY,
            height: rect.height,
            left: rect.left + offsetX,
            right: rect.right + offsetX,
            top: rect.top + offsetY,
            width: rect.width,
        };
    }

})(window);