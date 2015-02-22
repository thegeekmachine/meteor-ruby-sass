Package.describe({
    summary: 'Style with attitude.',
    git: "https://github.com/thegeekmachine/meteor-ruby-sass.git",
    version: "0.1.0",
    name: 'thegeekmachine:ruby-sass'
});

Package.registerBuildPlugin({
    name: 'thegeekmachine:ruby-sass',
    use: [],
    sources: [
        'plugin/compile-sass.js'
    ],
    npmDependencies: {
        'fibers': '1.0.1',
        'lodash': '2.4.1'
    }
});
