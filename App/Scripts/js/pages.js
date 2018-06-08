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
        appData.get('GetUserName', '?email=' + appData.store.getItem('userEmail')).success(function (data) {
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