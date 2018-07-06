/*
* Title: Data JS
* Author: Adam Southorn
* Version: 1.0
*/

var appData = {
    store: window.localStorage,

    init: function () {
        appData.get = global.models.getDigest;
    },
    getItem: function(name) {
        return appData.store.getItem(name);
    },
    setWelcomeStatus: function (data) {
        appData.store.setItem('welcomeStatus', data);
    },
    setUserEmail: function (data) {
        appData.store.setItem('userEmail', data);
    },
    setUserName: function (data) {
        appData.store.setItem('userName', data);
    },
    setUserKey: function (data) {
        appData.store.setItem('userKey', data);
    },
    setUserApiUrl: function (data) {
        appData.store.setItem('userApiUrl', data);
    },
    setReturnUser: function () {

    },
    setFingerprintCredentials: function (data) {
        appData.store.setItem('userFPToken', data.token);
    }
};