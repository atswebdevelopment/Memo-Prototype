/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        sass: {
            web: {
                options: {
                    style: "compressed"
                },
                files: [
                    {
                        "www/css/main.css": "Css/sass/main.scss"
                    }
                ]
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                globals: {
                    jQuery: true
                },
            },
            files: {
                src: [
                    "scripts/js/*.js"
                ]
            }
        },
        concat: {
            web: {
                src: ["scripts/js/*.js"],
                dest: "www/scripts/main.js",
            }
        },
        uglify: {
            web: {
                src: "www/scripts/main.js",
                dest: "www/scripts/main.min.js"
            }
        },
        watch: {
            sass: {
                files: ["Css/sass/*.scss", "Css/sass/**/*.scss"],
                tasks: ["sass"]
            },
            scripts: {
                files: ["scripts/js/*.js"],
                tasks: ["jshint", "concat", "uglify"]
            }
        }
    });
};