/*
* Title: Fingerprint JS
* Author: Adam Southorn
* Version: 1.0
*/

var fingerprint = {
    clientId: "Memo",
    init: function () {
        $('form.userPin legend').html('Fingerprint init...');
        $('body').on('change', '.fingerprint-auth input', function () {
            $('form.userPin legend').html('Fingerprint change...');
            if ($(this).val() === 'on') {
                $('form.userPin legend').html('Fingerprint change...');
                //Android
                if (global.device === 'Android') {
                    FingerprintAuth.isAvailable(fingerprint.isAvailableSuccess, fingerprint.isAvailableError);
                }
                //iOS
                else {
                    $('form.userPin legend').html('Fingerprint iOS...');
                    window.plugins.touchid.isAvailable(
                        function(type) {$('form.userPin legend').html('Fingerprint iOS...');},
                        function(msg) {$('form.userPin legend').html(msg);}
                    );
                    //window.plugins.touchid.isAvailable(fingerprint.isAvailableSuccess, fingerprint.isAvailableError);
                }
            }
        });

        //document.addEventListener('deviceready', fingerprint.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function () {
        console.log('fingerprint popup start');
        //Android
        if (global.device === 'Android') {
            if (appData.store.getItem('userFPToken') !== undefined) {
                var decryptConfig = {
                    clientId: fingerprint.clientId,
                    username: appData.store.getItem('userEmail'),
                    token: appData.store.getItem('userFPToken')
                };
                FingerprintAuth.decrypt(decryptConfig, fingerprint.decryptSuccessCallback, fingerprint.decryptErrorCallback);
            }
        }
        //iOS
        else {
            if (appData.store.getItem('iOSTempKey') !== undefined) {
                window.plugins.touchid.verifyFingerprint('Scan your fingerprint please', fingerprint.decryptSuccessCallback, fingerprint.decryptErrorCallback);
            }
        }
    },
    isAvailableSuccess: function (result) {
        $('form.userPin legend').html('Fingerprint available...');
        //Android
        if (global.device === 'Android') {
            if (result.isAvailable) {
                var form = $(this).parents('form');
                var encryptConfig = {
                    clientId: fingerprint.clientId,
                    username: $('.getUserEmailField').val(),
                    password: $('.getUserPasswordField').val()
                };

                FingerprintAuth.encrypt(encryptConfig, fingerprint.encryptSuccessCallback, fingerprint.encryptErrorCallback);
            }
        }
        //iOS
        else {
            $('form.userPin legend').html('Fingerprint available iOS...');
            window.plugins.touchid.verifyFingerprint('Scan your fingerprint please', fingerprint.encryptSuccessCallback, fingerprint.encryptErrorCallback);
        }
    },
    isAvailableError: function (message) {
        $('form.userPin legend').html('Fingerprint unavailable...');
        console.log("isAvailableError(): " + message);
    },
    encryptSuccessCallback: function (result) {
        //Android
        if (global.device === 'Android') {
            if (result.withFingerprint) {
                console.log("Successfully encrypted credentials.");
                appData.setFingerprintCredentials(result);
            } else if (result.withBackup) {
                console.log("Authenticated with backup password");
            }
        }
        //iOS
        else {
            console.log(result);
            appData.store.setItem('iOSTempKey', 'yes');
        }
    },
    encryptErrorCallback: function (error) {
        if (error === FingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
            console.log("FingerprintAuth Dialog Cancelled!");
        } else {
            console.log("FingerprintAuth Error: " + error);
        }
    },
    decryptSuccessCallback: function (result) {
        //Android
        if (global.device === 'Android') {
            if (result.withFingerprint) {
                console.log("Successful biometric authentication.");
                if (result.password) {
                    console.log("Successfully decrypted credential token.");
                    document.location.replace('dashboard.html');
                }
            } else if (result.withBackup) {
                console.log("Authenticated with backup password");
                document.location.replace('dashboard.html');
            }
        }
        //iOS
        else {
            document.location.replace('dashboard.html');
        }
    },
    decryptErrorCallback: function (error) {
        if (error === FingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
            console.log("FingerprintAuth Dialog Cancelled!");
        } else {
            console.log("FingerprintAuth Error: " + error);
        }
    }
};