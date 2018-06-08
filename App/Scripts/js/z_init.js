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