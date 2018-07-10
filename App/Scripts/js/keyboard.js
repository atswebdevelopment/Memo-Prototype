/*
* Title: Keyboard JS
* Author: Ben Halhead
* Version: 1.0
*/

var keyboard = {
    init: function () {

    },
    onDeviceReady: function () {
        cordova.plugins.Keyboard.show();
    }
};