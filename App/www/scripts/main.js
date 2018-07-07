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
/*
* Title: Fingerprint JS
* Author: Adam Southorn
* Version: 1.0
*/

var fingerprint = {
    clientId: "Memo",
    init: function () {
        $('body').on('change', '.fingerprint-auth input', function () {
            if ($(this).val() === 'on') {
                //Android
                if (global.device === 'Android') {
                    FingerprintAuth.isAvailable(fingerprint.isAvailableSuccess, fingerprint.isAvailableError);
                }
                //iOS
                else {
                    window.plugins.touchid.isAvailable(fingerprint.isAvailableSuccess, fingerprint.isAvailableError);
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
            window.plugins.touchid.verifyFingerprint('Scan your fingerprint please', fingerprint.encryptSuccessCallback, fingerprint.encryptErrorCallback);
        }
    },
    isAvailableError: function (message) {
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
/*
* Title: Forms JS
* Author: Adam Southorn
* Version: 1.0
*/

var forms = {
    init: function () {
        $('.select select').bind('change', function () {
            $(this).prev().text($(this).find('option:selected').text());
            if ($(this).val() === '') {
                $(this).parent().removeClass('active');
            }
            else {
                $(this).parent().addClass('active');
            }
        });

        $('.radio input').bind('change', function () {
            var form = $(this).parents('.form__field');

            form.find('.radio__input').removeClass('radio__input--on');
            $(this).parent().addClass('radio__input--on');
        });

        $('input[type=checkbox]').bind('change', function () {
            $(this).parent().toggleClass('active');
        });

        $('body').on('click', '.controls .arrow', function () {
            if ($(this).hasClass('controls__arrow--inactive')) {
                return false;
            }

            var controls = $(this).parents('.controls'),
                form = controls.prev(),
                active = controls.find('.controls__pip--active').index();

            if ($(this).hasClass('controls__arrow--left')) {
                $('fieldset.active').removeClass('active').prev().addClass('active');
                controls.find('.controls__arrow--right').removeClass('controls__arrow--inactive');
                active--;
                if (active <= 0) {
                    active = 0;
                    controls.find('.controls__arrow--left').addClass('controls__arrow--inactive');
                }
            }
            else {
                console.log(active >= form.find('fieldset').length - 1);
                console.log(active + " " + (form.find('fieldset').length - 1));
                if (active >= form.find('fieldset').length - 1) {
                    form.submit();
                    return false;
                }
                if (!forms.validateForms($('fieldset.active'))) {
                    return false;
                }
                $('fieldset.active').removeClass('active').next().addClass('active');

                controls.find('.controls__arrow--left').removeClass('controls__arrow--inactive');
                active++;
            }
            controls.find('.controls__pip--active').removeClass('controls__pip--active');
            controls.find('.controls__pip').eq(active).addClass('controls__pip--active');

            form.css('left', '-' + (100 * active)  + '%');

            return false;
        });

        $('.ajax').submit(function (e) {
            var form = $(this);
            var formData = new FormData(form[0]);

            if (form.hasClass('no-submit')) {
                e.preventDefault();
                return false;
            }

            if (!forms.validateForms(form)) {
                e.preventDefault();
                return false;
            }

            //reset any error messages
            if( $('p.form-message').length ) {
                $('p.form-message').removeClass('form-errors').html('');
            }

            form.addClass('form--loading');

            try {
                var data = form.serializeObject();
                var transport = 'data';
                if (form.hasClass('headers')) {
                    transport = 'headers';
                }

                var api_auth = true;
                if (form.hasClass('noAuth')) {
                    //Bypass auth
                    api_auth = false;
                }

                var post = global.models.postForm;
                if (form.attr('data-file') === 'true') {
                    data = formData;
                    post = global.models.postFile;
                }
                post(form.attr('data-action'), form.attr('data-method'), data, transport, api_auth)
                    .done(function (data) {
                        console.log(data);
                        forms.controller(data, form);
                    }).fail(function (data) {
                        form.find('.error-text').show();
                        form.removeClass('form--loading');
                    });
            }
            catch (ex) {
                console.log(ex);
                console.log('form post failed');
                form.find('.error-text').show();
                form.removeClass('form--loading');
            }

            e.preventDefault();
        });

        $('body').on('change', '.form__field input, .form__field select', function () {
            var form = $(this).parents('.form__field');
            forms.validateForms(form); 
        }).on('keyup', '.form__field--pin input', function () {
            $(this).next().focus();
        });
    },
    controller: function (data, form) {
        form.removeClass('form--loading');

        if (data.status === "SUCCESS") {
            form.addClass('form--complete');
        }
        else {
            //error handling for form
            if( $('p.form-message').length ) {
                $('p.form-message').addClass('form-errors').html(data.message);
            }

            return false;
        }

        //Login form
        if (form.hasClass('authenticate')) {
            appData.setWelcomeStatus('loggedin');
            //Set our global API user variables
            appData.setUserEmail(form.find('.getUserEmailField').val());
            appData.setUserName(data.user.email);
            appData.setUserKey(data.user.digest_hash);
            appData.setUserApiUrl('users/' + data.user.id + '.json');
            document.location.replace('dashboard.html');
        }
        //end

        //Register form
        if (form.hasClass('userRegister')) {
            $('.register--active').removeClass('register--active').next().addClass('register--active').find('fieldset').eq(0).addClass('active');
            $('.setUserEmailField').val($('.getUserEmailField').val());
            //Set our global API user variables
            appData.setUserEmail(form.find('.getUserEmailField').val());
            appData.setUserName(data.user.email);
            appData.setUserKey(data.user.digest_hash);
            var user_api_url = 'users/' + data.user.id + '.json';
            appData.setUserApiUrl('users/' + data.user.id + '.json');
            //Now that we know our user, we can determine the API URL for a user edit
            $('form.userPin').attr('data-action', user_api_url);
        }
        //end

        //Pin form
        if (form.hasClass('userPin')) {
            document.location.replace('dashboard.html');
        }
        //end
    },
    validateForms: function (form) {
        var result = true;

        form.find('.required').each(function () {
            if ($(this).is('div')) {
                var errors = 0;
                $(this).find('input,select').each(function () {
                    if ($(this).val() === "") {
                        result = false;
                        $(this).parents('.form__field').addClass('form__field--error').find('.form__validation').text('This field is required');
                        errors++;
                    }
                });
                if (errors === 0) {
                    $(this).parents('.form__field').addClass('form__field--valid').removeClass('form__field--error').find('.form__validation').text('');
                }
            }
            else if ($(this).attr('type') === 'radio') {
                if (!$(this).is(':checked')) {
                    result = false;
                    $(this).parents('.form__field').addClass('form__field--error').find('.form__validation').text('This field is required');
                }
            }
            else if ($(this).val() === "") {
                result = false;
                $(this).parents('.form__field').addClass('form__field--error').find('.form__validation').text('This field is required');
            }
            else {
                $(this).parents('.form__field').addClass('form__field--valid').removeClass('form__field--error').find('.form__validation').text('');
            }
        });

        form.find('.email').each(function () {
            if ($(this).val() !== "") {
                if (forms.validateEmail($(this).val()) === false) {
                    result = false;
                    $(this).parents('.form__field').addClass('form__field--error').find('.form__validation').text('Email address is not valid');
                }
                else {
                    $(this).parents('.form__field').addClass('form__field--valid').removeClass('form__field--error').find('.form__validation').text('');
                }
            }
        });

        form.find('.phone').each(function () {
            if ($(this).val() !== "") {
                if (forms.validatePhone($(this).val()) === false) {
                    result = false;
                    $(this).parents('.form__field').addClass('form__field--error').find('.form__validation').text('Telephone number is not valid');
                }
                else {
                    $(this).parents('.form__field').addClass('form__field--valid').removeClass('form__field--error').find('..form__validation').text('');
                }
            }
        });

        form.find('.form__field--error').eq(0).find('input,select').eq(0).focus();

        return result;
    },
    validateEmail: function (val) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(val);
    },
    validatePhone: function (val) {
        var re = /^[0-9]+$/;
        return re.test(val);
    }
};

(function($,undefined){
    '$:nomunge'; // Used by YUI compressor.

    $.fn.serializeObject = function(){
        var obj = {};

        $.each( this.serializeArray(), function(i,o){
            var n = o.name,
                v = o.value;

            obj[n] = obj[n] === undefined ? v
                : $.isArray( obj[n] ) ? obj[n].concat( v )
                    : [ obj[n], v ];
        });

        return obj;
    };

})(jQuery);
/*
* Title: Main JS
* Author: Adam Southorn
* Version: 1.0
*/

var global = {
    api_key : 'YTdqEC}p`H&GfnST{tGD#g7h?%mZ`[',
    api_endpoint : 'http://lifesbackup.com/api/',

    init: function () {
        global.ux();
        global.ui();
        global.resize();
        global.setImages();
        //$(window).on('resize', function (e) {
        //    views.resize();
        //});
    },
    ux: function () {
        //Form slide
        $('.form--slide').each(function () {
            var size = $(this).find('fieldset').length; 

            $(this).css('width', (size * 100) + '%');
            $(this).find('fieldset').show().css('width', (100 / size) + '%');
        });

        //Progress
        $(document).ready(function () {
            var x = 0;
            $('.boxes__progress-value').each(function () {
                $(this).css('stroke-dashoffset', x);
                x = x + 40;
            });
        });

        //Slick
        if ($('.gallery').length) {
            $('.gallery').slick(global.views.slickSettings);
        }
    },
    ui: function () {
        document.addEventListener('deviceready', global.onDeviceReady.bind(this), false);

        $('body').on('click', '.arrow a', function () {
            if (!$(this).parents('.slick-initialized').length) {
                var next = $(this).parents('.section').next();

                $('html, body').stop().animate({
                    'scrollTop': next.offset().top + parseInt(next.attr('data-offset'))
                }, 300);
            }
            return false;
        }).on('click', '.toggle-content a', function () {
            $(this).find('span').toggleClass('hidden');
            $(this).parent().prev().toggle(300);
            return false;
        }).on('click', '.nav a', function () {
            var url = $(this).attr('href');

            $('html, body').stop().animate({
                'scrollTop': $(url).offset().top
            }, 0);

            return false;
        });

        $('.help').click(function () {
            $('body').append('<div class="popup"> <a class="close" href="#"><span class="svg-load" data-src="images/icon-plus.svg"></span></a><div class="popup__content vertical-block"> <div class="logo logo--small logo--help"><span class="svg-load" data-src="images/icon-help.svg"></span></div><span class="title">need a little help?</span><p>Perhaps this quick video will do the trick?<br/><br/></p><p><span class="button button--alt"><a href="">watch the video</a></span></p><p>Or failing that, please tell us about your problem here:</p><form class="form ajax" data-method="PostLogin" novalidate> <fieldset class="active"> <div class="form__field"> <input type="text" name="help" id="help" class="required" placeholder="how can we help?"/> </div></fieldset> </form> <h2>FAQs</h2> <ul class="faqs"> <li class="faqs__item"> <a class="faqs__link" href=""></a> <div class="inner"> <span class="svg-load faqs__edit" data-src="images/icon-arrow-small.svg"></span> <span class="faqs__title">Mortgage Statements</span> </div></li><li class="faqs__item"> <a class="faqs__link" href=""></a> <div class="inner"> <span class="svg-load faqs__edit" data-src="images/icon-arrow-small.svg"></span> <span class="faqs__title">Parking Permit</span> </div></li><li class="faqs__item"> <a class="faqs__link" href=""></a> <div class="inner"> <span class="svg-load faqs__edit" data-src="images/icon-arrow-small.svg"></span> <span class="faqs__title">My CV</span> </div></li><li class="faqs__item"> <a class="faqs__link" href=""></a> <div class="inner"> <span class="svg-load faqs__edit" data-src="images/icon-arrow-small.svg"></span> <span class="faqs__title">House insurance</span> </div></li></ul> </div></div>');
            global.setImages();
            return false;
        });

        $('a').click(function () {
            if ($(this).attr('href') === '') {
                $('body').append('<div class="popup"><a class="close" href="#"><span class="svg-load" data-src="images/icon-plus.svg"></span></a><div class="popup__content vertical-block"><span class="title">Coming soon</span><span class="img-load" data-src="images/image-coming-soon.svg"></span><p>We\'re currently making some improvements. We promise we wont keep you waiting too long!</p></div><span class="svg-load cloud cloud--98" data-src="images/icon-cloud.svg"></span><span class="svg-load cloud cloud--99" data-src="images/icon-cloud.svg"></span></div>');
                global.setImages();
                return false;
            }
        });

        $('.memoViewFileImage').click(function () {
            $('body').append('<div class="popup"><a class="close" href="#"><span class="svg-load" data-src="images/icon-plus.svg"></span></a><div class="popup__image"><img src="' + $('.memoViewFileImage img').attr('src') + '" /></div></div>');
            global.setImages();
            return false;
        });

        $('.highlight__item').click(function () {
            $('.highlight__item').removeClass('highlight__item--active');
            $(this).addClass('highlight__item--active');
        });

        $('body').on('change', '.form__field--selection input', function () {
            var fieldset = $(this).parents('.form__field'),
                selection = fieldset.find('input:checked').val();

            if (selection === 'upload') {
                window.location.href = 'add-upload.html';
            }
            else if (selection === 'details') {
                window.location.href = 'add-details.html';
            }
        }).on('click', '.upload__button-done a', function () {
            window.location.href = 'vehicles.html';
        });

        $('body').on('click', '.close', function () {
            $('.popup').remove();
            return false;
        });
    },
    onDeviceReady: function () {
        global.device = device.platform;
        console.log(global.device + ' device ready');
    },
    setImages: function () {
        $('.img-load,.bg-load,.svg-load').each(function () {
            var bg = $(this).hasClass('bg-load') ? true : false,
                origClasses = $(this).attr('class'),
                data = $(this).attr('data-src'),
                mob = $(this).attr('data-mob');
            $(this).removeClass('img-load bg-load svg-load');

            var classes = $(this).attr('class');

            if ($(window).width() < 768) {
                if (mob === 'no') {
                    return;
                }
            }

            if (data !== undefined) {
                if (data.indexOf('[width]') > -1) {
                    var screensize = 1600;
                    if ($(window).width() < 1024) {
                        screensize = 1024;
                    }
                    if ($(window).width() < 768) {
                        screensize = 768;
                    }
                    $(this).attr('data-src', data.replace('[width]', screensize));

                    if ($(window).width() < 768 && $(this).attr('data-src-mob') !== undefined) {
                        $(this).attr('data-src', $(this).attr('data-src-mob'));
                    }
                }

                if (bg) {
                    var bgElement = $(this);
                    $('<img/>').attr('src', bgElement.attr('data-src')).on('load', function () {
                        $(this).remove();
                        bgElement.css('background-image', 'url(' + bgElement.attr('data-src') + ')');
                    });
                }
                else {
                    if (origClasses.indexOf('svg-load') > -1) {
                        var $img = $(this);
                        var imgID = $img.attr('id');
                        var imgURL = $img.attr('data-src');

                        $.get(imgURL, function (data) {
                            var $svg = $(data).find('svg');
                            $svg = $svg.attr('class', classes);
                            $svg = $svg.attr('data-src', imgURL);
                            $svg = $svg.removeAttr('xmlns:a');

                            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'));
                            }

                            $img.replaceWith($svg);
                        }, 'xml');
                    }
                    else {
                        $(this).replaceWith('<img class="' + classes + '" src="' + $(this).attr('data-src') + '" alt="' + $(this).attr('data-alt') + '">');
                    }
                }
            }
        });
    },
    resize: function () {

    },
    getParameterByName: function (name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    views: {
        slickSettings: {
            dots: true,
            arrows: false
        }
    },
    models: {
        getData: function (method, params) {
            return $.ajax({
                url: 'http://memo.jabberwokie.com/umbraco/api/MemoAppApi/' + method + params,
                type: 'GET'
            });
        },
        postForm: function (action, method, data, transport, auth) {
            var ajaxData = {
                url: global.api_endpoint + action,
                type: method,
                context: document.body
            };

            var headers = {
                'X-Api-Key' : global.api_key
            };

            if( auth ) {
                headers = $.extend( headers, {
                    'X-Username' : appData.store.getItem('userEmail'),
                    'X-User-Key' : appData.store.getItem('userKey')
                });
            }

            if( transport === 'headers') {
                //Send data in headers rather than as separate payload
                headers = $.extend( headers, data );
            } else {
                //Send data as normal payload
                ajaxData = $.extend( ajaxData, {
                    'data' : data
                });
            }

            ajaxData = $.extend( ajaxData, {
                'headers' : headers
            });

            console.log( headers );
            return $.ajax(ajaxData);
        },
        postFile: function (data, method) {
            return $.ajax({
                url: 'http://memo.jabberwokie.com/umbraco/api/MemoAppApi/' + method,
                type: 'POST',
                processData: false,
                contentType: false,// not json
                context: document.body,
                data: data
            });
        },
    }
};
/*
* Title: Pages JS
* Author: Adam Southorn
* Version: 1.0
*/

var pages = {
    init: function () {
        if ($('.welcome').length) {
            pages.welcome();
        }
        if ($('.dashboard').length) {
            pages.dashboard();
        }
        if ($('.add-details').length) {
            pages.addDetails();
        }
        if ($('.view-file').length) {
            pages.viewFile();
        }
    },
    welcome: function () {
        //Welcome html
        var welcomeTitle = 'welcome to memo';
        //var welcomeIntro = 'your life in your pocket';
        if (appData.store.getItem('userName')) {
            welcomeTitle = 'hello ' + appData.store.getItem('userName');
        //    welcomeIntro = 'please sign in to continue';
        //    //$('.memoReturnUser').removeClass('hidden');
        }
        ////else {
        ////    $('.memoNewUser').removeClass('hidden');
        ////}

        $('.memoWelcomeTitle').html(welcomeTitle);
        //$('.memoWelcomeIntro').html(welcomeIntro);
    },
    dashboard: function () {
        //Set logged in user name
        appData.get(appData.getItem('userApiUrl'), null).success(function (data) {
            appData.setUserName(data);

            //Dashboard html
            var dashboardHello = 'welcome to memo';

            if (appData.store.getItem('userName')) {
                dashboardHello = 'Hi ' + appData.store.getItem('userName');
            }

            $('.memoDashboardHello').html(dashboardHello);
        });
    },
    addDetails: function () {
        //Set logged in user name
        appData.get('GetUserFiles', '?email=' + appData.store.getItem('userEmail')).success(function (data) {
            var files = JSON.parse(data),
                htmlString = '';

            var path = 'http://memo.jabberwokie.com/userUploads';

            function formatBytes(a, b) {
                if (0 === a) { return "0 Bytes"; } var c = 1024, d = b || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c)); return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
            }

            $.each(files, function (i, e) {
                var fileType = e.file.split('.'),
                    fileSize = 0;
                if (e.fileSize !== undefined) {
                    fileSize = formatBytes(e.fileSize, 1);
                }
                htmlString += '<div class="file-list__item"><a href="view-file.html?file=' + e.file + '&name=' + e.tag + '" class="file-list__link"></a><div class="inner"><span class="file-list__icon img-load" data-src="images/icon-folder.svg"></span><span class="file-list__title">' + e.tag + '</span><span class="file-list__subtitle">' + fileType[fileType.length - 1].toUpperCase() + ' - ' + fileSize + '</span></div></div>';
            });

            $('.file-list').append(htmlString);

            global.setImages();
        });
    },
    viewFile: function () {
        var file = global.getParameterByName('file'),
            name = global.getParameterByName('name');

        $('.memoViewFileName').html(name);

        $('.memoViewFileImage').html('<img id="imgfile" src="http://memo.jabberwokie.com/userUploads/' + file + '"/>');
    }
};
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
/*
* Title: Upload File JS
* Author: Adam Southorn
* Version: 1.0
*/

var uploadFile = {
    storedFile: null,
    init: function () {
        $('.upload__link a').click(function () {
            uploadFile.openCamera($(this).attr('class'));
            return false;
        });

        $('.upload__button-confirm').click(function () {
            $('.upload__stage').hide();
            $('.upload__stage--stage-3').show();
            return false;
        });

        $('.upload__button-save').click(function () {
            $(this).hide();
            if (uploadFile.storedFile !== null) {
                uploadFile.upload(uploadFile.storedFile);
            }
            else {
                //for debug
                console.log('debug upload');
                uploadFile.uploadSuccess();
            }
            return false;
        });

        $('.upload__button-refresh').click(function () {
            document.location.replace('add-upload.html');
            return false;
        });

        $('.upload__button-done').click(function () {
            document.location.replace('add-details.html');
            return false;
        });
    },
    openCamera: function (selection) {
        try {
            var srcType = selection === 'upload__link-camera' ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY;
            var options = uploadFile.setOptions(srcType);

            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                uploadFile.displayImage(imageUri);
                uploadFile.getFileEntry(imageUri);
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
                console.log(error);
            }, options);
        }
        catch (e) {
            uploadFile.uploadTemp();
        }
    },
    displayImage: function (imageUri) {
        $('.upload__inner img').remove();
        $('.upload__inner').append('<img src="' + imageUri + '"/>');
        $('.upload__stage').hide();
        $('.upload__stage--stage-2').show();
    },
    setOptions: function (srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            correctOrientation: true  //Corrects Android orientation quirks
        };
        return options;
    },
    getFileEntry: function (imageUri) {
        window.resolveLocalFileSystemURL(imageUri, function success(fileEntry) {

            try {
                console.log("got file: " + fileEntry.fullPath);
                uploadFile.storedFile = fileEntry;
            }
            catch (e) {
                console.log(e);
            }

        }, function () {
            uploadFile.createNewFileEntry();
        });
    },
    createNewFileEntry: function() {
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

            // JPEG file
            dirEntry.getFile("null", { create: true, exclusive: false }, function (fileEntry) {

                try {
                    console.log("got file: " + fileEntry.fullPath);
                    uploadFile.storedFile = fileEntry;
                }
                catch (e) {
                    console.log(e);
                }

            }, uploadFile.onErrorCreateFile);

        }, uploadFile.onErrorResolveUrl);
    },
    onErrorCreateFile: function (error) {
        console.log(error);
    },
    onErrorResolveUrl: function (error) {
        console.log(error);
    },
    upload: function (fileEntry) {
        console.log(fileEntry);
        $('.upload').addClass('upload--image-uploading');

        var fileURL = fileEntry.toURL();

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "text/plain";

        var params = {};
        params.customName = $('.customName').val();
        params.userEmail = appData.store.getItem("userEmail");
        options.params = params;

        var ft = new FileTransfer();

        // SERVER must be a URL that can handle the request, like
        // http://some.server.com/upload.php
        ft.upload(fileURL, encodeURI("http://memo.jabberwokie.com/umbraco/api/MemoAppApi/UploadFile"), uploadFile.uploadSuccess, uploadFile.uploadFail, options);
    },
    uploadTemp: function () {
        $('.upload__inner img').remove();
        $('.upload__inner').append('<img src="/images/image-document.jpg"/>');
        $('.upload__stage').hide();
        $('.upload__stage--stage-2').show();
    },
    uploadSuccess: function () {
        console.log('SUCCESSFUL UPLOAD!');
        console.log($('.customName').val());
        console.log(appData.store.getItem("userEmail"));

        $('.upload__button-save').show();
        $('.upload__stage').hide();
        $('.upload__stage--stage-4').show();
    },
    uploadFail: function (error) {
        alert("An error has occurred: Code = " + error.code);

        $('.upload__button-save').show();
    }
};
global.init();
appData.init();
pages.init();

if ($('.form').length) {
    forms.init();
    fingerprint.init();
}
if ($('.upload').length) {
    uploadFile.init();
}

if ($('.splash').length) {
    splash.init();
}