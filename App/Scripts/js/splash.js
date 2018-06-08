/*
* Title: Splash
* Author: Adam Southorn
* Version: 1.0
*/

//Splash animation. Disappears after first use.
var splash = {
    init: function () {
        if (appData.store.getItem('welcomeStatus')) {
            if (appData.store.getItem('welcomeStatus') === 'loggedin') {
                $('.login').show();
                document.addEventListener('deviceready', fingerprint.onDeviceReady.bind(this), false);
            }
            else {
                $('.get-started').show();
            }
        }
        else {
            $('.splash').show();
            var i = 0;
            var splashTimer = setInterval(function () {
                if ($('.splash__stage').eq(i + 1).length) {
                    $('.splash__stage').eq(i).removeClass('splash__stage--active');
                    i++;
                    $('.splash__stage').eq(i).addClass('splash__stage--active');
                }
                else {
                    clearInterval(splashTimer);
                    $('.splash__stage').eq(i).removeClass('splash__stage--active');
                    setTimeout(function () {
                        $('.splash').hide();
                        $('.get-started').show();
                    }, 1000);
                }
            }, 3000);
            appData.setWelcomeStatus('on');
        }

        $('.login-toggle').click(function () {
            $('.login').show();
            $('.get-started').hide();

            console.log('fingerprint waiting for device ready');
            //document.addEventListener('deviceready', fingerprint.onDeviceReady.bind(this), false);
            return false;
        });

        $('.register-toggle').click(function () {
            $('.login').hide();
            $('.get-started').show();
            return false;
        });
    },
};