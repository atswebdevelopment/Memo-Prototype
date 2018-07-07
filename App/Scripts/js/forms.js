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
            //Unset all local storage as we have a brand new user
            appData.resetUser();
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