/*
* Title: Main JS
* Author: Adam Southorn
* Version: 1.0
*/

var global = {
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
            $('body').append('<div class="popup"><a class="close" href="#"><span class="svg-load" data-src="images/icon-plus.svg"></span></a><div class="popup__content vertical-block"><div class="logo logo--small logo--help"><span class="svg-load" data-src="images/icon-help.svg"></span></div><span class="title">need a little help?</span><p>Perhaps this quick video will do the trick?<br /><br /></p><p><span class="button button--alt"><a href="">watch the video</a></span></p></div></div>');
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
        postForm: function (data, method) {
            return $.ajax({
                url: 'http://memo.jabberwokie.com/umbraco/api/MemoAppApi/' + method,
                type: 'POST',
                context: document.body,
                data: data
            });
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
        }
    }
};