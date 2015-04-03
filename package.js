Package.describe({
    summary: 'Style with attitude.',
    git: "https://github.com/thegeekmachine/meteor-ruby-sass.git",
    version: "0.1.1",
    name: 'thegeekmachine:ruby-sass',
    environments: ['server']
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

