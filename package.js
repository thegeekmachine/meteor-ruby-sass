Package.describe({
    summary: 'Style with attitude.',
    git: "https://github.com/thegeekmachine/meteor-ruby-sass.git",
    version: "0.1.2.1",
    name: 'thegeekmachine:ruby-sass'
});

Package.registerBuildPlugin({
    name: 'sassCompiler',
    use: [],
    sources: [
        'plugin/compile-sass.js'
    ],
    npmDependencies: {
        'lodash': '2.4.1'
    }
});

Package.on_test(function (api) {
    api.use(['thegeekmachine:ruby-sass', 'tinytest', 'test-helpers', 'templating', 'jquery']);
    api.add_files(['tests/scss_tests.html', 'tests/scss_tests.js', 'tests/scss_tests.scss'], 'client');
});
