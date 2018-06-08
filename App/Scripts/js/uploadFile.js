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