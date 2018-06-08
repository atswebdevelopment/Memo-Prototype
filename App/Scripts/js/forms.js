/*
* Title: Forms JS
* Author: Adam Southorn
* Version: 1.0
*/

var forms = {
    init: function () {
        $('.select select').bind('change', function () {
            $(this).prev().text($(this).find('option:selected').val());
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

            form.find('.error-text').hide();

            form.addClass('form--loading');

            try {
                var data = form.serialize();
                var post = global.models.postForm;

                if (form.attr('data-file') === 'true') {
                    data = formData;
                    post = global.models.postFile;
                }

                post(data, form.attr('data-method')).success(function (data) {
                    console.log(data);
                    forms.controller(data, form);
                }).fail(function (data) {
                    console.log(data);
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
        var errorTag = form.prev().find('p');

        form.removeClass('form--loading');

        if (data === "900") {
            form.addClass('form--complete');
        }
        else {
            //error handling for form
            if (data === "905") {
                errorTag.html('There was an unknown internal model issue when processing your form. Please contact technical support.');
            }
            if (data === "901") {
                errorTag.html('That email address is already registered. Please go back and try a new one.');
            }
            else {
                errorTag.html(data);
            }
            return false;
        }

        //Login form
        if (form.attr('data-method') === 'PostLogin') {
            appData.setUserEmail(form.find('.getUserEmailField').val());
            appData.setWelcomeStatus('loggedin');
            document.location.replace('dashboard.html');
        }
        //end

        //Register form
        if (form.attr('data-method') === 'PostRegister') {
            $('.register--active').removeClass('register--active').next().addClass('register--active').find('fieldset').eq(0).addClass('active');
            appData.setUserEmail(form.find('.getUserEmailField').val());
            $('.setUserEmailField').val($('.getUserEmailField').val());
        }
        //end

        //Pin form
        if (form.attr('data-method') === 'PostPin') {
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