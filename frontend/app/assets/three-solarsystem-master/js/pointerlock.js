var PointerLock = (function() {
    var self = {};
    var enabled = false;
    var element;
    var handlers = {
        mousemove: [],
        enabled: [],
        disabled: [],
    };
    var prefixes = ['', 'moz', 'webkit'];


    function handleEvent(name, e) {
        for (var i = 0; i < handlers[name].length; i++) {
            handlers[name][i](e);
        }
    };

    $(function() {
        element = document.body;
        element.addEventListener('mousemove', function(e) {
            if (!enabled) return;
            var ev = {};
            var movementNames = ['movementX', 'movementY'];
            for (var i = 0; i < movementNames.length; i++)
                for (var j = 0; j < prefixes.length; j++) {
                    var prefix = prefixes[j];
                    var combinedName = prefix + 'M' + movementNames[i].slice(1); // lolhack
                    if (e[combinedName] !== undefined)
                        ev[movementNames[i]] = e[combinedName];
                }
            handleEvent('mousemove', ev);
        });
    });

    self.addEventListener = function(evName, callback) {
        if (evName in handlers)
            handlers[evName].push(callback);
        else
            throw new Error('Unsupported');
    };

    self.enableLock = function() {
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if (havePointerLock) {

            var pointerlockchange = function (e) {
                if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                    handleEvent('enabled', e);
                    enabled = true;
                    conn.send('enablePointerLock');
                } else {
                    handleEvent('disabled', e);
                    enabled = false;
                    conn.send('disablePointerLock');
                }
            }

            var pointerlockerror = function ( event ) {
                console.log('Failed to get pointer lock');
            }

            for (var i = 0; i < prefixes.length; i++) {
                var prefix = prefixes[i];
                document.addEventListener(prefix + 'pointerlockchange', pointerlockchange, false);
                document.addEventListener(prefix + 'pointerlockerror', pointerlockerror, false);
            }

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if ( /Firefox/i.test( navigator.userAgent ) ) {
                var fullscreenchange = function ( event ) {
                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                        element.requestPointerLock();
                    }
                }
                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }

        } else {
            console.log("Your browser doesn't seem to support Pointer Lock API");
        }
    };

    self.disableLock = function(is_client) {
        element.exitPointerLock = element.exitPointerLock || element.mozExitPointerLock || element.webkitExitPointerLock;
        if (element.exitPointerLock) element.exitPointerLock();
    }

    return self;

})();
